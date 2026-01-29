import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig.ts';
import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';
import LandingPage from './components/LandingPage.tsx';
import BillsPage from './components/BillsPage.tsx';
import AnalyticsPage from './components/AnalyticsPage.tsx';
import FamilyPage from './components/FamilyPage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import VoiceFAB from './components/VoiceFAB.tsx';
import { getUserProfile, subscribeToClanMembers, subscribeToFamilyExpenses } from './services/expenseService.ts';
import { UserProfile, ExpenseItem } from './types.ts';

const Navigation: React.FC = () => {
  const location = useLocation();
  const links = [
    { path: '/', label: 'Home', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { path: '/bills', label: 'Bills', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /> },
    { path: '/analytics', label: 'Data', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
    { path: '/family', label: 'Clan', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /> },
    { path: '/settings', label: 'Settings', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg glass rounded-2xl px-2 py-2 flex justify-around items-center shadow-2xl">
      {links.map((link) => (
        <Link 
          key={link.path}
          to={link.path}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${location.pathname === link.path ? 'nav-active' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{link.icon}</svg>
          <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
        </Link>
      ))}
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);

  // Safety timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  // 1. Auth & Profile Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
          if (userProfile) setShowLanding(false);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error("Firebase Auth Error:", error);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Data Listeners
  useEffect(() => {
    if (!profile?.familyId) return;

    try {
      const unsubExpenses = subscribeToFamilyExpenses(profile.familyId, setExpenses);
      const unsubMembers = subscribeToClanMembers(profile.familyId, setMembers);
      
      return () => {
        unsubExpenses();
        unsubMembers();
      };
    } catch (err) {
      console.error("Data subscription error:", err);
    }
  }, [profile?.familyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050a08]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-emerald-500/10 rounded-full"></div>
             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="animate-pulse text-emerald-500 font-black text-xl tracking-[0.3em] uppercase">ClanCash</div>
        </div>
      </div>
    );
  }

  // Handle fully logged out state
  if (!user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Handle logged in but no profile (setup phase)
  if (!user || !profile) {
    return (
      <div className="min-h-screen relative bg-[#050a08]">
        {!user && (
          <button 
            onClick={() => setShowLanding(true)}
            className="absolute top-8 left-8 z-20 glass p-3 rounded-xl text-emerald-500 hover:bg-white/10 transition-all group"
          >
            <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <Auth user={user} onProfileCreated={setProfile} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#050a08] text-white selection:bg-emerald-500/30 pb-32">
        <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
             <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <span className="text-xl font-black tracking-tighter">ClanCash</span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => signOut(auth)} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Sign Out</button>
            <img 
              src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
              className="w-10 h-10 rounded-full border border-emerald-500/30 object-cover" 
              alt="Profile" 
            />
          </div>
        </header>

        <main className="animate-in">
          <Routes>
            <Route path="/" element={<Dashboard user={user} profile={profile} expenses={expenses} members={members} />} />
            <Route path="/bills" element={<BillsPage expenses={expenses} members={members} />} />
            <Route path="/analytics" element={<AnalyticsPage expenses={expenses} />} />
            <Route path="/family" element={<FamilyPage profile={profile} members={members} />} />
            <Route path="/settings" element={<SettingsPage profile={profile} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <VoiceFAB profile={profile} user={user} />
        <Navigation />
      </div>
    </BrowserRouter>
  );
};

export default App;