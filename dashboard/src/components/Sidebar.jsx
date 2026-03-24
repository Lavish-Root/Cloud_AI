import React from 'react';
import { Shield, Layout, Lock, Settings, Download, Zap } from 'lucide-react';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 group ${
      active 
        ? 'bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon size={20} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
    <span className="font-semibold text-sm tracking-wide">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
  </div>
);

const Sidebar = ({ currentView, setCurrentView, onDownloadReport }) => {
  return (
    <aside className="w-72 border-r border-slate-800/60 flex flex-col shrink-0 bg-[#030712]/50 backdrop-blur-xl">
      <div className="p-8 mb-4">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => setCurrentView('Overview')}
        >
          <div className="relative">
            <div className="absolute -inset-1 bg-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Shield className="text-white shield-glow" size={24} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-white">CloudGuard</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mt-[-4px]">Intelligence AI</span>
          </div>
        </div>
      </div>

      <nav className="px-6 flex-1 space-y-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Main Menu</div>
        <NavItem active={currentView === 'Overview'} icon={Layout} label="Dashboard" onClick={() => setCurrentView('Overview')} />
        <NavItem active={currentView === 'Governance'} icon={Lock} label="Governance" onClick={() => setCurrentView('Governance')} />
        <NavItem active={currentView === 'Compliance'} icon={Settings} label="Compliance" onClick={() => setCurrentView('Compliance')} />
        
        <div className="pt-8">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Insights</div>
          <NavItem active={false} icon={Zap} label="Threat Intelligence" onClick={() => {}} />
        </div>
      </nav>

      <div className="p-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 mb-6">
          <div className="text-xs font-bold text-slate-400 mb-2">PRO PLAN ACTIVE</div>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-blue-500 rounded-full" />
          </div>
          <div className="text-[10px] text-slate-500 mt-2">75% of monthly scan quota used</div>
        </div>
        
        <button 
          onClick={() => onDownloadReport('pdf')} 
          className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3.5 rounded-2xl text-sm font-bold border border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]"
        >
          <Download size={16} />
          <span>Export Analytics</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
