import React, { useState } from 'react';
import { Shield, Zap, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const RemediationCenter = ({ findings, provider, onRemediated }) => {
  const [processing, setProcessing] = useState(null);
  const [success, setSuccess] = useState([]);

  const handleRemediate = async (finding) => {
    setProcessing(finding.rule_id);
    try {
      await axios.post('http://localhost:8000/api/security/remediate', {
        provider,
        resource_id: "auto-detect",
        issue_id: finding.rule_id
      });
      setSuccess([...success, finding.rule_id]);
      if (onRemediated) onRemediated(finding.rule_id);
    } catch (err) {
      console.error("Remediation failed", err);
    } finally {
      setProcessing(null);
    }
  };

  const riskyFindings = findings.filter(f => f.status === 'FAIL');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="text-blue-500" /> Remediation Center
          </h2>
          <p className="text-slate-400 text-sm mt-1">One-click security hardening for your cloud assets.</p>
        </div>
        <div className="px-4 py-2 glass-card rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Auto-Fix Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {riskyFindings.map((finding, idx) => (
            <motion.div
              key={finding.rule_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-3xl group flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  finding.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                }`}>
                  <Shield size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-bold text-lg">{finding.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter ${
                      finding.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm max-w-md">
                    Detected automated misconfiguration in {provider.toUpperCase()} resource baseline. Standard protocol requires immediate reversion.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleRemediate(finding)}
                disabled={processing === finding.rule_id || success.includes(finding.rule_id)}
                className={`min-w-[160px] py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  success.includes(finding.rule_id)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
                }`}
              >
                {processing === finding.rule_id ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : success.includes(finding.rule_id) ? (
                  <CheckCircle size={18} />
                ) : (
                  <>Apply Fix <ArrowRight size={18} /></>
                )}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {riskyFindings.length === 0 && (
          <div className="glass-card p-12 rounded-3xl text-center">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">System Fully Hardened</h3>
            <p className="text-slate-400">All identified security issues have been remediated across your {provider.toUpperCase()} environment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemediationCenter;
