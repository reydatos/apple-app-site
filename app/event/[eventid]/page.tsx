"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Head from "next/head";

interface Event {
  id: string;
  name: string;
  description: string;
}

export default function EventPage() {
  // Next.js App Router will supply the dynamic segment as lowercase
  const { eventid } = useParams() as { eventid: string };
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    if (!eventid) return;

    async function loadEvent() {
      try {
        const res = await fetch(`https://api.revolv.app/v1/events/${eventid}`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = (await res.json()) as Event;
        setEvent(data);
      } catch (err) {
        console.error("Failed to load event:", err);
      }
    }

    loadEvent();
  }, [eventid]);

  return (
    <>
      <Head>
        <meta
          name="apple-itunes-app"
          content="app-clip-bundle-id=com.a8media.revolv.clip"
        />
        <title>Event: {eventid}</title>
      </Head>

      <main style={{ padding: "2rem", textAlign: "center" }}>
        {event ? (
          <>
            <h1>Welcome to {event.name}</h1>
            <p>{event.description}</p>
          </>
        ) : (
          <p>Loading event…</p>
        )}
      </main>
    </>
  );
}
