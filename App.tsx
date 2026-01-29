
import React, { useState, useEffect } from 'react';
// Correctly import onAuthStateChanged function and User type from firebase/auth
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebaseConfig.ts';
import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';
import LandingPage from './components/LandingPage.tsx';

const App: React.FC = () => {
  // Use User type directly from modular firebase/auth
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Use the functional onAuthStateChanged from firebase/auth
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // For email/password users, we only consider them "logged in" if verified.
      // Google/social users are usually verified by provider, but we check emailVerified anyway for consistency.
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        setShowLanding(false);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050a08]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="animate-pulse text-emerald-500 font-bold text-lg tracking-tighter uppercase tracking-[0.2em]">ClanCash</div>
        </div>
      </div>
    );
  }

  // If user is not logged in/verified and we want to show landing
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // If user is not logged in/verified and landing is dismissed, show Auth
  if (!user) {
    return (
      <div className="min-h-screen relative">
        <button 
          onClick={() => setShowLanding(true)}
          className="absolute top-8 left-8 z-20 glass p-2 rounded-xl text-emerald-500 hover:bg-white/10 transition-all group"
          title="Back to Landing"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <Auth />
      </div>
    );
  }

  // Logged in and Verified user sees Dashboard
  return (
    <div className="min-h-screen bg-[#050a08] text-white selection:bg-emerald-500/30">
      <Dashboard user={user} />
    </div>
  );
};

export default App;
