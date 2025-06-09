  "use client";
  import { useEffect, useState } from 'react';
  import Head from 'next/head';

  export default function ProfilePage({ params }: { params: Promise<{
   username: string }> }) {
    const [username, setUsername] = useState<string>('');
    const [profileData, setProfileData] = useState<any>(null);

    useEffect(() => {
      const getParams = async () => {
        const resolvedParams = await params;
        setUsername(resolvedParams.username);

        // Fetch profile data from Supabase using environment 
  variables
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles
  ?username=eq.${resolvedParams.username}`,
            {
              headers: {
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer 
  ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            setProfileData(data[0] || null);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      getParams();
    }, [params]);

    const displayName = profileData?.full_name || username;
    const initials = displayName.split(' ').map((n: string) =>
  n[0]).join('').toUpperCase().slice(0, 2) ||
      username.charAt(0).toUpperCase();

    return (
      <>
        <Head>
          <title>{displayName} - Revolv Profile</title>
          <meta name="description" content={`Connect with 
  ${displayName} on Revolv. Exchange contact information instantly 
  and build your professional network.`} />
          <meta name="viewport" content="width=device-width, 
  initial-scale=1" />

          <meta property="og:type" content="profile" />
          <meta property="og:title" content={`${displayName} - Revolv
   Profile`} />
          <meta property="og:description" content={`Connect with 
  ${displayName} on Revolv. Exchange contact information instantly 
  and build your professional network.`} />
          <meta property="og:url" 
  content={`https://getrevolv.com/profile/${username}`} />
          <meta property="og:image" 
  content="https://getrevolv.com/revolv-og-image.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Revolv" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${displayName} - 
  Revolv Profile`} />
          <meta name="twitter:description" content={`Connect with 
  ${displayName} on Revolv. Exchange contact information instantly 
  and build your professional network.`} />
          <meta name="twitter:image" 
  content="https://getrevolv.com/revolv-og-image.png" />

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
                  Join Revolv to connect with {displayName} and
  exchange contact information instantly
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
