'use client';

import { useState } from 'react';
import { AdminShell } from '@/layouts/AdminShell';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCallback } from 'react';

export default function AffiliateBulkScrapePage() {
  const [lines, setLines] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const [savingIds, setSavingIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [saveErrors, setSaveErrors] = useState({});
  const [saveSuccessAll, setSaveSuccessAll] = useState('');
  const [saveErrorAll, setSaveErrorAll] = useState('');

  const formatItem = useCallback((item) => {
    return {
      asin: item.asin || '',
      title: item.title || '',
      price: item.price || '',
      features: item.features || [],
      image: item.image || '',
      affiliateUrl: item.affiliateUrl || item.sourceUrl || '',
      sourceUrl: item.sourceUrl || '',
    };
  }, []);

  const copyItem = useCallback((item) => {
    const payload = formatItem(item);
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2)).catch(() => {});
  }, [formatItem]);

  const copyAll = useCallback(() => {
    if (!results.length) return;
    const payload = results.map((r) => formatItem(r));
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2)).catch(() => {});
  }, [results, formatItem]);

  const mapToAffiliatePayload = (item) => {
    const numericPrice = parseFloat((item.price || '').replace(/[^0-9.]/g, '')) || 0;
    return {
      asin: item.asin || '',
      title: item.title || '',
      brand: '', // not scraped here; can be filled manually later
      price: numericPrice,
      imageUrl: item.image || '',
      features: item.features || [],
      sourceUrl: item.sourceUrl || '',
      affiliateUrl: item.affiliateUrl || '',
    };
  };

  const saveItem = async (item) => {
    const asin = item.asin || item.title || Math.random().toString(36).slice(2);
    setSavingIds((prev) => new Set(prev).add(asin));
    setSaveErrors((prev) => ({ ...prev, [asin]: undefined }));
    setSaveSuccessAll('');
    setSaveErrorAll('');
    try {
      const payload = mapToAffiliatePayload(item);
      const res = await fetch('/api/admin/affiliate-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      setSavedIds((prev) => new Set(prev).add(asin));
      setSaveErrors((prev) => ({ ...prev, [asin]: undefined }));
    } catch (e) {
      setSaveErrors((prev) => ({ ...prev, [asin]: e?.message || 'Save failed' }));
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(asin);
        return next;
      });
    }
  };

  const saveAll = async () => {
    setSaveSuccessAll('');
    setSaveErrorAll('');
    for (const item of results) {
      // eslint-disable-next-line no-await-in-loop
      await saveItem(item);
    }
    const anyErrors = results.some((r) => saveErrors[r.asin]);
    if (results.length && !anyErrors) {
      setSaveSuccessAll('All items saved to catalog.');
    } else if (anyErrors) {
      setSaveErrorAll('Some items failed to save. See rows for details.');
    }
  };

  const handleFetch = async () => {
    const items = lines
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        if (line.startsWith('http')) return { url: line };
        return { asin: line };
      });

    if (!items.length) return;

    setLoading(true);
    setResults([]);
    setErrors([]);

    try {
      const res = await fetch('/api/admin/affiliate-products/bulk-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrors([{ error: data.error || 'Failed to fetch', asin: '' }]);
      } else {
        setResults(data.products || []);
        setErrors(data.errors || []);
      }
    } catch (e) {
      setErrors([{ error: e?.message || 'Request failed', asin: '' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell
      title="Bulk Amazon Scrape"
      description="Paste ASINs or Amazon URLs to pull title, price, features, and image for affiliate products."
      backHref="/admin"
      showBack
    >
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import</CardTitle>
          <CardDescription>One ASIN or URL per line.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-strong">ASINs / URLs</label>
            <Textarea
              value={lines}
              onChange={(e) => setLines(e.target.value)}
              placeholder="B0CXXXXXXX&#10;https://www.amazon.com/dp/B0CXXXXXXX"
              className="min-h-[140px]"
            />
            <Button onClick={handleFetch} disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Fetching...' : 'Fetch Preview'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Loading</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-56" />
          </CardContent>
        </Card>
      )}

      {!loading && (results.length > 0 || errors.length > 0) && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {results.length} parsed, {errors.length} errors
            </CardDescription>
            {results.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={copyAll}>
                    Copy all as JSON
                  </Button>
                  <Button onClick={saveAll} disabled={savingIds.size > 0}>
                    {savingIds.size > 0 ? 'Saving...' : 'Save all to catalog'}
                  </Button>
                </div>
              </div>
            )}
            {saveSuccessAll && (
              <p className="text-xs text-primary mt-2">{saveSuccessAll}</p>
            )}
            {saveErrorAll && (
              <p className="text-xs text-destructive mt-2">{saveErrorAll}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((item, idx) => (
              <div
                key={`${item.asin || 'item'}-${idx}`}
                className="rounded-lg border border-border-muted bg-card p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-text-strong">{item.title || 'Untitled'}</div>
                  <span className="text-xs text-text-muted">{item.asin}</span>
                </div>
                <div className="text-sm text-text-muted">Price: {item.price || 'No price'}</div>
                <div className="text-sm text-text-muted">Affiliate URL: {item.affiliateUrl || item.sourceUrl || 'N/A'}</div>
                {item.image && (
                  <div className="text-xs text-primary truncate">
                    <a href={item.image} target="_blank" rel="noreferrer">
                      Image URL
                    </a>
                  </div>
                )}
                {item.features && item.features.length > 0 && (
                  <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                    {item.features.slice(0, 3).map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-end gap-2">
                  {saveErrors[item.asin] && (
                    <span className="text-xs text-destructive">{saveErrors[item.asin]}</span>
                  )}
                  {savedIds.has(item.asin) && (
                    <span className="text-xs text-primary">Saved</span>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => copyItem(item)}>
                    Copy details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => saveItem(item)}
                    disabled={savingIds.has(item.asin)}
                  >
                    {savingIds.has(item.asin) ? 'Saving…' : 'Save to catalog'}
                  </Button>
                </div>
              </div>
            ))}
            {errors.length > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {errors.map((err, idx) => (
                  <div key={idx}>ASIN {err.asin || '(unknown)'}: {err.error}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}
