import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Wand2, Save, Check, AlertTriangle } from 'lucide-react';
import AdminShell from '../../layouts/AdminShell';

const initialRules = [
  { label: 'Avoid medical claims; recommend consulting professionals', enabled: true },
  { label: 'Keep tone calm, instructive, and free of hype', enabled: true },
  { label: 'Use neutral, inclusive language; avoid cultural assumptions', enabled: true },
  { label: 'Summaries should be ≤120 words unless long form is requested', enabled: false },
];

export default function AiRules() {
  const [rules, setRules] = useState(initialRules);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are the Goddess Hair admin AI. Maintain a calm, transparent tone with clear next steps. ' +
      'Prioritize accuracy over speed. Surface risks proactively and ask for missing context when needed.'
  );
  const [styleNotes, setStyleNotes] = useState(
    'Tone: quiet confidence, pragmatic optimism. Vocabulary: clean, clinical, human. ' +
      'Structure: lead with the outcome, follow with rationale and 2-3 bullet actions.'
  );

  const toggleRule = (index) => {
    setRules((prev) =>
      prev.map((rule, i) =>
        i === index ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  return (
    <AdminShell
      title="AI System Rules"
      description="Define tone, risk boundaries, and publishing guardrails for automated content."
      actions={
        <button className="inline-flex items-center gap-2 rounded-full bg-text-strong px-4 py-2 text-sm font-semibold text-white shadow-ring transition hover:-translate-y-0.5">
          <Save className="h-4 w-4" />
          Save rules
        </button>
      }
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border-muted bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
                  System prompt
                </p>
                <h3 className="text-lg font-semibold text-text-strong">Primary guardrail</h3>
              </div>
              <Sparkles className="h-5 w-5 text-text-subtle" />
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-lg border border-border-muted bg-surface px-4 py-3 text-sm text-text-strong shadow-inner focus:border-text-strong focus:outline-none"
            />
            <p className="mt-2 text-xs text-text-muted">
              Keep it concise; this guides every automated call made from the admin workspace.
            </p>
          </div>

          <div className="rounded-xl border border-border-muted bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
                  Style sheet
                </p>
                <h3 className="text-lg font-semibold text-text-strong">Tone & phrasing</h3>
              </div>
              <Wand2 className="h-5 w-5 text-text-subtle" />
            </div>
            <textarea
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-lg border border-border-muted bg-surface px-4 py-3 text-sm text-text-strong shadow-inner focus:border-text-strong focus:outline-none"
            />
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border-muted bg-accent-soft p-3 text-sm text-text-strong">
                <p className="font-semibold">Must include</p>
                <p className="text-text-muted">Safety note + concise CTA</p>
              </div>
              <div className="rounded-lg border border-border-muted bg-accent-soft p-3 text-sm text-text-strong">
                <p className="font-semibold">Avoid</p>
                <p className="text-text-muted">Hype, slang, or absolutes</p>
              </div>
              <div className="rounded-lg border border-border-muted bg-accent-soft p-3 text-sm text-text-strong">
                <p className="font-semibold">Formatting</p>
                <p className="text-text-muted">Bullets over paragraphs</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border-muted bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
                  Rule set
                </p>
                <h3 className="text-lg font-semibold text-text-strong">Guardrails</h3>
              </div>
              <ShieldCheck className="h-5 w-5 text-text-subtle" />
            </div>
            <div className="mt-3 space-y-2">
              {rules.map((rule, index) => (
                <label
                  key={rule.label}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-muted bg-surface px-3 py-3 text-sm text-text-strong"
                >
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(index)}
                    className="mt-1 h-4 w-4 rounded border-border-muted text-text-strong focus:ring-text-strong"
                  />
                  <span className={!rule.enabled ? 'text-text-muted line-through' : ''}>
                    {rule.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border-muted bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
                  Warnings
                </p>
                <h3 className="text-lg font-semibold text-text-strong">Escalations</h3>
              </div>
              <AlertTriangle className="h-5 w-5 text-coral-700" />
            </div>
            <ul className="mt-3 space-y-2 text-sm text-text-strong">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                Flag if an answer references medical advice or permanent outcomes.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                Auto-block copy that uses superlatives like “miracle” or “guaranteed.”
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 text-primary" />
                Require human review when content references minors or health conditions.
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </AdminShell>
  );
}
