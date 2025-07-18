'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function ProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionComplete, setConnectionComplete] = useState(false);
  const [supabase, setSupabase] = useState(null);
  
  // Get profile data from URL parameters
  const profileData = {
    username: params.username as string,
    firstName: searchParams.get('name') || searchParams.get('firstName') || params.username,
    fullName: searchParams.get('fullName') || searchParams.get('name'),
    avatar: searchParams.get('avatar'),
    title: searchParams.get('title'),
    company: searchParams.get('company')
  };
  
  const isConnectionRequest = searchParams.get('connect') === 'true';
  
  useEffect(() => {
    // Initialize Supabase
    async function initSupabase() {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        if (window.supabase) {
          setSupabase(window.supabase.createClient(config.supabaseUrl, config.supabaseKey));
        }
      } catch (error) {
        console.error('Failed to initialize Supabase:', error);
      }
    }
    
    initSupabase();
  }, []);

  const handleConnect = () => {
    setShowAuthOptions(true);
  };

  const handleAppleAuth = async () => {
    if (!supabase) return;
    
    setIsConnecting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/profile/${profileData.username}?connect=true&step=complete&name=${encodeURIComponent(profileData.firstName)}`
        }
      });
      
      if (error) {
        console.error('Apple OAuth error:', error);
        window.location.href = 'https://apps.apple.com/app/revolv';
      }
    } catch (error) {
      console.error('Apple auth error:', error);
      window.location.href = 'https://apps.apple.com/app/revolv';
    }
  };

  const handleLinkedInAuth = async () => {
    if (!supabase) return;
    
    setIsConnecting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/profile/${profileData.username}?connect=true&step=complete&name=${encodeURIComponent(profileData.firstName)}`
        }
      });
      
      if (error) {
        console.error('LinkedIn OAuth error:', error);
        window.location.href = 'https://apps.apple.com/app/revolv';
      }
    } catch (error) {
      console.error('LinkedIn auth error:', error);
      window.location.href = 'https://apps.apple.com/app/revolv';
    }
  };

  // Handle OAuth completion
  useEffect(() => {
    if (searchParams.get('step') === 'complete') {
      setConnectionComplete(true);
      setTimeout(() => {
        window.location.href = 'https://apps.apple.com/app/revolv';
      }, 2000);
    }
  }, [searchParams]);

  if (connectionComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Connected!</h1>
            <p className="text-gray-600 mb-6">
              You're now connected with {profileData.firstName}. Download Revolv for the full experience.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-gray-500">Redirecting to App Store...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAuthOptions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect with {profileData.firstName}</h2>
              <p className="text-gray-600">Choose how you'd like to sign up and connect instantly</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleAppleAuth}
                disabled={isConnecting}
                className="w-full bg-black text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Continue with Apple</span>
              </button>
              
              <button
                onClick={handleLinkedInAuth}
                disabled={isConnecting}
                className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>Continue with LinkedIn</span>
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAuthOptions(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {profileData.avatar ? (
                  <img 
                    src={profileData.avatar} 
                    alt={profileData.fullName || profileData.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {(profileData.firstName || profileData.username || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {(profileData.fullName || profileData.firstName || profileData.username || 'User').toLowerCase()}
              </h1>
              <p className="text-gray-600 mb-6">
                @{profileData.username}
              </p>
              
              <div className="mb-8">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {isConnectionRequest 
                    ? `Join Revolv to connect with ${profileData.firstName} and exchange contact information instantly`
                    : `Connect with ${profileData.firstName} on Revolv for instant networking`
                  }
                </p>
              </div>
              
              <button
                onClick={handleConnect}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                {isConnectionRequest ? 'Connect Now' : 'Get Revolv'}
              </button>
            </div>
            
            <div className="px-8 pb-8">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-gray-900 font-semibold text-sm mb-1">Instant</div>
                  <div className="text-gray-600 text-sm">Connections</div>
                </div>
                <div>
                  <div className="text-gray-900 font-semibold text-sm mb-1">Share</div>
                  <div className="text-gray-600 text-sm">Profiles</div>
                </div>
                <div>
                  <div className="text-gray-900 font-semibold text-sm mb-1">Network</div>
                  <div className="text-gray-600 text-sm">Smarter</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
