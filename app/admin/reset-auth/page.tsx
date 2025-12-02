'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ResetAuthPage() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    setResetStatus(null);
    
    try {
      const response = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      setResetStatus({
        success: data.success,
        message: data.success 
          ? 'Authentication status reset successfully' 
          : data.error || 'Failed to reset authentication status',
      });
    } catch (error) {
      setResetStatus({
        success: false,
        message: 'An error occurred while resetting authentication status',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Reset Authentication Status</CardTitle>
          <CardDescription>
            Use this page to reset the authentication status if you&apos;ve been locked out due to too many failed login attempts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetStatus && (
            <Alert className={`mb-4 ${resetStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
              {resetStatus.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>
                {resetStatus.success ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>
                {resetStatus.message}
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleReset} 
            disabled={isResetting}
            className="w-full"
          >
            {isResetting ? 'Resetting...' : 'Reset Authentication Status'}
          </Button>
          
          <div className="mt-6 space-y-3 text-center">
            <a href="/login" className="block text-blue-600 hover:underline">
              Return to Login
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center w-full rounded-md border border-border-muted bg-surface px-4 py-2 text-sm font-medium text-text-strong hover:bg-surface-alt"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
