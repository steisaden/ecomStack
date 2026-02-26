'use client';

// src/pages/admin/BlogPosts.jsx
// src/pages/admin/BlogPosts.jsx
'use client';

import { AdminShell } from "@/layouts/AdminShell";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ContentfulBlogPosts = dynamic(
  () => import("@/components/ContentfulBlogPosts"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    ),
  }
);

export default function BlogPostsPage() {
  return (
    <AdminShell
      title="Blog Posts"
      description="Write, schedule, and manage blog content."
      backHref="/admin"
      showBack
    >
      <div className="bg-card border border-border-muted rounded-xl shadow-card p-4">
        <ContentfulBlogPosts />
      </div>
    </AdminShell>
  );
}
