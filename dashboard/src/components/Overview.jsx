import React from 'react';
import { 
  ShieldCheck, ShieldAlert, Zap, Activity, 
  Lock, Globe, HardDrive, UserCheck, 
  ArrowUpRight, ArrowDownRight, TrendingUp 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const Overview = ({ data, history, triggerIgnore }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#94a3b8',
        bodyColor: '#fff',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      y: { display: false, min: 0, max: 100 },
      x: { display: false }
    }
  };

  // Process history for the chart (last 10 points)
  const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const displayHistory = sortedHistory.slice(-10);
  
  const chartData = {
    labels: displayHistory.length > 0 
      ? displayHistory.map(h => new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      : ['1h ago', '45m ago', '30m ago', '15m ago', 'Now'],
    datasets: [{
      fill: true,
      label: 'Security Score',
      data: displayHistory.length > 0 
        ? displayHistory.map(h => h.risk_score)
        : [82, 78, 85, 80, data.riskScore],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      pointRadius: 0,
    }]
  };

  const isHijackAttempt = data.ruleFindings.some(f => f.rule_id === 'GCP_OWNER_REMOVAL_DETECTED');

  return (
    <div className="space-y-8 pb-10">
      <AnimatePresence>
        {isHijackAttempt && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative overflow-hidden bg-rose-600/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-rose-500/50 shadow-2xl shadow-rose-600/20 mb-8"
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
                onClick={() => triggerIgnore('GCP_OWNER_REMOVAL_DETECTED')} 
                className="bg-white text-rose-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                Intercept & Secure
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Security Intelligence <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 uppercase">Pro</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Real-time threat landscape for your multi-cloud architecture.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-5 py-3 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Operational State</p>
              <p className="text-sm font-bold text-slate-200">System Healthy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card p-8 rounded-[2rem] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={120} className="text-blue-500" />
          </div>
          <div className="flex flex-col md:flex-row gap-10 relative z-10">
            <div className="flex-shrink-0 flex flex-col items-center">
               <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="80" cy="80" r="70" 
                      fill="none" stroke="currentColor" strokeWidth="12" 
                      className="text-slate-800"
                    />
                    <circle 
                      cx="80" cy="80" r="70" 
                      fill="none" stroke="currentColor" strokeWidth="12" 
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * data.riskScore) / 100}
                      className={data.riskScore > 80 ? 'text-emerald-500' : data.riskScore > 50 ? 'text-blue-500' : 'text-red-500'}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white">{data.riskScore}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Score</span>
                  </div>
               </div>
               <div className="mt-4 flex items-center gap-2 text-emerald-400 font-bold text-sm">
                 <TrendingUp size={16} /> +4.2% since last hour
               </div>
            </div>

            <div className="flex-grow space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Posture Trend</h3>
                <p className="text-slate-400 text-sm">Analyzing configuration drift and IAM anomalies over the last 60 minutes.</p>
              </div>
              <div className="h-32 w-full">
                <Line data={chartData} options={chartOptions} />
              </div>
              <div className="flex gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Identities</p>
                  <p className="text-lg font-bold text-slate-200">Checked: 142</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Storage</p>
                  <p className="text-lg font-bold text-slate-200">Buckets: 89</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Networking</p>
                  <p className="text-lg font-bold text-slate-200">ACLs: 12</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-rows-2 gap-6">
          <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-between border-blue-500/20 bg-blue-500/[0.02]">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <ArrowUpRight className="text-slate-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{data.ruleFindings.filter(f => f.status === 'PASS').length}</p>
              <p className="text-sm text-slate-400 font-medium">Policy Checks Passed</p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-between border-red-500/20 bg-red-500/[0.02]">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
              <ArrowDownRight className="text-slate-600" size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{data.ruleFindings.filter(f => f.status === 'FAIL').length}</p>
              <p className="text-sm text-slate-400 font-medium">Critical Issues Found</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'IAM Compliance', value: '98%', icon: UserCheck, color: 'emerald' },
          { label: 'Data Encryption', value: '100%', icon: Lock, color: 'blue' },
          { label: 'Public Access', value: '0 detected', icon: Globe, color: 'emerald' },
          { label: 'Storage Audit', value: 'Verified', icon: HardDrive, color: 'indigo' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 rounded-3xl group cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
              stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
              stat.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-indigo-500/10 text-indigo-500'
            }`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl font-bold text-slate-200 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
