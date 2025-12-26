'use client';

import { useState } from 'react';
import { WorkingCalendar } from '@/components/ui/working-calendar';
import { AvailabilityCalendar } from '@/components/yoga/AvailabilityCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function FinalCalendarTest() {
  const [basicDate, setBasicDate] = useState<Date | undefined>();
  const [yogaDate, setYogaDate] = useState<Date | undefined>();
  const [yogaTime, setYogaTime] = useState<string>('');
  const [testResults, setTestResults] = useState({
    basicCalendar: false,
    yogaCalendar: false,
    timeSelection: false,
  });

  const handleBasicDateSelect = (date: Date | undefined) => {
    console.log('Basic calendar date selected:', date);
    setBasicDate(date);
    setTestResults(prev => ({ ...prev, basicCalendar: !!date }));
  };

  const handleYogaDateTimeSelect = (date: Date, time: string) => {
    console.log('Yoga calendar date/time selected:', date, time);
    setYogaDate(date);
    setYogaTime(time);
    setTestResults(prev => ({
      ...prev,
      yogaCalendar: !!date,
      timeSelection: !!time
    }));
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
        <h1 className="text-3xl font-bold mb-4">Final Calendar Test Suite</h1>
        <p className="text-gray-600">Complete test of calendar functionality and yoga booking integration</p>
      </div>

      {/* Test Results Dashboard */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Test Results Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.basicCalendar)}
                <span className="font-medium">Basic Calendar</span>
              </div>
              {getStatusBadge(testResults.basicCalendar)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.yogaCalendar)}
                <span className="font-medium">Yoga Calendar</span>
              </div>
              {getStatusBadge(testResults.yogaCalendar)}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.timeSelection)}
                <span className="font-medium">Time Selection</span>
              </div>
              {getStatusBadge(testResults.timeSelection)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Calendar Test */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Calendar Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <WorkingCalendar
                selected={basicDate}
                onSelect={handleBasicDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />

              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-semibold mb-2">Selected Date:</h4>
                <p className="text-sm">
                  {basicDate ? basicDate.toDateString() : 'No date selected'}
                </p>
              </div>

              <div className="text-sm text-gray-600">
                <p>{"<strong>Test:</strong> Click any future date"}</p>
                <p>{'<strong>Expected:</strong> Date should highlight and appear above'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yoga Booking Calendar Test */}
        <Card>
          <CardHeader>
            <CardTitle>Yoga Booking Calendar Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AvailabilityCalendar
                serviceId="test-service"
                onDateTimeSelect={handleYogaDateTimeSelect}
              />

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">Selected Date:</h4>
                  <p className="text-sm">
                    {yogaDate ? yogaDate.toDateString() : 'No date selected'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">Selected Time:</h4>
                  <p className="text-sm">
                    {yogaTime || 'No time selected'}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Test:</strong> Click a date, then click a time slot</p>
                <p><strong>Expected:</strong> Both date and time should appear above</p>
              </div>
            </div>
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
              <h4 className="font-semibold mb-3">Basic Calendar Test:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click any date in the left calendar</li>
                <li>Verify the date highlights in blue</li>
                <li>Check that the selected date appears in the gray box</li>
                <li>Try clicking different dates</li>
                <li>Verify past dates are disabled (grayed out)</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Yoga Calendar Test:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click any date in the right calendar</li>
                <li>Wait for time slots to load</li>
                <li>Click on an available time slot</li>
                <li>Verify both date and time appear in gray boxes</li>
                <li>Check browser console for API calls</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h4 className="font-semibold mb-2">Troubleshooting:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>If calendars don&apos;t work, check browser console for errors</li>
              <li>Try refreshing the page</li>
              <li>Test in different browsers (Chrome, Firefox, Safari)</li>
              <li>Test on mobile device or mobile emulation</li>
              <li>If time slots don&apos;t appear, check network tab for API calls</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {testResults.basicCalendar && testResults.yogaCalendar && testResults.timeSelection && (
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                🎉 All Tests Passed!
              </h3>
              <p className="text-green-700">
                Calendar functionality is working correctly. The yoga booking system is ready for use.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}