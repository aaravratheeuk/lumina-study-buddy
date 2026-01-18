
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { User, QuizQuestion } from '../types';

interface PracticeZoneProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const PracticeZone: React.FC<PracticeZoneProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'worksheet'>('quiz');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [xpGained, setXpGained] = useState(0); // Track session XP
  const [quizComplete, setQuizComplete] = useState(false);

  // Worksheet State
  const [worksheetContent, setWorksheetContent] = useState<string | null>(null);

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setXpGained(0);
    setQuizComplete(false);
    setShowFeedback(false);
    setSelectedAnswer(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a quiz with 10 multiple-choice questions about "${topic}" suitable for a student in ${user.yearGroup}. The tone should be encouraging.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctAnswer", "explanation"]
                }
              }
            },
            required: ["questions"]
          }
        }
      });
      
      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        if (data.questions && data.questions.length > 0) {
           setQuizQuestions(data.questions);
        } else {
           setError("Could not generate questions. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Oops! I couldn't write a quiz for that topic. Try something else!");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option: string) => {
    if (showFeedback) return;
    setSelectedAnswer(option);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;
    setShowFeedback(true);
    if (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(s => s + 1);
      // Award XP
      const xpAward = 25;
      setXpGained(prev => prev + xpAward);
      
      const updatedUser = {
        ...user,
        xp: (user.xp || 0) + xpAward
      };
      onUpdateUser(updatedUser);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetPractice = () => {
    setQuizQuestions([]);
    setTopic('');
    setQuizComplete(false);
    setWorksheetContent(null);
  };

  const generateWorksheet = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setWorksheetContent(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a practice worksheet for a ${user.yearGroup} student about "${topic}".
        Include:
        1. A brief 2-sentence summary of the topic.
        2. 5 short-answer practice questions.
        3. 1 fun "Challenge" question.
        4. An answer key at the very bottom.
        Format cleanly with headings using Markdown. Use emojis.`,
      });
      setWorksheetContent(response.text || "Could not generate worksheet.");
    } catch (err) {
      console.error(err);
      setError("Failed to create the worksheet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-worksheet');
    if (printContent) {
      const win = window.open('', '', 'height=700,width=800');
      if (win) {
        win.document.write('<html><head><title>Worksheet</title>');
        win.document.write('<link href="https://cdn.tailwindcss.com" rel="stylesheet">');
        win.document.write('</head><body class="p-10 font-sans">');
        win.document.write(printContent.innerHTML);
        win.document.write('</body></html>');
        win.document.close();
        win.print();
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10 animate-in fade-in duration-500">
      <header className="text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Practice Zone</h2>
        <p className="text-slate-500 text-lg">Master your subjects with AI-generated quizzes and worksheets.</p>
      </header>

      <div className="flex justify-center space-x-6 mb-8">
        <button
          onClick={() => { setActiveTab('quiz'); resetPractice(); }}
          className={`px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
        >
          ⚡ Quick Quiz
        </button>
        <button
          onClick={() => { setActiveTab('worksheet'); resetPractice(); }}
          className={`px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'worksheet' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
        >
          📄 Create Worksheet
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-100/50 min-h-[500px] flex flex-col">
        {!quizQuestions.length && !worksheetContent && !loading && (
          <div className="mb-8 space-y-4 flex-1 flex flex-col justify-center">
            <div className="text-center space-y-6">
              <div className="text-6xl grayscale opacity-20 animate-bounce">🚀</div>
              <h3 className="text-2xl font-bold text-slate-900">Ready to Launch?</h3>
              <div className="max-w-xl mx-auto w-full space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 text-left block">Enter Topic</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis, Fractions, Romeo and Juliet..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none font-medium placeholder:text-slate-400"
                    onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'quiz' ? startQuiz() : generateWorksheet())}
                  />
                  <button
                    onClick={activeTab === 'quiz' ? startQuiz : generateWorksheet}
                    disabled={loading || !topic.trim()}
                    className={`px-8 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'quiz' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-200'}`}
                  >
                    Go!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
           <div className="flex-1 flex flex-col items-center justify-center space-y-6">
             <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             <p className="font-bold text-slate-500 animate-pulse">{activeTab === 'quiz' ? 'Generating 10 questions...' : 'Designing worksheet...'}</p>
           </div>
        )}

        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-center font-bold border border-rose-100 mb-6">
            {error}
          </div>
        )}

        {/* QUIZ MODE - Active */}
        {activeTab === 'quiz' && quizQuestions.length > 0 && !quizComplete && !loading && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-2xl">
               <span className="text-xs font-black uppercase tracking-widest text-slate-400">Question {currentQuestionIndex + 1} / {quizQuestions.length}</span>
               <div className="flex items-center space-x-3">
                 <span className="text-xs font-black uppercase tracking-widest text-indigo-500">Score: {score}</span>
                 <div className="h-4 w-px bg-slate-300"></div>
                 <span className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center">
                   <span className="mr-1">⚡</span>{user.xp} XP
                 </span>
               </div>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-2 mb-8">
              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mb-8">{quizQuestions[currentQuestionIndex].question}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === quizQuestions[currentQuestionIndex].correctAnswer;
                
                let btnClass = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100";
                if (showFeedback) {
                  if (isCorrect) btnClass = "bg-emerald-100 border-emerald-200 text-emerald-800 ring-2 ring-emerald-400";
                  else if (isSelected && !isCorrect) btnClass = "bg-rose-100 border-rose-200 text-rose-800 ring-2 ring-rose-400 opacity-50";
                  else btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                } else if (isSelected) {
                   btnClass = "bg-indigo-100 border-indigo-200 text-indigo-800 ring-2 ring-indigo-400";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    className={`p-6 rounded-2xl border text-left font-medium transition-all ${btnClass}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-auto">
              {!showFeedback ? (
                 <button 
                   onClick={checkAnswer}
                   disabled={!selectedAnswer}
                   className="w-full bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl disabled:shadow-none hover:scale-[1.01] active:scale-[0.99]"
                 >
                   Check Answer
                 </button>
              ) : (
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl animate-in zoom-in duration-300">
                  <div className="flex items-start justify-between mb-6">
                     <div className="flex items-start gap-4">
                        <div className="text-3xl">{selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? '🎉' : '🤔'}</div>
                        <div>
                            <h4 className="font-bold text-indigo-900 text-lg mb-1 flex items-center">
                              {selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer ? 'Correct!' : 'Not quite...'}
                              {selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer && (
                                <span className="ml-3 text-xs bg-amber-400 text-white px-2 py-1 rounded-lg animate-bounce shadow-sm">+25 XP</span>
                              )}
                            </h4>
                            <p className="text-indigo-700 text-sm">{quizQuestions[currentQuestionIndex].explanation}</p>
                        </div>
                     </div>
                  </div>
                  <button 
                     onClick={nextQuestion}
                     className="w-full bg-indigo-600 text-white font-black py-4 px-10 rounded-2xl hover:bg-indigo-500 transition-colors shadow-lg"
                   >
                     {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question →' : 'See Results →'}
                   </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUIZ COMPLETED */}
        {quizComplete && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
             <div className="text-8xl mb-6">{score > 7 ? '🏆' : score > 4 ? '👍' : '📚'}</div>
             <h3 className="text-3xl font-black text-slate-900 mb-2">Quiz Completed!</h3>
             <div className="flex items-center justify-center space-x-6 mb-8">
               <p className="text-slate-500 text-lg">Score: <span className="text-indigo-600 font-bold text-2xl">{score} / {quizQuestions.length}</span></p>
               <div className="h-6 w-px bg-slate-200"></div>
               <p className="text-slate-500 text-lg">XP Earned: <span className="text-amber-500 font-bold text-2xl">+{xpGained}</span></p>
             </div>
             
             <div className="flex gap-4">
               <button 
                 onClick={resetPractice}
                 className="bg-slate-100 text-slate-600 font-black py-3 px-8 rounded-2xl hover:bg-slate-200 transition-colors uppercase text-xs tracking-widest"
               >
                 New Topic
               </button>
               <button 
                 onClick={startQuiz}
                 className="bg-indigo-600 text-white font-black py-3 px-8 rounded-2xl hover:bg-indigo-500 transition-colors uppercase text-xs tracking-widest shadow-lg"
               >
                 Try Again
               </button>
             </div>
          </div>
        )}

        {/* WORKSHEET MODE */}
        {activeTab === 'worksheet' && worksheetContent && !loading && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
               <button onClick={resetPractice} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">← Back</button>
               <button 
                 onClick={handlePrint}
                 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl transition-colors"
               >
                 <span>🖨️</span> Print / Save PDF
               </button>
             </div>
             <div id="printable-worksheet" className="prose prose-slate max-w-none bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-bold text-center mb-2 text-slate-900 border-b border-slate-100 pb-4">{topic} Worksheet</h1>
                <p className="text-center text-slate-500 text-sm mb-8 italic">Created for {user.yearGroup} • Lumina Study Buddy</p>
                <div className="whitespace-pre-wrap font-medium text-slate-700 leading-loose">
                  {worksheetContent}
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeZone;
