import React from 'react';
import {
  Sparkles,
  Boxes,
  Workflow,
  Shield,
  ArrowUpRight,
  TrendingUp,
  Clock3,
  CheckCircle2,
} from 'lucide-react';
import AdminShell from '../../layouts/AdminShell';

const metrics = [
  { label: 'Active products', value: '124', delta: '+8 this week' },
  { label: 'Queued validations', value: '6', delta: '3 need review' },
  { label: 'Publishing health', value: '98%', delta: 'Aligned with brand tone' },
];

const quickLinks = [
  {
    title: 'Products',
    description: 'Manage catalog, pricing, and publishing state.',
    href: '/admin/products',
    icon: Boxes,
  },
  {
    title: 'AI System Rules',
    description: 'Guardrails and tone-of-voice for automated output.',
    href: '/admin/ai-rules',
    icon: Sparkles,
  },
  {
    title: 'Workflows',
    description: 'Validate feeds, sync Contentful, monitor jobs.',
    href: '/admin/validation',
    icon: Workflow,
  },
];

const activity = [
  { title: 'Contentful sync completed', time: '2m ago', status: 'success' },
  { title: 'Affiliate feed queued for refresh', time: '18m ago', status: 'progress' },
  { title: '3 products flagged for copy polish', time: '41m ago', status: 'alert' },
];

export default function Dashboard() {
  return (
    <AdminShell
      title="Dashboard overview"
      description="A calm workspace that keeps the catalog, automations, and AI guardrails aligned."
      actions={
        <button className="rounded-full border border-border-muted bg-card px-4 py-2 text-sm font-medium text-text-strong shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
          New entry
        </button>
      }
    >
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border-muted bg-card p-4 shadow-card"
          >
            <p className="text-xs uppercase tracking-[0.14em] text-text-subtle">
              {item.label}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-semibold text-text-strong">{item.value}</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-2 text-sm text-text-muted">{item.delta}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-border-muted bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
              Shortcuts
            </p>
            <h2 className="text-lg font-semibold text-text-strong">Move quickly</h2>
          </div>
          <Clock3 className="h-5 w-5 text-text-subtle" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickLinks.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group flex flex-col justify-between rounded-lg border border-border-muted bg-surface px-4 py-5 transition hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-primary shadow-soft">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-strong">{item.title}</p>
                  <p className="text-sm text-text-muted">{item.description}</p>
                </div>
              </div>
              <ArrowUpRight className="mt-4 h-4 w-4 text-text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-border-muted bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
                Signals
              </p>
              <h3 className="text-lg font-semibold text-text-strong">Recent activity</h3>
            </div>
            <Shield className="h-5 w-5 text-text-subtle" />
          </div>
          <div className="mt-4 space-y-3">
            {activity.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-lg border border-border-muted bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {item.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                  {item.status === 'progress' && (
                    <Clock3 className="h-4 w-4 text-text-subtle" />
                  )}
                  {item.status === 'alert' && (
                    <Sparkles className="h-4 w-4 text-coral-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-text-strong">{item.title}</p>
                    <p className="text-xs text-text-muted">{item.time}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-text-subtle" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border-muted bg-card p-5 shadow-soft">
          <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
            Guardrails
          </p>
          <h3 className="text-lg font-semibold text-text-strong">Automation health</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-border-muted bg-accent-soft p-3">
              <p className="text-sm font-semibold text-text-strong">AI Rules</p>
              <p className="text-xs text-text-muted">All prompts within compliance thresholds</p>
            </div>
            <div className="rounded-lg border border-border-muted bg-accent-soft p-3">
              <p className="text-sm font-semibold text-text-strong">Publishing queue</p>
              <p className="text-xs text-text-muted">6 items staged for manual review</p>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
