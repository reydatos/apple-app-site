 "use client";
  import { useEffect, useState } from 'react';
  import Head from 'next/head';

  export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState<string>('');

    useEffect(() => {
      const getParams = async () => {
        const resolvedParams = await params;
        setUsername(resolvedParams.username);

        fetch(`https://api.revolv.app/v1/profiles/${resolvedParams.username}`)
          .then(res => res.json())
          .then(setProfile);
      };

      getParams();
    }, [params]);

    return (
      <>
        <Head>
          <meta name="apple-itunes-app" content="app-clip-bundle-id=com.a8media.revolv.appclip" />
          <title>Profile: {username}</title>
        </Head>
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {profile ? (
            <>
              <h1>Welcome to {profile.name}</h1>
              <p>{profile.bio}</p>
            </>
          ) : (
            <p>Loading profile...</p>
          )}
        </main>
      </>
    );
  }
