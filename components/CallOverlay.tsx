
import React, { useEffect, useState, useRef } from 'react';
import { Contact } from '../types';
import { GeminiLiveSession } from '../services/geminiLiveService';

interface CallOverlayProps {
  contact: Contact;
  onEnd: () => void;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ contact, onEnd }) => {
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState('Connecting...');
  const [visualizerLevels, setVisualizerLevels] = useState<number[]>(new Array(24).fill(0));
  const sessionRef = useRef<GeminiLiveSession | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    sessionRef.current = new GeminiLiveSession();
    
    const startCall = async () => {
      setStatus('In Call');
      await sessionRef.current?.startSession(onEnd);
      
      const updateVisualizer = () => {
        if (sessionRef.current) {
          const data = sessionRef.current.getVolumeData();
          // Map frequency data to our 24 bars
          const newLevels = [];
          const step = Math.floor(data.length / 24) || 1;
          for (let i = 0; i < 24; i++) {
            const val = data[i * step] || 0;
            // Normalize val (0-255) to a height percentage (5-100)
            const height = 5 + (val / 255) * 95;
            newLevels.push(height);
          }
          setVisualizerLevels(newLevels);
        }
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    startCall();

    const timer = setInterval(() => {
      setDuration(d => d + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      cancelAnimationFrame(animationFrameRef.current);
      sessionRef.current?.stopSession();
    };
  }, [onEnd]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-between py-20 px-6 animate-in fade-in zoom-in duration-500 overflow-hidden">
      {/* Background visualizer elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[120px] transition-transform duration-300" 
          style={{ transform: `translate(-50%, -50%) scale(${1 + (visualizerLevels.reduce((a, b) => a + b, 0) / 2400)})` }}
        />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="text-center relative z-10">
        <div className="relative inline-block mb-8">
          <div 
            className="absolute inset-0 bg-blue-500 rounded-full opacity-20 transition-transform duration-100" 
            style={{ transform: `scale(${1.2 + (visualizerLevels[5] / 100)})` }}
          />
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-10 scale-[2] delay-300" />
          <img 
            src={contact.avatar} 
            alt={contact.name} 
            className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] md:rounded-[60px] object-cover relative z-10 border-4 border-slate-900 shadow-2xl" 
          />
        </div>
        <h2 className="text-3xl font-bold mb-2 tracking-tight">{contact.name}</h2>
        <p className="text-blue-400 font-medium tracking-widest uppercase text-xs mb-1">
          {status}
        </p>
        <p className="text-slate-500 font-mono">{formatTime(duration)}</p>
      </div>

      {/* Actual Audio Visualizer */}
      <div className="flex items-center justify-center gap-1 md:gap-2 h-32 w-full max-w-lg relative z-10 px-4">
        {visualizerLevels.map((level, i) => (
          <div 
            key={i} 
            className="flex-1 min-w-[3px] bg-gradient-to-t from-blue-600 via-blue-400 to-purple-400 rounded-full transition-all duration-75"
            style={{ 
              height: `${level}%`,
              boxShadow: level > 40 ? '0 0 15px rgba(59, 130, 246, 0.5)' : 'none'
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-8 relative z-10">
        <button className="w-16 h-16 rounded-full glass-effect flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        </button>
        
        <button 
          onClick={onEnd}
          className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-500/40 hover:scale-110 active:scale-95 transition-all"
        >
          <svg className="w-9 h-9 rotate-[135deg]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
        </button>

        <button className="w-16 h-16 rounded-full glass-effect flex items-center justify-center text-slate-300 hover:bg-white/10 transition-all">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default CallOverlay;
