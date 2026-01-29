
import React from 'react';
import { UserProfile } from '../types.ts';

interface FamilyPageProps {
  profile: UserProfile;
  members: UserProfile[];
}

const FamilyPage: React.FC<FamilyPageProps> = ({ profile, members }) => {
  const copyInvite = () => {
    const inviteLink = `${window.location.origin}/join/${profile.familyId}`;
    navigator.clipboard.writeText(profile.familyId);
    alert(`Clan ID ${profile.familyId} copied to clipboard! Share this ID with your family to let them join.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-black tracking-tight">The Clan</h2>
        <p className="text-emerald-500/60 font-medium">Manage your household and invites</p>
      </div>

      <div className="glass p-10 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] -z-10"></div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500/50 mb-3">Your Unique Clan ID</p>
          <div className="inline-flex items-center gap-4 bg-[#050a08]/50 border border-white/10 px-8 py-5 rounded-2xl shadow-inner">
             <span className="text-3xl font-black tracking-[0.2em] text-white uppercase font-mono">{profile.familyId}</span>
          </div>
        </div>
        <button 
          onClick={copyInvite}
          className="mx-auto flex items-center gap-2 px-6 py-3 bg-emerald-500 text-[#050a08] font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
          Copy Clan Code
        </button>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 ml-4">Current Members</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(member => (
            <div key={member.uid} className="glass p-6 rounded-3xl flex items-center gap-4 hover:border-emerald-500/30 transition-all group">
              <div className="relative">
                <img 
                  src={member.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} 
                  className="w-14 h-14 rounded-2xl border border-white/10 object-cover" 
                  alt="" 
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#050a08]"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{member.displayName || 'Unknown Member'}</p>
                <p className="text-[10px] text-white/30 font-black truncate uppercase tracking-widest">{member.email}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="p-2 rounded-lg bg-white/5 text-white/40 cursor-pointer hover:text-emerald-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyPage;
