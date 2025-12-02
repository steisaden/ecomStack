'use client';

import { AdminShell } from '@/layouts/AdminShell';

const cards = [
  {
    title: 'Add Amazon Product',
    description: 'Quickly add an Amazon ASIN or manual entry with affiliate tracking.',
    href: '/admin/affiliate-products/add-amazon',
    cta: 'Add Amazon Product',
  },
  {
    title: 'Manage Affiliate Products',
    description: 'Review, edit, and validate existing affiliate listings.',
    href: '/admin/affiliate-products/manage',
    cta: 'Open Management',
  },
  {
    title: 'Affiliate Dashboard',
    description: 'Monitor bulk actions, jobs, and validations for affiliate items.',
    href: '/admin/affiliate-products/dashboard',
    cta: 'View Dashboard',
  },
];

export default function AffiliateProductsPage() {
  return (
    <AdminShell
      title="Affiliate Products"
      description="Add and manage affiliate products with a consistent admin shell."
      backHref="/admin"
      showBack
    >
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.href}
            className="bg-card border border-border-muted rounded-xl shadow-card px-4 py-4 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-sm font-semibold text-text-strong">{card.title}</h2>
              <p className="mt-1 text-xs text-text-muted">{card.description}</p>
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
    </AdminShell>
  );
}
