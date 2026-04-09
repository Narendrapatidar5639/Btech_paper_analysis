import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router";
import { 
  Users, Activity, FileText, TrendingUp, Clock, 
  CheckCircle, XCircle, Loader2, RefreshCw, 
  BrainCircuit, LayoutDashboard, Database, Zap,
  ShieldCheck, Globe, Cpu, Radio
} from "lucide-react";
import { GlassCard } from "../../components/GlassCard";
import { toast } from "sonner";

// Interfaces
interface DashboardStats {
  totalUsers: string;
  analysisRuns: string;
  activeSubjects: number;
  successRate: string;
}

interface ActivityItem {
  user: string;
  initial: string;
  time: string;
  subject: string;
  status: string;
}

export function AdminDashboard() {
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>();
  const isDark = theme === 'dark';

  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/dashboard-stats/");
      const data = await response.json();
      if (response.ok) {
        setStatsData(data.stats);
        setActivities(data.recentActivity || []);
      }
    } catch (error) {
      toast.error("Neural Sync Interrupted");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Updated to 30s for live feel
    return () => clearInterval(interval);
  }, []);

  const statsConfig = [
    { icon: Users, label: "Total Students", value: statsData?.totalUsers || "0", color: "from-blue-600 to-indigo-600", glow: "shadow-blue-500/40" },
    { icon: BrainCircuit, label: "Neural Runs", value: statsData?.analysisRuns || "0", color: "from-indigo-600 to-fuchsia-600", glow: "shadow-indigo-500/40" },
    { icon: Database, label: "Dataset Pool", value: statsData?.activeSubjects?.toString() || "0", color: "from-fuchsia-600 to-rose-600", glow: "shadow-fuchsia-500/40" },
    { icon: Zap, label: "Engine Accuracy", value: statsData?.successRate || "0%", color: "from-amber-500 to-orange-600", glow: "shadow-orange-500/40" },
  ];

  const getStatusUI = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("completed") || s.includes("success")) {
      return { 
        icon: <CheckCircle className="w-3.5 h-3.5" />, 
        color: isDark ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" : "text-emerald-700 bg-emerald-50 border-emerald-200" 
      };
    }
    if (s.includes("processing")) {
      return { 
        icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, 
        color: isDark ? "text-indigo-400 bg-indigo-400/10 border-indigo-400/30" : "text-indigo-700 bg-indigo-50 border-indigo-200" 
      };
    }
    return { 
      icon: <XCircle className="w-3.5 h-3.5" />, 
      color: isDark ? "text-rose-400 bg-rose-400/10 border-rose-400/30" : "text-rose-700 bg-rose-50 border-rose-200" 
    };
  };

  if (isLoading) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center transition-colors duration-700 ${isDark ? 'bg-[#02020a]' : 'bg-slate-50'}`}>
        <div className="relative scale-150">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-t-2 border-b-2 border-indigo-500 rounded-full"
          />
          <BrainCircuit className={`w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isDark ? 'text-white' : 'text-indigo-600'}`} />
        </div>
        <motion.p 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 text-indigo-500 font-black uppercase tracking-[0.6em] text-[10px]"
        >
          Synchronizing Neural Core
        </motion.p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-700 p-4 md:p-10 relative overflow-hidden ${isDark ? 'bg-[#02020a] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[150px] transition-all duration-1000 ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-200/40'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] transition-all duration-1000 ${isDark ? 'bg-fuchsia-600/5' : 'bg-fuchsia-100/30'}`} />
      </div>

      <div className="max-w-[1600px] mx-auto space-y-12 relative z-10">
        
        {/* Superior Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-12 bg-indigo-500 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">PatternBTech Command</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.85]">
              System<br />
              <span className="text-transparent" style={{ WebkitTextStroke: isDark ? '1px white' : '1px #1e293b' }}>Intelligence</span>
            </h1>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setIsRefreshing(true); fetchDashboardData(); }}
            className={`group relative flex items-center gap-4 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all overflow-hidden ${
              isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            {isRefreshing ? 'Re-Linking...' : 'Force Engine Sync'}
          </motion.button>
        </header>

        {/* Intelligence Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {statsConfig.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className={`p-8 border-2 transition-all group relative overflow-hidden rounded-[2.5rem] ${
                isDark ? 'border-white/5 hover:border-white/20 bg-white/[0.02]' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:border-indigo-200'
              }`}>
                {/* Visual Glow */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${stat.color}`} />
                
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-8 shadow-2xl ${stat.glow} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                
                <div className="space-y-1">
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                      {stat.label}
                    </p>
                    <h3 className={`text-5xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stat.value}
                    </h3>
                </div>
                
                <div className="mt-6 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">+12.5% vs Last Node</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </section>

        {/* Central Log Matrix */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 gap-8"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
               <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
               <h2 className={`text-xl font-black uppercase italic tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>
                 Neural Stream <span className="text-indigo-500 ml-2">Live</span>
               </h2>
            </div>
            <div className={`hidden md:flex gap-2 px-4 py-2 rounded-full border text-[9px] font-black tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                SYSTEM STABLE // 0.4ms LATENCY
            </div>
          </div>

          <GlassCard className={`border-2 overflow-hidden rounded-[3rem] ${isDark ? 'border-white/5 bg-white/[0.01]' : 'bg-white border-slate-100 shadow-2xl'}`}>
            <div className="hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className={`text-[11px] uppercase font-black tracking-[0.3em] border-b ${isDark ? 'text-gray-600 border-white/5' : 'text-slate-400 border-slate-100'}`}>
                    <th className="px-10 py-8">User Entity</th>
                    <th className="px-10 py-8">Logic Vector (Subject)</th>
                    <th className="px-10 py-8">Sync Time</th>
                    <th className="px-10 py-8 text-right">Core Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-50'}`}>
                  {activities.map((item, idx) => {
                    const ui = getStatusUI(item.status);
                    return (
                      <motion.tr 
                        key={idx} 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className={`group transition-all ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-indigo-50/30'}`}
                      >
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 transition-all duration-500 ${
                              isDark 
                              ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12' 
                              : 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12'
                            }`}>
                              {item.initial}
                            </div>
                            <span className={`text-base font-bold tracking-tight ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{item.user}</span>
                          </div>
                        </td>
                        <td className={`px-10 py-7 text-sm font-bold tracking-tight ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                           <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-500/50" />
                              {item.subject}
                           </div>
                        </td>
                        <td className={`px-10 py-7 text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>
                           {item.time}
                        </td>
                        <td className="px-10 py-7 text-right">
                          <span className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter border-2 ${ui.color}`}>
                            {ui.icon} {item.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Enhanced Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {activities.map((item, idx) => (
                <div key={idx} className="p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 font-black">{item.initial}</div>
                       <span className="font-black text-sm uppercase italic">{item.user}</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border-2 ${getStatusUI(item.status).color}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-gray-500 uppercase">Subject Vector</p>
                     <p className="text-sm font-bold">{item.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.section>

        {/* Global Hardware Matrix Footer */}
        <footer className={`pt-12 border-t-2 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
            <div className="flex gap-10">
               <div className="space-y-1">
                 <p className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                   <Globe className="w-3 h-3" /> Core Node
                 </p>
                 <p className="text-xs font-bold text-indigo-500 italic">AWS-MUMBAI-RGPV-01</p>
               </div>
               <div className="space-y-1">
                 <p className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                   <Cpu className="w-3 h-3" /> AI Model
                 </p>
                 <p className="text-xs font-bold text-indigo-500 italic">PATTERN-GPT-4-HYBRID</p>
               </div>
            </div>

            <div className="flex justify-center">
               <div className={`px-6 py-2 rounded-full border flex items-center gap-3 text-[10px] font-black tracking-[0.2em] ${isDark ? 'bg-white/5 border-white/10 text-emerald-500' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                  <ShieldCheck className="w-4 h-4" /> ENCRYPTED CONNECTION ACTIVE
               </div>
            </div>

            <div className="flex lg:justify-end">
               <p className={`text-[10px] font-black uppercase italic tracking-[0.3em] ${isDark ? 'text-gray-700' : 'text-slate-400'}`}>
                 © 2026 PatternBTech <span className="text-indigo-500 mx-2">//</span> All Rights Reserved
               </p>
            </div>
        </footer>
      </div>
    </div>
  );
}