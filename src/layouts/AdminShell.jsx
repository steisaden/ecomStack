import React from 'react';
import {
  ShieldCheck,
  Bell,
  CheckCircle2,
  Circle,
  ArrowUpRight,
} from 'lucide-react';

const defaultNav = [
  { label: 'Overview', href: '/admin/dashboard' },
  { label: 'Products', href: '/admin/products' },
  { label: 'AI System Rules', href: '/admin/ai-rules' },
  { label: 'Content', href: '/admin/content' },
  { label: 'Settings', href: '/admin/settings' },
];

const defaultNotices = [
  { label: 'Session monitored', status: 'active' },
  { label: 'Backups synced', status: 'idle' },
  { label: '2FA enforced', status: 'active' },
];

const statusDot = (status) => {
  if (status === 'active') {
    return <CheckCircle2 className="h-4 w-4 text-primary" />;
  }
  return <Circle className="h-4 w-4 text-text-subtle" />;
};

export default function AdminShell({
  title,
  description,
  actions,
  children,
  navItems = defaultNav,
  notices = defaultNotices,
}) {
  return (
    <div className="min-h-screen bg-surface text-text-muted">
      <div className="border-b border-border-muted bg-accent-soft/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-text-strong">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Admin area — actions are audited</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-card px-3 py-1 text-xs font-medium text-text-muted shadow-card sm:flex">
              SOC2 controls aligned
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-muted bg-card shadow-soft">
              <Bell className="h-4 w-4 text-text-subtle" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-56px)] max-w-7xl grid-cols-1 md:grid-cols-[250px_1fr]">
        <aside className="hidden border-r border-border-muted bg-card shadow-soft md:block">
          <div className="flex items-center justify-between px-5 pb-4 pt-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-text-subtle">
                Navigation
              </p>
              <p className="text-sm font-medium text-text-strong">Control Center</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-text-subtle" />
          </div>
          <nav className="space-y-1 px-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-accent-soft hover:text-text-strong"
              >
                <span>{item.label}</span>
                <ArrowUpRight className="h-4 w-4 text-text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </nav>
          <div className="mt-6 border-t border-border-muted px-5 pt-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-text-subtle">
              Security
            </p>
            <div className="mt-3 space-y-2">
              {notices.map((notice) => (
                <div
                  key={notice.label}
                  className="flex items-center justify-between rounded-lg border border-border-muted bg-accent-soft px-3 py-2 text-xs font-medium text-text-muted"
                >
                  <span>{notice.label}</span>
                  {statusDot(notice.status)}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex flex-col">
          <header className="border-b border-border-muted bg-card px-5 py-6 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
                  Admin workspace
                </p>
                <h1 className="text-2xl font-semibold text-text-strong">{title}</h1>
                {description && (
                  <p className="max-w-3xl text-sm text-text-muted">{description}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </header>

          <main className="flex-1 bg-surface px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
