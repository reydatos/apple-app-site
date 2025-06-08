"use client";
  import { useEffect, useState } from 'react';
  import Head from 'next/head';

  export default function EventPage({ params }: { params: { eventId: string } }) {
    const [event, setEvent] = useState(null);

    useEffect(() => {
      fetch(`https://api.revolv.app/v1/events/${params.eventId}`)
        .then(res => res.json())
        .then(setEvent);
    }, [params.eventId]);

    return (
      <>
        <Head>
          <meta name="apple-itunes-app" content="app-clip-bundle-id=com.a8media.revolv.appclip" />
          <title>Event: {params.eventId}</title>
        </Head>
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          {event ? (
            <>
              <h1>Welcome to {event.name}</h1>
              <p>{event.description}</p>
            </>
          ) : (
            <p>Loading event...</p>
          )}
        </main>
      </>
    );
  }

  (Removed the indented duplicate code and extra spaces)
