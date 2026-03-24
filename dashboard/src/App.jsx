import React, { useState, useEffect } from 'react';
import { 
  Shield, Settings, Activity, AlertTriangle, CheckCircle, BarChart2, 
  Layout, Cloud, Server, Lock, RefreshCcw, Bell, Search, TrendingUp, 
  ChevronRight, Download, Eye, Check, X, ShieldAlert, History, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('Overview');
  const [riskScore, setRiskScore] = useState(0);
  const [alerts, setAlerts] = useState([]); // Start with empty alerts
  const [approvals, setApprovals] = useState([]);
  const [compliance, setCompliance] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [driftStatus, setDriftStatus] = useState({ drift_detected: false, drifts: [] });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchInitialData();
    // Real-time Update simulation: Poll Every 15 seconds
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
          time: 'Active'
        }));

      setRiskScore(secRes.data.riskScore);
      setAlerts(formattedAlerts); // Update alerts from API
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
       alert("Alert acknowledged and ignored per policy.");
    });
    setShowAuthModal(true);
  };

  const handleApproval = async (id, action) => {
    try {
      await axios.post(`${API_BASE}/api/governance/approvals/${id}/action?action=${action}`);
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : a));
    } catch (err) { alert("Approval action failed."); }
  };

  const downloadReport = (type) => {
    window.open(`${API_BASE}/api/reports/${type}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex overflow-hidden">
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500"><Key size={24} /></div>
                <h3 className="text-xl font-bold">Security Verification</h3>
              </div>
              <p className="text-slate-400 text-sm mb-6">Enter your master passcode to diffuse this security state and ignore the alert.</p>
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Passcode..."
                className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <div className="flex space-x-3">
                <button onClick={() => setShowAuthModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-all">Cancel</button>
                <button onClick={handleVerifyPasscode} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all">Verify & Proceed</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-8 flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('Overview')}>
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30"><Shield className="text-white" size={24} /></div>
          <span className="font-bold text-xl tracking-tight">CloudGuard <span className="text-blue-500">AI</span></span>
        </div>
        <nav className="px-6 flex-1 space-y-1">
          <NavItem active={currentView === 'Overview'} icon={Layout} label="Overview" onClick={() => setCurrentView('Overview')} />
          <NavItem active={currentView === 'Governance'} icon={Lock} label="Governance" onClick={() => setCurrentView('Governance')} />
          <NavItem active={currentView === 'Compliance'} icon={Settings} label="Compliance" onClick={() => setCurrentView('Compliance')} />
        </nav>
        <div className="p-6">
          <button onClick={() => downloadReport('pdf')} className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl text-sm font-bold border border-slate-700 transition-all">
            <Download size={16} /><span>Export Report</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-900/50 shrink-0">
          <div className="text-lg font-bold text-slate-300">{currentView}</div>
          <div className="flex items-center space-x-6">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold">JD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {currentView === 'Overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {alerts.some(a => a.msg === 'OWNER REMOVAL ATTEMPT') && (
                  <div className="mb-8 bg-red-600 p-6 rounded-3xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center space-x-4">
                      <ShieldAlert size={32} className="text-white" />
                      <div>
                        <div className="font-black text-white text-xl uppercase tracking-tighter italic">Critical Hijack Attempt Detected</div>
                        <div className="text-red-100 text-sm font-bold uppercase tracking-widest">GCP IAM Console: Owner role is being revoked!</div>
                      </div>
                    </div>
                    <button onClick={() => triggerIgnore(alerts.find(a => a.msg === 'OWNER REMOVAL ATTEMPT')?.id)} className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold hover:scale-105 transition-all">Acknowledge Alert</button>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <StatCard title="Security Score" value={`${riskScore}/100`} icon={Shield} trend={4} color="green" />
                  <StatCard title="Active Resources" value="1,248" icon={Server} trend={12} color="blue" />
                  <StatCard title="IAM DRIFT" value={riskScore < 50 ? "CRITICAL" : "NONE"} icon={History} trend={0} color={riskScore < 50 ? "red" : "green"} />
                  <StatCard title="IAM Compliance" value="86%" icon={CheckCircle} trend={2} color="indigo" />
                </div>
                <div className="col-span-8 glass-morphism rounded-3xl p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center"><Activity className="mr-3 text-blue-500" size={20} />Real-time Activity Log</h2>
                  <div className="space-y-4">
                    {alerts.map(a => (
                      <div key={a.id} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${a.msg.includes('OWNER') ? 'bg-red-500 text-white' : 'bg-yellow-500/10 text-yellow-500'}`}><ShieldAlert size={18} /></div>
                          <div><div className="font-bold">{a.msg}</div><div className="text-xs text-slate-500">{a.provider} • {a.time}</div></div>
                        </div>
                        <button onClick={() => triggerIgnore(a.id)} className="text-red-400 text-xs font-bold hover:underline">Ignore (Passcode Required)</button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-blue-600/10 text-blue-500 shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
    <Icon size={20} />
    <span className="font-semibold text-sm">{label}</span>
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="glass-morphism p-6 rounded-2xl flex flex-col justify-between hover:border-slate-600 transition-all">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}><Icon size={24} /></div>
      <div className={`flex items-center text-xs font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>{trend}% <TrendingUp size={14} className="ml-1" /></div>
    </div>
    <div className="mt-4"><div className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</div><div className="text-3xl font-extrabold mt-1">{value}</div></div>
  </div>
);

export default Dashboard;
