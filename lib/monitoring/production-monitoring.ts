import { performance } from 'perf_hooks';

export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface AlertRule {
  name: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  duration: number; // seconds
  enabled: boolean;
}

export interface Alert {
  id: string;
  rule: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  resolved: boolean;
}

class ProductionMonitoring {
  private metrics: Map<string, MetricData[]> = new Map();
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private timers: Map<string, number> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.startMetricsCollection();
  }

  private initializeDefaultRules(): void {
    this.alertRules = [
      {
        name: 'High API Error Rate',
        metric: 'amazon_api_error_rate',
        threshold: 0.1, // 10%
        operator: 'gt',
        duration: 300, // 5 minutes
        enabled: true
      },
      {
        name: 'Slow API Response Time',
        metric: 'amazon_api_response_time',
        threshold: 5000, // 5 seconds
        operator: 'gt',
        duration: 60, // 1 minute
        enabled: true
      },
      {
        name: 'Job Queue Backlog',
        metric: 'job_queue_pending',
        threshold: 100,
        operator: 'gt',
        duration: 600, // 10 minutes
        enabled: true
      },
      {
        name: 'High Link Validation Failure Rate',
        metric: 'link_validation_failure_rate',
        threshold: 0.2, // 20%
        operator: 'gt',
        duration: 300, // 5 minutes
        enabled: true
      },
      {
        name: 'Cache Hit Rate Too Low',
        metric: 'cache_hit_rate',
        threshold: 0.8, // 80%
        operator: 'lt',
        duration: 300, // 5 minutes
        enabled: true
      }
    ];
  }

  private startMetricsCollection(): void {
    // Collect system metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
      this.evaluateAlertRules();
    }, 30000);

    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      // Memory usage
      const memUsage = process.memoryUsage();
      this.recordMetric('memory_heap_used', memUsage.heapUsed);
      this.recordMetric('memory_heap_total', memUsage.heapTotal);
      this.recordMetric('memory_rss', memUsage.rss);

      // Event loop lag
      const start = performance.now();
      setImmediate(() => {
        const lag = performance.now() - start;
        this.recordMetric('event_loop_lag', lag);
      });

      // Process uptime
      this.recordMetric('process_uptime', process.uptime());

      // CPU usage (approximation)
      const cpuUsage = process.cpuUsage();
      this.recordMetric('cpu_user', cpuUsage.user);
      this.recordMetric('cpu_system', cpuUsage.system);

    } catch (error) {
      console.error('Error collecting system metrics:', error);
    }
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: MetricData = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metricArray = this.metrics.get(name)!;
    metricArray.push(metric);

    // Keep only last 1000 data points per metric
    if (metricArray.length > 1000) {
      metricArray.shift();
    }
  }

  recordTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(`${name}_duration`, duration);
    };
  }

  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    const current = this.getLatestMetricValue(name) || 0;
    this.recordMetric(name, current + value, tags);
  }

  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, tags);
    
    // Also record statistical metrics
    const metrics = this.getMetrics(name, 300000); // Last 5 minutes
    if (metrics.length > 0) {
      const values = metrics.map(m => m.value);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      
      this.recordMetric(`${name}_avg`, avg, tags);
      this.recordMetric(`${name}_max`, max, tags);
      this.recordMetric(`${name}_min`, min, tags);
    }
  }

  getMetrics(name: string, timeWindow?: number): MetricData[] {
    const metrics = this.metrics.get(name) || [];
    
    if (!timeWindow) {
      return metrics;
    }
    
    const cutoff = Date.now() - timeWindow;
    return metrics.filter(m => m.timestamp >= cutoff);
  }

  getLatestMetricValue(name: string): number | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }
    
    return metrics[metrics.length - 1].value;
  }

  private evaluateAlertRules(): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const timeWindow = rule.duration * 1000;
      const metrics = this.getMetrics(rule.metric, timeWindow);
      
      if (metrics.length === 0) continue;

      const latestValue = metrics[metrics.length - 1].value;
      let shouldAlert = false;

      switch (rule.operator) {
        case 'gt':
          shouldAlert = latestValue > rule.threshold;
          break;
        case 'lt':
          shouldAlert = latestValue < rule.threshold;
          break;
        case 'eq':
          shouldAlert = latestValue === rule.threshold;
          break;
      }

      if (shouldAlert) {
        this.triggerAlert(rule, latestValue);
      }
    }
  }

  private triggerAlert(rule: AlertRule, value: number): void {
    // Check if alert already exists and is not resolved
    const existingAlert = this.alerts.find(
      alert => alert.rule === rule.name && !alert.resolved
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rule: rule.name,
      message: `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.threshold})`,
      severity: this.determineSeverity(rule, value),
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(alert);
    this.sendAlert(alert);
  }

  private determineSeverity(rule: AlertRule, value: number): Alert['severity'] {
    const deviation = Math.abs(value - rule.threshold) / rule.threshold;
    
    if (deviation > 2) return 'critical';
    if (deviation > 1) return 'high';
    if (deviation > 0.5) return 'medium';
    return 'low';
  }

  private async sendAlert(alert: Alert): Promise<void> {
    try {
      console.error(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);

      // Send to external monitoring services
      await this.sendToExternalServices(alert);

      // Send notifications
      await this.sendNotifications(alert);

    } catch (error) {
      console.error('Error sending alert:', error);
    }
  }

  private async sendToExternalServices(alert: Alert): Promise<void> {
    const promises: Promise<void>[] = [];

    // Send to Datadog (if configured)
    if (process.env.DATADOG_API_KEY) {
      promises.push(this.sendToDatadog(alert));
    }

    // Send to New Relic (if configured)
    if (process.env.NEW_RELIC_LICENSE_KEY) {
      promises.push(this.sendToNewRelic(alert));
    }

    // Send to Sentry (if configured)
    if (process.env.SENTRY_DSN) {
      promises.push(this.sendToSentry(alert));
    }

    // Send to custom webhook (if configured)
    if (process.env.ALERT_WEBHOOK_URL) {
      promises.push(this.sendToWebhook(alert));
    }

    await Promise.allSettled(promises);
  }

  private async sendToDatadog(alert: Alert): Promise<void> {
    try {
      const response = await fetch('https://api.datadoghq.com/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY!
        },
        body: JSON.stringify({
          title: `Amazon Product Enhancement Alert: ${alert.rule}`,
          text: alert.message,
          alert_type: alert.severity === 'critical' ? 'error' : 'warning',
          source_type_name: 'amazon-product-enhancement',
          tags: ['environment:production', 'service:amazon-product-enhancement']
        })
      });

      if (!response.ok) {
        throw new Error(`Datadog API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending alert to Datadog:', error);
    }
  }

  private async sendToNewRelic(alert: Alert): Promise<void> {
    try {
      const response = await fetch('https://insights-collector.newrelic.com/v1/accounts/YOUR_ACCOUNT_ID/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Insert-Key': process.env.NEW_RELIC_LICENSE_KEY!
        },
        body: JSON.stringify({
          eventType: 'AmazonProductEnhancementAlert',
          alertId: alert.id,
          rule: alert.rule,
          message: alert.message,
          severity: alert.severity,
          timestamp: alert.timestamp
        })
      });

      if (!response.ok) {
        throw new Error(`New Relic API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending alert to New Relic:', error);
    }
  }

  private async sendToSentry(alert: Alert): Promise<void> {
    try {
      // This would typically use the Sentry SDK
      console.log('Would send to Sentry:', alert);
    } catch (error) {
      console.error('Error sending alert to Sentry:', error);
    }
  }

  private async sendToWebhook(alert: Alert): Promise<void> {
    try {
      const response = await fetch(process.env.ALERT_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alert,
          service: 'amazon-product-enhancement',
          environment: process.env.NODE_ENV || 'production'
        })
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending alert to webhook:', error);
    }
  }

  private async sendNotifications(alert: Alert): Promise<void> {
    // Send email notifications for critical alerts
    if (alert.severity === 'critical' && process.env.ALERT_EMAIL) {
      await this.sendEmailAlert(alert);
    }

    // Send Slack notifications
    if (process.env.SLACK_WEBHOOK_URL) {
      await this.sendSlackAlert(alert);
    }
  }

  private async sendEmailAlert(alert: Alert): Promise<void> {
    try {
      // This would integrate with your email service (SendGrid, SES, etc.)
      console.log('Would send email alert:', alert);
    } catch (error) {
      console.error('Error sending email alert:', error);
    }
  }

  private async sendSlackAlert(alert: Alert): Promise<void> {
    try {
      const color = {
        low: '#36a64f',
        medium: '#ff9500',
        high: '#ff0000',
        critical: '#8B0000'
      }[alert.severity];

      const response = await fetch(process.env.SLACK_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attachments: [{
            color,
            title: `🚨 ${alert.rule}`,
            text: alert.message,
            fields: [
              {
                title: 'Severity',
                value: alert.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Service',
                value: 'Amazon Product Enhancement',
                short: true
              },
              {
                title: 'Time',
                value: new Date(alert.timestamp).toISOString(),
                short: true
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Slack webhook error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending Slack alert:', error);
    }
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Alert resolved: ${alert.rule}`);
    }
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getAllAlerts(limit: number = 100): Alert[] {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    
    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => m.timestamp >= cutoff);
      this.metrics.set(name, filtered);
    }

    // Clean up old alerts (keep for 7 days)
    const alertCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => alert.timestamp >= alertCutoff);
  }

  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    activeAlerts: number;
    criticalAlerts: number;
    lastMetricTime: number;
  } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (criticalAlerts > 0) {
      status = 'unhealthy';
    } else if (activeAlerts.length > 0) {
      status = 'degraded';
    }

    return {
      status,
      activeAlerts: activeAlerts.length,
      criticalAlerts,
      lastMetricTime: Math.max(...Array.from(this.metrics.values()).flat().map(m => m.timestamp))
    };
  }
}

// Singleton instance
export const productionMonitoring = new ProductionMonitoring();

// Convenience functions for common operations
export const recordMetric = (name: string, value: number, tags?: Record<string, string>) => 
  productionMonitoring.recordMetric(name, value, tags);

export const recordTimer = (name: string) => 
  productionMonitoring.recordTimer(name);

export const increment = (name: string, value?: number, tags?: Record<string, string>) => 
  productionMonitoring.increment(name, value, tags);

export const histogram = (name: string, value: number, tags?: Record<string, string>) => 
  productionMonitoring.histogram(name, value, tags);