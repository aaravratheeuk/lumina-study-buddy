
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { createAudioBlob, decodeAudio, decodeAudioData } from '../services/gemini';

const LiveVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setIsListening(false);
  }, []);

  const startSession = async () => {
    setIsActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        // Updated to recommended model for real-time tasks
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (event) => {
              const inputData = event.inputBuffer.getChannelData(0);
              const pcmBlob = createAudioBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
            setIsListening(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Audio output processing
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeAudio(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            // Transcription processing
            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev.slice(-10), `You: ${message.serverContent!.inputTranscription!.text}`]);
            }
            if (message.serverContent?.outputTranscription) {
               setTranscription(prev => [...prev.slice(-10), `Gemini: ${message.serverContent!.outputTranscription!.text}`]);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live session error:", e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: 'You are a helpful, witty AI companion in a creative studio. Be concise and inspiring.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start session:", err);
      setIsActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return (
    <div className="h-full flex flex-col p-6 md:p-10">
      <header className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Voice Sync</h2>
        <p className="text-slate-400">Real-time low-latency interaction with Gemini 2.5 Flash.</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className={`absolute -inset-8 bg-blue-500/20 rounded-full blur-3xl transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
          <button
            onClick={isActive ? stopSession : startSession}
            className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 ${
              isActive ? 'bg-red-600 shadow-lg shadow-red-900/50' : 'bg-blue-600 shadow-lg shadow-blue-900/50 hover:bg-blue-500'
            }`}
          >
            {isActive ? (
              <>
                <div className="flex space-x-1 mb-2">
                   {[1, 2, 3, 4, 5].map(i => (
                     <div key={i} className={`w-1 bg-white rounded-full animate-bounce h-8`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                   ))}
                </div>
                <span className="font-bold uppercase tracking-widest text-sm">Stop</span>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="font-bold uppercase tracking-widest text-sm">Start Sync</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full max-w-2xl bg-slate-900/50 border border-slate-800 rounded-2xl p-6 min-h-[200px] flex flex-col space-y-4 overflow-y-auto">
          {transcription.length === 0 ? (
            <p className="text-slate-600 text-center italic mt-10">Your conversation transcript will appear here...</p>
          ) : (
            transcription.map((text, i) => (
              <div key={i} className={`p-3 rounded-xl text-sm ${text.startsWith('You:') ? 'bg-blue-600/10 text-blue-300 self-end ml-12' : 'bg-slate-800 text-slate-200 self-start mr-12'}`}>
                {text}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs text-slate-500">
        Syncing with gemini-2.5-flash-native-audio-preview-12-2025
      </div>
    </div>
  );
};

export default LiveVoice;
