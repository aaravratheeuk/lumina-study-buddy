
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { createAudioBlob, decodeAudio, decodeAudioData } from '../services/gemini';

const LiveTutor: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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
  }, []);

  const startSession = async () => {
    setError(null);
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
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
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

            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => [...prev.slice(-15), `Student: ${message.serverContent!.inputTranscription!.text}`]);
            }
            if (message.serverContent?.outputTranscription) {
               setTranscription(prev => [...prev.slice(-15), `Tutor: ${message.serverContent!.outputTranscription!.text}`]);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
             console.error(e);
             setError("Connection error. Please try again.");
             setIsActive(false);
          },
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } }, // Professional but warm voice
          },
          systemInstruction: 'You are an expert Socratic Tutor for Year 1-11 students. Your mission is to help them understand school concepts. RULE: NEVER give the answer immediately. Ask guiding questions, use helpful analogies, and be very encouraging. If they sound stuck, give them a hint. Keep responses short and spoken.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError("Could not access microphone or connect to AI. Please check permissions.");
      setIsActive(false);
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="h-full flex flex-col p-6 md:p-12 max-w-4xl mx-auto">
      <header className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2">Speak to Tutor</h2>
        <p className="text-slate-500">Practice your languages, test your science knowledge, or just talk through a tough problem.</p>
      </header>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-center font-bold mb-6 border border-rose-200">
          {error}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className={`absolute -inset-10 bg-indigo-100 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
          <button
            onClick={isActive ? stopSession : startSession}
            className={`relative z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all duration-500 transform active:scale-95 shadow-2xl ${
              isActive ? 'bg-rose-500 shadow-rose-200' : 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-500'
            }`}
          >
            {isActive ? (
              <>
                <div className="flex space-x-2 mb-3">
                   {[1, 2, 3, 4, 5, 6].map(i => (
                     <div key={i} className={`w-1.5 bg-white rounded-full animate-bounce h-10`} style={{ animationDelay: `${i * 0.15}s` }}></div>
                   ))}
                </div>
                <span className="font-black uppercase tracking-widest text-sm text-white">Finish Lesson</span>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4 text-white">💬</div>
                <span className="font-black uppercase tracking-widest text-sm text-white">Start Talking</span>
              </>
            )}
          </button>
        </div>

        <div className="w-full bg-white border border-slate-200 rounded-3xl p-8 min-h-[300px] flex flex-col space-y-4 overflow-y-auto custom-scrollbar shadow-xl shadow-slate-100">
          {transcription.length === 0 ? (
            <div className="text-center mt-20 space-y-4">
              <p className="text-slate-400 font-bold italic">Tutor is ready for your questions...</p>
              <div className="flex justify-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
                 <span>Maths</span> • <span>English</span> • <span>Science</span> • <span>History</span>
              </div>
            </div>
          ) : (
            transcription.map((text, i) => (
              <div key={i} className={`p-4 rounded-2xl max-w-[85%] ${text.startsWith('Student:') ? 'bg-indigo-50 text-indigo-800 self-end ml-10 border border-indigo-100' : 'bg-slate-100 text-slate-700 self-start mr-10 border border-slate-200'}`}>
                <p className="text-xs font-black uppercase opacity-50 mb-1">{text.split(':')[0]}</p>
                <p className="text-sm font-medium">{text.split(':').slice(1).join(':').trim()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTutor;
