
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { User, LearningLog } from '../types';

const subjectConfigs = [
  { name: 'Mathematics', color: 'bg-blue-500', icon: '📐' },
  { name: 'Science', color: 'bg-emerald-500', icon: '🧪' },
  { name: 'English Lit', color: 'bg-rose-500', icon: '📚' },
  { name: 'History', color: 'bg-amber-500', icon: '🏰' },
];

interface DashboardProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser }) => {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

  useEffect(() => {
    const allLogs = JSON.parse(localStorage.getItem('lumina_logs') || '[]');
    const userLogs = allLogs.filter((l: LearningLog) => l.userId === user.id);
    setLogs(userLogs);
  }, [user.id, user.email]);

  // Calculate Real Streak
  const streak = useMemo(() => {
    if (logs.length === 0) return 0;
    
    // Sort logs by date descending
    const sortedDates = Array.from(new Set(logs.map(log => new Date(log.date).toDateString())))
      .map((d: string) => new Date(d))
      .sort((a: Date, b: Date) => b.getTime() - a.getTime());

    let count = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // If no log today, check if there was one yesterday to keep streak alive
    const todayStr = checkDate.toDateString();
    const hasLogToday = sortedDates.some(d => d.toDateString() === todayStr);
    
    if (!hasLogToday) {
      checkDate.setDate(checkDate.getDate() - 1);
      const hasLogYesterday = sortedDates.some(d => d.toDateString() === checkDate.toDateString());
      if (!hasLogYesterday) return 0;
    }

    // Iterate backwards
    for (const logDate of sortedDates) {
      if (logDate.toDateString() === checkDate.toDateString()) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (logDate.getTime() < checkDate.getTime()) {
        break; // Gap found
      }
    }
    return count;
  }, [logs]);

  // Calculate Study Analytics (Last 7 Days)
  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toDateString();
      const dayName = days[d.getDay()];
      
      const dayLogs = logs.filter(log => new Date(log.date).toDateString() === dateStr);
      const totalHours = dayLogs.reduce((sum, log) => sum + (log.duration / 60), 0);
      
      data.push({
        day: dayName,
        hours: parseFloat(totalHours.toFixed(1))
      });
    }
    return data;
  }, [logs]);

  const updateMastery = (subject: string, value: number) => {
    const updatedUser = {
      ...user,
      syllabusMastery: {
        ...user.syllabusMastery,
        [subject]: value
      }
    };
    onUpdateUser(updatedUser);
  };

  const formattedJoinDate = new Date(user.joinDate).toLocaleDateString(undefined, { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric' 
  });

  const totalStudyTime = useMemo(() => {
    const mins = logs.reduce((sum, log) => sum + log.duration, 0);
    return (mins / 60).toFixed(1);
  }, [logs]);

  return (
    <div className="p-6 md:p-12 space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter font-outfit">Welcome back, {user.name.split(' ')[0]}! ✨</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p className="text-slate-500 text-lg font-medium">Target: <span className="text-indigo-600 font-bold">{user.targetGrade || 'Exceeding'}</span></p>
            {user.yearGroup && (
               <>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                <p className="text-slate-500 text-lg font-bold">{user.yearGroup}</p>
               </>
            )}
            <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Joined {formattedJoinDate}</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="bg-white border border-slate-200 p-6 rounded-[2rem] flex items-center space-x-5 shadow-2xl shadow-slate-200">
              <div className="relative">
                <span className="text-5xl">🔥</span>
                {streak > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">ACTIVE</span>}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Day Streak</p>
                <p className="text-3xl font-black text-slate-900 font-outfit">{streak}</p>
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjectConfigs.map((s) => {
          const mastery = user.syllabusMastery?.[s.name] ?? 0;
          const isEditing = editingSubject === s.name;

          return (
            <div 
              key={s.name} 
              className={`bg-white border p-7 rounded-[2.5rem] transition-all relative group shadow-lg ${isEditing ? 'border-indigo-500 shadow-indigo-200 scale-[1.02]' : 'border-slate-200 hover:border-slate-300 hover:shadow-xl'}`}
              onClick={() => !isEditing && setEditingSubject(s.name)}
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl ${s.color} bg-opacity-10 flex items-center justify-center text-2xl transition-transform group-hover:scale-110`}>
                  {s.icon}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingSubject(isEditing ? null : s.name); }}
                  className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors"
                >
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit">{s.name}</h3>
              
              {isEditing ? (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300 py-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={mastery}
                    onChange={(e) => updateMastery(s.name, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="text-center font-black text-indigo-600 text-2xl font-outfit">{mastery}%</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className={`h-full ${s.color} transition-all duration-1000 shadow-sm`} style={{ width: `${mastery}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{mastery}% Mastery</p>
                    {mastery >= 90 && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-black uppercase">Expert</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-2xl font-black flex items-center font-outfit text-slate-900">
                    <span className="mr-4 text-indigo-500">📊</span> Real-Time Analytics
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Calculated from your learning logs.</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Studied</p>
                  <p className="text-2xl font-black text-slate-900 font-outfit">{totalStudyTime} Hrs</p>
               </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" dy={10} />
                  <YAxis stroke="#64748b" axisLine={false} tickLine={false} fontSize={10} fontWeight="bold" dx={-10} />
                  <Tooltip 
                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-indigo-600 border border-indigo-500 p-10 rounded-[3rem] shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
             <div className="absolute -right-6 -bottom-6 text-white opacity-10 group-hover:scale-150 transition-transform duration-1000 rotate-12">🚀</div>
             <h3 className="text-3xl font-black text-white mb-3 leading-tight font-outfit">Homework Hero</h3>
             <p className="text-indigo-100 mb-8 text-base font-medium opacity-90">Verify facts, solve equations, and search for curriculum-aligned resources.</p>
             <Link to="/homework" className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-white/20 transition-all hover:-translate-y-1 active:translate-y-0">Launch Hero</Link>
          </div>

          <div className="bg-white border border-slate-200 p-10 rounded-[3rem] shadow-xl shadow-slate-200/50">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center font-outfit text-slate-900">
                   <span className="mr-4 text-emerald-400">📝</span> Recent Logs
                </h3>
                <Link to="/logs" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">All Logs</Link>
             </div>
             <div className="space-y-5">
                {logs.slice(-3).reverse().length > 0 ? (
                  logs.slice(-3).reverse().map((log) => (
                    <div key={log.id} className="p-4 bg-slate-50 border border-slate-200 rounded-3xl border-l-4 border-l-indigo-500">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{log.subject}</span>
                          <span className="text-xs text-slate-500 font-bold">{new Date(log.date).toLocaleDateString()}</span>
                       </div>
                       <p className="text-slate-700 font-medium line-clamp-2 text-sm italic">"{log.summary}"</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 font-bold italic text-sm">No entries yet.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
