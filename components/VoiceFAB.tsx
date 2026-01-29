
import React, { useState } from 'react';
import { UserProfile, ExpenseCategory } from '../types.ts';
import { type User } from 'firebase/auth';
import { parseVoiceCommand } from '../utils/voiceUtils.ts';
import { addExpense } from '../services/expenseService.ts';

interface VoiceFABProps {
  profile: UserProfile;
  user: User;
}

const VoiceFAB: React.FC<VoiceFABProps> = ({ profile, user }) => {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) {
      alert("Voice Recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);
    setStatus('Listening...');

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setStatus('Parsing AI...');
      
      const parsed = await parseVoiceCommand(transcript);
      if (parsed) {
        await addExpense({
          name: parsed.name,
          price: parsed.price,
          category: parsed.category,
          direct_debit_date: new Date(),
          familyId: profile.familyId,
          createdBy: user.uid,
          creatorName: profile.displayName || 'Member'
        });
        setStatus('Saved!');
        setTimeout(() => setStatus(''), 2000);
      } else {
        setStatus('Error parsing');
        setTimeout(() => setStatus(''), 2000);
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus('');
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="fixed bottom-32 right-8 z-50 flex flex-col items-end gap-3">
      {status && (
        <div className="glass px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 border-emerald-500/30 animate-in fade-in zoom-in slide-in-from-right-4">
          {status}
        </div>
      )}
      <button 
        onClick={handleVoice}
        disabled={isListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${isListening ? 'bg-red-500 scale-110 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/40 hover:scale-110'}`}
      >
        <div className={`absolute inset-0 rounded-full bg-emerald-500 ${isListening ? 'animate-ping opacity-25' : 'hidden'}`}></div>
        <svg className={`w-8 h-8 ${isListening ? 'text-white' : 'text-[#050a08]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
    </div>
  );
};

export default VoiceFAB;
