import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google OAuth 2.0 configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google: any;
    gtag: (...args: any[]) => void;
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for saved user
    const savedUser = localStorage.getItem('google_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleAPI = () => {
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleSignIn();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (!GOOGLE_CLIENT_ID) {
        console.warn('Google Client ID not configured');
        setIsLoading(false);
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        // Check if user is already signed in (using stored credentials)
        if (user) {
          setIsLoading(false);
          return;
        }

        // Try to restore session if possible
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
        setIsLoading(false);
      }
    };

    loadGoogleAPI();
  }, []);

  const handleCredentialResponse = (response: any) => {
    try {
      // Decode the JWT token to get user info
      // Note: In production, you should verify this token on your backend
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const userData: User = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };

      setUser(userData);
      localStorage.setItem('google_user', JSON.stringify(userData));
      localStorage.setItem('google_credential', response.credential);

      // Track login event in GA
      if (window.gtag) {
        window.gtag('event', 'login', {
          method: 'Google',
        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error processing credential response:', error);
      setIsLoading(false);
    }
  };

  const signIn = async () => {
    try {
      if (!window.google?.accounts) {
        throw new Error('Google Identity Services not loaded. Please refresh the page.');
      }

      // Trigger the One Tap or popup sign-in
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          // Fallback to popup if One Tap is not available
          window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile',
            callback: (response: any) => {
              // This is a simplified version - in production, exchange the token for user info
              console.log('Token received:', response);
            },
          }).requestAccessToken();
        }
      });

      // Also provide a button-based sign-in as fallback
      if (!user) {
        // Create a temporary button for sign-in
        const signInButton = document.createElement('div');
        signInButton.id = 'google-signin-button';
        document.body.appendChild(signInButton);

        window.google.accounts.id.renderButton(
          signInButton,
          { theme: 'outline', size: 'large', text: 'signin_with' }
        );

        // Auto-click after a short delay
        setTimeout(() => {
          const button = signInButton.querySelector('div[role="button"]') as HTMLElement;
          if (button) {
            button.click();
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      alert(error.message || 'Failed to sign in. Please try again.');
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('google_user');
      localStorage.removeItem('google_credential');

      // Revoke token if available
      if (window.google?.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }

      // Track logout event in GA
      if (window.gtag) {
        window.gtag('event', 'logout');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Set loading to false once component is mounted and user state is determined
  useEffect(() => {
    if (user || !GOOGLE_CLIENT_ID) {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
