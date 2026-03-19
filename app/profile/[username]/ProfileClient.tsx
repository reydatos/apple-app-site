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
      <Card>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Connected!
          </h1>
          <p className="text-[var(--revolv-gray)] mb-6">
            You&apos;re now connected with {profileData.firstName}. Open Revolv
            for the full experience.
          </p>
          <p className="text-sm text-[var(--revolv-gray-light)] animate-pulse">
            Opening App Store...
          </p>
        </div>
      </Card>
    );
  }

  // --- Guest sent confirmation ---
  if (view === "guest-sent") {
    return (
      <Card>
        <div className="text-center">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Info Sent!
          </h1>
          <p className="text-[var(--revolv-gray)]">
            {profileData.firstName} will see your contact info in Revolv.
            They&apos;ll be in touch!
          </p>
        </div>
      </Card>
    );
  }

  // --- Auth options ---
  if (view === "auth") {
    return (
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Connect with {profileData.firstName}
          </h2>
          <p className="text-[var(--revolv-gray)]">
            Sign up to connect and exchange contact info instantly
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuth("apple")}
            disabled={isConnecting}
            className="w-full bg-black text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <AppleIcon />
            <span>Continue with Apple</span>
          </button>

          <button
            onClick={() => handleOAuth("linkedin_oidc")}
            disabled={isConnecting}
            className="w-full bg-[#0A66C2] text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-[#004182] transition-colors disabled:opacity-50"
          >
            <LinkedInIcon />
            <span>Continue with LinkedIn</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setView("profile")}
            className="text-[var(--revolv-gray-light)] hover:text-[var(--revolv-gray)] text-sm transition-colors"
          >
            Back
          </button>
        </div>
      </Card>
    );
  }

  // --- Main profile card ---
  return (
    <Card>
      {/* Avatar */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-[var(--revolv-coral)] to-[var(--revolv-coral-dark)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          {profileData.avatar ? (
            <img
              src={profileData.avatar}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <span className="text-3xl font-bold text-white">{initial}</span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-0.5">
          {displayName}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--revolv-gray)] mb-1">{subtitle}</p>
        )}
        <p className="text-sm text-[var(--revolv-gray-light)] mb-6">
          @{profileData.username}
        </p>

        <p className="text-[var(--revolv-gray)] text-base leading-relaxed mb-8">
          {isConnectionRequest
            ? `Join Revolv to connect with ${profileData.firstName} and exchange contact info instantly`
            : `Connect with ${profileData.firstName} on Revolv for intelligent networking`}
        </p>

        {/* Primary CTA */}
        <button
          onClick={() => setView("auth")}
          className="w-full bg-[var(--revolv-coral)] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:bg-[var(--revolv-coral-dark)] transition-all duration-200"
        >
          {isConnectionRequest ? "Connect on Revolv" : "Get Revolv"}
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-[var(--revolv-bg-base)]" />
        <span className="text-xs text-[var(--revolv-gray-light)] uppercase tracking-wider">
          or share your info
        </span>
        <div className="flex-1 h-px bg-[var(--revolv-bg-base)]" />
      </div>

      {/* Guest contact form */}
      <form onSubmit={handleGuestSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name *"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-[var(--revolv-bg-base)] bg-white text-[var(--foreground)] placeholder-[var(--revolv-gray-light)] focus:outline-none focus:ring-2 focus:ring-[var(--revolv-coral)]/30 focus:border-[var(--revolv-coral)] transition-all"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--revolv-bg-base)] bg-white text-[var(--foreground)] placeholder-[var(--revolv-gray-light)] focus:outline-none focus:ring-2 focus:ring-[var(--revolv-coral)]/30 focus:border-[var(--revolv-coral)] transition-all"
        />
        <input
          type="email"
          placeholder="Email address"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--revolv-bg-base)] bg-white text-[var(--foreground)] placeholder-[var(--revolv-gray-light)] focus:outline-none focus:ring-2 focus:ring-[var(--revolv-coral)]/30 focus:border-[var(--revolv-coral)] transition-all"
        />

        {guestError && (
          <p className="text-sm text-red-500 text-center">{guestError}</p>
        )}

        <button
          type="submit"
          disabled={guestSubmitting || !guestName.trim()}
          className="w-full py-3 px-6 rounded-xl border-2 border-[var(--revolv-coral)] text-[var(--revolv-coral)] font-semibold hover:bg-[var(--revolv-coral)] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {guestSubmitting
            ? "Sending..."
            : `Send to ${profileData.firstName}`}
        </button>
      </form>

      {/* Feature pills */}
      <div className="grid grid-cols-3 gap-4 text-center mt-8 pt-6 border-t border-[var(--revolv-bg-base)]">
        <FeaturePill label="Instant" sublabel="Connections" />
        <FeaturePill label="Smart" sublabel="Networking" />
        <FeaturePill label="AI" sublabel="Intelligence" />
      </div>
    </Card>
  );
}

// --- Shared components ---

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden px-8 py-8">
      {children}
    </div>
  );
}

function FeaturePill({
  label,
  sublabel,
}: {
  label: string;
  sublabel: string;
}) {
  return (
    <div>
      <div className="text-[var(--foreground)] font-semibold text-sm">
        {label}
      </div>
      <div className="text-[var(--revolv-gray-light)] text-xs">{sublabel}</div>
    </div>
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
