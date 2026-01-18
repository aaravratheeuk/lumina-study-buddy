
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { startVideoGeneration, checkVideoStatus } from '../services/gemini';

const VideoGen: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [needsKey, setNeedsKey] = useState(false);

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const checkKeyStatus = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setNeedsKey(!hasKey);
    }
  };

  const handleOpenSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setNeedsKey(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setVideoUrl(null);
    setStatusMessage('Initiating video synthesis...');

    try {
      let operation = await startVideoGeneration(prompt);
      
      while (!operation.done) {
        setStatusMessage('Gemini is dreaming up your frames... This may take a few minutes.');
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await checkVideoStatus(operation);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error("Video generation error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setNeedsKey(true);
      }
      alert("Failed to generate video. Ensure you have a valid paid API key selected.");
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  if (needsKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m11-1a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">API Key Required for Veo</h2>
        <p className="text-slate-400 max-w-md">
          Video generation using Veo 3.1 requires a paid API key from a GCP project. 
          Please visit the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 underline">billing documentation</a> for details.
        </p>
        <button 
          onClick={handleOpenSelectKey}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl transition-all"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      <header className="text-center">
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Cine Studio</h2>
        <p className="text-slate-400 text-lg italic">"Everything you can imagine is real."</p>
      </header>

      <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Cinematic Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A high-speed cinematic tracking shot of a glowing blue wolf running through a futuristic digital forest at midnight..."
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-2xl p-4 text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex justify-end">
             <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Generate Video'}
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        {videoUrl ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl group">
            <video src={videoUrl} controls autoPlay loop className="w-full h-auto" />
            <div className="p-4 flex justify-between items-center">
              <span className="text-sm text-slate-400">Rendering Complete</span>
              <a href={videoUrl} download="lumina-veo.mp4" className="text-blue-400 hover:text-blue-300 font-semibold">Download Video</a>
            </div>
          </div>
        ) : loading ? (
          <div className="aspect-video bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24">
               <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-white text-xl font-bold mb-2 animate-pulse">Synthesizing Reality</p>
              <p className="text-slate-400 max-w-xs">{statusMessage}</p>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4">
             <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
             </div>
             <p className="text-slate-600 font-medium">Video preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGen;
