
import React, { useState } from 'react';
import { UserProfile, ExpenseCategory } from '../types.ts';

interface SettingsPageProps {
  profile: UserProfile;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ profile }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight">Settings</h2>
        <p className="text-emerald-500/60 font-medium">Customize your financial experience</p>
      </div>

      <div className="glass p-8 rounded-[2.5rem] space-y-8">
        <div className="space-y-6">
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500/70">Preferences</h4>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div>
              <p className="font-bold">Aesthetic Mode</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Toggle dark and light experience</p>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-14 h-8 rounded-full relative transition-all duration-500 ${isDarkMode ? 'bg-emerald-500/20' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 transition-all duration-500 ${isDarkMode ? 'right-1' : 'right-7'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div>
              <p className="font-bold">Smart Reminders</p>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Alerts for upcoming direct debits</p>
            </div>
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-14 h-8 rounded-full relative transition-all duration-500 ${notifications ? 'bg-emerald-500/20' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 transition-all duration-500 ${notifications ? 'right-1' : 'right-7'}`}></div>
            </button>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-white/5">
          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500/70">Category Management</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
             {Object.values(ExpenseCategory).map(cat => (
               <div key={cat} className="px-4 py-3 glass rounded-xl border-white/10 flex items-center justify-between group">
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                  <svg className="w-3 h-3 text-white/20 group-hover:text-red-400 cursor-pointer transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </div>
             ))}
             <button className="px-4 py-3 border border-dashed border-emerald-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-500/60 hover:bg-emerald-500/10 transition-all">+ Add Category</button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-center">ClanCash v1.2.0 • Build ID: 8A2F9</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
