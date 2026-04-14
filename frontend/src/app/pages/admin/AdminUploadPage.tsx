import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router"; // Layout se theme lene ke liye
import { Upload, File as FileIcon, X, CheckCircle, PlusCircle, Database, Layout } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { GlassCard } from "../../components/GlassCard";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";

interface DropdownItem {
  id: number;
  name: string;
}

export function AdminUploadPage() {
  // Layout se theme access kar rahe hain
  const { theme } = useOutletContext<{ theme: 'light' | 'dark' }>();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({ university: "", course: "", semester: "", subject: "" });
  const [universities, setUniversities] = useState<DropdownItem[]>([]);
  const [courses, setCourses] = useState<DropdownItem[]>([]);
  const [subjects, setSubjects] = useState<DropdownItem[]>([]);
  const [showAddNew, setShowAddNew] = useState<{ type: string; value: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  // API Logic (Same as before)
  const fetchMetadata = async () => {
    try {//const API_BASE_URL = "https://pattern-btech-backend.onrender.com/api";
      const response = await fetch("https://pattern-btech-backend.onrender.com/api/selection-metadata/");
      const data = await response.json();
      setUniversities(data.universities || []);
      setCourses(data.branches || []);
    } catch (error) {
      toast.error("Cloud Metadata Sync Failed");
    }
  };

  useEffect(() => { fetchMetadata(); }, []);

  useEffect(() => {
    if (formData.course && formData.semester) {//const API_BASE_URL = "https://pattern-btech-backend.onrender.com/api";
      fetch(`https://pattern-btech-backend.onrender.com/api/get-subjects/?branch=${formData.course}&semester=${formData.semester}`)
        .then(res => res.json())
        .then(data => setSubjects(data));
    }
  }, [formData.course, formData.semester]);

  const handleCreateNew = async () => {
    if (!showAddNew?.value) return;
    try {
      const response = await fetch("https://pattern-btech-backend.onrender.com/api/admin/create-metadata/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: showAddNew.type,
          name: showAddNew.value,
          branch_id: formData.course,
          semester: formData.semester
        })
      });
      if (response.ok) {
        toast.success(`Database updated: ${showAddNew.type} added.`);
        await fetchMetadata();
        setShowAddNew(null);
      }
    } catch (error) { toast.error("Database Write Failed"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.university || !formData.course || !formData.semester || !formData.subject) {
      toast.error("Please provide full neural mapping (fill all fields)"); return;
    }
    setIsUploading(true);
    setUploadProgress(20);
    
    const data = new FormData();
    data.append("university", formData.university);
    data.append("branch", formData.course);
    data.append("semester", formData.semester);
    data.append("subject", formData.subject);
    selectedFiles.forEach(f => data.append("files", f));

    try {
      const res = await fetch("https://pattern-btech-backend.onrender.com/api/admin/upload/", { method: "POST", body: data });
      if (res.ok) {
        setUploadProgress(100);
        toast.success("Dataset published to PatternBTech Cloud!");
        setSelectedFiles([]);
        setFormData({ ...formData, subject: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (err) { toast.error("Transmission Interrupted"); }
    finally { setTimeout(() => { setIsUploading(false); setUploadProgress(0); }, 1500); }
  };

  // --- DYNAMIC STYLES BASED ON THEME ---
  const selectClassName = `w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer transition-all font-bold text-sm ${
    isDark 
    ? "bg-white/5 border-white/10 text-white focus:border-indigo-500" 
    : "bg-slate-100 border-slate-200 text-slate-800 focus:border-indigo-600"
  }`;

  const optionClassName = isDark ? "bg-[#1a1a2e] text-white" : "bg-white text-slate-900";

  return (
    <div className="relative min-h-[85vh]">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/70">Dataset Management</span>
        </div>
        <h1 className={`text-4xl md:text-5xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Neural<span className="text-indigo-500">Upload</span>
        </h1>
        <p className={`mt-2 font-medium ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Integrate new question patterns into the analysis engine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2">
          <GlassCard className={`p-8 border ${isDark ? 'border-white/5 shadow-2xl' : 'border-slate-200 shadow-xl shadow-slate-200/50'}`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Reusable Select Field Logic */}
                {[
                  { label: "Target University", key: "university", data: universities, type: "university" },
                  { label: "Branch Vector", key: "course", data: courses, type: "branch" },
                ].map((field) => (
                  <div key={field.key} className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <Label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{field.label}</Label>
                      <button type="button" onClick={() => setShowAddNew({ type: field.type, value: '' })} className="text-[10px] font-bold text-indigo-500 flex items-center hover:underline">
                        <PlusCircle className="w-3 h-3 mr-1" /> New Entry
                      </button>
                    </div>
                    <select 
                      value={(formData as any)[field.key]} 
                      onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                      className={selectClassName}
                    >
                      <option value="" className={optionClassName}>Select Entity</option>
                      {field.data.map(u => <option key={u.id} value={u.id} className={optionClassName}>{u.name}</option>)}
                    </select>
                  </div>
                ))}

                <div className="space-y-3">
                  <Label className={`text-[10px] px-1 font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Semester</Label>
                  <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className={selectClassName}>
                    <option value="" className={optionClassName}>Select Phase</option>
                    {semesters.map(s => <option key={s} value={s} className={optionClassName}>Semester {s}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <Label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Subject Node</Label>
                    <button type="button" onClick={() => setShowAddNew({ type: 'subject', value: '' })} className="text-[10px] font-bold text-indigo-500 flex items-center hover:underline">
                      <PlusCircle className="w-3 h-3 mr-1" /> New Node
                    </button>
                  </div>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className={selectClassName}>
                    <option value="" className={optionClassName}>Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id} className={optionClassName}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* PDF Upload Area */}
              <div className="space-y-4">
                <Label className={`text-[10px] px-1 font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Source Datasets (PDF)</Label>
                <div className={`border-2 border-dashed p-12 rounded-3xl text-center transition-all group relative overflow-hidden ${
                  isDark ? 'border-white/10 bg-white/[0.02] hover:border-indigo-500/50' : 'border-slate-200 bg-slate-50 hover:border-indigo-400'
                }`}>
                  <input type="file" ref={fileInputRef} multiple accept=".pdf" onChange={e => e.target.files && setSelectedFiles(Array.from(e.target.files))} className="hidden" id="file-up" />
                  <label htmlFor="file-up" className="cursor-pointer relative z-10">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className={`text-xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Ingest Files</p>
                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">Multi-PDF Support Active</p>
                  </label>
                </div>
              </div>

              {/* File Preview */}
              <AnimatePresence>
                {selectedFiles.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((f, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight border ${
                          isDark ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          <FileIcon className="w-3 h-3 text-indigo-500" />
                          <span className="truncate max-w-[120px]">{f.name}</span>
                          <X className="w-3 h-3 cursor-pointer hover:text-rose-500" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isUploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
                    <span className="animate-pulse">Uploading to Core...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2 bg-indigo-500/10" />
                </div>
              )}

              <Button type="submit" className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 rounded-2xl transition-all active:scale-95" disabled={isUploading}>
                {isUploading ? "Neural Transmission in Progress..." : "Finalize & Publish"}
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* Sidebar Status Card */}
        <div className="space-y-6">
            <GlassCard className={`p-6 border-l-4 border-indigo-500 ${isDark ? 'bg-indigo-500/5 border-white/5' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-black uppercase tracking-widest text-[11px] mb-4 flex items-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <CheckCircle className="w-4 h-4 mr-2 text-indigo-500" /> Upload Protocol
              </h3>
              <ul className="space-y-4">
                {[
                  "Ensure PDF clarity for high-accuracy NLP analysis.",
                  "Branch must be mapped before adding new subjects.",
                  "Semantic tagging occurs automatically after upload."
                ].map((text, i) => (
                  <li key={i} className="text-[11px] font-medium text-gray-500 flex gap-3 leading-relaxed">
                    <span className="text-indigo-500 font-black">0{i+1}.</span> {text}
                  </li>
                ))}
              </ul>
            </GlassCard>
        </div>
      </div>

      {/* Modern Modal for New Entries */}
      <AnimatePresence>
        {showAddNew && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md">
              <GlassCard className={`p-10 border shadow-2xl ${isDark ? 'border-indigo-500/30' : 'bg-white border-slate-200'}`}>
                <h2 className={`text-2xl font-black uppercase italic tracking-tighter mb-6 flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <PlusCircle className="mr-3 text-indigo-500 w-6 h-6" /> New <span className="ml-2 text-indigo-500">{showAddNew.type}</span>
                </h2>
                <div className="space-y-4">
                    <Label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>System Label</Label>
                    <input 
                      autoFocus
                      className={`w-full px-5 py-4 rounded-2xl font-bold border transition-all outline-none ${
                        isDark ? 'bg-white/5 border-white/10 text-white focus:border-indigo-500' : 'bg-slate-100 border-slate-200 text-slate-800 focus:border-indigo-600'
                      }`}
                      placeholder={`Enter ${showAddNew.type} name...`}
                      value={showAddNew.value}
                      onChange={e => setShowAddNew({ ...showAddNew, value: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleCreateNew()}
                    />
                </div>
                <div className="flex gap-4 mt-10">
                  <Button onClick={() => setShowAddNew(null)} className={`flex-1 h-12 text-[10px] font-black uppercase tracking-widest rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>Abort</Button>
                  <Button onClick={handleCreateNew} className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20">Sync to DB</Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}