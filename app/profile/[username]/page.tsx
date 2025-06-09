  "use client";
  import { useEffect, useState } from 'react';
  import Head from 'next/head';

  interface Profile {
    username: string;
    fullName: string;
    bio?: string;
    profileImageUrl?: string;
  }

  export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const [username, setUsername] = useState<string>('');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const loadProfile = async () => {
        const resolvedParams = await params;
        setUsername(resolvedParams.username);

        // Fetch profile data from your API
        try {
          const response = await
  fetch(`https://iaefaqnpaczmxyqigzdw.supabase.co/rest/v1/profiles?username=eq.${resolvedParams.username}`,
  {
            headers: {
              'apikey':
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWZhcW5wYWN6bXh5cWlnemR3Iiwicm9s
  ZSI6ImFub24iLCJpYXQiOjE3NDg2NTg2NDgsImV4cCI6MjA2NDIzNDY0OH0.ImWFrxgQsGrY7MGg3bQfINKLpZ5uf9GS2JpE1bJq990'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
              setProfile({
                username: data[0].username,
                fullName: data[0].full_name || data[0].first_name + ' ' + data[0].last_name,
                bio: data[0].bio,
                profileImageUrl: data[0].profile_image_url
              });
            }
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          setLoading(false);
        }
      };

      loadProfile();
    }, [params]);

    const displayName = profile?.fullName || username;
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
      <>
        <Head>
          <meta name="apple-itunes-app" content="app-clip-bundle-id=com.a8media.revolv.clip" />
          <title>{displayName} - Revolv</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <main style={{ 
          minHeight: '100vh',
          background: '#FAFAFA',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Header with Revolv Logo */}
          <header style={{
            background: 'white',
            borderBottom: '1px solid #E5E5E5',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="150" height="40" viewBox="0 0 320 80" fill="none">
              {/* Revolv Logo Icon */}
              <g transform="translate(0, 10)">
                {/* Outer square with corners */}
                <path d="M10 20 L10 10 L20 10" stroke="#FF3B30" strokeWidth="4" fill="none"/>
                <path d="M60 10 L70 10 L70 20" stroke="#FF3B30" strokeWidth="4" fill="none"/>
                <path d="M70 50 L70 60 L60 60" stroke="#FF3B30" strokeWidth="4" fill="none"/>
                <path d="M20 60 L10 60 L10 50" stroke="#FF3B30" strokeWidth="4" fill="none"/>

                {/* Inner diamond */}
                <path d="M25 35 L40 20 L55 35 L40 50 Z" fill="#FF3B30"/>

                {/* Center circle */}
                <circle cx="40" cy="35" r="8" fill="white"/>
              </g>

              {/* Revolv Text */}
              <text x="90" y="48" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="600" 
  fill="#2C2C2C">revolv</text>
            </svg>
          </header>

          {/* Profile Content */}
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
              {loading ? (
                <div style={{ padding: '60px 0' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: '#F0F0F0',
                    margin: '0 auto 24px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}/>
                  <div style={{
                    height: '32px',
                    background: '#F0F0F0',
                    borderRadius: '8px',
                    margin: '0 auto 16px',
                    width: '200px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}/>
                </div>
              ) : (
                <>
                  {/* Profile Picture */}
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
                    color: 'white',
                    position: 'relative'
                  }}>
                    {profile?.profileImageUrl ? (
                      <img 
                        src={profile.profileImageUrl} 
                        alt={displayName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span style={{ zIndex: 1 }}>{initials}</span>
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
                    margin: '0 0 12px'
                  }}>
                    @{username}
                  </p>

                  {profile?.bio && (
                    <p style={{
                      fontSize: '16px',
                      color: '#666',
                      margin: '0 0 32px',
                      lineHeight: '1.5'
                    }}>
                      {profile.bio}
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
                      Join Revolv to connect with {displayName} and exchange contact information instantly
                    </p>

                    <a 
                      href="https://apps.apple.com/app/revolv"
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
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,59,48,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,59,48,0.3)';
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
                      <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>
                        Instant
                      </div>
                      <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
                        Connections
                      </div>
                    </div>
                    <div style={{ width: '1px', background: '#E5E5E5' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>
                        Share
                      </div>
                      <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
                        Profiles
                      </div>
                    </div>
                    <div style={{ width: '1px', background: '#E5E5E5' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>
                        Network
                      </div>
                      <div style={{ fontSize: '16px', color: '#333', fontWeight: '600' }}>
                        Smarter
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <style jsx global>{`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.6; }
              100% { opacity: 1; }
            }
          `}</style>
        </main>
      </>
    );
  }
