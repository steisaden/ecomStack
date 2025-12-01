'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ShoppingCart,
  Calendar,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface TestResult {
  type: string
  success: boolean
  message: string
  timestamp: string
}

export default function EmailNotifications() {
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const runEmailTest = async (type: 'configuration' | 'sale' | 'yoga') => {
    setTesting(true)
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type })
      })
      
      const result = await response.json()
      
      const testResult: TestResult = {
        type,
        success: result.success,
        message: result.message || (result.success ? 'Test passed' : 'Test failed'),
        timestamp: new Date().toLocaleString()
      }
      
      setTestResults(prev => [testResult, ...prev.slice(0, 9)]) // Keep last 10 results
      
      if (result.success) {
        toast.success(`${type} email test successful!`)
      } else {
        toast.error(`${type} email test failed: ${result.error}`)
      }
      
    } catch (error: any) {
      const testResult: TestResult = {
        type,
        success: false,
        message: error.message || 'Network error',
        timestamp: new Date().toLocaleString()
      }
      
      setTestResults(prev => [testResult, ...prev.slice(0, 9)])
      toast.error(`Failed to test ${type} email`)
    } finally {
      setTesting(false)
    }
  }

  const getTestIcon = (type: string) => {
    switch (type) {
      case 'configuration':
        return <Settings className="h-4 w-4" />
      case 'sale':
        return <ShoppingCart className="h-4 w-4" />
      case 'yoga':
        return <Calendar className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const getTestDescription = (type: string) => {
    switch (type) {
      case 'configuration':
        return 'Test basic email setup and SMTP connection'
      case 'sale':
        return 'Test sale confirmation email template'
      case 'yoga':
        return 'Test yoga booking notification template'
      default:
        return 'Email test'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Notifications</h2>
        <p className="text-muted-foreground">
          Manage and test email notifications for sales and yoga bookings sent to{' '}
          <Badge variant="outline" className="font-mono">
            goddesshairandbodycare@gmail.com
          </Badge>
        </p>
      </div>

      {/* Email Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Current email settings and connection status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Business Email</label>
              <p className="text-sm text-muted-foreground font-mono">
                {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'goddesshairandbodycare@gmail.com'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">SMTP Host</label>
              <p className="text-sm text-muted-foreground font-mono">
                smtp.gmail.com:587
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Setup Required</h4>
            <p className="text-sm text-blue-800">
              To enable email notifications, you need to set up a Gmail App Password. 
              See the setup guide in <code>docs/email-notifications-setup.md</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Email Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Email Notifications
          </CardTitle>
          <CardDescription>
            Test different types of email notifications to verify setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Configuration Test */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium">Configuration</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {getTestDescription('configuration')}
              </p>
              <Button
                onClick={() => runEmailTest('configuration')}
                disabled={testing}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {testing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                Test Setup
              </Button>
            </div>

            {/* Sale Test */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-green-600" />
                <h4 className="font-medium">Sale Notification</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {getTestDescription('sale')}
              </p>
              <Button
                onClick={() => runEmailTest('sale')}
                disabled={testing}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {testing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                Test Sale Email
              </Button>
            </div>

            {/* Yoga Test */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <h4 className="font-medium">Yoga Booking</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {getTestDescription('yoga')}
              </p>
              <Button
                onClick={() => runEmailTest('yoga')}
                disabled={testing}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {testing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                Test Yoga Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Recent email test results and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div className="flex items-center gap-2">
                      {getTestIcon(result.type)}
                      <span className="font-medium capitalize">{result.type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {result.message}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Automatic Notifications</CardTitle>
          <CardDescription>
            These emails are sent automatically when events occur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <ShoppingCart className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Sale Confirmations</h4>
                <p className="text-sm text-green-800">
                  Sent when customers complete purchases via Stripe checkout
                </p>
                <ul className="text-xs text-green-700 mt-1 space-y-1">
                  <li>• Business notification with order details</li>
                  <li>• Customer confirmation with tracking info</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900">Yoga Bookings</h4>
                <p className="text-sm text-purple-800">
                  Sent when customers book yoga sessions and complete payment
                </p>
                <ul className="text-xs text-purple-700 mt-1 space-y-1">
                  <li>• Business notification with booking details</li>
                  <li>• Customer confirmation with session info</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}