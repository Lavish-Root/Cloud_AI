import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Activity, ArrowUpRight } from 'lucide-react';

const GlobalConsole = ({ batchData, onDrilldown }) => {
  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'aws': return <Shield className="text-orange-500" />;
      case 'azure': return <Shield className="text-blue-500" />;
      case 'gcp': return <Shield className="text-emerald-500" />;
      default: return <Shield className="text-slate-500" />;
    }
  };

  const getScoreColor = (score) => {
    if (score > 80) return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
    if (score > 50) return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
    return 'text-rose-500 border-rose-500/20 bg-rose-500/5';
  };

  const globalScore = Math.floor(batchData.reduce((acc, curr) => acc + curr.riskScore, 0) / (batchData.length || 1));

  return (
    <div className="space-y-8 p-2">
      {/* Global Hero Card */}
      <div className="glass-card p-10 rounded-[3rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-700">
           <Activity size={200} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-500/10 text-blue-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 shadow-lg shadow-blue-500/5">
                Federated Security Posture
              </span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Global Command Center</h1>
            <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
              Monitoring <span className="text-white">3 Active Environments</span> across the global cloud infrastructure. 
              Real-time threat intelligence and automated remediation are active across all nodes.
            </p>
          </div>

          <div className="flex items-center gap-8">
             <div className="text-center">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Aggregate Score</div>
                <div className={`text-7xl font-black tracking-tighter ${getScoreColor(globalScore).split(' ')[0]}`}>
                  {globalScore}
                </div>
             </div>
             <div className="w-[1px] h-16 bg-white/10" />
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                   <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Total Risks</div>
                   <div className="text-xl font-bold text-white">
                      {batchData.reduce((acc, curr) => acc + curr.findingsCount, 0)}
                   </div>
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                   <div className="text-[10px] font-black text-slate-500 uppercase mb-1">Active Nodes</div>
                   <div className="text-xl font-bold text-white">42</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Cloud Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {batchData.map((platform) => {
          const isDisconnected = platform.status === 'DISCONNECTED';
          return (
            <motion.div 
              key={platform.provider}
              whileHover={isDisconnected ? {} : { y: -5 }}
              className={`glass-card p-8 rounded-[2.5rem] border transition-all cursor-pointer group ${
                isDisconnected ? 'border-white/5 opacity-60 grayscale' : 'border-white/5 hover:border-white/10'
              }`}
              onClick={() => !isDisconnected && onDrilldown(platform.provider)}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                  {getProviderIcon(platform.provider)}
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  isDisconnected ? 'text-slate-500 border-slate-800 bg-slate-900/40' : getScoreColor(platform.riskScore)
                }`}>
                  {isDisconnected ? 'OFFLINE' : `Score: ${platform.riskScore}`}
                </div>
              </div>

              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                {platform.provider === 'gcp' ? 'Google Cloud' : platform.provider.toUpperCase()}
              </h3>
              
              <div className="space-y-4 mb-8">
                 {isDisconnected ? (
                    <div className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
                       Awaiting Browser Target Connection...
                    </div>
                 ) : (
                    <>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                          <span>Open Vulnerabilities</span>
                          <span className={platform.findingsCount > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                            {platform.findingsCount} Issues
                          </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                          <span>Threat Intelligence</span>
                          <span className={platform.mlInference?.anomaly_level === 'HIGH' ? 'text-rose-500' : 'text-slate-300'}>
                            {platform.mlInference?.anomaly_level || 'LOW'} Risk
                          </span>
                      </div>
                    </>
                 )}
              </div>

              <button 
                disabled={isDisconnected}
                className={`w-full py-4 border border-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isDisconnected ? 'bg-slate-900/40 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {isDisconnected ? 'SYNC REQUIRED' : 'Enter Console'} <ArrowUpRight size={14} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalConsole;
