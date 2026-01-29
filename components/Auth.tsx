
import React, { useState } from 'react';
// Explicitly import modular functions from firebase/auth
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendEmailVerification, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      // Use functional signInWithPopup from firebase/auth
      await signInWithPopup(auth, googleProvider);
      // Google accounts are typically pre-verified, so we don't force verification here
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        // Use functional signInWithEmailAndPassword from firebase/auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          setError('Email not verified. Please check your inbox.');
          await signOut(auth);
          setIsVerifying(true);
        }
      } else {
        // Use functional createUserWithEmailAndPassword from firebase/auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Use functional updateProfile and sendEmailVerification from firebase/auth
        await updateProfile(user, { displayName: name });
        await sendEmailVerification(user);
        
        // Force sign out immediately after sign up to prevent auto-login
        await signOut(auth);
        setIsVerifying(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050a08] to-black">
        <div className="w-full max-w-md glass p-10 rounded-3xl space-y-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black tracking-tight">Verify Your Email</h2>
          <p className="text-emerald-500/60 font-medium">
            We've sent a verification link to <span className="text-emerald-400">{email}</span>. 
            Check your inbox and verify your account to continue.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => {
                setIsVerifying(false);
                setIsLogin(true);
                setError('');
              }} 
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050a08] font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all active:scale-95"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050a08] to-black">
      <div className="w-full max-w-md glass p-8 rounded-3xl space-y-8">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight">ClanCash</h1>
          <p className="text-emerald-500/60 font-medium">Family Wealth Management</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-emerald-500/70 mb-1 ml-1">Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-emerald-500/70 mb-1 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
              placeholder="name@family.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-emerald-500/70 mb-1 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white"
              placeholder="••••••••"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <p className="text-red-400 text-xs text-center">{error}</p>
            </div>
          )}

          <button type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-[#050a08] font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all active:scale-95">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-emerald-500/40 font-bold tracking-widest">or</span></div>
        </div>

        <button onClick={handleGoogleSignIn} className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-gray-100 active:scale-95">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-emerald-500/60 text-sm">
          {isLogin ? "New to ClanCash?" : "Already have an account?"}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }} 
            className="ml-1 text-emerald-400 font-bold hover:underline"
          >
            {isLogin ? 'Join the Clan' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
