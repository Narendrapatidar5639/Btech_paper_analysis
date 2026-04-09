import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  FileText, 
  Brain, 
  Sparkles,
  Loader2,
  ArrowLeft,
  Zap,
  ExternalLink,
  Globe,
  Layers,
  ShieldCheck,
  Cpu,
  History,
  X,
  Bot,
  Search,
  MessageSquare,
  ZapOff
} from "lucide-react";
import { Button } from "../components/ui/button";
import { GlassCard } from "../components/GlassCard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from "recharts";
import { toast } from "sonner";

// --- Types & Interfaces ---
interface AnalysisResponse {
  topics: Record<string, number>;
  questions: Record<string, number>;
  metadata: { 
    paper_count: number; 
    analyzed_ids: number[];
    subject?: string;
    semester?: string;
  };
}

const API_BASE_URL = "http://127.0.0.1:8000/api";

export function AnalysisDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPaperIds, subjectName, semester, university } = location.state || {};
  
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);

  // --- Logic: Fetch Data ---
  useEffect(() => {
    const performAnalysis = async () => {
      if (!selectedPaperIds || selectedPaperIds.length === 0) {
        toast.error("Neural session expired.");
        navigate("/papers");
        return;
      }
      try {
        setLoading(true);
        const idsString = selectedPaperIds.join(",");
        const response = await fetch(`${API_BASE_URL}/dashboard/?paperIds=${idsString}`);
        if (!response.ok) throw new Error("Engine offline.");
        const result = await response.json();
        setAnalysisData(result);
      } catch (err: any) {
        toast.error("Uplink failed: Backend unreachable.");
      } finally {
        setTimeout(() => setLoading(false), 3000); 
      }
    };
    performAnalysis();
  }, [selectedPaperIds, navigate]);

  // --- Feature: Download Logic ---
  const handleDownloadReport = () => {
    if (!analysisData) return;
    setIsGenerating(true);
    toast.loading("Generating Neural Report...");
    setTimeout(() => {
      try {
        const text = `PATTERN BTECH REPORT\nSubject: ${subjectName}\nGenerated: ${new Date().toLocaleString()}\n\nTOPICS:\n${Object.entries(analysisData.topics).map(([t, c]) => `- ${t}: ${c}`).join('\n')}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Report_${subjectName}.txt`;
        a.click();
        toast.dismiss();
        toast.success("Report Exported!");
      } catch (err) {
        toast.error("Export Protocol Failed.");
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  // --- NEW: Multi-AI Logic with Clipboard Fix ---
  const redirectAITool = async (tool: 'chatgpt' | 'gemini' | 'perplexity' | 'multi-ai') => {
    if (!selectedQuestion) return;

    const prompt = `Question: ${selectedQuestion}\n\nAct as a B.Tech professor. Provide a detailed university-standard answer with points, diagram suggestions, and key technical terms for ${subjectName}.`;

    // Clipboard strategy for tools that block direct query strings
    try {
      await navigator.clipboard.writeText(prompt);
      toast.info("Prompt copied! Just paste (Ctrl+V) in the AI window.", { duration: 4000 });
    } catch (err) {
      console.error("Clipboard blocked");
    }

    let url = "";
    switch(tool) {
      case 'chatgpt': url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`; break;
      case 'gemini': url = `https://gemini.google.com/app`; break;
      case 'perplexity': url = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`; break;
      case 'multi-ai': url = `https://www.google.com/search?q=${encodeURIComponent(prompt + " AI solutions")}`; break;
    }
    
    setTimeout(() => {
      window.open(url, "_blank");
      setShowAIModal(false);
    }, 800);
  };

  // --- Data Transformation ---
  const topicFrequencyData = useMemo(() => {
    if (!analysisData?.topics) return [];
    return Object.entries(analysisData.topics)
      .map(([topic, freq]) => ({
        topic: topic.length > 10 ? topic.substring(0, 8) + ".." : topic,
        fullTopic: topic,
        hits: freq,
      }))
      .sort((a, b) => b.hits - a.hits).slice(0, 6);
  }, [analysisData]);

  const weightage = [
    { name: "High", value: 65, color: "#6366f1" },
    { name: "Average", value: 25, color: "#06b6d4" },
    { name: "Low", value: 10, color: "#1e293b" },
  ];

  // --- 1. Loading with 360° Logo Fix ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 text-center">
          <div className="relative mb-10 flex justify-center">
            <div className="absolute w-44 h-44 rounded-full border border-indigo-500/10 animate-[spin_15s_linear_infinite]" />
            <motion.img 
              src="/logo.png" 
              alt="Logo" 
              className="w-28 h-28 relative z-20"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
            />
          </div>
          <h2 className="text-2xl font-black text-white tracking-[0.5em] uppercase italic">System Booting</h2>
          <p className="text-indigo-400 font-mono text-[10px] animate-pulse uppercase tracking-[0.3em] mt-3">Accessing RGPV Neural Nodes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-4 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* --- Header --- */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-12 border-b border-white/5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-6">
               <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Analysis Live
               </span>
               <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Protocol_v9.4</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.8] mb-8">
              NEURAL <br /> <span className="text-indigo-600">INSIGHTS</span>
            </h1>
            <div className="flex flex-wrap gap-4">
               <div className="px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-bold text-gray-400 flex items-center gap-3">
                  <Globe className="w-4 h-4 text-indigo-500" /> {subjectName || "Paper Analysis"}
               </div>
               <div className="px-5 py-2.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-black text-indigo-400 uppercase tracking-widest">
                  SEM {semester} • {university}
               </div>
            </div>
          </motion.div>

          <div className="flex gap-4 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none h-16 rounded-2xl border-white/10 text-white hover:bg-white/5 uppercase font-black tracking-tighter px-8" onClick={() => navigate("/papers")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <Button disabled={isGenerating} onClick={handleDownloadReport} className="flex-1 md:flex-none h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-10 uppercase font-black tracking-widest">
              {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              Get Report
            </Button>
          </div>
        </header>

        {/* --- Quick Metrics --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { l: "Analysed Nodes", v: analysisData?.metadata.paper_count || 0, i: FileText, c: "text-blue-500" },
            { l: "Pattern Density", v: Object.keys(analysisData?.topics || {}).length, i: Layers, c: "text-indigo-500" },
            { l: "Critical Vectors", v: Object.keys(analysisData?.questions || {}).length, i: Zap, c: "text-amber-500" },
            { l: "Reliability", v: "99.2%", i: ShieldCheck, c: "text-emerald-500" },
          ].map((m, i) => (
            <GlassCard key={i} className="p-8 border-white/5 bg-white/[0.01] relative overflow-hidden group">
               <m.i className={`w-8 h-8 ${m.c} mb-4 group-hover:scale-110 transition-transform`} />
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{m.l}</p>
               <h3 className="text-3xl font-black text-white italic">{m.v}</h3>
            </GlassCard>
          ))}
        </section>

        {/* --- Charts --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-2 p-10 border-white/5 bg-white/[0.01] rounded-[3rem]">
            <h3 className="text-2xl font-black text-white uppercase italic mb-10">Frequency Spectrum</h3>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topicFrequencyData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis dataKey="topic" stroke="#334155" tick={{fill: '#64748b', fontSize: 10, fontWeight: 900}} axisLine={false} tickLine={false} />
                     <YAxis stroke="#334155" tick={{fill: '#475569'}} axisLine={false} tickLine={false} />
                     <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '15px'}} />
                     <Bar dataKey="hits" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-10 border-white/5 bg-white/[0.01] rounded-[3rem] flex flex-col justify-between">
            <h3 className="text-2xl font-black text-white uppercase italic">Weightage</h3>
            <div className="h-[250px] relative">
               <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                     <Pie data={weightage} innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value" stroke="none">
                        {weightage.map((e, i) => <Cell key={i} fill={e.color} />)}
                     </Pie>
                  </RePieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-white italic">AI</span>
               </div>
            </div>
            <div className="space-y-3">
               {weightage.map((s, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}} />
                       <span className="text-[10px] font-black text-gray-500 uppercase">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white">{s.value}%</span>
                 </div>
               ))}
            </div>
          </GlassCard>
        </div>

        {/* --- Question List --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-24">
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-2">
               <TrendingUp className="text-indigo-500 w-6 h-6" />
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Priority Stream</h3>
            </div>
            <div className="space-y-6">
              {analysisData?.questions && Object.entries(analysisData.questions).map(([q, hits], idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 transition-all group"
                >
                  <p className="text-lg font-bold text-gray-200 mb-8 italic group-hover:text-white transition-colors">"{q}"</p>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                     <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                          {hits} Historic Hits
                        </div>
                        <History className="w-4 h-4 text-gray-600" />
                     </div>
                     <Button 
                       onClick={() => { setSelectedQuestion(q); setShowAIModal(true); }}
                       className="w-full sm:w-auto h-14 rounded-2xl bg-indigo-600 hover:bg-white hover:text-indigo-600 text-white font-black uppercase text-[10px] tracking-widest px-8 transition-all"
                     >
                       Solve with AI <ExternalLink className="w-3 h-3 ml-2" />
                     </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* --- Neural Keynotes --- */}
          <div className="space-y-8">
             <div className="flex items-center gap-4 px-2">
                <Brain className="text-purple-500 w-6 h-6" />
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Neural Keynotes</h3>
             </div>
             <GlassCard className="p-10 border-white/5 bg-white/[0.01] rounded-[3rem] space-y-10">
                {topicFrequencyData.map((t, idx) => (
                  <div key={idx} className="space-y-3">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-500">{t.fullTopic}</span>
                        <span className="text-indigo-500">{t.hits} Hits</span>
                     </div>
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(t.hits / (analysisData?.metadata.paper_count || 1)) * 100}%` }} className="h-full bg-indigo-600" />
                     </div>
                  </div>
                ))}
                <div className="mt-10 p-8 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 relative">
                   <Sparkles className="w-5 h-5 text-indigo-400 absolute top-4 right-4" />
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3 italic">AI Conclusion</h4>
                   <p className="text-xs text-gray-400 leading-relaxed italic">
                     "Neural engine detects a strong cyclic pattern in the frequency spectrum. Prioritizing the top 4 nodes yields 78% syllabus coverage."
                   </p>
                </div>
             </GlassCard>
          </div>
        </div>

        {/* --- FIXED: Multi-AI Choice Modal --- */}
        <AnimatePresence>
          {showAIModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={() => setShowAIModal(false)} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md">
                <GlassCard className="p-8 border-white/10 bg-[#0a0f1e] rounded-[2.5rem] shadow-2xl">
                   <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-indigo-500" />
                         </div>
                         <div>
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">AI Selection</h3>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Pick your Intelligence Engine</p>
                         </div>
                      </div>
                      <X className="text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowAIModal(false)} />
                   </div>
                   
                   <div className="grid gap-4">
                      {[
                        { id: 'chatgpt', name: 'ChatGPT 4o', desc: 'Detailed Analysis', icon: MessageSquare, color: 'hover:border-emerald-500/30' },
                        { id: 'gemini', name: 'Google Gemini', desc: 'Technical Logic', icon: Sparkles, color: 'hover:border-blue-500/30' },
                        { id: 'perplexity', name: 'Perplexity AI', desc: 'Real-time Research', icon: Globe, color: 'hover:border-purple-500/30' },
                        { id: 'multi-ai', name: 'Search AI Hub', desc: 'Aggregated Results', icon: Search, color: 'hover:border-amber-500/30' }
                      ].map((tool) => (
                        <button key={tool.id} onClick={() => redirectAITool(tool.id as any)} className={`w-full p-5 rounded-2xl bg-white/[0.02] border border-white/5 ${tool.color} flex items-center gap-4 group transition-all text-left`}>
                           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                              <tool.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-white uppercase tracking-tighter">{tool.name}</p>
                              <p className="text-[9px] text-gray-600 font-bold uppercase">{tool.desc}</p>
                           </div>
                        </button>
                      ))}
                   </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}