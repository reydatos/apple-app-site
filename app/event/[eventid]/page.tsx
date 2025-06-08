// app/event/[eventid]/page.tsx

import Head from "next/head";

// 1. Define the shape of your Event data
interface Event {
  name: string;
  description: string;
  // add any other fields you need here
}

// 2. Fetch helper (replace with your real data-loading logic)
async function fetchEventById(eventId: string): Promise<Event | null> {
  // Example using a REST API; update URL & parsing as needed
  const res = await fetch(`https://api.yoursite.com/events/${eventId}`);
  if (!res.ok) return null;
  return (await res.json()) as Event;
}

export default async function EventPage({
  params,
}: {
  params: { eventid: string };
}) {
  // 3. Tell TS that `event` is Event | null
  const event = await fetchEventById(params.eventid);

  // 4. Handle the “not found” case
  if (!event) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Event Not Found</h1>
        <p>Sorry, we couldn’t find an event with ID “{params.eventid}”.</p>
      </main>
    );
  }

  // 5. Render your event page
  const deepLink = `revolv://event/${params.eventid}`;

  return (
    <>
      <Head>
        <meta
          name="apple-itunes-app"
          content="app-clip-bundle-id=com.a8media.revolv.clip"
        />
        <title>{event.name}</title>
      </Head>
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <h1>{event.name}</h1>
        <p>{event.description}</p>
        <div style={{ marginTop: "40px" }}>
          <a
            href={deepLink}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#007AFF",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
            }}
          >
            Open in Revolv App
          </a>
        </div>
      </main>
    </>
  );
}
