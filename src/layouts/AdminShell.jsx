'use client';

// src/layouts/AdminShell.jsx
import { useState } from "react";
import { Menu, X } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export function AdminShell({
  title,
  description,
  children,
  backHref = "/admin",
  showBack = true,
  userName = "admin",
}) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Products", href: "/admin/products" },
    { label: "Blog Posts", href: "/admin/blog-posts" },
    { label: "Affiliate Products", href: "/admin/affiliate-products" },
    { label: "Bulk Scrape", href: "/admin/affiliate-products/bulk-scrape" },
    { label: "AI Rules", href: "/admin/ai-rules" },
    { label: "Yoga Services", href: "/admin/yoga-services" },
    { label: "Availability", href: "/admin/yoga-availability" },
    { label: "Social Media", href: "/admin/social-media" },
    { label: "About Page", href: "/admin/about-page" },
    { label: "Validation", href: "/admin/validation" },
    { label: "Settings", href: "/admin/reset-auth" },
  ];

  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <div className="flex">
        {/* Sidebar (hook up your actual sidebar component here) */}
        <aside className="hidden md:block w-64 border-r border-border-muted bg-panel">
          <div className="p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted mb-3">
              Admin
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-alt hover:text-text-strong"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-40px)] flex flex-col">
          {/* Page header */}
          <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-muted bg-surface">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden inline-flex items-center justify-center rounded-md border border-border-muted bg-surface px-2.5 py-2 text-text-strong hover:bg-surface-alt"
                onClick={() => setIsNavOpen(true)}
                aria-label="Open admin navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-text-strong">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-text-muted mt-1">{description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {showBack && (
                <a
                  href={backHref}
                  className="inline-flex items-center gap-2 rounded-md border border-border-muted bg-surface px-3 py-1.5 text-xs font-medium text-text-strong hover:bg-surface-alt"
                >
                  ← Back to Admin Dashboard
                </a>
              )}
              <span className="hidden sm:inline text-xs text-text-muted">
                Welcome, {userName}
              </span>
              <LogoutButton />
            </div>
          </header>

          {/* Page body */}
          <section className="flex-1 px-4 sm:px-6 py-6 bg-surface-alt">
            {children}
          </section>
        </main>
      </div>

      {/* Mobile nav drawer */}
      {isNavOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="flex-1 bg-black/30"
            onClick={() => setIsNavOpen(false)}
            aria-label="Close navigation"
          />
          <div className="w-72 max-w-[80vw] bg-panel border-l border-border-muted shadow-card">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border-muted">
              <p className="text-sm font-semibold text-text-strong">Admin</p>
              <button
                className="rounded-md border border-border-muted bg-surface px-2 py-1 text-text-strong hover:bg-surface-alt"
                onClick={() => setIsNavOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-alt hover:text-text-strong"
                  onClick={() => setIsNavOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
