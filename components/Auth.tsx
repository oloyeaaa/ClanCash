
import React, { useState } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig.ts';
import { createUserProfile } from '../services/expenseService.ts';
import { UserProfile } from '../types.ts';

interface AuthProps {
  user?: User | null; // Passed from App if already authenticated but missing profile
  onProfileCreated?: (profile: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ user: existingUser, onProfileCreated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const generateClanId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFamilyId(id);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, googleProvider);
      // App.tsx handles the redirection and profile check
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClanAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingUser || !familyId) return;
    
    setLoading(true);
    try {
      const newProfile: UserProfile = {
        uid: existingUser.uid,
        email: existingUser.email,
        displayName: existingUser.displayName || name || 'Clan Member',
        photoURL: existingUser.photoURL,
        familyId: familyId.trim().toUpperCase()
      };
      await createUserProfile(newProfile);
      onProfileCreated?.(newProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!familyId) {
          setError('Please enter or generate a Clan ID.');
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: name,
          photoURL: null,
          familyId: familyId.trim().toUpperCase()
        };
        await createUserProfile(newProfile);
        onProfileCreated?.(newProfile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // State 1: Logged in but missing a Clan Profile (Common for Google Login)
  if (existingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#050a08]">
        <div className="w-full max-w-md glass p-8 rounded-3xl space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Almost There!</h1>
            <p className="text-emerald-500/60 font-medium mt-2">
              Join a family or start a new clan to continue.
            </p>
          </div>

          <form onSubmit={handleClanAssignment} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-emerald-500/70 mb-1 ml-1 flex justify-between">
                <span>Clan ID</span>
                <button type="button" onClick={generateClanId} className="text-emerald-400 hover:underline">Generate New</button>
              </label>
              <input 
                type="text" value={familyId} onChange={(e) => setFamilyId(e.target.value)} required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-mono uppercase"
                placeholder="EX: SMITH-2025"
              />
              <p className="text-[10px] text-white/30 mt-1 ml-1">Ask your head of household for the Clan ID if joining an existing account.</p>
            </div>
            
            <button 
              type="submit" disabled={loading || !familyId}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050a08] font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Join Household'}
            </button>

            <button 
              type="button" 
              onClick={() => signOut(auth)}
              className="w-full py-2 text-white/30 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel and Sign Out
            </button>
          </form>
        </div>
      </div>
    );
  }

  // State 2: Fully logged out (Default login/signup screen)
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050a08]">
      <div className="w-full max-w-md glass p-8 rounded-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-white leading-none mb-2">ClanCash</h1>
          <p className="text-emerald-500/60 font-medium">
            {isLogin ? "Sign in to your household" : "Create your family clan"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-emerald-500/70 mb-1 ml-1">Full Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-emerald-500/70 mb-1 ml-1 flex justify-between">
                  <span>Clan ID</span>
                  <button type="button" onClick={generateClanId} className="text-emerald-400 hover:underline">Generate New</button>
                </label>
                <input 
                  type="text" value={familyId} onChange={(e) => setFamilyId(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white font-mono uppercase"
                  placeholder="EX: SMITH-2025"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-emerald-500/70 mb-1 ml-1">Email</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
              placeholder="family@clan.com"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-emerald-500/70 mb-1 ml-1">Password</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded-xl">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050a08] font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Enter Dashboard' : 'Create Account')}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050a08] px-2 text-emerald-500/40 font-bold tracking-widest">or</span></div>
        </div>

        <button onClick={handleGoogleSignIn} disabled={loading} className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-emerald-500/60 text-sm">
          {isLogin ? "New clan member?" : "Already in a clan?"}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-1 text-emerald-400 font-bold hover:underline">
            {isLogin ? 'Start Account' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
