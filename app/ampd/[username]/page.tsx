"use client";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolved = await params;
      setUsername(resolved.username);
    };
    getParams();
  }, [params]);

  return (
    <>
      <Head>
        <meta
          name="apple-itunes-app"
          content="app-clip-bundle-id=com.a8media.revolv.clip"
        />
        <title>Profile: {username}</title>
      </Head>
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <h1>{username} on Revolv</h1>
        <p>Download the Revolv app to connect with {username}!</p>
        <a
          href="https://apps.apple.com/app/revolv"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            background: "#007AFF",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          Download Revolv
        </a>
      </main>
    </>
  );
}
