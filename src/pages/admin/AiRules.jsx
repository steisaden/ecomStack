// src/pages/admin/AiRules.jsx
import { AdminShell } from "@/layouts/AdminShell";

export default function AiRulesPage() {
  return (
    <AdminShell
      title="AI System Rules"
      description="Control how the AI writes, speaks, and describes your brand."
      backHref="/admin"
      showBack
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="bg-card border border-border-muted rounded-xl shadow-card p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Tone & Voice
            </p>
            <input
              type="text"
              placeholder="Warm, professional, encouraging..."
              className="mt-2 w-full h-10 px-3 text-sm border border-border-muted rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Title Style
            </p>
            <textarea
              rows={3}
              className="mt-2 w-full px-3 py-2 text-sm border border-border-muted rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Keep titles clear, keyword-rich, and under 60 characters..."
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Words to Avoid
            </p>
            <textarea
              rows={3}
              className="mt-2 w-full px-3 py-2 text-sm border border-border-muted rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Avoid: miracle, guaranteed, cure..."
            />
          </div>
        </div>

        {/* Right column */}
        <div className="bg-card border border-border-muted rounded-xl shadow-card p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Brand Voice Description
            </p>
            <textarea
              rows={4}
              className="mt-2 w-full px-3 py-2 text-sm border border-border-muted rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Describe the brand's personality, values, and how it should talk..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Max Title Length
              </p>
              <input
                type="number"
                className="mt-2 w-full h-10 px-3 text-sm border border-border-muted rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                defaultValue={60}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Max Description Length
              </p>
              <input
                type="number"
                className="mt-2 w-full h-10 px-3 text-sm border border-border-muted rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                defaultValue={160}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button className="px-3 py-2 text-xs rounded-lg border border-border-muted bg-surface hover:bg-surface-alt">
              Reset
            </button>
            <button className="px-3 py-2 text-xs rounded-lg bg-primary text-white hover:bg-primary-strong">
              Save AI Rules
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
