  "use client";
  import { useEffect, useState } from 'react';
  import Head from 'next/head';

  export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
      const getParams = async () => {
        const resolvedParams = await params;
        setUsername(resolvedParams.username);
      };
      getParams();
    }, [params]);

    const displayName = username;
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ||
  username.charAt(0).toUpperCase();

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
              <g transform="translate(0, 10)">
                <path d="M10 20 L10 10 L20 10" stroke="#FF3B30" strokeWidth="4" fill="none"/>
                <path d="M60 10 L70 10 L70 20" stroke="#FF3B30" strokeWidth="4" fill="none"/>
                <path d="M70 50 L70 60 L60 60" stroke="#FF3B30" strokeWidth="4" fill="none"/>
                <path d="M20 60 L10 60 L10 50" stroke="#FF3B30" strokeWidth="4" fill="none"/>
                <path d="M25 35 L40 20 L55 35 L40 50 Z" fill="#FF3B30"/>
                <circle cx="40" cy="35" r="8" fill="white"/>
              </g>
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
                @{username}
              </p>

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
            </div>
          </div>
        </main>
      </>
    );
  }
