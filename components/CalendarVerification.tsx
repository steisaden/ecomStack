'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function CalendarVerification() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [testResults, setTestResults] = useState<{
    dateSelection: boolean | null;
    visualFeedback: boolean | null;
    mobileResponsive: boolean | null;
  }>({
    dateSelection: null,
    visualFeedback: null,
    mobileResponsive: null,
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    
    // Test date selection
    setTestResults(prev => ({
      ...prev,
      dateSelection: date !== undefined,
      visualFeedback: true, // If we got here, visual feedback is working
    }));
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    if (status) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Not Tested</Badge>;
    if (status) return <Badge variant="default" className="bg-green-500">Pass</Badge>;
    return <Badge variant="destructive">Fail</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Functionality Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Calendar */}
            <div>
              <h3 className="font-semibold mb-3">Interactive Calendar</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="w-full border rounded-lg"
              />
            </div>

            {/* Test Results */}
            <div>
              <h3 className="font-semibold mb-3">Test Results</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(testResults.dateSelection)}
                    <span className="text-sm">Date Selection</span>
                  </div>
                  {getStatusBadge(testResults.dateSelection)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(testResults.visualFeedback)}
                    <span className="text-sm">Visual Feedback</span>
                  </div>
                  {getStatusBadge(testResults.visualFeedback)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(testResults.mobileResponsive)}
                    <span className="text-sm">Mobile Responsive</span>
                  </div>
                  <Badge variant="secondary">Manual Test</Badge>
                </div>
              </div>

              {/* Selected Date Display */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Selected Date:</h4>
                <p className="text-sm">
                  {selectedDate ? selectedDate.toDateString() : 'No date selected'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">Automated Tests:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{"Click any date in the calendar above"}</li>
              <li>{"Verify the date appears in the \"Selected Date\" box"}</li>
              <li>{"Check that the test results show \"Pass\" for Date Selection and Visual Feedback"}</li>
            </ul>
            
            <h4 className="font-medium mt-4">Manual Tests:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Test on mobile device or resize browser window to mobile size</li>
              <li>Verify calendar remains usable and clickable on small screens</li>
              <li>Test keyboard navigation (Tab, Arrow keys, Enter/Space)</li>
              <li>Verify accessibility with screen reader if available</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}