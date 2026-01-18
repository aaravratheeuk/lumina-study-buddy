
import React, { useState, useEffect } from 'react';
import { User, Assignment, StudentRosterItem } from '../types';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'class' | 'homework'>('class');
  const [roster, setRoster] = useState<StudentRosterItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  // New Student Form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // New Homework Form
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkSubject, setHomeworkSubject] = useState('Mathematics');
  const [homeworkDesc, setHomeworkDesc] = useState('');
  const [homeworkDue, setHomeworkDue] = useState('');

  useEffect(() => {
    // Load roster
    const savedRoster = JSON.parse(localStorage.getItem(`lumina_roster_${user.id}`) || '[]');
    setRoster(savedRoster);

    // Load assignments
    const allAssignments = JSON.parse(localStorage.getItem('lumina_assignments') || '[]');
    const teacherAssignments = allAssignments.filter((a: Assignment) => a.teacherId === user.id);
    setAssignments(teacherAssignments);
  }, [user.id]);

  const addStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName || !newStudentEmail) return;

    const updatedRoster = [...roster, { name: newStudentName, email: newStudentEmail }];
    setRoster(updatedRoster);
    localStorage.setItem(`lumina_roster_${user.id}`, JSON.stringify(updatedRoster));
    
    setNewStudentName('');
    setNewStudentEmail('');
  };

  const removeStudent = (email: string) => {
    const updatedRoster = roster.filter(s => s.email !== email);
    setRoster(updatedRoster);
    localStorage.setItem(`lumina_roster_${user.id}`, JSON.stringify(updatedRoster));
  };

  const createAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkTitle || !homeworkDesc || !homeworkDue) return;

    const newAssignment: Assignment = {
      id: Math.random().toString(36).substr(2, 9),
      teacherId: user.id,
      teacherName: user.name,
      subject: homeworkSubject,
      title: homeworkTitle,
      description: homeworkDesc,
      dueDate: homeworkDue,
      studentEmails: roster.map(s => s.email), // Assign to all in roster
      createdAt: new Date().toISOString()
    };

    const allAssignments = JSON.parse(localStorage.getItem('lumina_assignments') || '[]');
    allAssignments.push(newAssignment);
    localStorage.setItem('lumina_assignments', JSON.stringify(allAssignments));

    setAssignments([newAssignment, ...assignments]);
    setHomeworkTitle('');
    setHomeworkDesc('');
    setHomeworkDue('');
    alert("Homework assigned to " + roster.length + " students!");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900 pb-20">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-xl text-white shadow-lg shadow-indigo-500/20">🍎</div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Lumina Teacher</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Classroom Manager</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-slate-600 hidden md:inline">Welcome, {user.name}</span>
          <button onClick={onLogout} className="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600">Log Out</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex space-x-4 mb-8">
           <button 
             onClick={() => setActiveTab('class')}
             className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'class' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
           >
             My Class Roster
           </button>
           <button 
             onClick={() => setActiveTab('homework')}
             className={`px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'homework' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
           >
             Set Homework
           </button>
        </div>

        {activeTab === 'class' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 sticky top-24">
                <h3 className="text-2xl font-black text-slate-900 mb-6">Add Student</h3>
                <form onSubmit={addStudent} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
                    <input 
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      placeholder="Alice Wonderland"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student Email</label>
                    <input 
                      required
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      placeholder="alice@school.uk"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all uppercase text-xs tracking-widest">
                    Add to Class +
                  </button>
                </form>
                <p className="mt-6 text-xs text-slate-500 leading-relaxed">
                  Students added here will automatically receive any homework you assign. Make sure their email matches their signup email.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900">Class List ({roster.length})</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Year 1-11</span>
                </div>
                {roster.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {roster.map((student, i) => (
                      <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                             {student.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-slate-900">{student.name}</p>
                             <p className="text-xs text-slate-500">{student.email}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => removeStudent(student.email)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-slate-400 italic">
                    No students yet. Add them to get started!
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1">
                <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 sticky top-24">
                  <h3 className="text-2xl font-black text-slate-900 mb-6">Create Assignment</h3>
                  <form onSubmit={createAssignment} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                      <select 
                        value={homeworkSubject}
                        onChange={(e) => setHomeworkSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      >
                        <option>Mathematics</option>
                        <option>Science</option>
                        <option>English Lit</option>
                        <option>History</option>
                        <option>Geography</option>
                        <option>Languages</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignment Title</label>
                      <input 
                        required
                        value={homeworkTitle}
                        onChange={(e) => setHomeworkTitle(e.target.value)}
                        placeholder="e.g. Algebra Worksheet 3"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions</label>
                      <textarea 
                        required
                        value={homeworkDesc}
                        onChange={(e) => setHomeworkDesc(e.target.value)}
                        placeholder="Complete questions 1-10..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium h-32 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                      <input 
                        required
                        type="date"
                        value={homeworkDue}
                        onChange={(e) => setHomeworkDue(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                      />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all uppercase text-xs tracking-widest">
                      Assign to All Students
                    </button>
                  </form>
                </div>
             </div>

             <div className="lg:col-span-2">
                <div className="space-y-6">
                   <h3 className="text-xl font-black text-slate-900 ml-2">Active Assignments</h3>
                   {assignments.length > 0 ? (
                     assignments.slice().reverse().map(assignment => (
                       <div key={assignment.id} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-2 h-full ${assignment.subject === 'Mathematics' ? 'bg-blue-500' : assignment.subject === 'Science' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          <div className="flex justify-between items-start mb-2 pl-4">
                             <div>
                                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-lg mb-2 inline-block">{assignment.subject}</span>
                                <h4 className="text-lg font-bold text-slate-900">{assignment.title}</h4>
                             </div>
                             <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                          <p className="text-slate-600 pl-4 text-sm mb-4">{assignment.description}</p>
                          <div className="pl-4 border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-400">
                             <span>Assigned to {assignment.studentEmails.length} students</span>
                             <span>{new Date(assignment.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-12 bg-white border border-slate-200 rounded-[2.5rem] border-dashed">
                        <p className="text-slate-400 font-medium">No active assignments. Create one to get started!</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
