import React from 'react';
import { Shield, Server, History, CheckCircle, ShieldAlert, Zap, Globe, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from './StatCard';
import ActivityLog from './ActivityLog';

const Overview = ({ riskScore, alerts, triggerIgnore }) => {
  const isHijackAttempt = alerts.some(a => a.msg === 'OWNER REMOVAL ATTEMPT');

  return (
    <div className="space-y-10">
      <AnimatePresence>
        {isHijackAttempt && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative overflow-hidden bg-rose-600/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-rose-500/50 shadow-2xl shadow-rose-600/20"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldAlert size={120} />
            </div>
            
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="bg-white/20 p-5 rounded-3xl animate-pulse text-white backdrop-blur-md shadow-xl">
                  <ShieldAlert size={40} />
                </div>
                <div>
                  <div className="font-black text-white text-3xl uppercase tracking-tighter italic leading-tight">Critical Hijack Attempt</div>
                  <div className="text-rose-100 text-sm font-bold uppercase tracking-widest mt-1">GCP Cloud IAM: Admin permissions are being revoked by external actor</div>
                </div>
              </div>
              
              <button 
                onClick={() => triggerIgnore(alerts.find(a => a.msg === 'OWNER REMOVAL ATTEMPT')?.id)} 
                className="bg-white text-rose-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                Intercept & Secure
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Security Profile" value={`${riskScore}/100`} icon={Shield} trend={4} color="green" />
        <StatCard title="Global Nodes" value="1,248" icon={Globe} trend={12} color="blue" />
        <StatCard title="IAM DRIFT" value={riskScore < 50 ? "CRITICAL" : "STABLE"} icon={History} trend={0} color={riskScore < 50 ? "red" : "indigo"} />
        <StatCard title="Auto Compliance" value="86%" icon={CheckCircle} trend={-2} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 flex flex-col gap-10">
          <ActivityLog alerts={alerts} onTriggerIgnore={triggerIgnore} />
          
          <div className="glass-card rounded-[2.5rem] p-8 bg-[#030712]/40 backdrop-blur-2xl border-slate-800/40">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                <Cpu size={22} />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">AI Compute Efficiency</h2>
            </div>
            
            <div className="h-48 flex items-end justify-between px-4 pb-2">
              {[40, 70, 45, 90, 65, 80, 55, 75, 95, 60, 85, 40].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="w-4 bg-gradient-to-t from-blue-600/20 to-indigo-500/60 rounded-t-lg"
                />
              ))}
            </div>
            <div className="mt-4 border-t border-slate-800 pt-4 flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>NOW</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="glass-card rounded-[2.5rem] p-8 border-slate-800/40 bg-gradient-to-br from-blue-600/10 to-transparent">
            <h2 className="text-xl font-extrabold text-white tracking-tight mb-6">Threat Mitigation</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Active Shielding</span>
                <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                </div>
              </div>
              <div className="flex items-center justify-between opacity-50">
                <span className="text-sm font-bold text-slate-300">Auto-Remediation</span>
                <div className="w-12 h-6 bg-slate-800 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-slate-600 rounded-full shadow-lg" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Isolation Mode</span>
                <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1 translate-x-0">
                  <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                </div>
              </div>
            </div>
            
            <button className="w-full mt-10 p-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
              Deploy Global Patch
            </button>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 border-slate-800/40">
            <div className="flex items-center space-x-3 mb-6">
              <Zap size={18} className="text-amber-500" />
              <h2 className="text-lg font-extrabold text-white tracking-tight">Security Tip</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Consider implementing <span className="text-blue-400 font-bold">Zero Trust</span> architecture for your Azure workloads to reduce lateral movement risk by up to 80%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
