import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ eventid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { eventid } = await params;
  return {
    title: `Event — Revolv`,
    description: `Join this event on Revolv`,
    other: {
      "apple-itunes-app": `app-clip-bundle-id=com.a8media.revolv.clip, app-clip-display=card`,
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { eventid } = await params;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-[var(--revolv-coral)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[var(--revolv-coral)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Revolv Event
          </h1>
          <p className="text-[var(--revolv-gray)] mb-6">
            Open this link in the Revolv app to view event details and check in.
          </p>
          <a
            href="https://apps.apple.com/app/revolv"
            className="inline-block w-full bg-[var(--revolv-coral)] text-white font-semibold py-4 px-6 rounded-2xl hover:bg-[var(--revolv-coral-dark)] transition-colors"
          >
            Open in Revolv
          </a>
        </div>
      </div>
    </div>
  );
}
