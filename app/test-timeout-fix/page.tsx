'use client';

import { useState } from 'react';
import { AvailabilityCalendar } from '@/components/yoga/AvailabilityCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function TestTimeoutFix() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [testResults, setTestResults] = useState({
    calendarLoad: false,
    apiResponse: false,
    noTimeout: false,
  });
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const handleDateTimeSelect = (date: Date, time: string) => {
    console.log('Date/Time selected:', date, time);
    setSelectedDate(date);
    setSelectedTime(time);
    setTestResults(prev => ({
      ...prev,
      calendarLoad: true,
      apiResponse: !!time,
      noTimeout: true // If we got here, no timeout occurred
    }));
    setLastError(null);
  };

  const testApiWithTimeout = async () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    setLoading(true);
    setLastError(null);

    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setLastError(`Request timed out after 8 seconds`);
      }, 8000);

      const response = await fetch(
        `/api/yoga-availability?serviceId=test-service&date=${selectedDate.toISOString()}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;

      const data = await response.json();
      console.log(`API Response in ${duration}ms:`, data);

      setTestResults(prev => ({
        ...prev,
        apiResponse: data.success,
        noTimeout: duration < 8000
      }));

      if (!data.success) {
        setLastError(`API Error: ${data.error}`);
      }
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (error.name === 'AbortError') {
        setLastError(`Request timed out after ${duration}ms`);
        setTestResults(prev => ({ ...prev, noTimeout: false }));
      } else {
        setLastError(`Network Error: ${error.message}`);
        setTestResults(prev => ({ ...prev, apiResponse: false }));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ?
      <CheckCircle className="h-5 w-5 text-green-500" /> :
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (status: boolean) => {
    return status ?
      <Badge className="bg-green-500">PASS</Badge> :
      <Badge variant="destructive">FAIL</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Timeout Fix Test</h1>
        <p className="text-gray-600">Test that API calls complete within 8 seconds and don&apos;t timeout</p>
      </div>

      {/* Test Results Dashboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeout Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.calendarLoad)}
                <span className="font-medium">Calendar Load</span>
              </div>
              {getStatusBadge(testResults.calendarLoad)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.apiResponse)}
                <span className="font-medium">API Response</span>
              </div>
              {getStatusBadge(testResults.apiResponse)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.noTimeout)}
                <span className="font-medium">No Timeout</span>
              </div>
              {getStatusBadge(testResults.noTimeout)}
            </div>
          </div>

          {lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Last Error:</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{lastError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Test */}
        <Card>
          <CardHeader>
            <CardTitle>Availability Calendar Test</CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar
              serviceId="test-service"
              onDateTimeSelect={handleDateTimeSelect}
            />
          </CardContent>
        </Card>

        {/* Manual API Test */}
        <Card>
          <CardHeader>
            <CardTitle>Manual API Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">Selected Date:</h4>
                <p className="text-sm">
                  {selectedDate ? selectedDate.toDateString() : 'No date selected'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">Selected Time:</h4>
                <p className="text-sm">
                  {selectedTime || 'No time selected'}
                </p>
              </div>
            </div>

            <Button
              onClick={testApiWithTimeout}
              disabled={!selectedDate || loading}
              className="w-full"
            >
              {loading ? 'Testing API...' : 'Test API with Timeout'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Automatic Test:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>{"Click any date in the calendar"}</li>
                <li>{"Wait for time slots to load (should be under 8 seconds)"}</li>
                <li>{"Click a time slot if available"}</li>
                <li>{"All three test results should show \"PASS\""}</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Manual Test:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>{"Select a date in the calendar"}</li>
                <li>{"Click \"Test API with Timeout\" button"}</li>
                <li>{"Should complete within 8 seconds"}</li>
                <li>{"Check for any error messages"}</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">Expected Behavior:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{"API calls should complete within 8 seconds"}</li>
              <li>{"No \"timeout of 30000ms exceeded\" errors"}</li>
              <li>{"Calendar should load time slots quickly"}</li>
              <li>{"Error messages should be clear and helpful"}</li>
              <li>{"All operations should feel responsive"}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Admin Link */}
      <Card className="mt-8 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Updated Admin System
            </h3>
            <p className="text-green-700 mb-4">
              The admin system now has consistent time slot selection on both Single Date and Bulk Date management:
            </p>
            <Button asChild>
              <a href="/admin/yoga-availability" target="_blank" rel="noopener noreferrer">
                Test Updated Admin System
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}