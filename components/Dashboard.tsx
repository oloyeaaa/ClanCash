
import React, { useState, useEffect, useMemo } from 'react';
// Correctly import signOut function and User type from firebase/auth
import { type User, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { subscribeToExpenses, addExpense, deleteExpense } from '../services/expenseService';
import { ExpenseItem, ExpenseCategory } from '../types';
import { parseVoiceCommand } from '../utils/voiceUtils';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis 
} from 'recharts';
import { Timestamp } from 'firebase/firestore';

interface DashboardProps {
  // Use modular User type from firebase/auth
  user: User;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: ExpenseCategory.Other,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const unsub = subscribeToExpenses(user.uid, (data) => setExpenses(data));
    return () => unsub();
  }, [user.uid]);

  // Reminders logic: items due in next 3 days
  const upcomingDebits = useMemo(() => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    return expenses.filter(exp => {
      const date = exp.direct_debit_date instanceof Timestamp 
        ? exp.direct_debit_date.toDate() 
        : new Date(exp.direct_debit_date);
      return date >= today && date <= threeDaysLater;
    });
  }, [expenses]);

  // Chart data calculation
  const chartData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.price;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const totalBalance = useMemo(() => 
    expenses.reduce((acc, curr) => acc + curr.price, 0), 
  [expenses]);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Handle the asynchronous AI-powered voice command parsing using Gemini SDK
      const parsed = await parseVoiceCommand(transcript);
      if (parsed) {
        setForm(prev => ({
          ...prev,
          name: parsed.name,
          price: parsed.price.toString(),
          category: (Object.values(ExpenseCategory).includes(parsed.category as ExpenseCategory)) 
            ? (parsed.category as ExpenseCategory) 
            : ExpenseCategory.Other
        }));
      } else {
        alert(`Parsing failed. Try: "Add Netflix 15.99 to Entertainment"`);
      }
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    await addExpense({
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      direct_debit_date: new Date(form.date),
      createdBy: user.uid,
      creatorName: user.displayName || user.email || 'Anonymous'
    });

    setForm({
      name: '',
      price: '',
      category: ExpenseCategory.Other,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <span className="text-emerald-500">ClanCash</span> Dashboard
          </h2>
          <p className="text-emerald-500/50 text-sm font-medium">Welcome back, {user.displayName || 'Clan Member'}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => signOut(auth)}
            className="px-4 py-2 glass rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            Sign Out
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/50 overflow-hidden">
            <img src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} alt="Avatar" />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stats and Add Form */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Balance Card */}
          <div className="glass p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all"></div>
            <p className="text-emerald-500/70 text-xs font-black uppercase tracking-widest mb-1">Family Balance</p>
            <h3 className="text-4xl font-bold">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <div className="mt-4 flex gap-2">
              <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">LIVE SYNC</span>
              <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold">PREMIUM</span>
            </div>
          </div>

          {/* Add Item Form */}
          <div className="glass p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-emerald-400">Add Expense</h4>
              <button 
                onClick={handleVoiceInput}
                className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <input 
                type="text" 
                placeholder="Item Name" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
              />
              <div className="flex gap-2">
                <input 
                  type="number" 
                  placeholder="Price" 
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
                />
                <select 
                  value={form.category}
                  onChange={e => setForm({...form, category: e.target.value as ExpenseCategory})}
                  className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none appearance-none"
                >
                  {Object.values(ExpenseCategory).map(cat => (
                    <option key={cat} value={cat} className="bg-[#050a08]">{cat}</option>
                  ))}
                </select>
              </div>
              <input 
                type="date" 
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none"
              />
              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-[#050a08] font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/10">
                Save Item
              </button>
            </form>
          </div>

          {/* Reminders / Upcoming Alerts */}
          {upcomingDebits.length > 0 && (
            <div className="glass p-6 rounded-3xl space-y-4 border-amber-500/30">
              <h4 className="font-black text-xs text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Priority Alerts
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {upcomingDebits.map(item => (
                  <div key={item.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-amber-200">{item.name}</p>
                      <p className="text-[10px] text-amber-500/70">Due in next 72 hours</p>
                    </div>
                    <span className="text-amber-400 font-bold">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualization and List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl h-[300px] flex flex-col">
              <h4 className="text-sm font-bold text-white/60 mb-4">Spending by Category</h4>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl h-[300px] flex flex-col">
              <h4 className="text-sm font-bold text-white/60 mb-4">Relative Costs</h4>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="glass rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h4 className="font-bold">Recent History</h4>
              <span className="text-xs text-white/30">{expenses.length} Total Items</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
              {expenses.length === 0 ? (
                <div className="p-12 text-center text-white/20">
                  <p>No transactions yet. Start logging!</p>
                </div>
              ) : (
                expenses.map(item => (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-500 border border-white/10 group-hover:border-emerald-500/30 transition-all">
                        <span className="text-lg font-black">{item.category[0]}</span>
                      </div>
                      <div>
                        <p className="font-bold text-white leading-none mb-1">{item.name}</p>
                        <p className="text-xs text-white/40">{item.category} • {new Date(item.direct_debit_date instanceof Timestamp ? item.direct_debit_date.toDate() : item.direct_debit_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-black text-emerald-400">-${item.price.toFixed(2)}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-tighter">Added by {item.creatorName}</p>
                      </div>
                      <button 
                        onClick={() => deleteExpense(item.id!)}
                        className="p-2 rounded-lg text-red-500/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
