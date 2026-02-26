// Shared types for both client and server components
// This file should not import any server-only functions
import type { EntrySkeletonType } from 'contentful'

export interface ContentfulProduct {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    description: any; // Rich text
    price?: number;
    images: ContentfulAsset[];
    category?: ContentfulCategory;
    inStock: boolean;
    isAffiliate: boolean;
    affiliateUrl?: string;
    slug: string;
  };
}

// Simplified types - removing skeleton types that cause build issues

export interface Product {
  sys: { id: string };
  title: string;
  description: string;
  price?: number;
  images: Asset[];
  category?: Category;
  inStock: boolean;
  isAffiliate: boolean;
  affiliateUrl?: string;
  slug: string;
}

export interface ContentfulBlogPost {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedVersion?: number;
  };
  fields: {
    title: string;
    slug: string;
    excerpt: string;
    content: any; // Rich text content
    featuredImage?: ContentfulAsset;
    author: ContentfulAuthor;
    categories: ContentfulCategory[];
    tags?: string[];
    publishedAt?: string; // ISO 8601 date string
    views?: number;
    likes?: number;
  };
}

// Removed skeleton type

export interface BlogPost {
  sys: {
    id: string;
    createdAt: string;
    updatedAt: string;
    publishedVersion?: number;
  };
  title: string;
  slug: string;
  excerpt: string;
  content: any; // Rich text content
  featuredImage?: Asset;
  author: Author;
  categories: Category[];
  tags?: string[];
  publishedAt?: string; // ISO 8601 date string
  views?: number;
  likes?: number;
}

export interface ContentfulCategory {
  sys: { id: string };
  fields: {
    name: string;
    slug: string;
  };
}

// Removed skeleton type

export interface Category {
  name: string;
  slug: string;
}

export interface ContentfulAboutContent {
  sys: { id: string };
  fields: {
    title: string;
    mainContent: any;
    mission?: string;
    vision?: string;
    image?: ContentfulAsset;
  };
}

// Removed skeleton type

export interface AboutContent {
  title: string;
  mainContent: any;
  mission?: string;
  vision?: string;
  image?: Asset;
}

export interface ContentfulSocialMediaSettings {
  sys: { id: string };
  fields: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    patreon?: string;
  };
}

// Removed skeleton type

export interface SocialMediaSettings {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  patreon?: string;
}

// Affiliate Product Types
export interface ContentfulAffiliateProduct {
  sys: { id: string };
  fields: {
    title: string;
    description: string;
    price?: number;
    imageUrl?: string;
    affiliateUrl: string;
    category?: string;
    tags?: string[];
    commissionRate?: number;
    platform: string;
    performance?: {
      clicks: number;
      conversions: number;
      revenue: number;
      conversionRate: number;
      lastUpdated: string;
    };
    status: 'active' | 'inactive' | 'pending';
    scheduledPromotions?: {
      startDate: string;
      endDate: string;
      discount?: number;
    }[];
    // New fields for Amazon Product Enhancement System
    imageRefreshStatus?: ImageRefreshStatus;
    linkValidationStatus?: LinkValidationStatus;
    lastImageRefresh?: string;
    lastLinkCheck?: string;
    needsReview?: boolean;
  };
}

export type ImageRefreshStatus = 'current' | 'outdated' | 'failed';
export type LinkValidationStatus = 'valid' | 'invalid' | 'checking';

export interface AffiliateProduct {
  id: string;
  title: string;
  description: string;
  asin?: string; // Amazon Standard Identification Number
  price: number | {
    amount: number;
    currency: string;
    displayAmount: string;
  };
  imageUrl?: string;
  affiliateUrl: string;
  category?: string;
  tags: string[];
  commissionRate: number;
  platform: string;
  performance: {
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
    lastUpdated: string;
  };
  status: 'active' | 'inactive' | 'pending';
  scheduledPromotions: {
    startDate: string;
    endDate: string;
    discount?: number;
  }[];
  // New fields for Amazon Product Enhancement System
  imageRefreshStatus: ImageRefreshStatus;
  linkValidationStatus: LinkValidationStatus;
  lastImageRefresh?: string;
  lastLinkCheck?: string;
  needsReview: boolean;
  amazonData?: {
    brand?: string;
    features?: string[];
    availability?: string;
    lastFetched?: string;
    detailPageURL?: string;
  };
  validation?: {
    asinValid: boolean;
    lastValidated?: string;
    validationError?: string;
  };
}

export interface AIRecommendation {
  productId: string | null;
  title: string;
  reason: string;
  confidence: number;
  predictedPerformance: {
    clicks: number;
    conversions: number;
    revenue: number;
  };
  suggestedAction: 'add' | 'promote' | 'optimize' | 'remove';
}

export interface PerformanceMetrics {
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  avgCommissionRate: number;
  topPerforming: AffiliateProduct[];
  recommendations: AIRecommendation[];
}

// Global Settings Types - Transformed Application Types
export interface ContentfulAsset {
  sys: {
    id: string;
    type: string;
  };
  fields: {
    title?: string;
    description?: string;
    file: {
      url: string;
      details: {
        size: number;
        image?: {
          width: number;
          height: number;
        };
      };
      fileName: string;
      contentType: string;
    };
  };
}

// Removed skeleton type

export interface Asset {
  url: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  contentType: string;
}

export interface ContentfulNavigationItem {
  sys: { id: string };
  fields: {
    label: string;
    href: string;
    icon?: string;
    external?: boolean;
    disabled?: boolean;
    order: number;
    children?: ContentfulNavigationItem[];
  };
}

// Removed skeleton type

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  external?: boolean;
  disabled?: boolean;
  order: number;
  children?: NavigationItem[];
}

export interface ContentfulSocialLink {
  sys: { id: string };
  fields: {
    platform: string;
    url: string;
    icon?: ContentfulAsset;
  };
}

// Removed skeleton type

export interface SocialLink {
  platform: string;
  url: string;
  icon?: Asset;
}

export interface ContentfulContactInfo {
  sys: { id: string };
  fields: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

// Removed skeleton type

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

export interface ContentfulCTAButton {
  sys: { id: string };
  fields: {
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'accent';
    external?: boolean;
  };
}

// Removed skeleton type

export interface CTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary' | 'accent';
  external?: boolean;
}

export interface ContentfulHeroContent {
  sys: { id: string };
  fields: {
    title: string;
    subtitle?: string;
    backgroundImage?: ContentfulAsset;
    primaryCTA?: ContentfulCTAButton;
    secondaryCTA?: ContentfulCTAButton;
  };
}

// Removed skeleton type

export interface HeroContent {
  title: string;
  subtitle?: string;
  backgroundImage?: Asset;
  primaryCTA?: CTAButton;
  secondaryCTA?: CTAButton;
}

export interface ContentfulFooterSection {
  contentTypeId: 'footerSection';
  sys: { id: string };
  fields: {
    title: string;
    links: ContentfulNavigationItem[];
    order: number;
  };
}

// Removed skeleton type

export interface FooterSection {
  title: string;
  links: NavigationItem[];
  order: number;
}

export interface ContentfulGlobalSettings {
  sys: {
    id: string;
    contentType: { sys: { id: 'globalSettings' } };
    createdAt: string;
    updatedAt: string;
  };
  fields: {
    siteTitle: string;
    siteDescription: string;
    seoKeywords?: string[];
    favicon?: ContentfulAsset;
    logo?: ContentfulAsset;
    primaryNavigation?: ContentfulNavigationItem[];
    footerNavigation?: ContentfulFooterSection[];
    contactInfo?: ContentfulContactInfo;
    socialLinks?: ContentfulSocialLink[];
    heroContent?: ContentfulHeroContent;
    featuredProducts?: ContentfulProduct[];
    copyrightText?: string;
    footerSections?: ContentfulFooterSection[];
  };
}

// Removed skeleton type

export interface GlobalSettings {
  siteTitle: string;
  siteDescription: string;
  seoKeywords: string[];
  favicon?: Asset;
  logo?: Asset;
  navigation: NavigationItem[];
  footerNavigation: FooterSection[];
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  heroContent?: HeroContent;
  featuredProducts?: Product[];
  copyrightText: string;
  footerSections: FooterSection[];
  lastUpdated: Date;
}

export interface Author {
  name: string;
  avatar?: Asset;
  bio?: any; // Rich text content
}

export interface ContentfulAuthor {
  sys: { id: string };
  fields: {
    name: string;
    avatar?: ContentfulAsset;
    bio?: any; // Rich text content
  };
}

// Removed skeleton type

// Default/Fallback Settings
export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  siteTitle: 'Goddess Care Co',
  siteDescription: 'Handcrafted oils and natural beauty essentials',
  seoKeywords: ['beauty', 'skincare', 'natural', 'handcrafted', 'oils'],
  navigation: [
    { id: '1', label: 'Home', href: '/', order: 1 },
    { id: '2', label: 'Products', href: '/products', order: 2 },
    { id: '3', label: 'Blog', href: '/blog', order: 3 },
    { id: '4', label: 'About', href: '/about', order: 4 }
  ],
  contactInfo: {
    email: 'goddesshairandbodycare@gmail.com'
  },
  socialLinks: [],
  copyrightText: `© ${new Date().getFullYear()} Goddess Care Co. All rights reserved.`,
  footerSections: [],
  footerNavigation: [],
  featuredProducts: [],
  lastUpdated: new Date()
}

// Order Types
export interface Order {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customerName?: string;
  customerEmail?: string;
}

// Dashboard Types
export interface ContentStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  draftBlogPosts: number;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  revenueThisMonth: number;
  revenueThisYear: number;
  topPaymentMethods: {
    method: string;
    count: number;
    totalAmount: number;
  }[];
  recentOrders: Order[];
  monthlyRevenue: {
    month: string;
    revenue: number;
    orders: number;
  }[];
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  apiResponseTime: number;
  databaseConnections: number;
}

export interface DashboardData {
  contentStats: ContentStats;
  salesMetrics: SalesMetrics;
  systemHealth: SystemHealth;
}

export interface ProductMetrics {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  inventoryStatus: {
    inStock: number;
    outOfStock: number;
  };
  topSellingProducts: {
    product: Product;
    sales: number;
  }[];
}

export interface BlogMetrics {
  totalPosts: number;
  postsThisMonth: number;
  postsByCategory: {
    category: string;
    count: number;
  }[];
  mostViewedPosts: {
    post: BlogPost;
    views: number;
  }[];
}

// Yoga Booking Types
export interface YogaService {
  sys: { id: string };
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  includedAmenities: string[];
  luxuryFeatures: string[];
  image?: Asset;
  displayOrder: number;
  slug: string;
}

export interface ContentfulAddOnExperience {
  sys: { id: string };
  fields: {
    name: string;
    description: string;
    price: number;
    applicableServices: string[];
    image?: ContentfulAsset;
  };
}

export interface AddOnExperience {
  sys: { id: string };
  name: string;
  description: string;
  price: number;
  applicableServices: string[];
  image?: Asset;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface ServiceAvailability {
  [date: string]: TimeSlot[];
}

// Availability Types
export interface Availability {
  [date: string]: {
    [time: string]: 'available' | 'booked' | 'unavailable';
  };
}

// AI and Analytics Types

// Tracking Events
export interface TrackingEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType:
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'checkout_start'
  | 'payment_initiated'
  | 'purchase_completed'
  | 'product_search'
  | 'category_view'
  | 'wishlist_add'
  | 'share_action'
  | string;
  productId?: string;
  category?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  url?: string;
  referrer?: string;
}

export interface ClickEvent {
  id: string;
  userId?: string;
  sessionId: string;
  elementId?: string;
  elementName?: string;
  elementType: string;
  url: string;
  referrer?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  x?: number;
  y?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

// Conversion Funnel Types
export interface ConversionFunnelStep {
  name: string;
  eventTypes: string[];
  count: number;
  dropOffRate: number;
}

export interface ConversionFunnelAnalysis {
  totalVisitors: number;
  funnelSteps: ConversionFunnelStep[];
  conversionRate: number;
  revenueGenerated: number;
  averageOrderValue: number;
  topConversionPaths: Array<{
    path: string[];
    count: number;
    conversionRate: number;
  }>;
  timeToConvert: {
    avg: number;
    median: number;
  };
  period: {
    start: string;
    end: string;
  };
}

// ROI Tracking Types
export interface ROIMetric {
  productId: string;
  productName: string;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  roiPercentage: number;
  salesCount: number;
  averageOrderValue: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  conversionRate: number;
  impressions: number;
  clicks: number;
  clickThroughRate: number;
  timePeriod: {
    start: string;
    end: string;
  };
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  totalSales: number;
  totalRevenue: number;
  unitsSold: number;
  avgSalePrice: number;
  grossProfit: number;
  marketingSpend: number;
  roi: number;
  performanceTrend: 'increasing' | 'decreasing' | 'stable';
  efficiencyRating: number;
}

// Click Tracking Types
export interface ClickTrackingData {
  elementId: string;
  elementName: string;
  totalClicks: number;
  uniqueUsers: number;
  clickThroughRate: number;
  avgTimeOnPage: number;
  conversionRate: number;
  regionClicks: Array<{ x: number; y: number; count: number }>;
  timeDistribution: Array<{ hour: number; clicks: number }>;
  performanceTrend: Array<{ date: string; clicks: number }>;
}

export interface RealTimeClickAnalytics {
  totalClicks: number;
  uniqueUsers: number;
  topClickElements: Array<{
    elementId: string;
    elementName: string;
    clickCount: number;
    clickThroughRate: number;
  }>;
  clickHeatmap: Array<{ x: number; y: number; intensity: number }>;
  activeUsers: number;
  avgSessionDuration: number;
  pageEngagement: number;
  referrerBreakdown: Array<{ source: string; clicks: number }>;
}
''