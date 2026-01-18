
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    secretCode: '',
    targetGrade: 'Exceeding',
    yearGroup: 'Year 7'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUsers = JSON.parse(localStorage.getItem('lumina_users') || '[]');
    const normalizedName = formData.name.trim();
    
    if (isLogin) {
      const user = savedUsers.find((u: any) => 
        u.name.toLowerCase() === normalizedName.toLowerCase() && 
        u.secretCode === formData.secretCode
      );
      
      if (user) {
        // Ensure legacy users have XP
        if (typeof user.xp === 'undefined') {
          user.xp = 0;
        }
        localStorage.setItem('lumina_current_user', JSON.stringify(user));
        onLogin(user);
      } else {
        alert("Could not find a student with that Name and Secret Code. Please check your spelling!");
      }
    } else {
      // Check if name is taken
      if (savedUsers.some((u: any) => u.name.toLowerCase() === normalizedName.toLowerCase())) {
        alert("That name is already being used by another student! Try adding your last initial (e.g. 'Charlie B').");
        return;
      }

      if (formData.secretCode.length < 3) {
        alert("Your secret code needs to be at least 3 characters long.");
        return;
      }

      // Generate a dummy email for compatibility with types
      const dummyEmail = `${normalizedName.toLowerCase().replace(/\s+/g, '.')}@lumina.student`;

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: normalizedName,
        email: dummyEmail,
        secretCode: formData.secretCode,
        targetGrade: formData.targetGrade,
        yearGroup: formData.yearGroup,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${normalizedName}`,
        joinDate: new Date().toISOString(),
        xp: 0,
        syllabusMastery: {
          'Mathematics': 0,
          'Science': 0,
          'English Lit': 0,
          'History': 0
        }
      };
      
      savedUsers.push(newUser);
      localStorage.setItem('lumina_users', JSON.stringify(savedUsers));
      localStorage.setItem('lumina_current_user', JSON.stringify(newUser));
      onLogin(newUser);
    }
  };

  const yearGroups = Array.from({ length: 11 }, (_, i) => `Year ${i + 1}`);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-inter">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-100/50 rounded-full blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-100/50 rounded-full blur-[160px] animate-pulse delay-1000"></div>

      <div className="max-w-md w-full z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[2rem] text-5xl shadow-2xl shadow-indigo-200 mb-6 transform hover:rotate-6 transition-transform cursor-pointer border-4 border-white">🎓</div>
          <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">Lumina</h1>
          <p className="text-slate-500 text-lg font-medium">The AI Study Companion</p>
        </div>

        <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-indigo-100 relative">
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 border border-slate-200">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
              <input 
                required
                type="text" 
                placeholder="Charlie Bucket"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium hover:bg-white focus:bg-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Code</label>
              <input 
                required
                type="text" 
                placeholder="e.g. MagicCastle123"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium hover:bg-white focus:bg-white"
                value={formData.secretCode}
                onChange={(e) => setFormData({...formData, secretCode: e.target.value})}
              />
              <p className="text-[10px] text-slate-400 font-medium ml-1">
                {isLogin ? "Enter the code you created when you signed up." : "Create a secret code to protect your account. Don't forget it!"}
              </p>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Which Class?</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none font-bold hover:bg-white focus:bg-white"
                    value={formData.yearGroup}
                    onChange={(e) => setFormData({...formData, yearGroup: e.target.value})}
                  >
                    {yearGroups.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Goal</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none font-bold hover:bg-white focus:bg-white"
                    value={formData.targetGrade}
                    onChange={(e) => setFormData({...formData, targetGrade: e.target.value})}
                  >
                    <option>Exceeding Expectations</option>
                    <option>Expected Standard</option>
                    <option>Working Towards</option>
                    <option>Grade 9 / A*</option>
                    <option>Grade 8 / A</option>
                    <option>Grade 5 / C</option>
                  </select>
                </div>
              </>
            )}

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 mt-4 text-sm uppercase tracking-widest"
            >
              {isLogin ? 'Open Portal' : 'Start Learning'}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          Empowered by Gemini AI • Year 1-11
        </p>
      </div>
    </div>
  );
};

export default Auth;
