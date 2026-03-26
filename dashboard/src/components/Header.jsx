import React from 'react';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';

const Header = ({ currentView, provider, score, onProviderChange, simulatedUrl, onUrlChange }) => {
  const platforms = [
    { id: 'all', name: 'Global Hub', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    { id: 'aws', name: 'AWS', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    { id: 'azure', name: 'Azure', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 'gcp', name: 'GCP', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  ];

  return (
    <header className="h-24 border-b border-slate-800/60 px-10 flex items-center justify-between bg-[#030712]/40 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-12">
        <div className="flex flex-col">
          <div className="text-2xl font-black text-white tracking-tighter flex items-center gap-3 italic">
            CLOUDGUARD <span className="text-blue-500 font-extrabold not-italic">AI</span>
          </div>
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-0.5">Enterprise Edition</div>
        </div>

        {/* Platform Selector Hub */}
        <div className="flex items-center bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 space-x-1">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => onProviderChange(p.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                provider === p.id 
                  ? `${p.color} border shadow-lg shadow-blue-500/5` 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* LIVE SYNC CONNECTOR */}
        <div className="hidden xl:flex items-center gap-4 bg-blue-500/5 border border-blue-500/10 px-5 py-2.5 rounded-2xl">
           <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${simulatedUrl ? 'bg-emerald-500' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Browser Probe</span>
           </div>
           <input 
              type="text" 
              value={simulatedUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="Enter Cloud Console URL to Sync..."
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-200 w-64 placeholder:text-slate-700"
           />
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <div className="relative group hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search security logs..." 
            className="bg-slate-900/40 border border-slate-800/60 rounded-2xl py-2.5 pl-12 pr-6 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all group">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 border-2 border-[#030712] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse" />
          </button>
          
          <div className="h-10 w-px bg-slate-800/60 mx-2" />

          <div className="flex items-center space-x-4 cursor-pointer group">
            <div className="flex flex-col items-end mr-1">
              <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">Admin Session</span>
              <span className="text-[10px] font-bold text-green-500 tracking-widest uppercase">MFA Verified</span>
            </div>
            <div className="relative p-0.5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/10">
              <div className="h-11 w-11 bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-blue-500 text-lg">
                JD
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
