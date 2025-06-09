  import { Metadata } from 'next';

  interface Props {
    params: Promise<{ username: string }>;
  }

  export async function generateMetadata({ params }: Props): 
  Promise<Metadata> {
    const resolvedParams = await params;
    const username = resolvedParams.username;
    const displayName = username;

    return {
      title: `${displayName} - Revolv Profile`,
      description: `Connect with ${displayName} on Revolv. Exchange 
  contact information instantly and build your professional 
  network.`,
      openGraph: {
        type: 'profile',
        title: `${displayName} - Revolv Profile`,
        description: `Connect with ${displayName} on Revolv. Exchange
   contact information instantly and build your professional 
  network.`,
        url: `https://getrevolv.com/profile/${username}`,
        images: [
          {
            url: 'https://getrevolv.com/revolv-og-image.png',
            width: 1200,
            height: 630,
            alt: 'Revolv - Connect and network instantly',
          }
        ],
        siteName: 'Revolv',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${displayName} - Revolv Profile`,
        description: `Connect with ${displayName} on Revolv. Exchange
   contact information instantly and build your professional 
  network.`,
        images: ['https://getrevolv.com/revolv-og-image.png'],
      },
      other: {
        'apple-itunes-app':
  'app-clip-bundle-id=com.a8media.revolv.clip',
      },
    };
  }

  export default async function ProfilePage({ params }: Props) {
    const resolvedParams = await params;
    const username = resolvedParams.username;
    const displayName = username;
    const initials = displayName.split(' ').map(n =>
  n[0]).join('').toUpperCase().slice(0, 2) ||
  username.charAt(0).toUpperCase();

    return (
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
              <div style={{ width: '1px', background: '#E5E5E5' }} />
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
              <div style={{ width: '1px', background: '#E5E5E5' }} />
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
    );
  }
