// app/admin/amazon-paapi-config/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { BackToAdminButton } from '@/components/admin/BackToAdminButton';

const SHOW_AMAZON_PAAPI_SCREEN = false;

export default function AmazonPAAPIConfigPage() {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [partnerTag, setPartnerTag] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    isConfigured: boolean;
    isValid: boolean;
    validationError: string | null;
    lastValidationTime: string | null;
  } | null>(null);

  useEffect(() => {
    fetchConfigStatus();
  }, []);

  const fetchConfigStatus = async () => {
    try {
      const response = await fetch('/api/admin/amazon-paapi-config');
      if (!response.ok) {
        throw new Error('Failed to fetch config status');
      }
      const data = await response.json();
      setConfigStatus(data);
      setAccessKey(data.credentials?.accessKey || '');
      setSecretKey(data.credentials?.secretKey || '');
      setPartnerTag(data.credentials?.partnerTag || '');
    } catch (error: any) {
      console.error('Error fetching config status:', error);
      toast.error(`Failed to load config status: ${error.message}`);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/admin/amazon-paapi-config/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessKey, secretKey, partnerTag }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Amazon PA-API connection successful!');
        fetchConfigStatus(); // Refresh status
      } else {
        toast.error(`Connection failed: ${data.error}`);
        setConfigStatus(prev => prev ? { ...prev, isValid: false, validationError: data.error } : null);
      }
    } catch (error: any) {
      console.error('Error testing connection:', error);
      toast.error(`Failed to test connection: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  if (!SHOW_AMAZON_PAAPI_SCREEN) {
    return (
      <div className="container mx-auto py-12 px-4 text-center text-muted-foreground">
        Amazon PA-API configuration is temporarily hidden.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Amazon PA-API Configuration</h1>
          <p className="text-muted-foreground">Manage your Amazon Product Advertising API credentials.</p>
        </div>
        <BackToAdminButton />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
          <CardDescription>Overview of your Amazon PA-API configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {configStatus ? (
            <>
              <div className="flex items-center gap-2">
                {getStatusIcon(configStatus.isConfigured)}
                <span className="font-medium">
                  {configStatus.isConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              {configStatus.isConfigured && (
                <div className="flex items-center gap-2">
                  {getStatusIcon(configStatus.isValid)}
                  <span className="font-medium">
                    {configStatus.isValid ? 'Credentials Valid' : 'Credentials Invalid'}
                  </span>
                </div>
              )}
              {configStatus.validationError && (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm">{configStatus.validationError}</span>
                </div>
              )}
              {configStatus.lastValidationTime && (
                <p className="text-sm text-muted-foreground">
                  Last validated: {new Date(configStatus.lastValidationTime).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading status...</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Credentials</CardTitle>
          <CardDescription>Enter your Amazon PA-API credentials below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="accessKey">Access Key ID</Label>
            <Input
              id="accessKey"
              type="password"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Your Amazon Access Key ID"
            />
          </div>
          <div>
            <Label htmlFor="secretKey">Secret Access Key</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Your Amazon Secret Access Key"
            />
          </div>
          <div>
            <Label htmlFor="partnerTag">Partner Tag</Label>
            <Input
              id="partnerTag"
              value={partnerTag}
              onChange={(e) => setPartnerTag(e.target.value)}
              placeholder="Your Amazon Partner Tag (Associate ID)"
            />
          </div>
          <Button onClick={handleTestConnection} disabled={isTesting || !accessKey || !secretKey || !partnerTag}>
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
