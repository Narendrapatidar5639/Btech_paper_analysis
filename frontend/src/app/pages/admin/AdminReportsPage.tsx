import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOutletContext } from "react-router"; 
import { FileText, Download, Eye, Calendar, BarChart3, Loader2, Zap } from "lucide-react";
import { Button } from "../../components/ui/button";
import { GlassCard } from "../../components/GlassCard";
import { toast } from "sonner";

interface Report {
  id: number;
  title: string;
  university: string;
  semester: string;
  date: string;
  papers: number;
  status: string;
}

interface UploadedPaper {
  id: number;
  name: string;
  university: string;
  uploadDate: string;
  pages: string;
  url: string;
}

export function AdminReportsPage() {
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>();
  const isDark = theme === 'dark';

  const [reports, setReports] = useState<Report[]>([]);
  const [uploadedPapers, setUploadedPapers] = useState<UploadedPaper[]>([]);
  const [stats, setStats] = useState({ totalReports: "0", totalPapers: "0", thisMonth: "0" });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {//const API_BASE_URL = "https://pattern-btech-backend.onrender.com/api";
      const response = await fetch("https://pattern-btech-backend.onrender.com/api/admin/reports/");
      const data = await response.json();
      if (response.ok) {
        setReports(data.reports);
        setUploadedPapers(data.uploadedPapers);
        setStats({
          totalReports: data.stats.totalReports.toString(),
          totalPapers: data.stats.totalPapers.toString(),
          thisMonth: data.stats.thisMonth.toString(),
        });
      }
    } catch (error) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDownload = (url: string, title: string) => {
    window.open(url, "_blank");
    toast.success(`Accessing ${title} dataset`);
  };

  const getStatusStyle = (status: string) => {
    const isCompleted = status.toLowerCase() === "completed";
    if (isDark) {
      return isCompleted ? "text-green-400 bg-green-400/10 border-green-500/20" : "text-yellow-400 bg-yellow-400/10 border-yellow-500/20";
    }
    return isCompleted ? "text-green-700 bg-green-100 border-green-200" : "text-yellow-700 bg-yellow-100 border-yellow-200";
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className={`text-xs font-black uppercase tracking-[0.3em] ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Loading Neural Data...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/70">Analytics Engine</span>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
          System<span className="text-indigo-500">Reports</span>
        </h1>
        <p className={`mt-2 font-medium ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Real-time monitoring of NLP processing and paper ingestion.</p>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: FileText, label: "Total Reports", value: stats.totalReports, color: "from-indigo-600 to-violet-600" },
          { icon: BarChart3, label: "Uploaded Papers", value: stats.totalPapers, color: "from-fuchsia-600 to-pink-600" },
          { icon: Calendar, label: "Cycles This Month", value: stats.thisMonth, color: "from-blue-600 to-cyan-600" },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
              <GlassCard className={`p-6 border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-white shadow-xl shadow-slate-200/50'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-slate-300'}`}>Live Node</div>
                </div>
                <div className={`text-4xl font-black italic tracking-tighter mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</div>
                <div className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className={`p-8 border ${isDark ? 'border-white/5' : 'border-slate-200 bg-white shadow-xl'}`}>
            <h2 className={`text-xl font-black uppercase italic tracking-tighter mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Generated Analysis Reports</h2>
            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div key={report.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.05 }}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                    isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                  }`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{report.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>{report.university}</span>
                        <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                        <span>Sem {report.semester}</span>
                        <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                        <span>{report.papers} Datasets</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(report.status)}`}>
                      {report.status}
                    </span>
                    <Button variant="ghost" size="sm" className={`rounded-xl font-bold text-[10px] uppercase tracking-widest ${isDark ? 'hover:bg-indigo-500/20 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'}`}>
                      <Eye className="w-4 h-4 mr-2" /> Inspect
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Papers Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard className={`p-8 border overflow-hidden ${isDark ? 'border-white/5' : 'border-slate-200 bg-white shadow-xl'}`}>
            <h2 className={`text-xl font-black uppercase italic tracking-tighter mb-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Dataset Ingestion</h2>
            <div className="overflow-x-auto overflow-hidden rounded-2xl border border-transparent">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-white/5 text-gray-500' : 'bg-slate-50 text-slate-400'}`}>
                    <th className="py-4 px-6">Source Name</th>
                    <th className="py-4 px-6">Mapping</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-transparent">
                  {uploadedPapers.map((paper) => (
                    <tr key={paper.id} className={`transition-colors border-b ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <td className={`py-5 px-6 text-sm font-bold ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{paper.name}</td>
                      <td className="py-5 px-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-md">
                          {paper.university}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button 
                          onClick={() => handleDownload(paper.url, paper.name)} 
                          className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-indigo-500/20 text-indigo-400' : 'bg-slate-100 hover:bg-indigo-50 text-indigo-600'}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}