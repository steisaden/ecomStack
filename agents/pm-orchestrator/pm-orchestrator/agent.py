# pm-orchestrator/agent.py
import os
import json
import logging
import uuid
import time
from typing import Any, Dict, Optional

# ADK Agent base (the extension created this import in your skeleton)
# If your environment uses a different import path, adjust accordingly.
from google.adk.agents import Agent
from google.adk.tools import google_search  # keep if you want search tool available

# ---- Basic logging ----
logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger("pm-orchestrator")

# ---- ENV config (set these in your Kiro/Gemini runtime or CLI Runner env) ----
CLI_RUNNER_URL = os.environ.get("CLI_RUNNER_URL", "http://localhost:3001")
CLI_RUNNER_TOKEN = os.environ.get("CLI_RUNNER_TOKEN", "sd212857")
MEMORY_API = os.environ.get("MEMORY_API", "http://localhost:4001")  # replace with your Memory URL
NODE_SERVER_API = os.environ.get("NODE_SERVER_API", "http://localhost:3001")          # optional: nodeServer endpoint

# ---- Utilities: small HTTP helper used as "tools" ----
import requests

def cli_runner_run(cmd: str, args: list[str], timeout_ms: int = 120000) -> Dict[str, Any]:
    """Call the CLI Runner service to execute a local CLI in the Gemini runtime."""
    payload = {"cmd": cmd, "args": args, "timeoutMs": timeout_ms}
    headers = {"Authorization": f"Bearer {CLI_RUNNER_TOKEN}"} if CLI_RUNNER_TOKEN else {}
    r = requests.post(f"{CLI_RUNNER_URL}/run", json=payload, headers=headers, timeout=(5, timeout_ms/1000+10))
    r.raise_for_status()
    return r.json()

def memory_save(key: str, value: Any) -> Dict[str, Any]:
    """Persist a JSON object to Memory. Replace with your Memory API shape."""
    url = f"{MEMORY_API}/nodes/{key}"
    r = requests.put(url, json={"value": value})
    r.raise_for_status()
    return r.json()

def memory_get(key: str) -> Optional[Any]:
    url = f"{MEMORY_API}/nodes/{key}"
    r = requests.get(url)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.json().get("value")

def notify_pm_channel(payload: Dict[str, Any]) -> None:
    """Notify via nodeServer or external webhook; fallback to logging."""
    if NODE_SERVER_API:
        r = requests.post(NODE_SERVER_API + "/notify", json=payload, timeout=10)
        r.raise_for_status()
    else:
        log.info("NOTIFY: %s", json.dumps(payload))

# ---- Task-card schema & helpers ----
def new_task_card(title: str, description: str, acceptance_criteria: list[dict], owner: str = "agent:gemini-executor", estimate_hours: int = 2):
    task_id = f"task-{uuid.uuid4().hex[:8]}"
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    task = {
        "taskId": task_id,
        "projectId": None,
        "title": title,
        "description": description,
        "owner": owner,
        "status": "todo",
        "priority": "med",
        "estimateHours": estimate_hours,
        "dependencies": [],
        "acceptanceCriteria": acceptance_criteria,
        "mcpHints": {"primary": ["gemini_cli"], "secondary": ["sequential-thinking", "Memory"]},
        "artifactPointers": [],
        "graderResults": {},
        "createdAt": now,
        "updatedAt": now,
        "dueAt": None
    }
    return task

# ---- High level PM operations implemented as "tools" ----
class PMTools:
    @staticmethod
    def create_task(task: Dict[str, Any]) -> Dict[str, Any]:
        """Persist the task to Memory and return it."""
        key = f"task:{task['taskId']}"
        memory_save(key, task)
        # Also append to project task list (simple pattern)
        project_tasks_key = f"project:{task.get('projectId', 'default')}:tasks"
        existing = memory_get(project_tasks_key) or []
        existing.append(task['taskId'])
        memory_save(project_tasks_key, existing)
        notify_pm_channel({"event": "task.created", "taskId": task['taskId'], "title": task['title']})
        return task

    @staticmethod
    def assign_task(task_id: str, new_owner: str) -> Dict[str, Any]:
        key = f"task:{task_id}"
        task = memory_get(key)
        if not task:
            raise RuntimeError(f"task {task_id} not found")
        task["owner"] = new_owner
        task["status"] = "in_progress"
        task["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        memory_save(key, task)
        notify_pm_channel({"event": "task.assigned", "taskId": task_id, "to": new_owner})
        return task

    @staticmethod
    def update_status(task_id: str, status: str, note: Optional[str] = None):
        key = f"task:{task_id}"
        task = memory_get(key)
        if not task:
            raise RuntimeError(f"task {task_id} not found")
        task["status"] = status
        task["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        if note:
            task.setdefault("notes", []).append({"ts": time.time(), "note": note})
        memory_save(key, task)
        notify_pm_channel({"event": "task.status", "taskId": task_id, "status": status, "note": note})
        return task

    @staticmethod
    def get_task(task_id: str) -> Dict[str, Any]:
        key = f"task:{task_id}"
        task = memory_get(key)
        if not task:
            raise RuntimeError(f"task {task_id} not found")
        return task

    @staticmethod
    def report_project(project_id: str) -> Dict[str, Any]:
        project_key = f"project:{project_id}:tasks"
        tasks = memory_get(project_key) or []
        _tasks = [memory_get(f"task:{t}") for t in tasks]
        report = {"projectId": project_id, "tasks": _tasks}
        notify_pm_channel({"event": "project.report", "projectId": project_id, "count": len(tasks)})
        return report

# ---- Agent message handling: wire the PM tools to messages ----
# The Agent class in the ADK accepts an instruction + tools. We will implement a simple on_message handler.
root_agent = Agent(
    name="pm-orchestrator",
    model="gemini-2-5-flash",
    instruction="You are pm-orchestrator: accept project briefs, create tasks, assign agents, and manage lifecycle.",
    tools=[google_search]  # include search tool for research triggers
)

# Add a small message handler on the Agent
@root_agent.on_message  # decorator provided by ADK
def handle_message(message: Dict[str, Any]) -> Dict[str, Any]:
    """
    Expected message shape (examples):
      { "type": "task.create", "body": { "title": "...", "description": "...", "acceptanceCriteria": [...] } }
      { "type": "task.assign", "body": { "taskId": "task-xxxx", "owner": "agent:gemini-executor" } }
      { "type": "task.update", "body": { "taskId": "...", "status": "blocked", "note": "reason" } }
      { "type": "project.report", "body": { "projectId": "proj-0" } }
    """
    try:
        msg_type = message.get("type")
        body = message.get("body", {})
        log.info("pm-orchestrator received message: %s", msg_type)

        if msg_type == "task.create":
            title = body.get("title")
            desc = body.get("description", "")
            criteria = body.get("acceptanceCriteria", [])
            task = new_task_card(title, desc, criteria, owner=body.get("owner", "agent:gemini-executor"), estimate_hours=body.get("estimateHours", 2))
            created = PMTools.create_task(task)
            return {"ok": True, "taskId": created["taskId"], "task": created}

        if msg_type == "task.assign":
            task_id = body["taskId"]
            owner = body["owner"]
            updated = PMTools.assign_task(task_id, owner)
            return {"ok": True, "task": updated}

        if msg_type == "task.update":
            task_id = body["taskId"]
            status = body.get("status", "todo")
            note = body.get("note")
            updated = PMTools.update_status(task_id, status, note)
            return {"ok": True, "task": updated}

        if msg_type == "project.report":
            pid = body.get("projectId", "default")
            report = PMTools.report_project(pid)
            return {"ok": True, "report": report}

        # fallback: help or unknown message
        return {"ok": False, "error": "unsupported message type", "supported": ["task.create","task.assign","task.update","project.report"]}
    except Exception as e:
        log.exception("Error handling message")
        return {"ok": False, "error": str(e)}

# ---- Optional: expose a helper function to programmatically create sample tasks (dev convenience) ----
def bootstrap_sample_task():
    example = new_task_card(
        title="Hero component: responsive + CTA + animation",
        description="Create hero per design tokens; include reduced-motion support.",
        acceptance_criteria=[
            {"type": "lint", "command": "npm run lint", "threshold": "no-errors"},
            {"type": "unit_tests", "command": "npm test -- --testPathPattern=hero", "threshold": "pass"}
        ],
        owner="agent:gemini-executor",
        estimate_hours=4
    )
    created = PMTools.create_task(example)
    log.info("Bootstrapped sample task: %s", created["taskId"])
    return created

# ---- local run / debug support ----
def main():
    log.info("Starting pm-orchestrator local runner")
    # In many ADK setups the agent object has a .run() or similar call to start listening.
    # If the ADK provides an agent.run() method, call it. Otherwise start a simple HTTP server or REPL loop.
    try:
        # Try to run agent event loop if available (ADK provides this in many variants)
        if hasattr(root_agent, "run"):
            # This will block and let ADK manage messages
            root_agent.run()
        else:
            # Fallback: expose a simple REPL to test messages locally
            log.info("ADK Agent.run not available. Running REPL for manual testing.")
            log.info("Type JSON messages (one per line). Ctrl-C to exit.")
            bootstrap_sample_task()
            while True:
                line = input(">>> ")
                if not line.strip():
                    continue
                msg = json.loads(line)
                resp = handle_message(msg)
                print(json.dumps(resp, indent=2))
    except KeyboardInterrupt:
        log.info("pm-orchestrator local runner exiting")

if __name__ == "__main__":
    main()
