'use client';

// src/layouts/AdminShell.jsx
// src/layouts/AdminShell.jsx
import LogoutButton from "@/components/LogoutButton";

export function AdminShell({
  title,
  description,
  children,
  backHref = "/admin",
  showBack = true,
  userName = "admin",
}) {

  return (
    <div className="min-h-screen bg-surface text-slate-900">
      <div className="flex">
        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-40px)] flex flex-col">
          {/* Page header */}
          <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border-muted bg-surface">
            <div className="flex items-center gap-3">
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
              {/* Controls removed as per request */}
            </div>
          </header>

          {/* Page body */}
          <section className="flex-1 px-4 sm:px-6 py-6 bg-surface-alt">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
