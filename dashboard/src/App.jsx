import React, { useState, useEffect } from 'react';
import { Key, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Import local components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './components/Overview';

const API_BASE = "http://localhost:8000";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('Overview');
  const [riskScore, setRiskScore] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [compliance, setCompliance] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [driftStatus, setDriftStatus] = useState({ drift_detected: false, drifts: [] });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const indicators = { 
        change_freq: Math.floor(Math.random() * 5), 
        unauth_attempts: Math.floor(Math.random() * 12), 
        public_resources: 0 
      };

      const [secRes, appRes, compRes, driftRes] = await Promise.all([
        axios.post(`${API_BASE}/api/security/check`, { url: "console.cloud.google.com", indicators }),
        axios.get(`${API_BASE}/api/governance/approvals`),
        axios.get(`${API_BASE}/api/governance/compliance-checks`),
        axios.get(`${API_BASE}/api/baseline/status`, { params: { provider: 'aws' } })
      ]);

      const findings = secRes.data.ruleFindings;
      const formattedAlerts = findings
        .filter(f => f.status === 'FAIL')
        .map((f, index) => ({
          id: index,
          type: f.severity.toLowerCase(),
          msg: f.name,
          provider: secRes.data.provider.toUpperCase(),
          time: 'Active',
          severity: f.severity.toLowerCase()
        }));

      setRiskScore(secRes.data.riskScore);
      setAlerts(formattedAlerts);
      setApprovals(appRes.data);
      setCompliance(compRes.data);
      setDriftStatus(driftRes.data);
    } catch (err) { console.error("Data fetch failed", err); }
    finally { setIsLoading(false); }
  };

  const handleVerifyPasscode = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/verify`, { password: passcode });
      setShowAuthModal(false);
      setPasscode('');
      if (pendingAction) pendingAction();
    } catch (err) { alert("Incorrect Master Passcode!"); }
  };

  const triggerIgnore = (id) => {
    setPendingAction(() => () => {
       setAlerts(prev => prev.filter(a => a.id !== id));
    });
    setShowAuthModal(true);
  };

  const downloadReport = (type) => {
    window.open(`${API_BASE}/api/reports/${type}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex overflow-hidden">
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
              className="bg-slate-900/80 border border-slate-800/60 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="bg-rose-500/10 p-5 rounded-3xl text-rose-500 mb-6 border border-rose-500/20 shadow-lg shadow-rose-500/5">
                  <Key size={32} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Elevated Security required</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">This action requires a master authentication token to proceed. Your attempt will be logged.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Master Passcode</label>
                  <input 
                    type="password" 
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl py-4 px-6 text-xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:tracking-normal placeholder:text-slate-800"
                    autoFocus
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleVerifyPasscode} 
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    Authenticate Request
                  </button>
                  <button 
                    onClick={() => setShowAuthModal(false)} 
                    className="w-full py-4 text-slate-500 hover:text-slate-300 font-bold text-sm transition-all"
                  >
                    Cancel Action
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onDownloadReport={downloadReport} 
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header currentView={currentView} />

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {currentView === 'Overview' && (
              <motion.div 
                key="overview" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Overview riskScore={riskScore} alerts={alerts} triggerIgnore={triggerIgnore} />
              </motion.div>
            )}

            {currentView !== 'Overview' && (
              <motion.div 
                key="other" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800/50 rounded-[3rem]"
              >
                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800/50 mb-6">
                  <ShieldAlert size={64} className="opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">{currentView} Module Offline</h3>
                <p className="text-sm font-medium text-slate-600">This security module is currently performing a delta-sync.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
