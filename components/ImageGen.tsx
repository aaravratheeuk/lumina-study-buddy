
import React, { useState } from 'react';
import { generateImage } from '../services/gemini';

const ImageGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const imageUrl = await generateImage(prompt, aspectRatio);
      setResult(imageUrl);
    } catch (error) {
      console.error("Image generation failed:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      <header className="text-center">
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Image Forge</h2>
        <p className="text-slate-400 text-lg">Harness Gemini 2.5 Flash to bring your imagination to life.</p>
      </header>

      <div className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Visual Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your masterpiece in detail..."
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Aspect Ratio</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
                {(["1:1", "16:9", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      aspectRatio === ratio ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] mt-auto"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Forging...
                </span>
              ) : 'Generate Magic'}
            </button>
          </div>
        </div>
      </div>

      <div className="relative group">
        {result ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-blue-500/50">
            <img src={result} alt="Generated" className="w-full h-auto" />
            <div className="p-4 bg-slate-900/90 flex justify-between items-center">
              <span className="text-sm text-slate-400">Masterpiece ready</span>
              <a 
                href={result} 
                download="lumina-gen.png" 
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Download
              </a>
            </div>
          </div>
        ) : loading ? (
          <div className="aspect-video bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4 animate-pulse">
             <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-slate-500 font-medium">Mixing colors and data...</p>
          </div>
        ) : (
          <div className="aspect-video bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4">
             <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
             <p className="text-slate-600 font-medium">Your creation will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGen;
