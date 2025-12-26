// src/pages/admin/Products.jsx
// src/pages/admin/Products.jsx
'use client';

import { AdminShell } from "@/layouts/AdminShell";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ContentfulProducts = dynamic(() => import("@/components/ContentfulProducts"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  ),
});

export default function ProductsPage() {
  return (
    <AdminShell
      title=""
      description=""
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Commerce
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/affiliate-products/manage"
            className="px-3 py-2 text-xs rounded-lg border border-border-muted bg-surface hover:bg-surface-alt"
          >
            Manage Affiliate Products
          </a>
          <a
            href="/admin/products/create"
            className="px-3 py-2 text-xs rounded-lg bg-primary text-white hover:bg-primary-strong"
          >
            + New Product
          </a>
        </div>
      </div>

      <div className="bg-card border border-border-muted rounded-xl shadow-card p-4">
        <ContentfulProducts />
      </div>
    </AdminShell>
  );
}
