 "use client";
  import { useEffect, useState } from 'react';
  import Head from 'next/head';

  export default function ProfilePage({ params }: { params: { username: string } }) {
    // rest of component...
  }

import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`https://api.revolv.app/v1/profiles/${params.username}`)
      .then(res => res.json())
      .then(setProfile);
  }, [params.username]);

  return (
    <>
      <Head>
        <meta name="apple-itunes-app" content="app-clip-bundle-id=com.a8media.revolv.appclip" />
        <title>{params.username}'s AMPD</title>
      </Head>
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        {profile ? (
          <>
            <h1>{profile.name}</h1>
            <p>{profile.title}</p>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </main>
    </>
  );
}
