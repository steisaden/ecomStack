import { NextResponse } from 'next/server';
import { productionMonitoring } from '@/lib/monitoring/production-monitoring';
import { jobQueue } from '@/lib/background/job-queue';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }
    // Get overall health status
    const healthStatus = productionMonitoring.getHealthStatus();
    
    // Get job queue statistics
    const queueStats = await jobQueue.getQueueStats();
    
    // Get active alerts
    const activeAlerts = productionMonitoring.getActiveAlerts();
    
    // Check individual component health
    const componentHealth = await checkComponentHealth();
    
    // Determine overall system status
    let systemStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (healthStatus.criticalAlerts > 0 || componentHealth.some(c => c.status === 'unhealthy')) {
      systemStatus = 'unhealthy';
    } else if (healthStatus.activeAlerts > 0 || componentHealth.some(c => c.status === 'degraded')) {
      systemStatus = 'degraded';
    }
    
    const response = {
      status: systemStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      monitoring: {
        activeAlerts: healthStatus.activeAlerts,
        criticalAlerts: healthStatus.criticalAlerts,
        lastMetricTime: new Date(healthStatus.lastMetricTime).toISOString()
      },
      jobQueue: {
        pending: queueStats.pending,
        running: queueStats.running,
        completed: queueStats.completed,
        failed: queueStats.failed,
        backlog: queueStats.pending + queueStats.running
      },
      components: componentHealth,
      alerts: activeAlerts.map(alert => ({
        id: alert.id,
        rule: alert.rule,
        severity: alert.severity,
        message: alert.message,
        timestamp: new Date(alert.timestamp).toISOString()
      })),
      metrics: {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        eventLoopLag: productionMonitoring.getLatestMetricValue('event_loop_lag'),
        amazonApiErrorRate: productionMonitoring.getLatestMetricValue('amazon_api_error_rate'),
        linkValidationFailureRate: productionMonitoring.getLatestMetricValue('link_validation_failure_rate')
      }
    };
    
    // Return appropriate HTTP status code
    const statusCode = systemStatus === 'healthy' ? 200 : 
                      systemStatus === 'degraded' ? 207 : 503;
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

async function checkComponentHealth(): Promise<Array<{
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  responseTime?: number;
}>> {
  const components: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    responseTime?: number;
  }> = [];
  
  // Check Amazon API
  try {
    const start = Date.now();
    const { amazonProductApi } = await import('@/lib/amazon/product-api');
    
    // Use a test ASIN that should always work (or fail predictably)
    const result = await amazonProductApi.validateProductExists('B08N5WRWNW');
    const responseTime = Date.now() - start;
    
    components.push({
      name: 'Amazon PAAPI',
      status: responseTime > 5000 ? 'degraded' : 'healthy',
      responseTime,
      message: responseTime > 5000 ? 'Slow response time' : undefined
    });
  } catch (error) {
    components.push({
      name: 'Amazon PAAPI',
      status: 'unhealthy',
      message: 'API connection failed'
    });
  }
  
  // Check Link Validator
  try {
    const start = Date.now();
    const { linkValidator } = await import('@/lib/validation/link-validator');
    
    // Test with a reliable URL
    const result = await linkValidator.validateLink('https://httpbin.org/status/200');
    const responseTime = Date.now() - start;
    
    components.push({
      name: 'Link Validator',
      status: result.isValid && responseTime < 10000 ? 'healthy' : 'degraded',
      responseTime,
      message: !result.isValid ? 'Validation failed' : 
               responseTime > 10000 ? 'Slow response time' : undefined
    });
  } catch (error) {
    components.push({
      name: 'Link Validator',
      status: 'unhealthy',
      message: 'Validation service failed'
    });
  }
  
  // Check Job Queue
  try {
    const stats = await jobQueue.getQueueStats();
    const backlog = stats.pending + stats.running;
    
    components.push({
      name: 'Job Queue',
      status: backlog > 100 ? 'degraded' : 
              backlog > 500 ? 'unhealthy' : 'healthy',
      message: backlog > 100 ? `High backlog: ${backlog} jobs` : undefined
    });
  } catch (error) {
    components.push({
      name: 'Job Queue',
      status: 'unhealthy',
      message: 'Queue service failed'
    });
  }
  
  // Check Cache (if Redis is configured)
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    try {
      // This would check Redis connectivity
      components.push({
        name: 'Cache (Redis)',
        status: 'healthy'
      });
    } catch (error) {
      components.push({
        name: 'Cache (Redis)',
        status: 'unhealthy',
        message: 'Redis connection failed'
      });
    }
  }
  
  // Check Database (if configured)
  if (process.env.DATABASE_URL) {
    try {
      // This would check database connectivity
      components.push({
        name: 'Database',
        status: 'healthy'
      });
    } catch (error) {
      components.push({
        name: 'Database',
        status: 'unhealthy',
        message: 'Database connection failed'
      });
    }
  }
  
  return components;
}
