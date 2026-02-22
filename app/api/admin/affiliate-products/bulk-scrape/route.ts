import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type InputItem = { asin?: string; url?: string };
type ParsedItem = {
  asin: string;
  title?: string;
  price?: string;
  features?: string[];
  image?: string;
  sourceUrl: string;
  affiliateUrl: string;
};

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

// Simple in-memory cache with TTL
const cache = new Map<
  string,
  { expires: number; data: ParsedItem | { error: string; asin: string } }
>();
const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

function normalizeAsinAndUrl(item: InputItem): { asin?: string; url?: string } {
  if (item.asin) return { asin: item.asin, url: item.url };
  if (item.url) {
    try {
      const u = new URL(item.url);
      const dpIndex = u.pathname.split('/').findIndex((segment) => segment === 'dp');
      if (dpIndex !== -1) {
        const asin = u.pathname.split('/')[dpIndex + 1];
        return { asin, url: item.url };
      }
    } catch {
      return { url: item.url };
    }
  }
  return { asin: undefined, url: item.url };
}

function addAffiliateTag(url: string, tag?: string) {
  if (!tag) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('tag', tag);
    return u.toString();
  } catch {
    return url;
  }
}

function isExpired(entry?: { expires: number }) {
  if (!entry) return true;
  return Date.now() > entry.expires;
}

async function fetchProductPage(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseProduct(html: string, asin: string, url: string, affiliateTag?: string): ParsedItem {
  const $ = cheerio.load(html);
  const title = $('#productTitle').text().trim() || undefined;

  const price =
    $('#corePriceDisplay_desktop_featurediv .a-price-whole').first().text().trim() ||
    $('#corePriceDisplay_desktop_featurediv .a-offscreen').first().text().trim() ||
    $('#priceblock_ourprice').text().trim() ||
    $('#priceblock_dealprice').text().trim() ||
    $('.a-price .a-offscreen').first().text().trim() ||
    undefined;

  const features = $('#feature-bullets ul li span')
    .map((_i, el) => $(el).text().trim())
    .get()
    .filter(Boolean);

  const img =
    $('#imgTagWrapperId img').attr('data-old-hires') ||
    $('#imgTagWrapperId img').attr('src') ||
    undefined;

  const sourceUrl = url;
  const affiliateUrl = addAffiliateTag(url, affiliateTag);

  return {
    asin,
    title,
    price,
    features,
    image: img,
    sourceUrl,
    affiliateUrl,
  };
}

async function scrapeItem(item: InputItem, affiliateTag?: string) {
  const { asin, url } = normalizeAsinAndUrl(item);
  if (!asin && !url) {
    return { error: 'Missing ASIN or URL', asin: asin || '' };
  }

  const finalAsin = asin || '';
  const productUrl = url || `https://www.amazon.com/dp/${finalAsin}`;
  const cacheKey = finalAsin || productUrl;
  const cached = cache.get(cacheKey);
  if (!isExpired(cached)) {
    return cached!.data;
  }

  try {
    const html = await fetchProductPage(productUrl);
    const parsed = parseProduct(html, finalAsin, productUrl, affiliateTag);
    cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, data: parsed });
    return parsed;
  } catch (err: any) {
    const errorResult = { error: err?.message || 'Failed to scrape product', asin: finalAsin };
    cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, data: errorResult });
    return errorResult;
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }
    const body = await request.json();
    const items: InputItem[] = Array.isArray(body?.items) ? body.items : [];
    const affiliateTag =
      process.env.AMAZON_ASSOCIATE_TAG ||
      process.env.AMAZON_PAAPI_PARTNER_TAG ||
      undefined;

    if (!items.length) {
      return NextResponse.json(
        { success: false, error: 'No items provided', products: [], errors: [] },
        { status: 400 }
      );
    }

    const results: Array<ParsedItem | { error: string; asin: string }> = [];
    for (const item of items) {
      // Throttle lightly: 200ms gap to reduce concurrent fetch spikes
      // eslint-disable-next-line no-await-in-loop
      const result = await scrapeItem(item, affiliateTag);
      results.push(result);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 200));
    }

    const products = results.filter((r): r is ParsedItem => !(r as any).error);
    const errors = results.filter((r): r is { error: string; asin: string } => (r as any).error);

    return NextResponse.json({
      success: true,
      products,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Bulk scrape error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to scrape affiliate products',
        message: error?.message || 'Unknown error',
        products: [],
        errors: [],
      },
      { status: 500 }
    );
  }
}
