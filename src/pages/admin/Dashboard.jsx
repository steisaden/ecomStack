'use client';

// src/pages/admin/Dashboard.jsx
import { AdminShell } from "@/layouts/AdminShell";
import DashboardStatistics from "@/components/DashboardStatistics";

const cards = [
  {
    id: "products",
    title: "Products",
    description: "Manage affiliate & regular products.",
    cta: "Open Products",
    href: "/admin/products",
  },
  {
    id: "services",
    title: "Yoga Services",
    description: "Configure offerings & pricing.",
    cta: "Manage Services",
    href: "/admin/yoga-services",
  },
  {
    id: "availability",
    title: "Availability",
    description: "Control your booking slots.",
    cta: "Edit Availability",
    href: "/admin/yoga-availability",
  },
  {
    id: "aiRules",
    title: "AI Rules",
    description: "Set brand voice & content rules.",
    cta: "Open AI Rules",
    href: "/admin/ai-rules",
  },
  {
    id: "blog",
    title: "Blog Posts",
    description: "Write and schedule articles.",
    cta: "Manage Blog",
    href: "/admin/blog-posts",
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect Stripe, Contentful, Amazon…",
    cta: "View Integrations",
    href: "/admin/validation",
  },
];

export default function DashboardPage({ user }) {
  return (
    <AdminShell
      title="Admin Dashboard"
      description="Overview of your business systems at a glance."
      showBack={false}
    >
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            className="bg-card border border-border-muted rounded-xl shadow-card px-4 py-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-sm font-semibold text-text-strong">
                {card.title}
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                {card.description}
              </p>
            </div>
            <a
              href={card.href}
              className="mt-4 inline-flex text-xs font-medium text-primary hover:text-primary-strong"
            >
              {card.cta} →
            </a>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border-muted bg-card p-4 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Analytics
        </p>
        <DashboardStatistics />
      </div>
    </AdminShell>
  );
}
