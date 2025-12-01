import { cacheService } from '../cache/cache-service';
import { amazonProductApi } from '../amazon/product-api';
import { linkValidator } from '../validation/link-validator';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: HealthCheckResult[];
  details: {
    [key: string]: any;
  };
}

export interface HealthCheckResult {
  name: string;
  status: 'up' | 'down';
  responseTime?: number;
  details?: any;
  error?: string;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  required: boolean; // If true, failure will make the whole system unhealthy
}

export class HealthCheckService {
  private checks: HealthCheck[] = [];

  constructor() {
    // Register default health checks
    this.registerCheck({
      name: 'cache-service',
      check: this.checkCacheService,
      required: true
    });

    this.registerCheck({
      name: 'amazon-api',
      check: this.checkAmazonAPI,
      required: false // Amazon API not required for basic operation
    });

    this.registerCheck({
      name: 'validation-service',
      check: this.checkValidationService,
      required: true
    });
  }

  private async checkCacheService(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // Test basic cache operations
      const testKey = `health-check-${Date.now()}`;
      const testValue = 'health-check-value';

      const setResult = await cacheService.set(testKey, testValue, 10); // 10 second TTL
      if (!setResult) {
        return {
          name: 'cache-service',
          status: 'down',
          responseTime: Date.now() - startTime,
          error: 'Failed to set value in cache'
        };
      }

      const getResult = await cacheService.get(testKey);
      if (getResult !== testValue) {
        return {
          name: 'cache-service',
          status: 'down',
          responseTime: Date.now() - startTime,
          error: 'Retrieved value does not match set value'
        };
      }

      return {
        name: 'cache-service',
        status: 'up',
        responseTime: Date.now() - startTime,
        details: { type: cacheService.constructor.name }
      };
    } catch (error: any) {
      return {
        name: 'cache-service',
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  private async checkAmazonAPI(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // Test Amazon API with a known good ASIN
      const result = await amazonProductApi.getProductData('B07MH4MJGB'); // Example ASIN
      if (result.error) {
        return {
          name: 'amazon-api',
          status: 'down',
          responseTime: Date.now() - startTime,
          error: result.error.message
        };
      }

      return {
        name: 'amazon-api',
        status: 'up',
        responseTime: Date.now() - startTime,
        details: { 
          hasValidCredentials: !!amazonProductApi['accessKey'],
          productRetrieved: !!result.data
        }
      };
    } catch (error: any) {
      return {
        name: 'amazon-api',
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  private async checkValidationService(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      // Test link validation with a known good URL
      const result = await linkValidator.validateLink('https://httpbin.org/status/200');
      if (!result.isValid) {
        return {
          name: 'validation-service',
          status: 'down',
          responseTime: Date.now() - startTime,
          error: result.error || 'Link validation failed'
        };
      }

      return {
        name: 'validation-service',
        status: 'up',
        responseTime: Date.now() - startTime,
        details: { 
          statusCode: result.statusCode,
          url: result.url
        }
      };
    } catch (error: any) {
      return {
        name: 'validation-service',
        status: 'down',
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  registerCheck(check: HealthCheck): void {
    this.checks.push(check);
  }

  unregisterCheck(name: string): void {
    this.checks = this.checks.filter(check => check.name !== name);
  }

  async runHealthChecks(): Promise<HealthStatus> {
    const startTime = Date.now();
    const results: HealthCheckResult[] = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Run all checks in parallel
    const checkPromises = this.checks.map(check => check.check().catch(error => ({
      name: check.name,
      status: 'down' as const,
      error: error.message || 'Unknown error'
    })));

    const checkResults = await Promise.all(checkPromises);
    results.push(...checkResults);

    // Determine overall status
    const downChecks = results.filter(result => result.status === 'down');
    const requiredDownChecks = downChecks.filter(result => {
      const check = this.checks.find(c => c.name === result.name);
      return check?.required;
    });

    if (requiredDownChecks.length > 0) {
      overallStatus = 'unhealthy';
    } else if (downChecks.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
      details: {
        totalChecks: results.length,
        passingChecks: results.filter(r => r.status === 'up').length,
        failingChecks: downChecks.length,
        responseTime: Date.now() - startTime
      }
    };
  }

  async getHealthStatus(): Promise<HealthStatus> {
    return await this.runHealthChecks();
  }
}

// Singleton health check service instance
export const healthCheckService = new HealthCheckService();