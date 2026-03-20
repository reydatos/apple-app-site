import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { ProfileClient } from "./ProfileClient";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fetchProfileData(username: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Fetch profile by username
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_id, first_name, last_name, full_name, username, title, company, location, bio, profile_image_url, skills, career_stage, created_at")
    .eq("username", username)
    .single();

  if (!profile) return null;

  // Fetch engagement stats in parallel
  const [connectionsResult, introStatsResult, responseRateResult] = await Promise.all([
    // Connection count
    supabase
      .from("connections")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${profile.user_id},connected_user_id.eq.${profile.user_id}`)
      .eq("connection_status", "active"),
    // Introduction stats
    supabase.rpc("get_introduction_stats", { p_user_id: profile.user_id }),
    // Response rate
    supabase.rpc("get_response_rate", { query_user_id: profile.user_id }),
  ]);

  const connectionsCount = connectionsResult.count ?? 0;
  const introStats = introStatsResult.data?.[0];
  const introductionsCount = introStats?.total_accepted ?? 0;
  const responseRate = typeof responseRateResult.data === "number" ? responseRateResult.data : 0;

  // Excellence badges (mirrors iOS ExcellenceLevel thresholds)
  let introductionBadge: string | null = null;
  if (introductionsCount >= 25) introductionBadge = "Super Connector";
  else if (introductionsCount >= 10) introductionBadge = "Top Connector";

  let responseBadge: string | null = null;
  if (responseRate >= 0.95) responseBadge = "Super Responsive";
  else if (responseRate >= 0.85) responseBadge = "Highly Responsive";

  return {
    username: profile.username || username,
    firstName: profile.first_name || username,
    fullName: profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || null,
    avatar: sanitizeAvatarUrl(profile.profile_image_url),
    title: profile.title || null,
    company: profile.company || null,
    location: profile.location || null,
    bio: profile.bio || null,
    skills: parseSkills(profile.skills),
    careerStage: profile.career_stage || null,
    memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : null,
    stats: {
      connections: connectionsCount,
      introductions: introductionsCount,
      responseRate: Math.round(responseRate * 100),
    },
    badges: {
      introduction: introductionBadge,
      response: responseBadge,
    },
  };
}

function parseSkills(skills: unknown): string[] {
  if (!skills || typeof skills !== "object") return [];
  const s = skills as { technical?: string[]; soft?: string[] };
  return [...(s.technical || []), ...(s.soft || [])].slice(0, 6);
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const sp = await searchParams;

  // Try Supabase first, fall back to URL params
  const profile = await fetchProfileData(username);
  const displayName = profile?.fullName || sp.fullName || sp.name || username;
  const subtitle = [profile?.title || sp.title, profile?.company || sp.company].filter(Boolean).join(" at ");

  return {
    title: `${displayName} — Revolv`,
    description: subtitle
      ? `Connect with ${displayName} (${subtitle}) on Revolv — Relationship Intelligence`
      : `Connect with ${displayName} on Revolv — Relationship Intelligence`,
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

  // Fetch real profile from Supabase
  const profile = await fetchProfileData(username);

  // Build profile data — prefer Supabase, fall back to URL params
  const profileData = profile || {
    username,
    firstName: sp.name || sp.firstName || username,
    fullName: sp.fullName || sp.name || null,
    avatar: sanitizeAvatarUrl(sp.avatar || null),
    title: sp.title || null,
    company: sp.company || null,
    location: null,
    bio: null,
    skills: [] as string[],
    careerStage: null,
    memberSince: null,
    stats: null,
    badges: { introduction: null, response: null },
  };

  const isConnectionRequest = sp.connect === "true";

  return (
    <div className="min-h-screen serenity-gradient flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <ProfileClient
          profileData={profileData}
          isConnectionRequest={isConnectionRequest}
        />

        <p className="text-center text-xs text-[var(--revolv-gray-light)] mt-8">
          Powered by{" "}
          <a
            href="https://getrevolv.com"
            className="text-[var(--revolv-accent)] hover:underline"
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
