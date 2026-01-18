
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import HomeworkHero from './components/HomeworkHero';
import DiagramLab from './components/DiagramLab';
import LiveTutor from './components/LiveTutor';
import DailyLog from './components/DailyLog';
import PracticeZone from './components/PracticeZone';
import Auth from './components/Auth';
import { AppTab, User } from './types';

const Navbar = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const location = useLocation();
  
  const navItems = [
    { id: AppTab.DASHBOARD, label: 'Progress Hub', path: '/', icon: '📊' },
    { id: AppTab.HOMEWORK, label: 'Homework Hero', path: '/homework', icon: '📝' },
    { id: AppTab.PRACTICE, label: 'Practice Zone', path: '/practice', icon: '⚡' },
    { id: AppTab.LOGS, label: 'What I Learned', path: '/logs', icon: '🧠' },
    { id: AppTab.DIAGRAMS, label: 'Diagram Lab', path: '/diagrams', icon: '🎨' },
    { id: AppTab.TUTOR, label: 'Speak to Tutor', path: '/tutor', icon: '🎙️' },
  ];

  const formattedJoinDate = new Date(user.joinDate).toLocaleDateString(undefined, { 
    month: 'short', 
    year: 'numeric' 
  });

  // Level Calculation: Level 1 starts at 0, next level every 1000 XP
  const level = Math.floor((user.xp || 0) / 1000) + 1;
  const xpProgress = ((user.xp || 0) % 1000) / 10; // Percentage towards next level

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 md:relative md:border-t-0 md:border-r md:w-72 md:h-screen md:flex md:flex-col p-6 shadow-xl text-slate-900">
      <div className="hidden md:block mb-10">
        <div className="flex items-center space-x-3 mb-1">
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 text-white">🎓</div>
           <h1 className="text-2xl font-black text-slate-900">Lumina</h1>
        </div>
        <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest ml-1">Study Buddy</p>
      </div>

      <div className="hidden md:block mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
         <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-black uppercase tracking-widest">Level {level}</span>
            <span className="text-xs text-indigo-500 font-bold">{user.xp || 0} XP</span>
         </div>
         <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
             <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${xpProgress}%` }}></div>
         </div>
         <p className="text-[9px] text-slate-400 font-bold text-right">{1000 - ((user.xp || 0) % 1000)} XP to next level</p>
      </div>

      <div className="flex justify-around md:flex-col md:space-y-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center p-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold scale-[1.02]' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className="text-xl mr-3 group-hover:scale-125 transition-transform">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="hidden md:block mt-auto pt-6 border-t border-slate-200 space-y-4">
        <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-2xl border border-slate-200 group hover:border-slate-300 transition-colors">
           <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300" />
           <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Joined {formattedJoinDate}</p>
              <button onClick={onLogout} className="text-[10px] text-rose-500 font-black uppercase hover:text-rose-600 transition-colors tracking-widest">Log Out</button>
           </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('lumina_current_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lumina_current_user');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('lumina_current_user', JSON.stringify(updatedUser));
    
    // Also update in the main users array
    const allUsers = JSON.parse(localStorage.getItem('lumina_users') || '[]');
    const index = allUsers.findIndex((u: User) => u.id === updatedUser.id);
    if (index !== -1) {
      allUsers[index] = updatedUser;
      localStorage.setItem('lumina_users', JSON.stringify(allUsers));
    }
  };

  if (loading) return null;

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <HashRouter>
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1 pb-24 md:pb-0 overflow-y-auto max-h-screen relative">
          <Routes>
            <Route path="/" element={<Dashboard user={user} onUpdateUser={updateUser} />} />
            <Route path="/homework" element={<HomeworkHero />} />
            <Route path="/practice" element={<PracticeZone user={user} onUpdateUser={updateUser} />} />
            <Route path="/diagrams" element={<DiagramLab />} />
            <Route path="/tutor" element={<LiveTutor />} />
            <Route path="/logs" element={<DailyLog user={user} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
