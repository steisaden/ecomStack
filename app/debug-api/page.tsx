'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DebugApiPage() {
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allAvailability, setAllAvailability] = useState<any>(null);

  const testGetAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/yoga-availability?serviceId=test-service&date=${testDate}T00:00:00.000Z`
      );
      const data = await response.json();
      
      console.log('GET API Response:', data);
      setApiResponse(data);
    } catch (error) {
      console.error('GET API Error:', error);
      setApiResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAddAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/yoga-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: 'test-service',
          date: `${testDate}T00:00:00.000Z`,
          timeSlots: ['09:00', '10:00', '14:00', '15:00'],
          action: 'add',
        }),
      });

      const data = await response.json();
      console.log('POST API Response:', data);
      setApiResponse(data);
    } catch (error) {
      console.error('POST API Error:', error);
      setApiResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getAllAvailability = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-availability');
      const data = await response.json();
      
      console.log('All Availability:', data);
      setAllAvailability(data);
    } catch (error) {
      console.error('Get All Availability Error:', error);
      setAllAvailability({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">API Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>API Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-date">Test Date</Label>
              <Input
                id="test-date"
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={testGetAvailability} 
                disabled={loading}
                className="w-full"
              >
                Test GET Availability
              </Button>
              
              <Button 
                onClick={testAddAvailability} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Test ADD Availability
              </Button>
              
              <Button 
                onClick={getAllAvailability} 
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                Get All Availability Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Response */}
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : apiResponse ? (
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-80">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500">No response yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Availability Data */}
      {allAvailability && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>All Availability Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-80">
              {JSON.stringify(allAvailability, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Debug Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <h4 className="font-semibold">Steps to debug:</h4>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>{"First click \"Get All Availability Data\" to see what's in the backend"}</li>
              <li>{"Select a date and click \"Test GET Availability\" to see if API returns data"}</li>
              <li>{"If no data, click \"Test ADD Availability\" to add some test data"}</li>
              <li>{"Then test GET again to see if the data appears"}</li>
              <li>{"Check browser console for detailed logs"}</li>
            </ol>
            
            <h4 className="font-semibold mt-4">Expected behavior:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{"GET should return success: true and availableSlots array"}</li>
              <li>{"POST should return success: true and confirmation"}</li>
              <li>{"All availability should show the JSON data structure"}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}