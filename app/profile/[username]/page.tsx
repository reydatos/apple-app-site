  "use client";
  import { useEffect, useState } from 'react';
  import Head from 'next/head';

  // Types for better type safety
  interface ProfileData {
    id: string;
    full_name: string;
    username: string;
    bio?: string;
    created_at: string;
  }

  interface ApiResponse {
    data: ProfileData | null;
    error: string | null;
  }

  export default function ProfilePage({ params }: { params: Promise<{
   username: string }> }) {
    const [username, setUsername] = useState<string>('');
    const [profileData, setProfileData] = useState<ProfileData |
  null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Input validation function
    const isValidUsername = (username: string): boolean => {
      // Username should be 3-30 characters, alphanumeric, 
  underscore, hyphen only
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      return usernameRegex.test(username);
    };

    // Sanitize string to prevent XSS
    const sanitizeString = (str: string): string => {
      return str.replace(/[<>\"'&]/g, (match) => {
        const escapeMap: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '&': '&amp;'
        };
        return escapeMap[match];
      });
    };

    // Secure API call with proper error handling
    const fetchProfileData = async (username: string):
  Promise<ApiResponse> => {
      try {
        // Validate environment variables exist
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Missing required environment 
  configuration');
        }

        // Input validation
        if (!isValidUsername(username)) {
          throw new Error('Invalid username format');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(),
  10000); // 10s timeout

        const response = await fetch(
          `${supabaseUrl}/rest/v1/profiles?username=eq.${encodeURICom
  ponent(username)}&select=id,full_name,username,bio,created_at`,
          {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Don't expose internal error details to client
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();

        // Validate response structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }

        const profile = data[0] || null;

        // Validate profile data structure if it exists
        if (profile && (!profile.id || !profile.username)) {
          throw new Error('Invalid profile data structure');
        }

        return { data: profile, error: null };

      } catch (error) {
        console.error('Profile fetch error:', error);

        // Return user-friendly error messages, don't expose internal
   details
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            return { data: null, error: 'Request timeout' };
          }
          if (error.message === 'Invalid username format') {
            return { data: null, error: 'Invalid username' };
          }
        }

        return { data: null, error: 'Unable to load profile' };
      }
    };

    useEffect(() => {
      const getParams = async () => {
        try {
          const resolvedParams = await params;
          const usernameParam = resolvedParams.username;

          if (!usernameParam) {
            setError('Username is required');
            setIsLoading(false);
            return;
          }

          setUsername(usernameParam);

          const result = await fetchProfileData(usernameParam);

          if (result.error) {
            setError(result.error);
          } else {
            setProfileData(result.data);
          }

        } catch (error) {
          setError('Failed to load profile');
        } finally {
          setIsLoading(false);
        }
      };

      getParams();
    }, [params]);

    // Compute display values with sanitization
    const displayName = profileData?.full_name
      ? sanitizeString(profileData.full_name)
      : sanitizeString(username);

    const sanitizedUsername = sanitizeString(username);
    const sanitizedBio = profileData?.bio ?
  sanitizeString(profileData.bio) : null;

    const initials = displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || sanitizedUsername.charAt(0).toUpperCase();

    // Handle loading and error states
    if (isLoading) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          Loading...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1>Profile Not Found</h1>
            <p>The requested profile could not be found.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <Head>
          <title>{displayName} - Revolv Profile</title>
          <meta name="description" content={`Connect with 
  ${displayName} on Revolv. Exchange contact information instantly 
  and build your professional network.`} />
          <meta name="viewport" content="width=device-width, 
  initial-scale=1" />

          {/* Security headers */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" 
  />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" 
  />

          {/* Open Graph Meta Tags */}
          <meta property="og:type" content="profile" />
          <meta property="og:title" content={`${displayName} - Revolv
   Profile`} />
          <meta property="og:description" content={`Connect with 
  ${displayName} on Revolv. Exchange contact information instantly 
  and build your professional network.`} />
          <meta property="og:url" content={`https://getrevolv.com/pro
  file/${encodeURIComponent(sanitizedUsername)}`} />
          <meta property="og:image" 
  content="https://getrevolv.com/revolv-og-image.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Revolv" />

          {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${displayName} - 
  Revolv Profile`} />
          <meta name="twitter:description" content={`Connect with 
  ${displayName} on Revolv. Exchange contact information instantly 
  and build your professional network.`} />
          <meta name="twitter:image" 
  content="https://getrevolv.com/revolv-og-image.png" />

          {/* Apple App Banner */}
          <meta name="apple-itunes-app" 
  content="app-clip-bundle-id=com.a8media.revolv.clip" />
        </Head>
        <main style={{ 
          minHeight: '100vh',
          background: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI",
   Roboto, sans-serif'
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '48px 32px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                margin: '0 auto 24px',
                overflow: 'hidden',
                background: '#FF3B30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: '600',
                color: 'white'
              }}>
                {initials}
              </div>

              <h1 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: '#1C1C1C',
                margin: '0 0 8px'
              }}>
                {displayName}
              </h1>

              <p style={{
                fontSize: '18px',
                color: '#666',
                margin: '0 0 32px'
              }}>
                @{sanitizedUsername}
              </p>

              {sanitizedBio && (
                <p style={{
                  fontSize: '16px',
                  color: '#333',
                  margin: '0 0 24px',
                  lineHeight: '1.5'
                }}>
                  {sanitizedBio}
                </p>
              )}

              <div style={{
                background: '#F8F8F8',
                borderRadius: '12px',
                padding: '20px',
                margin: '32px 0'
              }}>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  margin: '0 0 20px',
                  lineHeight: '1.6'
                }}>
                  Join Revolv to connect with {displayName} and
  exchange contact information instantly
                </p>

                <a 
                  href="https://apps.apple.com/app/revolv"
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{
                    display: 'inline-block',
                    padding: '16px 32px',
                    background: '#FF3B30',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontSize: '17px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(255,59,48,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
  'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px
  rgba(255,59,48,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform =
  'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px
  rgba(255,59,48,0.3)';
                  }}
                >
                  Get Revolv
                </a>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                marginTop: '24px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#999', 
  marginBottom: '4px' }}>
                    Instant
                  </div>
                  <div style={{ fontSize: '16px', color: '#333', 
  fontWeight: '600' }}>
                    Connections
                  </div>
                </div>
                <div style={{ width: '1px', background: '#E5E5E5' }} 
  />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#999', 
  marginBottom: '4px' }}>
                    Share
                  </div>
                  <div style={{ fontSize: '16px', color: '#333', 
  fontWeight: '600' }}>
                    Profiles
                  </div>
                </div>
                <div style={{ width: '1px', background: '#E5E5E5' }} 
  />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#999', 
  marginBottom: '4px' }}>
                    Network
                  </div>
                  <div style={{ fontSize: '16px', color: '#333', 
  fontWeight: '600' }}>
                    Smarter
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
