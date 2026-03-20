"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface ProfileStats {
  connections: number;
  introductions: number;
  responseRate: number; // 0-100
}

interface ProfileBadges {
  introduction: string | null; // "Super Connector" | "Top Connector" | null
  response: string | null; // "Super Responsive" | "Highly Responsive" | null
}

interface ProfileData {
  username: string;
  firstName: string;
  fullName: string | null;
  avatar: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  bio: string | null;
  skills: string[];
  careerStage: string | null;
  memberSince: string | null;
  stats: ProfileStats | null;
  badges: ProfileBadges;
}

interface ProfileClientProps {
  profileData: ProfileData;
  isConnectionRequest: boolean;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type View = "profile" | "auth" | "guest-form" | "connected" | "guest-sent";

export function ProfileClient({
  profileData,
  isConnectionRequest,
}: ProfileClientProps) {
  const searchParams = useSearchParams();
  const [view, setView] = useState<View>("profile");
  const [isConnecting, setIsConnecting] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Guest form state
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  useEffect(() => {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      setSupabase(createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
    }
  }, []);

  // Handle OAuth completion
  useEffect(() => {
    if (searchParams.get("step") === "complete") {
      setView("connected");
      const timer = setTimeout(() => {
        window.location.href = "https://apps.apple.com/app/revolv";
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleOAuth = useCallback(
    async (provider: "apple" | "linkedin_oidc") => {
      if (!supabase) return;
      setIsConnecting(true);
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/profile/${profileData.username}?connect=true&step=complete&name=${encodeURIComponent(profileData.firstName)}`,
          },
        });
        if (error) {
          console.error(`${provider} OAuth error:`, error);
          window.location.href = "https://apps.apple.com/app/revolv";
        }
      } catch {
        window.location.href = "https://apps.apple.com/app/revolv";
      }
    },
    [supabase, profileData],
  );

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    if (!guestPhone.trim() && !guestEmail.trim()) {
      setGuestError("Please enter your phone number or email");
      return;
    }

    setGuestSubmitting(true);
    setGuestError(null);

    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/receive-guest-contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            target_username: profileData.username,
            name: guestName.trim(),
            phone: guestPhone.trim() || undefined,
            email: guestEmail.trim() || undefined,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send contact info");
      }

      setView("guest-sent");
    } catch (err) {
      setGuestError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setGuestSubmitting(false);
    }
  };

  const displayName =
    profileData.fullName || profileData.firstName || profileData.username;
  const subtitle = [profileData.title, profileData.company]
    .filter(Boolean)
    .join(" at ");
  const initial = (displayName || "U").charAt(0).toUpperCase();
  const hasStats = profileData.stats && profileData.stats.connections > 0;
  const hasBadge = profileData.badges.introduction || profileData.badges.response;

  // --- Connected state ---
  if (view === "connected") {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--revolv-charcoal)] mb-2">Connected!</h1>
          <p className="text-[var(--revolv-gray)] text-[15px] leading-relaxed mb-6">
            You&apos;re now connected with {profileData.firstName}. Open Revolv for the full experience.
          </p>
          <p className="text-sm text-[var(--revolv-gray-light)] animate-pulse">Opening App Store...</p>
        </div>
      </GlassCard>
    );
  }

  // --- Guest sent confirmation ---
  if (view === "guest-sent") {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--revolv-coral)]/10 to-[var(--revolv-coral)]/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-[var(--revolv-coral)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--revolv-charcoal)] mb-2">Info Sent!</h1>
          <p className="text-[var(--revolv-gray)] text-[15px] leading-relaxed">
            {profileData.firstName} will see your contact info in Revolv. They&apos;ll be in touch!
          </p>
        </div>
      </GlassCard>
    );
  }

  // --- Auth options ---
  if (view === "auth") {
    return (
      <GlassCard>
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[var(--revolv-divider)]">
          <Avatar avatar={profileData.avatar} initial={initial} size="sm" />
          <div>
            <h2 className="text-lg font-semibold text-[var(--revolv-charcoal)]">
              Connect with {profileData.firstName}
            </h2>
            <p className="text-sm text-[var(--revolv-gray)]">
              Sign up to exchange contact info instantly
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuth("apple")}
            disabled={isConnecting}
            className="w-full bg-black text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <AppleIcon />
            <span>Continue with Apple</span>
          </button>
          <button
            onClick={() => handleOAuth("linkedin_oidc")}
            disabled={isConnecting}
            className="w-full bg-[#0A66C2] text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#004182] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <LinkedInIcon />
            <span>Continue with LinkedIn</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setView("profile")}
            className="text-[var(--revolv-accent)] hover:text-[var(--revolv-blue)] text-sm font-medium transition-colors"
          >
            Back
          </button>
        </div>
      </GlassCard>
    );
  }

  // --- Main profile card with relationship intelligence ---
  return (
    <div className="space-y-4">
      {/* Primary profile card */}
      <GlassCard>
        {/* Horizontal profile header — matches iOS UnifiedProfileCard layout */}
        <div className="flex items-start gap-5 mb-1">
          <Avatar avatar={profileData.avatar} initial={initial} size="lg" />
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold text-[var(--revolv-charcoal)] leading-tight truncate">
                {displayName}
              </h1>
              {/* Verification badge */}
              <svg className="w-5 h-5 text-green-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            {subtitle && (
              <p className="text-[15px] text-[var(--revolv-gray)] mt-0.5 leading-snug">{subtitle}</p>
            )}
            {profileData.location && (
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-3 h-3 text-[var(--revolv-gray-light)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="text-sm text-[var(--revolv-gray-light)]">{profileData.location}</span>
              </div>
            )}
            <p className="text-sm text-[var(--revolv-gray-light)] mt-1">@{profileData.username}</p>
          </div>
        </div>

        {/* Excellence badges */}
        {hasBadge && (
          <div className="flex flex-wrap gap-2 mt-3 mb-1">
            {profileData.badges.introduction && (
              <span className="excellence-badge">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  {profileData.badges.introduction === "Super Connector" ? (
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  ) : (
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  )}
                </svg>
                {profileData.badges.introduction}
              </span>
            )}
            {profileData.badges.response && (
              <span className="excellence-badge excellence-badge-green">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {profileData.badges.response}
              </span>
            )}
          </div>
        )}

        {/* Engagement stats — matches iOS UnifiedProfileCard stats row */}
        {hasStats && (
          <div className="grid grid-cols-3 gap-1 py-4 mt-3 border-t border-b border-[var(--revolv-divider)]">
            <StatItem
              value={profileData.stats!.connections.toString()}
              label="Connections"
              color="var(--revolv-accent)"
            />
            <StatItem
              value={profileData.stats!.introductions.toString()}
              label="Introductions"
              color="var(--revolv-coral)"
            />
            <StatItem
              value={`${profileData.stats!.responseRate}%`}
              label="Response"
              color={profileData.stats!.responseRate >= 85 ? "#22c55e" : "var(--revolv-gray-light)"}
            />
          </div>
        )}

        {/* Bio */}
        {profileData.bio && (
          <p className="text-[var(--revolv-gray)] text-[15px] leading-relaxed mt-4">
            {profileData.bio}
          </p>
        )}

        {/* Skills capsules */}
        {profileData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {profileData.skills.map((skill) => (
              <span key={skill} className="skill-capsule">{skill}</span>
            ))}
          </div>
        )}

        {/* Member since */}
        {profileData.memberSince && (
          <p className="text-xs text-[var(--revolv-gray-light)] mt-4">
            Member since {profileData.memberSince}
          </p>
        )}
      </GlassCard>

      {/* Relationship Intelligence card */}
      <div className="intelligence-card rounded-3xl overflow-hidden px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[var(--revolv-coral)]/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-[var(--revolv-coral)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-[var(--revolv-charcoal)] tracking-wide uppercase">
            Relationship Intelligence
          </h2>
        </div>

        <p className="text-[var(--revolv-gray)] text-[14px] leading-relaxed mb-4">
          {isConnectionRequest
            ? `Connect with ${profileData.firstName} on Revolv to unlock AI-powered relationship insights, smart follow-up reminders, and networking intelligence.`
            : `${profileData.firstName} uses Revolv to build stronger professional relationships with AI-powered intelligence.`}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <IntelligenceFeature
            icon={<path d="M13 10V3L4 14h7v7l9-11h-7z" />}
            label="Smart Follow-ups"
            detail="AI-timed reminders"
          />
          <IntelligenceFeature
            icon={<path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />}
            label="Network Mapping"
            detail="Hidden connections"
          />
          <IntelligenceFeature
            icon={<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
            label="Trust Scores"
            detail="Relationship health"
          />
          <IntelligenceFeature
            icon={<path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />}
            label="Intro Matching"
            detail="Opportunity engine"
          />
        </div>
      </div>

      {/* Connect / Guest Form card */}
      <GlassCard>
        {/* Description */}
        <p className="text-[var(--revolv-gray)] text-[15px] leading-relaxed mb-5">
          {isConnectionRequest
            ? `Join Revolv to connect with ${profileData.firstName} and start building intelligent relationships.`
            : `Connect with ${profileData.firstName} on Revolv for AI-powered relationship intelligence.`}
        </p>

        {/* Primary CTA */}
        <button
          onClick={() => setView("auth")}
          className="w-full bg-[var(--revolv-coral)] text-white font-semibold py-4 px-6 rounded-2xl ios-shadow hover:bg-[var(--revolv-coral-dark)] active:scale-[0.98] transition-all duration-200"
        >
          {isConnectionRequest ? "Connect on Revolv" : "Get Revolv"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[var(--revolv-divider)]" />
          <span className="text-xs text-[var(--revolv-gray-light)] uppercase tracking-wider font-medium">
            or share your info
          </span>
          <div className="flex-1 h-px bg-[var(--revolv-divider)]" />
        </div>

        {/* Guest contact form */}
        <form onSubmit={handleGuestSubmit} className="space-y-3">
          <GlassInput type="text" placeholder="Your name *" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
          <GlassInput type="tel" placeholder="Phone number" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} />
          <GlassInput type="email" placeholder="Email address" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />

          {guestError && <p className="text-sm text-red-500 text-center">{guestError}</p>}

          <button
            type="submit"
            disabled={guestSubmitting || !guestName.trim()}
            className="w-full py-3.5 px-6 rounded-2xl border-2 border-[var(--revolv-coral)] text-[var(--revolv-coral)] font-semibold hover:bg-[var(--revolv-coral)] hover:text-white active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {guestSubmitting ? "Sending..." : `Send to ${profileData.firstName}`}
          </button>
        </form>

        {/* Revolv badge */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-5 border-t border-[var(--revolv-divider)]">
          <RevolvLogo />
          <span className="text-xs text-[var(--revolv-gray-light)] font-medium tracking-wide">
            Relationship Intelligence
          </span>
        </div>
      </GlassCard>
    </div>
  );
}

// --- Shared Components ---

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-3xl ios-shadow overflow-hidden px-7 py-7">
      {children}
    </div>
  );
}

function Avatar({
  avatar,
  initial,
  size = "lg",
}: {
  avatar: string | null;
  initial: string;
  size?: "sm" | "lg";
}) {
  const dimensions = size === "lg" ? "w-[88px] h-[88px]" : "w-11 h-11";
  const textSize = size === "lg" ? "text-3xl" : "text-lg";
  const ringPad = size === "lg" ? "p-[3px]" : "p-[2px]";

  return (
    <div className={`avatar-ring rounded-full ${ringPad} flex-shrink-0`}>
      <div className={`${dimensions} rounded-full flex items-center justify-center overflow-hidden bg-white`}>
        {avatar ? (
          <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--revolv-serenity-3)] to-[var(--revolv-accent)] flex items-center justify-center">
            <span className={`${textSize} font-bold text-white`}>{initial}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[18px] font-bold text-[var(--revolv-charcoal)]" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-[var(--revolv-gray-light)] mt-0.5">{label}</div>
    </div>
  );
}

function IntelligenceFeature({
  icon,
  label,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <div className="intelligence-feature rounded-xl px-3 py-3">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-[var(--revolv-coral)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
        <span className="text-[13px] font-semibold text-[var(--revolv-charcoal)]">{label}</span>
      </div>
      <span className="text-[11px] text-[var(--revolv-gray-light)] ml-6">{detail}</span>
    </div>
  );
}

function GlassInput({
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3.5 rounded-xl bg-white/60 backdrop-blur-sm border border-[var(--revolv-divider)] text-[var(--revolv-charcoal)] placeholder-[var(--revolv-gray-light)] focus:outline-none focus:ring-2 focus:ring-[var(--revolv-accent)]/30 focus:border-[var(--revolv-accent)] transition-all text-[15px]"
    />
  );
}

function RevolvLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="var(--revolv-coral)" />
      <path d="M12 12h8v2h-6v2h4v2h-4v4h-2V12z" fill="white" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
