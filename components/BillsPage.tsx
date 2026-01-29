
import React from 'react';
import { ExpenseItem, UserProfile } from '../types.ts';
import { Timestamp } from 'firebase/firestore';

interface BillsPageProps {
  expenses: ExpenseItem[];
  members: UserProfile[];
}

const BillsPage: React.FC<BillsPageProps> = ({ expenses, members }) => {
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = a.direct_debit_date instanceof Timestamp ? a.direct_debit_date.toMillis() : new Date(a.direct_debit_date).getTime();
    const dateB = b.direct_debit_date instanceof Timestamp ? b.direct_debit_date.toMillis() : new Date(b.direct_debit_date).getTime();
    return dateB - dateA;
  });

  const isDueSoon = (dateStr: any) => {
    const date = dateStr instanceof Timestamp ? dateStr.toDate() : new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Timeline</h2>
          <p className="text-emerald-500/60 font-medium">Detailed clan financial history</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 glass rounded-2xl border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Upcoming (Next 3 Days)</span>
        </div>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/5 before:to-transparent">
        {sortedExpenses.map((item) => {
          const dueSoon = isDueSoon(item.direct_debit_date);
          const creator = members.find(m => m.uid === item.createdBy);
          
          return (
            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-[#050a08] glass shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${dueSoon ? 'bg-red-500/20 border-red-500/50' : ''}`}>
                 <div className={`w-2 h-2 rounded-full ${dueSoon ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
              </div>
              
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-6 rounded-3xl transition-all duration-500 ${dueSoon ? 'ring-2 ring-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'hover:bg-white/10'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h5 className="font-bold text-lg leading-tight truncate">{item.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-500/60 px-2 py-0.5 bg-emerald-500/5 rounded-md border border-emerald-500/10">{item.category}</span>
                      {item.paymentMethod && (
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-blue-400/60 px-2 py-0.5 bg-blue-500/5 rounded-md border border-blue-500/10">via {item.paymentMethod}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black text-emerald-400">-${item.price.toFixed(2)}</p>
                    <p className="text-[10px] text-white/30 font-bold">{new Date(item.direct_debit_date instanceof Timestamp ? item.direct_debit_date.toDate() : item.direct_debit_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-white/50 italic mb-4 py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                    "{item.notes}"
                  </p>
                )}
                
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <img src={creator?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.createdBy}`} className="w-5 h-5 rounded-full border border-white/10" alt="" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Added by {item.creatorName}</span>
                  {dueSoon && (
                    <span className="ml-auto text-[8px] font-black uppercase bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full">Due Soon</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedExpenses.length === 0 && (
          <div className="text-center py-20 text-white/20 italic">No transactions recorded yet. Use the voice button to add some.</div>
        )}
      </div>
    </div>
  );
};

export default BillsPage;