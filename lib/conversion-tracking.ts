

// Types for tracking events and funnels
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

export interface ConversionFunnelStep {
  name: string;
  eventTypes: string[];
  count: number;
  dropOffRate: number;
}

export interface ConversionFunnelAnalysis {
  totalVisitors: number;
  funnelSteps: ConversionFunnelStep[];
  conversionRate: number; // Overall conversion rate
  revenueGenerated: number;
  averageOrderValue: number;
  topConversionPaths: Array<{
    path: string[];
    count: number;
    conversionRate: number;
  }>;
  timeToConvert: {
    avg: number; // in minutes
    median: number;
  };
  period: {
    start: string;
    end: string;
  };
}

// Simple in-memory storage for demo purposes
// In production, this would connect to a database like PostgreSQL, Redis, or a dedicated analytics service
class InMemoryEventStore {
  private events: TrackingEvent[] = [];
  private readonly maxSize: number = 10000; // Limit for demo purposes

  addEvent(event: TrackingEvent): void {
    this.events.push(event);

    // Trim if we exceed the max size
    if (this.events.length > this.maxSize) {
      this.events = this.events.slice(-this.maxSize);
    }
  }

  getEvents(filters?: {
    userId?: string;
    sessionId?: string;
    eventType?: string;
    productId?: string;
    startDate?: string;
    endDate?: string;
  }): TrackingEvent[] {
    return this.events.filter(event => {
      if (filters?.userId && event.userId !== filters.userId) return false;
      if (filters?.sessionId && event.sessionId !== filters.sessionId) return false;
      if (filters?.eventType && event.eventType !== filters.eventType) return false;
      if (filters?.productId && event.productId !== filters.productId) return false;

      if (filters?.startDate) {
        const eventTime = new Date(event.timestamp).getTime();
        const startTime = new Date(filters.startDate).getTime();
        if (eventTime < startTime) return false;
      }

      if (filters?.endDate) {
        const eventTime = new Date(event.timestamp).getTime();
        const endTime = new Date(filters.endDate).getTime();
        if (eventTime > endTime) return false;
      }

      return true;
    });
  }

  clear(): void {
    this.events = [];
  }
}

const eventStore = new InMemoryEventStore();

/**
 * Service for tracking user events and analyzing conversion funnels
 */
export class ConversionTrackingService {
  /**
   * Track a user event
   */
  static trackEvent(event: Omit<TrackingEvent, 'id' | 'timestamp'>): void {
    const trackingEvent: TrackingEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    eventStore.addEvent(trackingEvent);
  }

  /**
   * Analyze the conversion funnel for a given time period
   */
  static async analyzeConversionFunnel(
    options: {
      startDate?: string;
      endDate?: string;
      userId?: string;
      productId?: string;
      includeDemoData?: boolean;
    } = {}
  ): Promise<ConversionFunnelAnalysis> {
    // Get events for the specified period
    const events = eventStore.getEvents({
      startDate: options.startDate,
      endDate: options.endDate,
      userId: options.userId,
      productId: options.productId
    });

    // Include demo data if requested and no real data exists
    let allEvents = events;
    if (options.includeDemoData && events.length === 0) {
      allEvents = [...events, ...this.generateDemoEvents()];
    }

    // Define funnel steps for an e-commerce site
    const funnelSteps = [
      { name: 'Visitors', eventTypes: ['page_view'] },
      { name: 'Product Views', eventTypes: ['product_view'] },
      { name: 'Add to Cart', eventTypes: ['add_to_cart'] },
      { name: 'Checkout Start', eventTypes: ['checkout_start'] },
      { name: 'Purchase Completed', eventTypes: ['purchase_completed'] }
    ];

    // Count events for each step
    const stepCounts: { [key: string]: number } = {};

    funnelSteps.forEach(step => {
      stepCounts[step.name] = allEvents.filter(event =>
        step.eventTypes.includes(event.eventType)
      ).length;
    });

    // Calculate drop-off rates
    const processedSteps: ConversionFunnelStep[] = [];

    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const count = stepCounts[step.name];

      let dropOffRate = 0;
      if (i > 0 && stepCounts[funnelSteps[i - 1].name] > 0) {
        dropOffRate = 1 - (count / stepCounts[funnelSteps[i - 1].name]);
      }

      processedSteps.push({
        name: step.name,
        eventTypes: step.eventTypes,
        count,
        dropOffRate
      });
    }

    // Calculate overall conversion rate
    const visitors = stepCounts['Visitors'] || 1; // Avoid division by zero
    const purchasers = stepCounts['Purchase Completed'] || 0;
    const conversionRate = (purchasers / visitors) * 100;

    // Calculate revenue (demo data for now)
    const revenueGenerated = purchasers * 45.99; // Assuming average order value of $45.99
    const averageOrderValue = purchasers > 0 ? revenueGenerated / purchasers : 0;

    // Find top conversion paths
    const conversionPaths = this.findConversionPaths(allEvents);
    const topConversionPaths = conversionPaths
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 5);

    // Calculate average time to convert
    const timeToConvert = this.calculateTimeToConvert(allEvents);

    return {
      totalVisitors: stepCounts['Visitors'] || 0,
      funnelSteps: processedSteps,
      conversionRate,
      revenueGenerated,
      averageOrderValue,
      topConversionPaths,
      timeToConvert,
      period: {
        start: options.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: options.endDate || new Date().toISOString()
      }
    };
  }

  /**
   * Get user journey for a specific user
   */
  static async getUserJourney(userId: string): Promise<TrackingEvent[]> {
    return eventStore.getEvents({ userId });
  }

  /**
   * Get top products by conversion rate
   */
  static async getTopConvertingProducts(
    options: { startDate?: string; endDate?: string } = {}
  ): Promise<Array<{
    productId: string;
    productName: string;
    views: number;
    addToCart: number;
    purchases: number;
    conversionRate: number;
  }>> {
    const events = eventStore.getEvents({
      startDate: options.startDate,
      endDate: options.endDate
    });

    const productStats: Record<string, {
      views: number;
      addToCart: number;
      purchases: number;
      productName: string;
    }> = {};

    events.forEach(event => {
      if (!event.productId) return;

      if (!productStats[event.productId]) {
        productStats[event.productId] = {
          views: 0,
          addToCart: 0,
          purchases: 0,
          productName: event.metadata?.productName || `Product ${event.productId}`
        };
      }

      const stats = productStats[event.productId];

      switch (event.eventType) {
        case 'product_view':
          stats.views++;
          break;
        case 'add_to_cart':
          stats.addToCart++;
          break;
        case 'purchase_completed':
          stats.purchases++;
          break;
      }
    });

    return Object.entries(productStats)
      .map(([productId, stats]) => ({
        productId,
        productName: stats.productName,
        views: stats.views,
        addToCart: stats.addToCart,
        purchases: stats.purchases,
        conversionRate: stats.views > 0 ? (stats.purchases / stats.views) * 100 : 0
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }

  private static generateDemoEvents(): TrackingEvent[] {
    const events: TrackingEvent[] = [];
    const now = new Date();

    // Generate demo events for the last 30 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const eventTime = new Date(now);
      eventTime.setDate(now.getDate() - daysAgo);

      const eventTypes: TrackingEvent['eventType'][] = [
        'page_view',
        'product_view',
        'add_to_cart',
        'checkout_start',
        'purchase_completed'
      ];

      // Generate events following a conversion path
      const paths = [
        ['page_view', 'product_view'],
        ['page_view', 'product_view', 'add_to_cart'],
        ['page_view', 'product_view', 'add_to_cart', 'checkout_start'],
        ['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'purchase_completed']
      ];

      const path = paths[Math.floor(Math.random() * paths.length)];
      const userId = `user_${Math.floor(Math.random() * 100)}`;
      const sessionId = `session_${Date.now()}_${i}`;
      const productId = `prod_${Math.floor(Math.random() * 20)}`;

      for (let j = 0; j < path.length; j++) {
        const eventType = path[j] as TrackingEvent['eventType'];
        const timestamp = new Date(eventTime);
        timestamp.setMinutes(timestamp.getMinutes() + j * 5); // Spread events within a session

        events.push({
          id: `demo_event_${i}_${j}`,
          userId,
          sessionId,
          eventType,
          productId: eventType !== 'page_view' ? productId : undefined,
          timestamp: timestamp.toISOString(),
          metadata: {
            productName: `Demo Product ${productId}`,
            price: Math.random() * 50 + 10
          },
          url: `/${eventType === 'product_view' ? `products/${productId}` : eventType === 'page_view' ? '' : eventType}`,
          referrer: 'https://example.com'
        });
      }
    }

    return events;
  }

  private static findConversionPaths(events: TrackingEvent[]): Array<{
    path: string[];
    count: number;
    conversionRate: number;
  }> {
    const paths: Record<string, { count: number; converted: number }> = {};
    const userSessions: Record<string, TrackingEvent[]> = {};

    // Group events by session
    events.forEach(event => {
      if (!userSessions[event.sessionId]) {
        userSessions[event.sessionId] = [];
      }
      userSessions[event.sessionId].push(event);
    });

    // Process each session to identify paths
    Object.values(userSessions).forEach(sessionEvents => {
      // Sort events by timestamp
      sessionEvents.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Identify the sequence of events in this session
      const eventSequence = sessionEvents.map(e => e.eventType);
      const pathKey = eventSequence.join(' > ');

      if (!paths[pathKey]) {
        paths[pathKey] = { count: 0, converted: 0 };
      }
      paths[pathKey].count++;

      // Check if this session resulted in a purchase
      if (eventSequence.includes('purchase_completed')) {
        paths[pathKey].converted++;
      }
    });

    // Convert to the required format
    return Object.entries(paths).map(([path, stats]) => ({
      path: path.split(' > '),
      count: stats.count,
      conversionRate: stats.count > 0 ? (stats.converted / stats.count) * 100 : 0
    }));
  }

  private static calculateTimeToConvert(events: TrackingEvent[]): {
    avg: number;
    median: number;
  } {
    const conversionTimes: number[] = [];

    // Group events by session
    const userSessions: Record<string, TrackingEvent[]> = {};
    events.forEach(event => {
      if (!userSessions[event.sessionId]) {
        userSessions[event.sessionId] = [];
      }
      userSessions[event.sessionId].push(event);
    });

    // Calculate time from first event to purchase for converting sessions
    Object.values(userSessions).forEach(sessionEvents => {
      const hasPurchase = sessionEvents.some(e => e.eventType === 'purchase_completed');
      if (hasPurchase) {
        const sortedEvents = sessionEvents.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const firstEventTime = new Date(sortedEvents[0].timestamp).getTime();
        const purchaseEventTime = new Date(
          sortedEvents.find(e => e.eventType === 'purchase_completed')!.timestamp
        ).getTime();

        const timeDiffMinutes = (purchaseEventTime - firstEventTime) / (1000 * 60);
        conversionTimes.push(timeDiffMinutes);
      }
    });

    if (conversionTimes.length === 0) {
      return { avg: 0, median: 0 };
    }

    const avg = conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length;

    const sortedTimes = [...conversionTimes].sort((a, b) => a - b);
    const median =
      sortedTimes.length % 2 === 0
        ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
        : sortedTimes[Math.floor(sortedTimes.length / 2)];

    return { avg, median };
  }
}