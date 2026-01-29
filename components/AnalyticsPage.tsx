
import React, { useMemo } from 'react';
import { ExpenseItem } from '../types.ts';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Rectangle
} from 'recharts';
import { Timestamp } from 'firebase/firestore';

interface AnalyticsPageProps {
  expenses: ExpenseItem[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ expenses }) => {
  const analyticsData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let thisMonthTotal = 0;
    let lastMonthTotal = 0;

    expenses.forEach(exp => {
      const date = exp.direct_debit_date instanceof Timestamp ? exp.direct_debit_date.toDate() : new Date(exp.direct_debit_date);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        thisMonthTotal += exp.price;
      } else if (date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear) {
        lastMonthTotal += exp.price;
      }
    });

    return [
      { name: 'Last Month', value: lastMonthTotal },
      { name: 'This Month', value: thisMonthTotal },
    ];
  }, [expenses]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(exp => {
      cats[exp.category] = (cats[exp.category] || 0) + exp.price;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [expenses]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight">Analytics</h2>
        <p className="text-emerald-500/60 font-medium">Household spending patterns and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2.5rem] min-h-[400px] flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500/70 mb-10">Monthly Comparison</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 800}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  content={({active, payload}) => {
                    if (active && payload?.length) {
                      return (
                        <div className="glass p-3 rounded-xl border-white/10 shadow-xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{payload[0].payload.name}</p>
                          <p className="text-lg font-bold">${payload[0].value?.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[15, 15, 15, 15]} activeBar={<Rectangle fill="white" stroke="white" strokeWidth={1} />}>
                   {analyticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'rgba(255,255,255,0.1)' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Total Spending Change</p>
              <p className={`text-2xl font-black ${analyticsData[1].value > analyticsData[0].value ? 'text-red-400' : 'text-emerald-400'}`}>
                {analyticsData[0].value === 0 ? '0%' : `${(((analyticsData[1].value - analyticsData[0].value) / analyticsData[0].value) * 100).toFixed(1)}%`}
              </p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Forecast</p>
               <p className="text-xs font-bold text-white/60">On track for ${ (analyticsData[1].value * 1.1).toFixed(0) }</p>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] min-h-[400px] flex flex-col">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500/70 mb-10">Spending by Category</h3>
          <div className="flex-1">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{cat.name}</span>
                <span className="text-[10px] font-black text-white ml-auto">${cat.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
