import type { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const sp = await searchParams;
  const displayName = sp.fullName || sp.name || username;
  const title = sp.title || "";
  const company = sp.company || "";
  const subtitle = [title, company].filter(Boolean).join(" at ");

  return {
    title: `${displayName} — Revolv`,
    description: subtitle
      ? `Connect with ${displayName} (${subtitle}) on Revolv`
      : `Connect with ${displayName} on Revolv — relationship intelligence`,
    openGraph: {
      title: `${displayName} — Revolv`,
      description: subtitle
        ? `${subtitle} — Connect on Revolv`
        : `Connect with ${displayName} on Revolv`,
      type: "profile",
      siteName: "Revolv",
    },
  };
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const sp = await searchParams;

  const profileData = {
    username,
    firstName: sp.name || sp.firstName || username,
    fullName: sp.fullName || sp.name || null,
    avatar: sanitizeAvatarUrl(sp.avatar || null),
    title: sp.title || null,
    company: sp.company || null,
  };

  const isConnectionRequest = sp.connect === "true";

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <ProfileClient
          profileData={profileData}
          isConnectionRequest={isConnectionRequest}
        />

        <p className="text-center text-xs text-[var(--revolv-gray-light)] mt-8">
          Powered by{" "}
          <a
            href="https://getrevolv.com"
            className="text-[var(--revolv-blue)] hover:underline"
          >
            Revolv
          </a>{" "}
          — Relationship Intelligence
        </p>
      </div>
    </div>
  );
}

function sanitizeAvatarUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const allowed = [
      "supabase.co",
      "supabase.in",
      "gravatar.com",
      "cloudinary.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "media.licdn.com",
    ];
    if (allowed.some((domain) => parsed.hostname.endsWith(domain))) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}
