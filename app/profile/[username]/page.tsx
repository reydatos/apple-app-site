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

    return (
      <>
        <Head>
          <meta name="apple-itunes-app" content="app-clip-bundle-id=com.a8media.revolv.clip" />
          <title>{username} - Revolv</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <main style={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '48px 32px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
          }}>
            {/* Profile Avatar */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: '600',
              color: 'white'
            }}>
              {username.charAt(0).toUpperCase()}
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 8px'
            }}>
              @{username}
            </h1>

            <p style={{
              fontSize: '18px',
              color: '#666',
              margin: '0 0 40px',
              lineHeight: '1.6'
            }}>
              Connect with {username} on Revolv to exchange contact information instantly
            </p>

            <a 
              href={`revolv://profile/${username}`}
              style={{
                display: 'inline-block',
                padding: '18px 40px',
                background: '#007AFF',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '600',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 20px rgba(0,122,255,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,122,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,122,255,0.3)';
              }}
            >
              Open in Revolv
            </a>

            <div style={{
              marginTop: '32px',
              paddingTop: '32px',
              borderTop: '1px solid #eee'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#999',
                margin: '0 0 16px'
              }}>
                Don't have Revolv yet?
              </p>
              <a 
                href="https://apps.apple.com/app/revolv"
                style={{
                  fontSize: '16px',
                  color: '#007AFF',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Download from App Store →
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }
