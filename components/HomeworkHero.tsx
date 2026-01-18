
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { GroundingSource } from '../types';

const HomeworkHero: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');
    setSources([]);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: {
          systemInstruction: `You are Lumina Study Buddy, a helpful, encouraging tutor for students in Year 1 to Year 11 (ages 5-16).
          
          RULES:
          1. **NEVER** give the final answer or write the essay for the student.
          2. **ALWAYS** guide them with hints, questions, and simple explanations.
          3. If asked for code or math solutions, break down the logic or provide a similar example, but do not solve the specific problem asked.
          4. Use simple, age-appropriate language.
          5. Use emojis to be friendly.
          6. Use bold text for key terms.
          7. Verify facts using search.`,
          tools: [{ googleSearch: {} }],
        },
      });

      setResponse(result.text || "I couldn't find an answer for that. Try rephrasing!");
      
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const extractedSources: GroundingSource[] = [];
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            extractedSources.push({
              title: chunk.web.title || "Reference Source",
              uri: chunk.web.uri
            });
          }
        });
        setSources(extractedSources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i));
      }
    } catch (error: any) {
      console.error(error);
      setError("Oops! Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-12 space-y-12 transition-all duration-700 ${focusMode ? 'scale-[1.02]' : ''}`}>
      <header className="text-center">
        <div className="inline-block px-4 py-1.5 bg-indigo-100 border border-indigo-200 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Homework Assistant</div>
        <h2 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">Let's do your homework.</h2>
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto italic">"The more that you read, the more things you will know. The more that you learn, the more places you'll go." — Dr. Seuss</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-100/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6">
           <button 
             onClick={() => setFocusMode(!focusMode)}
             className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${focusMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
           >
             {focusMode ? '✨ Focus Active' : 'Enable Focus'}
           </button>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-2">What are we working on today?</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question, paste an essay prompt, or solve a tricky math problem..."
              className="w-full h-40 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-slate-900 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none shadow-inner text-lg leading-relaxed font-medium placeholder:text-slate-400"
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex space-x-3">
                <div className="flex -space-x-2">
                   {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px]">✨</div>)}
                </div>
                <span className="text-xs text-slate-400 font-bold">3 Study Modes Available</span>
             </div>
             <button
              onClick={handleAsk}
              disabled={loading || !query.trim()}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 px-12 rounded-[1.5rem] transition-all shadow-xl shadow-indigo-200 active:scale-95 text-sm uppercase tracking-widest"
            >
              {loading ? (
                <span className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </span>
              ) : 'Start Discovery'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-2xl font-bold text-center animate-in fade-in slide-in-from-bottom-2">
          {error}
        </div>
      )}

      {(response || loading) && !error && (
        <div className="space-y-8 pb-32 animate-in slide-in-from-bottom-8 duration-500">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 md:p-14 leading-relaxed text-slate-700 shadow-2xl shadow-indigo-100/50 relative">
            <div className="absolute -left-6 top-10 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-indigo-200 text-white">💡</div>
            {loading ? (
              <div className="space-y-6 py-6">
                <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded-full w-full animate-pulse delay-75"></div>
                <div className="h-4 bg-slate-100 rounded-full w-5/6 animate-pulse delay-150"></div>
                <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse delay-300"></div>
              </div>
            ) : (
              <div className="prose prose-lg prose-indigo max-w-none text-slate-700">
                {response.split('\n').map((line, i) => (
                  <p key={i} className={`mb-6 leading-loose ${line.startsWith('#') ? 'text-2xl font-black text-slate-900 border-b border-slate-100 pb-2 mb-8' : ''}`}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>

          {sources.length > 0 && !loading && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-10">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-indigo-600 font-black text-xs uppercase tracking-[0.2em] flex items-center">
                    <span className="mr-3 text-xl">🌐</span> Verified Research Sources
                 </h4>
                 <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-3 py-1 bg-white border border-slate-200 rounded-lg">{sources.length} Links</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200 hover:border-indigo-400 p-5 rounded-2xl transition-all group flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                       <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2">{src.title}</span>
                       <span className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">↗</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold truncate max-w-full italic">{src.uri}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeworkHero;
