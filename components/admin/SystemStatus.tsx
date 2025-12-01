import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { HealthStatus, HealthCheckResult } from '@/lib/monitoring/health-checks';

const SystemStatus = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/system/health');
        if (!response.ok) {
          throw new Error(`Health check failed with status: ${response.status}`);
        }
        const data: HealthStatus = await response.json();
        setHealthStatus(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching health status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthStatus();

    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCheckStatusIcon = (status: HealthCheckResult['status']) => {
    if (status === 'up') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Monitor the health status of system components</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <WifiOff className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-destructive">System Unavailable</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        ) : healthStatus ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(healthStatus.status)}
                <h3 className="text-xl font-semibold capitalize">{healthStatus.status}</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                Last checked: {formatTime(healthStatus.timestamp)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Total Checks</div>
                <div className="text-2xl font-bold">{healthStatus.details.totalChecks}</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Passing Checks</div>
                <div className="text-2xl font-bold text-green-600">{healthStatus.details.passingChecks}</div>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="text-sm text-muted-foreground">Failing Checks</div>
                <div className="text-2xl font-bold text-red-600">{healthStatus.details.failingChecks}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Component Status</h4>
              {healthStatus.checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getCheckStatusIcon(check.status)}
                    <span className="font-medium">{check.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {check.responseTime !== undefined && (
                      <span className="text-sm text-muted-foreground">{check.responseTime}ms</span>
                    )}
                    <Badge variant={check.status === 'up' ? 'default' : 'destructive'}>
                      {check.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default SystemStatus;