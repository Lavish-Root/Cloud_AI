import React from 'react';
import { Search, Bell, Settings, ChevronDown } from 'lucide-react';

const Header = ({ currentView }) => {
  return (
    <header className="h-24 border-b border-slate-800/60 px-10 flex items-center justify-between bg-[#030712]/40 backdrop-blur-md shrink-0">
      <div className="flex flex-col">
        <div className="text-2xl font-bold text-white tracking-tight">{currentView}</div>
        <div className="text-xs text-slate-500 font-medium tracking-wide">CloudGuard Admin Console • Global Infrastructure</div>
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
