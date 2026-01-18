
import React, { useState } from 'react';
import { generateImage } from '../services/gemini';

const DiagramLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      // Guide the prompt to be educational
      const educationalPrompt = `A clear, high-quality educational diagram or visual aid showing: ${prompt}. Educational style, textbook quality, white background where appropriate, labeled clearly.`;
      const imageUrl = await generateImage(educationalPrompt, "1:1");
      setResult(imageUrl);
    } catch (error) {
      console.error(error);
      alert("Failed to create diagram. Try a different topic!");
    } finally {
      setLoading(false);
    }
  };

  const suggested = [
    "Structure of an atom",
    "Water cycle diagram",
    "Plate tectonics",
    "Ancient Egyptian pyramid layout",
    "Newton's Third Law illustration"
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10 animate-in fade-in duration-500">
      <header className="text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4">Diagram Lab</h2>
        <p className="text-slate-500 text-lg">Create accurate visuals for your science, history, or geography reports.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Visual Topic</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Cross-section of a volcano"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-emerald-100"
          >
            {loading ? 'Sketching...' : 'Create Visual Aid'}
          </button>

          <div className="pt-6 border-t border-slate-100">
             <p className="text-xs font-black text-slate-400 uppercase mb-4">Quick Ideas</p>
             <div className="flex flex-wrap gap-2">
                {suggested.map(idea => (
                  <button 
                    key={idea}
                    onClick={() => setPrompt(idea)}
                    className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 px-3 rounded-lg border border-slate-200 transition-colors font-bold"
                  >
                    {idea}
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 group relative">
              <img src={result} alt="Diagram" className="w-full h-auto aspect-square object-contain bg-white" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-900/80 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-bold text-white">Visual Ready for Report</span>
                <a href={result} download="diagram.png" className="bg-white text-slate-900 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-100">Save Image</a>
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-12 space-y-4">
              {loading ? (
                 <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <div className="text-5xl grayscale opacity-50">🎨</div>
                  <h4 className="text-xl font-bold text-slate-700">Your custom diagram will appear here</h4>
                  <p className="text-slate-500 text-sm max-w-xs">Perfect for adding to Google Slides, PowerPoint, or printed posters.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagramLab;
