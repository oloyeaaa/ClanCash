
import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#050a08] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tighter">ClanCash</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-6 py-2 glass rounded-xl text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Next-Gen Family Finance
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
          Wealth management for the <span className="text-emerald-500">modern clan.</span>
        </h1>
        
        <p className="text-emerald-500/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Take control of your family's future with AI-powered voice tracking, 
          real-time spending analytics, and intelligent reminders.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-24">
          <button 
            onClick={onGetStarted}
            className="px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-[#050a08] font-black rounded-2xl text-lg transition-all active:scale-95 shadow-[0_20px_50px_rgba(16,185,129,0.2)]"
          >
            Get Started Now
          </button>
          <button className="px-10 py-5 glass hover:bg-white/10 text-white font-black rounded-2xl text-lg transition-all active:scale-95">
            View Live Demo
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-8 rounded-[2rem] text-left group hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Voice First</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Just say "Add Netflix 15.99 to Entertainment". Our natural language engine handles the rest.
            </p>
          </div>

          <div className="glass p-8 rounded-[2rem] text-left group hover:border-blue-500/40 transition-all">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Deep Analytics</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Understand your monthly trends with beautiful, responsive charts designed for clarity.
            </p>
          </div>

          <div className="glass p-8 rounded-[2rem] text-left group hover:border-amber-500/40 transition-all">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Alerts</h3>
            <p className="text-white/40 text-sm leading-relaxed">
              Automatic reminders for upcoming direct debits so you're never caught off guard.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center">
        <p className="text-white/20 text-xs font-bold uppercase tracking-[0.2em]">Built for the modern household • © 2025 ClanCash</p>
      </footer>
    </div>
  );
};

export default LandingPage;
