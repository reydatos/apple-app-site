import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revolv App Clip",
  description: "Quick connect with Revolv",
  other: {
    "apple-itunes-app": `app-clip-bundle-id=com.a8media.revolv.clip`,
  },
};

export default function AppClipTestLaunch() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
          Welcome to Revolv
        </h1>
        <p className="text-lg text-[var(--revolv-gray)] mb-6">
          You&apos;ve launched the Revolv App Clip. Get the full app to unlock
          relationship intelligence.
        </p>
        <a
          href="https://apps.apple.com/app/revolv"
          className="inline-block bg-[var(--revolv-coral)] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[var(--revolv-coral-dark)] transition-colors"
        >
          Get Revolv
        </a>
      </div>
    </main>
  );
}
