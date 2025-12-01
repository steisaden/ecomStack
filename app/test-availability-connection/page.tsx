'use client';

import { useState, useEffect } from 'react';
import { AvailabilityCalendar } from '@/components/yoga/AvailabilityCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function TestAvailabilityConnection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({
    apiConnection: false,
    dataRetrieval: false,
    timeDisplay: false,
  });

  const handleDateTimeSelect = (date: Date, time: string) => {
    console.log('Date/Time selected:', date, time);
    setSelectedDate(date);
    setSelectedTime(time);
    setTestResults(prev => ({ 
      ...prev, 
      timeDisplay: !!time 
    }));
  };

  const testApiDirectly = async () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/yoga-availability?serviceId=test-service&date=${selectedDate.toISOString()}`
      );
      const data = await response.json();
      
      console.log('Direct API test response:', data);
      setApiResponse(data);
      
      setTestResults(prev => ({
        ...prev,
        apiConnection: response.ok,
        dataRetrieval: data.success && data.data?.availableSlots?.length > 0
      }));
    } catch (error) {
      console.error('Direct API test error:', error);
      setApiResponse({ error: error.message });
      setTestResults(prev => ({
        ...prev,
        apiConnection: false,
        dataRetrieval: false
      }));
    } finally {
      setLoading(false);
    }
  };

  const addTestTimeSlot = async () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/yoga-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: 'test-service',
          date: selectedDate.toISOString(),
          timeSlots: ['09:00', '14:00', '16:00'],
          action: 'add',
        }),
      });

      const data = await response.json();
      console.log('Add time slot response:', data);
      
      if (data.success) {
        // Refresh the calendar to show new slots
        window.location.reload();
      }
    } catch (error) {
      console.error('Error adding time slots:', error);
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
        <h1 className="text-3xl font-bold mb-4">Availability Connection Test</h1>
        <p className="text-gray-600">Test the connection between admin backend and frontend calendar</p>
      </div>

      {/* Test Results Dashboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Connection Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.apiConnection)}
                <span className="font-medium">API Connection</span>
              </div>
              {getStatusBadge(testResults.apiConnection)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.dataRetrieval)}
                <span className="font-medium">Data Retrieval</span>
              </div>
              {getStatusBadge(testResults.dataRetrieval)}
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.timeDisplay)}
                <span className="font-medium">Time Display</span>
              </div>
              {getStatusBadge(testResults.timeDisplay)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar
              serviceId="test-service"
              onDateTimeSelect={handleDateTimeSelect}
            />
          </CardContent>
        </Card>

        {/* API Test Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              API Test Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selection Display */}
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

            {/* API Test Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={testApiDirectly} 
                disabled={!selectedDate || loading}
                className="w-full"
              >
                {loading ? 'Testing...' : 'Test API Directly'}
              </Button>
              
              <Button 
                onClick={addTestTimeSlot} 
                disabled={!selectedDate || loading}
                variant="outline"
                className="w-full"
              >
                Add Test Time Slots
              </Button>
            </div>

            {/* API Response */}
            {apiResponse && (
              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">API Response:</h4>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
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
              <h4 className="font-semibold mb-3">Step 1: Test Calendar</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>{"Click any date in the calendar"}</li>
                <li>{"Wait for available times to load"}</li>
                <li>{"If no times appear, the date may not have availability"}</li>
                <li>{"Try dates: Nov 28, Nov 29, Nov 30, Dec 1"}</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Step 2: Test API</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>{"Select a date"}</li>
                <li>{"Click \"Test API Directly\" to see raw response"}</li>
                <li>{"Click \"Add Test Time Slots\" to add availability"}</li>
                <li>{"Refresh page to see new time slots"}</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">Expected Behavior:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{"Selecting a date should trigger an API call"}</li>
              <li>{"Available time slots should appear below the calendar"}</li>
              <li>{"Clicking a time slot should select it"}</li>
              <li>{"All three test results should show \"PASS\""}</li>
              <li>{"API response should show success: true and availableSlots array"}</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Admin Link */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Admin System
            </h3>
            <p className="text-blue-700 mb-4">
              To add or manage available time slots, use the admin system:
            </p>
            <Button asChild>
              <a href="/admin/yoga-availability" target="_blank" rel="noopener noreferrer">
                Open Admin Yoga Availability
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}