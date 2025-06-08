'use client';

import { useEffect } from 'react';

export default function AppClipTestLaunch() {
  useEffect(() => {
    console.log('[App Clip] Launch initiated at /appclip/test-launch');
    // Here’s where you’d call your analytics or tracking
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-black px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Revolv 🎉</h1>
        <p className="text-lg text-gray-600 mb-6">
          You’ve just launched the App Clip.
        </p>
        <button
          className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
          onClick={() => {
            // Placeholder: Send them to a profile creation screen or full app CTA
            window.location.href = 'https://getrevolv.com/app/profile/create';
          }}
        >
          Create Your Profile
        </button>
      </div>
    </main>
  );
}

// rebuild
