import React from 'react';
import { ShieldAlert, ShieldCheck, Clock, ExternalLink, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityLog = ({ alerts, onTriggerIgnore }) => {
  return (
    <div className="glass-card rounded-[2.5rem] p-8 flex flex-col h-full bg-[#030712]/40 backdrop-blur-2xl border-slate-800/40">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5">
            <Clock size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Security Intel</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Real-time threat landscape</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse-soft shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Stream</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4">
        <AnimatePresence initial={false}>
          {alerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-64 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800/50 rounded-3xl"
            >
              <ShieldCheck size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No active security threats detected</p>
            </motion.div>
          ) : (
            alerts.map((a, index) => (
              <motion.div 
                key={a.id} 
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative bg-slate-900/40 border border-slate-800/50 p-5 rounded-2xl hover:border-slate-700/80 transition-all hover:bg-slate-900/60"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      a.msg.includes('OWNER') 
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 group-hover:text-white transition-colors tracking-tight">{a.msg}</div>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{a.provider} Infrastructure</span>
                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{a.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => onTriggerIgnore(a.id)}
                      className="opacity-0 group-hover:opacity-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95"
                    >
                      Dismiss Threat
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                {/* Threat probability indicator or other data can go here */}
                {a.severity === 'critical' && (
                  <div className="absolute top-0 right-0 h-full w-1.5 bg-rose-500 rounded-r-2xl" />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800/60">
        <button className="w-full flex items-center justify-center space-x-2 text-slate-500 hover:text-blue-400 text-xs font-bold uppercase tracking-[0.2em] transition-colors group">
          <span>View Full Forensic Log</span>
          <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ActivityLog;
