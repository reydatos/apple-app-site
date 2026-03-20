"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface ProfileData {
  username: string;
  firstName: string;
  fullName: string | null;
  avatar: string | null;
  title: string | null;
  company: string | null;
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

  // --- Connected state ---
  if (view === "connected") {
    return (
      <GlassCard>
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-10 h-10 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--revolv-charcoal)] mb-2">
            Connected!
          </h1>
          <p className="text-[var(--revolv-gray)] text-[15px] leading-relaxed mb-6">
            You&apos;re now connected with {profileData.firstName}. Open Revolv
            for the full experience.
          </p>
          <p className="text-sm text-[var(--revolv-gray-light)] animate-pulse">
            Opening App Store...
          </p>
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
            <svg
              className="w-10 h-10 text-[var(--revolv-coral)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--revolv-charcoal)] mb-2">
            Info Sent!
          </h1>
          <p className="text-[var(--revolv-gray)] text-[15px] leading-relaxed">
            {profileData.firstName} will see your contact info in Revolv.
            They&apos;ll be in touch!
          </p>
        </div>
      </GlassCard>
    );
  }

  // --- Auth options ---
  if (view === "auth") {
    return (
      <GlassCard>
        {/* Mini profile header */}
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

  // --- Main profile card (iOS-aligned) ---
  return (
    <GlassCard>
      {/* Horizontal profile header — matches iOS UnifiedProfileCard layout */}
      <div className="flex items-start gap-5 mb-5">
        {/* Avatar (left) — 88px to match iOS Profile.avatarSize */}
        <Avatar avatar={profileData.avatar} initial={initial} size="lg" />

        {/* Name + details (right) */}
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-[22px] font-bold text-[var(--revolv-charcoal)] leading-tight truncate">
            {displayName}
          </h1>
          {subtitle && (
            <p className="text-[15px] text-[var(--revolv-gray)] mt-0.5 leading-snug">
              {subtitle}
            </p>
          )}
          <p className="text-sm text-[var(--revolv-gray-light)] mt-1">
            @{profileData.username}
          </p>
        </div>
      </div>

      {/* Stats row — matches iOS UnifiedProfileCard stats section */}
      <div className="grid grid-cols-3 gap-1 py-4 border-t border-b border-[var(--revolv-divider)]">
        <StatItem label="Platform" value="Revolv" />
        <StatItem label="Networking" value="Smart" />
        <StatItem label="Intelligence" value="AI" />
      </div>

      {/* Description */}
      <p className="text-[var(--revolv-gray)] text-[15px] leading-relaxed mt-5 mb-6">
        {isConnectionRequest
          ? `Join Revolv to connect with ${profileData.firstName} and exchange contact info instantly.`
          : `Connect with ${profileData.firstName} on Revolv for intelligent relationship management.`}
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
        <GlassInput
          type="text"
          placeholder="Your name *"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
        />
        <GlassInput
          type="tel"
          placeholder="Phone number"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
        />
        <GlassInput
          type="email"
          placeholder="Email address"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
        />

        {guestError && (
          <p className="text-sm text-red-500 text-center">{guestError}</p>
        )}

        <button
          type="submit"
          disabled={guestSubmitting || !guestName.trim()}
          className="w-full py-3.5 px-6 rounded-2xl border-2 border-[var(--revolv-coral)] text-[var(--revolv-coral)] font-semibold hover:bg-[var(--revolv-coral)] hover:text-white active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guestSubmitting
            ? "Sending..."
            : `Send to ${profileData.firstName}`}
        </button>
      </form>

      {/* Revolv badge — minimal branding */}
      <div className="flex items-center justify-center gap-2 mt-8 pt-5 border-t border-[var(--revolv-divider)]">
        <RevolvLogo />
        <span className="text-xs text-[var(--revolv-gray-light)] font-medium tracking-wide">
          Relationship Intelligence
        </span>
      </div>
    </GlassCard>
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
    <div
      className={`avatar-ring rounded-full ${ringPad} flex-shrink-0`}
    >
      <div
        className={`${dimensions} rounded-full flex items-center justify-center overflow-hidden bg-white`}
      >
        {avatar ? (
          <img
            src={avatar}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--revolv-serenity-3)] to-[var(--revolv-accent)] flex items-center justify-center">
            <span className={`${textSize} font-bold text-white`}>
              {initial}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[15px] font-bold text-[var(--revolv-charcoal)]">
        {value}
      </div>
      <div className="text-xs text-[var(--revolv-gray-light)] mt-0.5">
        {label}
      </div>
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
      <path
        d="M12 12h8v2h-6v2h4v2h-4v4h-2V12z"
        fill="white"
      />
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
