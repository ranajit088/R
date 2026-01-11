
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-[#312E81] flex flex-col items-center justify-center overflow-hidden">
      <div className="relative flex items-center justify-center animate-in zoom-in-95 duration-700">
        {/* Subtle background glow */}
        <div className="absolute w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse"></div>
        
        {/* Brand Logo Container */}
        <div className="relative group">
          {/* Outer shadow/glow for the 'R' box */}
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-[2.5rem] transform scale-110"></div>
          
          <div className="w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform rotate-12 transition-transform duration-1000">
             <h1 className="text-[#312E81] text-7xl font-[900] italic -rotate-12 select-none tracking-tighter drop-shadow-md">R</h1>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
        <div className="flex space-x-2 mb-4">
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
        </div>
        <p className="text-white text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Professional Network</p>
      </div>
    </div>
  );
};

export default SplashScreen;
