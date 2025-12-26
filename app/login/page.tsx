'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';

interface LoginFormData {
  username: string;
  password: string;
}

interface SetupFormData {
  username: string;
  password: string;
  confirmPassword: string;
}

interface ResetFormData {
  username: string;
  resetToken: string;
  recoveryCode: string;
  newPassword: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'create' | 'reset'>('login');
  const [adminStatus, setAdminStatus] = useState<{ configured: boolean; username?: string | null } | null>(null);
  const [setupStatus, setSetupStatus] = useState<string>('');
  const [setupRecoveryCode, setSetupRecoveryCode] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [resetTokenExpiry, setResetTokenExpiry] = useState<string>('');
  const [requestingResetToken, setRequestingResetToken] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const setupForm = useForm<SetupFormData>({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const resetForm = useForm<ResetFormData>({
    defaultValues: {
      username: '',
      resetToken: '',
      recoveryCode: '',
      newPassword: '',
    },
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/admin-users/status');
        const data = await response.json();
        setAdminStatus({ configured: data.configured, username: data.username });
        if (!data.configured) {
          setMode('create');
        }
      } catch (err) {
        console.error('Failed to load admin status', err);
      }
    };

    checkStatus();
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Successful login
        router.push('/admin');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async (data: SetupFormData) => {
    setSetupStatus('');
    setSetupRecoveryCode(null);

    if (data.password !== data.confirmPassword) {
      setSetupStatus('Passwords must match');
      return;
    }

    try {
      const response = await fetch('/api/admin-users/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSetupRecoveryCode(result.recoveryCode);
        setSetupStatus('Admin account created. Save the recovery code to unlock or reset later.');
        setAdminStatus({ configured: true, username: result.username });
      } else {
        setSetupStatus(result.error || 'Could not create admin user');
      }
    } catch (err) {
      console.error('Setup error:', err);
      setSetupStatus('Network error while creating admin user');
    }
  };

  const requestResetToken = async () => {
    setResetStatus('');
    setRequestingResetToken(true);
    try {
      const username = resetForm.getValues('username');
      if (!username) {
        setResetStatus('Enter a username to request a reset token.');
        setRequestingResetToken(false);
        return;
      }

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // Updated flow: we don't get the token back. We get a message.
        // setResetToken(result.resetToken); <--- REMOVED
        setResetStatus(result.message || 'Reset instructions sent to your email.');
        // We can't auto-fill the token anymore
      } else {
        setResetStatus(result.error || 'Could not request password reset');
      }
    } catch (err) {
      console.error('Reset token request error:', err);
      setResetStatus('Network error while requesting reset token');
    } finally {
      setRequestingResetToken(false);
    }
  };

  const handleResetPassword = async (data: ResetFormData) => {
    setResetStatus('');
    const payload = {
      token: data.resetToken || resetToken,
      recoveryCode: data.recoveryCode,
      newPassword: data.newPassword,
    };

    if (!payload.token && !payload.recoveryCode) {
      setResetStatus('Provide either a reset token or your recovery code.');
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setResetStatus('Password updated. You can now sign in with the new password.');
        setMode('login');
      } else {
        setResetStatus(result.error || 'Password reset failed');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setResetStatus('Network error while resetting password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beauty-light">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-beauty-dark">
            {mode === 'login' && 'Admin Login'}
            {mode === 'create' && 'Create Admin Account'}
            {mode === 'reset' && 'Reset Admin Password'}
          </CardTitle>
          <p className="text-beauty-muted">
            {mode === 'login' && 'Sign in to access the admin dashboard'}
            {mode === 'create' && 'Set up your admin username and password'}
            {mode === 'reset' && 'Recover access with a reset token or recovery code'}
          </p>
          <div className="mt-4 flex justify-center gap-2 text-sm">
            <Button
              type="button"
              variant={mode === 'login' ? 'default' : 'outline'}
              onClick={() => setMode('login')}
              className="flex-1"
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={mode === 'create' ? 'default' : 'outline'}
              onClick={() => setMode('create')}
              className="flex-1"
            >
              Create Account
            </Button>
            <Button
              type="button"
              variant={mode === 'reset' ? 'default' : 'outline'}
              onClick={() => setMode('reset')}
              className="flex-1"
            >
              Reset Password
            </Button>
          </div>
          {adminStatus && (
            <p className="mt-2 text-xs text-beauty-muted">
              {adminStatus.configured
                ? `Admin account set up for ${adminStatus.username || 'the site owner'}.`
                : 'No admin account exists yet. Create one to continue.'}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {mode === 'login' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  rules={{ required: 'Username is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{ required: 'Password is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          )}

          {mode === 'create' && (
            <Form {...setupForm}>
              <form onSubmit={setupForm.handleSubmit(handleSetup)} className="space-y-4">
                <FormField
                  control={setupForm.control}
                  name="username"
                  rules={{ required: 'Username is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Choose a username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={setupForm.control}
                  name="password"
                  rules={{ required: 'Password is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a strong password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={setupForm.control}
                  name="confirmPassword"
                  rules={{ required: 'Please confirm your password' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Re-enter your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {setupStatus && (
                  <div className="text-sm text-center text-beauty-dark">
                    {setupStatus}
                  </div>
                )}

                {setupRecoveryCode && (
                  <div className="text-xs bg-beauty-light p-3 rounded border border-gray-200">
                    <p className="font-semibold mb-1">Recovery code</p>
                    <Textarea readOnly value={setupRecoveryCode} className="text-sm font-mono" />
                    <p className="mt-2">Save this code somewhere safe. Use it if you ever need to reset the password.</p>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Save Admin Account
                </Button>
              </form>
            </Form>
          )}

          {mode === 'reset' && (
            <div className="space-y-6">
              <Form {...resetForm}>
                <form className="space-y-4" onSubmit={resetForm.handleSubmit(handleResetPassword)}>
                  <FormField
                    control={resetForm.control}
                    name="username"
                    rules={{ required: 'Username is required to request a token' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Account username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="button" variant="outline" className="w-full" onClick={requestResetToken} disabled={requestingResetToken}>
                    {requestingResetToken ? 'Generating reset token...' : 'Generate reset token'}
                  </Button>



                  <FormField
                    control={resetForm.control}
                    name="resetToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reset Token</FormLabel>
                        <FormControl>
                          <Input placeholder="Paste reset token (or use recovery code instead)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetForm.control}
                    name="recoveryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recovery Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter saved recovery code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetForm.control}
                    name="newPassword"
                    rules={{ required: 'New password is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {resetStatus && (
                    <div className="text-sm text-center text-beauty-dark">
                      {resetStatus}
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    Update Password
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
