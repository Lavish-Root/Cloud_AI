import React, { useState, useEffect, useCallback } from 'react';
import { Key, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Import local components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './components/Overview';
import RemediationCenter from './components/RemediationCenter';

const API_BASE = "http://localhost:8000";

const App = () => {
  const [currentView, setCurrentView] = useState('Overview');
  const [securityData, setSecurityData] = useState({
    riskScore: 0,
    ruleFindings: [],
    provider: 'aws',
    mlInference: { threat_probability: 0, anomaly_level: 'LOW' }
  });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const fetchSecurityData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Backend automatically manages indicators for real-time consistency
      const response = await axios.post(`${API_BASE}/api/security/check`, { 
        url: "console.cloud.google.com",
        indicators: {
          change_freq: Math.floor(Math.random() * 5),
          unauth_attempts: Math.floor(Math.random() * 2),
          public_resources: 1
        }
      });
      setSecurityData(response.data);
      
      const historyRes = await axios.get(`${API_BASE}/api/security/history`);
      setHistory(historyRes.data);
    } catch (err) { 
      console.error("Data fetch failed", err); 
    } finally { 
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 15000);
    return () => clearInterval(interval);
  }, [fetchSecurityData]);

  const handleVerifyPasscode = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/verify`, { password: passcode });
      setShowAuthModal(false);
      setPasscode('');
      if (pendingAction) await pendingAction();
      fetchSecurityData(); // Refresh immediately after action
    } catch (err) { 
      alert("Incorrect Master Passcode!"); 
    }
  };

  const triggerIgnore = (ruleId) => {
    setPendingAction(() => async () => {
       try {
         // Intercept & Secure call for hijacking attempts
         if (ruleId === 'GCP_OWNER_REMOVAL_DETECTED') {
           await axios.post(`${API_BASE}/api/security/remediate/intercept`);
         }
         console.log("Neutralized rule:", ruleId);
         fetchSecurityData();
       } catch (err) { 
         console.error("Remediation failed", err); 
       }
    });
    setShowAuthModal(true);
  };

  const onRemediated = (ruleId) => {
    fetchSecurityData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
          <h2 className="text-xl font-black text-white tracking-widest uppercase animate-pulse">Initializing Enterprise Security Engine...</h2>
          <p className="text-slate-500 text-sm mt-2 font-bold uppercase tracking-tighter">Authenticating Multi-Cloud Federated Nodes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex overflow-hidden selection:bg-blue-500/30">
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-slate-900/80 border border-white/5 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-600/10 p-5 rounded-3xl text-blue-500 mb-6 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                  <Key size={32} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Elevated Security</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">This action requires a master authentication token to proceed. Access will be logged in the audit trail.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Master Passcode</label>
                  <input 
                    type="password" 
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl py-4 px-6 text-xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:tracking-normal placeholder:text-slate-800 text-center"
                    autoFocus
                  />
                </div>
                
                <button 
                  onClick={handleVerifyPasscode} 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  Authorize Action
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onDownloadReport={() => window.open(`${API_BASE}/api/reports/security-status`)} 
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header currentView={currentView} provider={securityData.provider} score={securityData.riskScore} />

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'Overview' && (
                <Overview data={securityData} history={history} triggerIgnore={triggerIgnore} />
              )}
              {currentView === 'Remediation' && (
                <RemediationCenter 
                  findings={securityData.ruleFindings} 
                  provider={securityData.provider} 
                  onRemediated={onRemediated} 
                />
              )}
              {currentView === 'Activity' && (
                <div className="glass-card p-10 rounded-[3rem]">
                   <h2 className="text-2xl font-black text-white mb-6">Security Audit Logs</h2>
                   <p className="text-slate-500 mb-8 border-b border-slate-800 pb-8 uppercase text-[10px] font-bold tracking-[0.2em]">Full chain of custody event history</p>
                   <div className="space-y-4">
                      {securityData.ruleFindings.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                           <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${f.status === 'PASS' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="text-sm font-bold text-slate-300">{f.name}</span>
                           </div>
                           <span className="text-[10px] font-black text-slate-500 uppercase">{f.rule_id}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
              {['Inventory', 'Policies', 'ThreatIntel'].includes(currentView) && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800/50 rounded-[3rem] p-20">
                  <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800/50 mb-6">
                    <ShieldAlert size={64} className="opacity-20" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400 mb-2 uppercase tracking-widest">{currentView} Module Offline</h3>
                  <p className="text-sm font-bold text-slate-600 uppercase tracking-tighter">Initializing Federated Data Sync...</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
