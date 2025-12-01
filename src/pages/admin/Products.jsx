import React from 'react';
import { Filter, Plus, ArrowUpRight, CheckCircle2, Clock, Pause } from 'lucide-react';
import AdminShell from '../../layouts/AdminShell';

const products = [
  {
    name: 'Revive Peptide Serum',
    sku: 'SKU-2034',
    status: 'Published',
    channel: 'Direct',
    price: '$68',
    updated: '2d ago',
  },
  {
    name: 'Botanical Repair Hair Oil',
    sku: 'SKU-1187',
    status: 'Review',
    channel: 'Affiliate',
    price: '$42',
    updated: '6h ago',
  },
  {
    name: 'Ceramide Barrier Mask',
    sku: 'SKU-9912',
    status: 'Draft',
    channel: 'Direct',
    price: '$54',
    updated: '1d ago',
  },
  {
    name: 'Cooling Scalp Mist',
    sku: 'SKU-7655',
    status: 'Published',
    channel: 'Affiliate',
    price: '$38',
    updated: '3d ago',
  },
];

const statusTone = {
  Published: 'bg-primary/10 text-primary',
  Review: 'bg-coral-100 text-coral-700',
  Draft: 'bg-accent-soft text-text-strong',
};

export default function Products() {
  return (
    <AdminShell
      title="Products"
      description="Curate, validate, and publish catalog items across direct and affiliate channels."
      actions={
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-full border border-border-muted bg-card px-4 py-2 text-sm font-medium text-text-strong shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
            <Filter className="h-4 w-4 text-text-subtle" />
            Filters
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-text-strong px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-ring">
            <Plus className="h-4 w-4" />
            Add product
          </button>
        </div>
      }
    >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border-muted bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-[0.14em] text-text-subtle">Publishing</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-semibold text-text-strong">82</span>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-text-muted">Live products</p>
        </div>
        <div className="rounded-xl border border-border-muted bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-[0.14em] text-text-subtle">Review queue</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-semibold text-text-strong">12</span>
            <Clock className="h-5 w-5 text-text-subtle" />
          </div>
          <p className="text-sm text-text-muted">Waiting on validation</p>
        </div>
        <div className="rounded-xl border border-border-muted bg-card p-4 shadow-soft">
          <p className="text-xs uppercase tracking-[0.14em] text-text-subtle">Drafts</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-2xl font-semibold text-text-strong">7</span>
            <Pause className="h-5 w-5 text-text-subtle" />
          </div>
          <p className="text-sm text-text-muted">Need content polish</p>
        </div>
      </section>

      <section className="rounded-xl border border-border-muted bg-card p-5 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-text-subtle">
              Catalog
            </p>
            <h3 className="text-lg font-semibold text-text-strong">Products list</h3>
          </div>
          <a
            href="/admin/validation"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-strong"
          >
            Validation workspace
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border-muted">
          <table className="min-w-full divide-y divide-border-muted">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Channel
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted bg-card">
              {products.map((product) => (
                <tr key={product.sku} className="hover:bg-accent-soft/80">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-text-strong">{product.name}</p>
                      <p className="text-xs text-text-muted">{product.sku}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusTone[product.status]}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-text-strong">
                      {product.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-text-strong">
                    {product.price}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-muted">{product.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
