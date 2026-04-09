import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FileText, 
  Sparkles, 
  ArrowLeft 
} from "lucide-react";
import { Button } from "../components/ui/button";
import { GlassCard } from "../components/GlassCard";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext"; // Auth context import kiya

interface Paper {
  id: number;
  display_name: string; 
  pdf_file: string;
}

const API_BASE_URL = "http://127.0.0.1:8000/api";
const MEDIA_BASE_URL = "http://127.0.0.1:8000/media/";

export function PapersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectionData = location.state || {};
  const { user } = useAuth(); // Logged in user ki details lene ke liye
  
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPapers, setSelectedPapers] = useState<number[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- THEME LOGIC ---
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  // --- FETCH PAPERS ---
  useEffect(() => {
    const fetchPapers = async () => {
      if (!selectionData.university || !selectionData.branch || !selectionData.subject) {
        toast.error("Session expired.");
        navigate("/selection");
        return;
      }
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          university: String(selectionData.university),
          branch: String(selectionData.branch),
          semester: String(selectionData.semester),
          subject: String(selectionData.subject)
        });

        const response = await fetch(`${API_BASE_URL}/papers/?${queryParams.toString()}`);
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        setPapers(data);
      } catch (error) {
        toast.error("Connection Error");
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchPapers();
  }, [selectionData, navigate]);

  const getFullFileUrl = (filePath: string) => filePath.startsWith('http') ? filePath : `${MEDIA_BASE_URL}${filePath}`;

  const togglePaperSelection = (paperId: number) => {
    setSelectedPapers((prev) => prev.includes(paperId) ? prev.filter((id) => id !== paperId) : [...prev, paperId]);
  };

  // --- NEW LOGIC: SEND DATA TO BACKEND BEFORE ANALYSIS ---
  const handleStartAnalysis = async () => {
    if (selectedPapers.length === 0) return toast.error("Select papers first");

    // 1. User details extract karein (Navbar wali logic use ki hai)
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUser = user || localUser;
    const userName = currentUser?.full_name || currentUser?.displayName || "Neural User";

    // 2. Data object taiyar karein jo Admin side ko chahiye
    const analysisPayload = {
      user_name: userName,
      subject_name: selectionData.subjectName || "Unknown Subject",
      semester: selectionData.semester,
      paper_count: selectedPapers.length,
      timestamp: new Date().toLocaleTimeString(), // Backend ko time bhejne ke liye
      status: "Processing"
    };

    try {
      // Toast dikhayein ki engine start ho raha hai
      toast.loading("Initializing Neural Engine...", { id: "analysis-load" });

      // 3. Backend API call (Admin Activity record karne ke liye)
      // Note: Is endpoint ko aapne backend mein handle karna hai
      const logResponse = await fetch(`${API_BASE_URL}/admin/activity-log/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysisPayload),
      });

      if (logResponse.ok) {
        toast.success("Identity Verified. Analysis Started.", { id: "analysis-load" });
      }

      // 4. Sab sahi hone par dashboard par bhej dein
      navigate("/dashboard", { 
        state: { 
          ...selectionData, 
          selectedPaperIds: selectedPapers,
          userName: userName // Dashboard ko bhi user name bhej rahe hain
        } 
      });

    } catch (error) {
      console.error("Sync Error:", error);
      // Agar backend sync fail bhi ho jaye, tab bhi user ko analysis dikhna chahiye
      toast.dismiss("analysis-load");
      navigate("/dashboard", { state: { ...selectionData, selectedPaperIds: selectedPapers } });
    }
  };

  // --- LOADING UI (RETAINED AS PER YOUR REQUEST) ---
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-700 ${isDarkMode ? 'bg-[#02020a]' : 'bg-gray-50'}`}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10 relative z-10">
          <div className="relative flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute w-48 h-48 bg-indigo-500/30 blur-[60px] rounded-full" />
            <motion.div 
              className="w-32 h-32 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center p-5 backdrop-blur-md"
              animate={{ rotateY: [0, 180, 360], rotateZ: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
            >
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain pointer-events-none brightness-125" />
            </motion.div>
          </div>
          <div className="space-y-4">
            <motion.h2 animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className={`font-black italic uppercase tracking-[0.5em] text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Synchronizing Neural Archive
            </motion.h2>
            <div className="w-48 h-[1px] bg-gray-800/30 mx-auto overflow-hidden relative rounded-full">
              <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" animate={{ x: ["-100%", "300%"] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen transition-colors duration-700 overflow-x-hidden ${isDarkMode ? 'bg-[#02020a] text-white' : 'bg-white text-slate-900'}`}>
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-200/30'}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <button onClick={() => navigate("/selection")} className="mb-8 flex items-center text-[11px] font-black uppercase tracking-[0.3em] opacity-60 hover:opacity-100 transition-all group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-2 transition-transform" /> Back to Terminal
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">
                Neural <br />
                <span className="text-transparent" style={{ WebkitTextStroke: isDarkMode ? '1.5px white' : '1.5px black' }}>Archive</span>
              </h1>
              <p className={`text-[12px] font-bold uppercase tracking-[0.4em] flex items-center gap-4 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                <span className="w-12 h-[2px] bg-indigo-500" />
                {selectionData.subjectName || "Subject"} • SEM {selectionData.semester}
              </p>
            </div>
            <Button 
              onClick={handleStartAnalysis} 
              disabled={selectedPapers.length === 0} 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic tracking-widest h-20 px-12 rounded-2xl shadow-2xl transition-all disabled:opacity-20"
            >
              <Sparkles className="w-6 h-6 mr-3" /> Analyze ({selectedPapers.length})
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {papers.map((paper, index) => (
            <motion.div key={paper.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <GlassCard className={`p-8 cursor-pointer border-2 transition-all duration-500 rounded-[2.5rem] ${selectedPapers.includes(paper.id) ? "border-indigo-500 bg-indigo-500/10" : isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`} onClick={() => togglePaperSelection(paper.id)}>
                <div className="flex items-center justify-between mb-10">
                  <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${selectedPapers.includes(paper.id) ? "bg-indigo-500 border-indigo-500 rotate-12" : "border-gray-500/20"}`}>
                    {selectedPapers.includes(paper.id) && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                  <FileText className="w-6 h-6 text-gray-500" />
                </div>
                <h3 className={`text-2xl font-black uppercase italic tracking-tight leading-[1.1] mb-12 min-h-[5rem] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{paper.display_name}</h3>
                <div className="flex gap-4">
                  <Button variant="secondary" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase" onClick={(e) => { e.stopPropagation(); window.open(getFullFileUrl(paper.pdf_file), "_blank"); }}>View</Button>
                  <Button variant="secondary" className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase" onClick={(e) => { e.stopPropagation(); window.open(getFullFileUrl(paper.pdf_file), "_blank"); }}>PDF</Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}