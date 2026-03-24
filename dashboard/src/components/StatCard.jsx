import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color }) => {
  const colors = {
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    red: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    yellow: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  const selectedColor = colors[color] || colors.blue;

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className="glass-card p-6 rounded-[2rem] flex flex-col justify-between stat-card-glow transition-all duration-500 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${selectedColor} border transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]`}>
          <Icon size={24} />
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
            trend >= 0 ? 'text-emerald-400 bg-emerald-500/5' : 'text-rose-400 bg-rose-500/5'
          }`}>
            <span>{Math.abs(trend)}%</span>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">{title}</div>
        <div className="flex items-baseline space-x-2">
          <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
          {trend !== undefined && <div className="text-[10px] text-slate-500 font-bold">vs last week</div>}
        </div>
      </div>

      <div className="mt-4 h-1 w-full bg-slate-800/50 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: trend >= 0 ? `${70 + trend}%` : `${70 + trend}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full rounded-full ${trend >= 0 ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`}
        />
      </div>
    </motion.div>
  );
};

export default StatCard;
