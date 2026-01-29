
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { type User } from 'firebase/auth';
import { ExpenseItem, UserProfile } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { seedSampleData } from '../services/expenseService.ts';

interface DashboardProps {
  user: User;
  profile: UserProfile;
  expenses: ExpenseItem[];
  members: UserProfile[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass px-4 py-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">{payload[0].name}</p>
        <p className="text-lg font-bold text-white leading-none">${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ user, profile, expenses, members }) => {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedSampleData(profile.familyId, user.uid, profile.displayName || 'Member');
    } catch (err) {
      console.error("Failed to seed data:", err);
    } finally {
      setSeeding(false);
    }
  };

  const chartData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.price;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalBalance = useMemo(() => expenses.reduce((acc, curr) => acc + curr.price, 0), [expenses]);
  const recentExpenses = expenses.slice(0, 5);

  if (expenses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center animate-in">
        <div className="max-w-lg mx-auto glass p-12 rounded-[3rem] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-32 h-32 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-tighter mb-4 leading-tight">Welcome to the <br/><span className="text-emerald-500">Clan Dashboard</span></h2>
            <p className="text-white/40 font-medium mb-10 leading-relaxed">
              Your clan doesn't have any financial records yet. Use the Voice button to add an expense, or populate with sample data to see the analytics in action.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleSeed}
                disabled={seeding}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-[#050a08] font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {seeding ? 'Creating Clan History...' : 'Initialize Sample Data'}
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Try saying: "Add Starbucks 5.50 to Groceries"</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="relative z-10">
              <p className="text-emerald-500/70 text-sm font-black uppercase tracking-[0.2em] mb-2">Household Total Spending</p>
              <h3 className="text-6xl font-black tracking-tighter">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {members.map(m => (
                    <img key={m.uid} src={m.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.uid}`} className="w-8 h-8 rounded-full border-2 border-[#050a08]" alt={m.displayName || ''} />
                  ))}
                </div>
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{members.length} Active Clan Members</span>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2.5rem] min-h-[400px]">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500/70 mb-8">Category Breakdown</h4>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-all outline-none" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar activity */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-8 rounded-[2.5rem] flex flex-col min-h-full">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500/70 mb-6">Recent Activity</h4>
            <div className="space-y-4 flex-1">
              {recentExpenses.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/20 text-sm italic py-20">No recent transactions.</div>
              ) : recentExpenses.map(item => (
                <div key={item.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                      <span className="text-sm font-black">{item.category[0]}</span>
                    </div>
                    <div>
                      <p className="font-bold text-xs truncate max-w-[120px]">{item.name}</p>
                      <p className="text-[10px] text-white/30 uppercase font-black">{item.creatorName.split(' ')[0]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">-${item.price.toFixed(2)}</p>
                    <p className="text-[9px] text-white/20">Today</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/bills" className="mt-8 py-3 w-full glass hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all">View All History</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
