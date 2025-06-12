<meta name="apple-itunes-app" content="app-id=YOUR_APP_ID, 
app-clip-bundle-id=com.a8media.revolv.clip"
<meta name="apple-mobile-web-app-capable" content="yes">

import { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const displayName = username;

  return {
    title: `${displayName} - Revolv Profile`,
    description: `Connect with ${displayName} on Revolv. Exchange contact information instantly and build your professional network.`,
    openGraph: {
      type: "profile",
      title: `${displayName} - Revolv Profile`,
      description: `Connect with ${displayName} on Revolv. Exchange contact information instantly and build your professional network.`,
      url: `https://getrevolv.com/profile/${username}`,
      images: [
        {
          url: "https://getrevolv.com/revolv-og-image.png",
          width: 1200,
          height: 630,
          alt: "Revolv - Connect and network instantly",
        },
      ],
      siteName: "Revolv",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} - Revolv Profile`,
      description: `Connect with ${displayName} on Revolv. Exchange contact information instantly and build your professional network.`,
      images: ["https://getrevolv.com/revolv-og-image.png"],
    },
    other: {
      "apple-itunes-app": "app-clip-bundle-id=com.a8media.revolv.clip",
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const displayName = username;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || username.charAt(0).toUpperCase();

  const mainStyle = {
    minHeight: "100vh",
    background: "#FAFAFA",
    display: "flex",
    flexDirection: "column" as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const containerStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "20px",
    padding: "48px 32px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center" as const,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  };

  const avatarStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    margin: "0 auto 24px",
    overflow: "hidden",
    background: "#FF3B30",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
    fontWeight: "600",
    color: "white",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1C1C1C",
    margin: "0 0 8px",
  };

  const usernameStyle = {
    fontSize: "18px",
    color: "#666",
    margin: "0 0 32px",
  };

  const ctaContainerStyle = {
    background: "#F8F8F8",
    borderRadius: "12px",
    padding: "20px",
    margin: "32px 0",
  };

  const ctaTextStyle = {
    fontSize: "16px",
    color: "#666",
    margin: "0 0 20px",
    lineHeight: "1.6",
  };

  const buttonStyle = {
    display: "inline-block",
    padding: "16px 32px",
    background: "#FF3B30",
    color: "white",
    textDecoration: "none",
    borderRadius: "12px",
    fontSize: "17px",
    fontWeight: "600",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(255,59,48,0.3)",
  };

  const featuresStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginTop: "24px",
  };

  const featureStyle = {
    textAlign: "center" as const,
  };

  const featureLabelStyle = {
    fontSize: "14px",
    color: "#999",
    marginBottom: "4px",
  };

  const featureValueStyle = {
    fontSize: "16px",
    color: "#333",
    fontWeight: "600",
  };

  const dividerStyle = {
    width: "1px",
    background: "#E5E5E5",
  };

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={avatarStyle}>{initials}</div>

          <h1 style={titleStyle}>{displayName}</h1>

          <p style={usernameStyle}>@{username}</p>

          <div style={ctaContainerStyle}>
            <p style={ctaTextStyle}>
              Join Revolv to connect with {displayName} and exchange contact
              information instantly
            </p>

            <a
              href="https://apps.apple.com/app/revolv"
              rel="noopener noreferrer"
              target="_blank"
              style={buttonStyle}
            >
              Get Revolv
            </a>
          </div>

          <div style={featuresStyle}>
            <div style={featureStyle}>
              <div style={featureLabelStyle}>Instant</div>
              <div style={featureValueStyle}>Connections</div>
            </div>
            <div style={dividerStyle} />
            <div style={featureStyle}>
              <div style={featureLabelStyle}>Share</div>
              <div style={featureValueStyle}>Profiles</div>
            </div>
            <div style={dividerStyle} />
            <div style={featureStyle}>
              <div style={featureLabelStyle}>Network</div>
              <div style={featureValueStyle}>Smarter</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
