"use client";
  import { useEffect, useState } from 'react';
  import Head from 'next/head';

  export default function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
    const [event, setEvent] = useState(null);
    const [eventId, setEventId] = useState<string>('');

    useEffect(() => {
      const getParams = async () => {
        const resolvedParams = await params;
        setEventId(resolvedParams.eventId);

        fetch(`https://api.revolv.app/v1/events/${resolvedParams.eventId}`)
          .then(res => res.json())
          .then(setEvent);
      };

      getParams();
    }, [params]);

    return (
      <>
        <Head>
          <meta name="apple-itunes-app" content="app-clip-bundle-id=com.a8media.revolv.appclip" />
          <title>Event: {eventId}</title>
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
