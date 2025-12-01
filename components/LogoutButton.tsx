'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const response = await fetch('/api/auth', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to login page
        router.push('/login');
        router.refresh(); // Refresh to clear any cached data
      } else {
        console.error('Logout failed');
        // Even if the API call fails, redirect to login for security
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, redirect to login for security
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}