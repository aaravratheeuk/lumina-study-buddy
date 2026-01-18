
import React, { useState, useEffect } from 'react';
import { User, LearningLog } from '../types';

const DailyLog: React.FC<{ user: User }> = ({ user }) => {
  const [summary, setSummary] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [mood, setMood] = useState('💡 Inspired');
  const [duration, setDuration] = useState(30);
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const allLogs = JSON.parse(localStorage.getItem('lumina_logs') || '[]');
    const userLogs = allLogs.filter((l: LearningLog) => l.userId === user.id);
    setLogs(userLogs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [user.id]);

  const handleSave = () => {
    if (!summary.trim()) return;
    
    const newLog: LearningLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      date: new Date().toISOString(),
      summary,
      subject,
      mood,
      duration: Number(duration)
    };

    const allLogs = JSON.parse(localStorage.getItem('lumina_logs') || '[]');
    allLogs.push(newLog);
    localStorage.setItem('lumina_logs', JSON.stringify(allLogs));
    
    setLogs([newLog, ...logs]);
    setSummary('');
    setIsAdding(false);
  };

  const deleteLog = (id: string) => {
    const updated = logs.filter(l => l.id !== id);
    const allLogs = JSON.parse(localStorage.getItem('lumina_logs') || '[]');
    const updatedAll = allLogs.filter((l: any) => l.id !== id);
    localStorage.setItem('lumina_logs', JSON.stringify(updatedAll));
    setLogs(updated);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter font-outfit">Log Your Learning</h2>
          <p className="text-slate-500 text-lg">Every minute counts towards your target grade.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all ${isAdding ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95'}`}
        >
          {isAdding ? 'Cancel' : 'Add New Insight +'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <select 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none font-bold"
              >
                <option>Mathematics</option>
                <option>Science</option>
                <option>English Lit</option>
                <option>History</option>
                <option>Geography</option>
                <option>Languages</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Spent</label>
              <select 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none font-bold"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="45">45 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="90">1.5 Hours</option>
                <option value="120">2 Hours</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Today's Vibe</label>
              <select 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none font-bold"
              >
                <option>💡 Inspired</option>
                <option>💪 Productive</option>
                <option>😴 Tired</option>
                <option>🤯 Challenged</option>
                <option>🎯 Focused</option>
              </select>
            </div>
          </div>
          <div className="space-y-2 mb-8">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">What did you actually learn?</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Explain it like I'm 5... (e.g., I learned that photosynthesis happens in the chloroplasts and needs CO2, water and light...)"
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none shadow-inner placeholder:text-slate-400"
            />
          </div>
          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 px-12 rounded-2xl transition-all shadow-xl shadow-emerald-200 active:scale-95 text-sm uppercase tracking-widest"
            >
              Save to Brain 🧠
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] group hover:border-indigo-400 transition-all hover:bg-indigo-50/20 relative shadow-xl shadow-slate-200/50">
              <button 
                onClick={() => deleteLog(log.id)}
                className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
                     {log.subject.substring(0, 1)}
                   </div>
                   <div>
                     <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{log.subject}</span>
                     <span className="text-xs text-indigo-500 font-bold">{log.duration} mins</span>
                   </div>
                </div>
                <span className="text-xs text-slate-500 font-bold">{new Date(log.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
              </div>
              <p className="text-slate-700 leading-relaxed mb-6 font-medium">"{log.summary}"</p>
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{log.mood}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="text-8xl grayscale opacity-20">📚</div>
             <p className="text-slate-400 font-bold text-xl">Your learning log is waiting...</p>
             <p className="text-slate-500 max-w-sm mx-auto">Start recording what you learn in school. It helps with long-term memory and powers your dashboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLog;
