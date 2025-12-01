'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Activity,
  Server,
  Database,
  Zap,
  Clock
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  monitoring: {
    activeAlerts: number;
    criticalAlerts: number;
    lastMetricTime: string;
  };
  jobQueue: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    backlog: number;
  };
  components: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    responseTime?: number;
  }>;
  alerts: Array<{
    id: string;
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
  }>;
  metrics: {
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
    eventLoopLag: number | null;
    amazonApiErrorRate: number | null;
    linkValidationFailureRate: number | null;
  };
}

export default function SystemStatusDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealthStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/system/health', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin-secret'}`
        }
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      setHealth(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = {
      healthy: 'success' as const,
      degraded: 'warning' as const,
      unhealthy: 'destructive' as const
    }[status] || 'secondary' as const;

    return (
      <Badge variant={variant} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variant = {
      low: 'secondary' as const,
      medium: 'warning' as const,
      high: 'destructive' as const,
      critical: 'destructive' as const
    }[severity] || 'secondary' as const;

    return (
      <Badge variant={variant} className="capitalize">
        {severity}
      </Badge>
    );
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2"
            onClick={fetchHealthStatus}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!health) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No health data available</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6" data-testid="system-status">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              {getStatusIcon(health.status)}
              <span className="ml-2">System Status</span>
            </span>
            <div className="flex items-center space-x-2">
              {getStatusBadge(health.status)}
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchHealthStatus}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Uptime</div>
              <div className="text-lg font-semibold">{formatUptime(health.uptime)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Version</div>
              <div className="text-lg font-semibold">{health.version}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Environment</div>
              <div className="text-lg font-semibold capitalize">{health.environment}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="text-lg font-semibold" data-testid="last-updated">
                {lastUpdated?.toLocaleTimeString() || 'Never'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {health.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Active Alerts ({health.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {health.alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{alert.rule}</span>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {alert.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            Component Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {health.components.map((component) => (
              <div key={component.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{component.name}</span>
                  {getStatusIcon(component.status)}
                </div>
                <div className="mb-2">
                  {getStatusBadge(component.status)}
                </div>
                {component.responseTime && (
                  <div className="text-sm text-muted-foreground">
                    Response: {component.responseTime}ms
                  </div>
                )}
                {component.message && (
                  <div className="text-sm text-muted-foreground">
                    {component.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Job Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{health.jobQueue.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{health.jobQueue.running}</div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{health.jobQueue.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{health.jobQueue.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{health.jobQueue.backlog}</div>
              <div className="text-sm text-muted-foreground">Backlog</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Memory Usage */}
            <div>
              <h4 className="font-medium mb-3">Memory Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Heap Used:</span>
                  <span className="text-sm font-mono">
                    {formatBytes(health.metrics.memoryUsage.heapUsed)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Heap Total:</span>
                  <span className="text-sm font-mono">
                    {formatBytes(health.metrics.memoryUsage.heapTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">RSS:</span>
                  <span className="text-sm font-mono">
                    {formatBytes(health.metrics.memoryUsage.rss)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="font-medium mb-3">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Event Loop Lag:</span>
                  <span className="text-sm font-mono">
                    {health.metrics.eventLoopLag ? `${health.metrics.eventLoopLag.toFixed(2)}ms` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Amazon API Error Rate:</span>
                  <span className="text-sm font-mono">
                    {formatPercentage(health.metrics.amazonApiErrorRate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Link Validation Failure Rate:</span>
                  <span className="text-sm font-mono">
                    {formatPercentage(health.metrics.linkValidationFailureRate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Monitoring Status */}
            <div>
              <h4 className="font-medium mb-3">Monitoring</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Active Alerts:</span>
                  <span className="text-sm font-mono">{health.monitoring.activeAlerts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Critical Alerts:</span>
                  <span className="text-sm font-mono text-red-600">
                    {health.monitoring.criticalAlerts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Metric:</span>
                  <span className="text-sm font-mono">
                    {new Date(health.monitoring.lastMetricTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}