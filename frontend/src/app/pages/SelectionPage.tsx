import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Loader2,
  ChevronDown,
  Lock,
  Star
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { GlassCard } from "../components/GlassCard";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
// Assuming you have a theme context, if not, it will default to dark logic
// import { useTheme } from "../contexts/ThemeContext";

const API_BASE_URL = "https://pattern-btech-backend.onrender.com/api";

const TESTIMONIALS = [
  { id: 1, name: "Rahul Sharma", role: "CS Student", text: "PatternBTech made my RGPV exam prep so much easier!" },
  { id: 2, name: "Ananya Verma", role: "IT Student", text: "The NLP analysis is spot on. Highly recommended for PYQs." },
  { id: 3, name: "Deepak Gill", role: "EC Student", text: "Saved me weeks of manual paper searching. Great UI!" },
  { id: 4, name: "Sneha Kapoor", role: "ME Student", text: "Finally a portal that understands engineering syllabus." },
  { id: 5, name: "Vikas Raj", role: "EE Student", text: "The Glassmorphism design looks amazing and works fast." },
];

export function SelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const { theme } = useTheme(); // Use this if you have a theme provider

  const [loading, setLoading] = useState(false);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    university: "",
    branch: "", 
    semester: "",
    subject: "",
  });

  const [options, setOptions] = useState({
    universities: [] as any[],
    branches: [] as any[],
    semesters: ["1", "2", "3", "4", "5", "6", "7", "8"],
    subjects: [] as any[],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch("https://pattern-btech-backend.onrender.com/api/selection-metadata/", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Failed to fetch initial data");
        const data = await response.json();
        setOptions(prev => ({
          ...prev,
          universities: data.universities || [],
          branches: data.branches || []
        }));
      } catch (error) {
        toast.error("Failed to load university data");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (formData.branch && formData.semester) {
        setSubjectsLoading(true);
        try {
          const response = await fetch(
            `${API_BASE_URL}/get-subjects/?branch=${formData.branch}&semester=${formData.semester}`,
            { method: "GET", credentials: "include" }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setOptions((prev) => ({ ...prev, subjects: data || [] }));
        } catch (error) {
          setOptions((prev) => ({ ...prev, subjects: [] }));
          toast.error("No subjects found for this selection");
        } finally {
          setSubjectsLoading(false);
        }
      }
    };
    fetchSubjects();
  }, [formData.branch, formData.semester]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to continue");
      navigate("/auth");
      return;
    }
    setLoading(true);
    try {
      const selectedSubject = options.subjects.find(s => s.id.toString() === formData.subject);
      const submissionData = { ...formData, subjectName: selectedSubject?.name || "" };
      toast.success("Criteria Confirmed");
      navigate("/papers", { state: submissionData });
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'branch' || name === 'semester' ? { subject: "" } : {})
    }));
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-background text-foreground transition-colors duration-500 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Pattern<span className="text-indigo-500">BTech</span> Analysis Portal
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Select your academic details to generate the NLP-powered report.
          </p>
        </motion.div>

        {/* Main Selection Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative mb-20">
          <GlassCard className="p-6 md:p-10 border-border bg-card/40 backdrop-blur-2xl rounded-3xl shadow-2xl relative overflow-hidden">
            
            {!user && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Access Locked</h2>
                  <Button onClick={() => navigate("/auth")} className="mt-2">Login to Unlock</Button>
                </motion.div>
              </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-8 ${!user ? 'blur-lg pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Reusable Select Field Logic */}
                {[
                  { label: "University", icon: GraduationCap, key: "university", opts: options.universities },
                  { label: "Branch", icon: BookOpen, key: "branch", opts: options.branches },
                  { label: "Semester", icon: Calendar, key: "semester", opts: options.semesters.map(s => ({id: s, name: `Semester ${s}`})) },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label className="flex items-center gap-2 ml-1"><field.icon className="w-4 h-4 text-indigo-500" /> {field.label}</Label>
                    <div className="relative">
                      <select
                        value={formData[field.key as keyof typeof formData]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="w-full pl-4 pr-10 py-3.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                      >
                        <option value="">Select {field.label}</option>
                        {field.opts.map((opt: any) => (
                          <option key={opt.id} value={opt.id} className="text-black">{opt.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    </div>
                  </div>
                ))}

                {/* Subject Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 ml-1"><FileText className="w-4 h-4 text-indigo-500" /> Subject</Label>
                  <div className="relative">
                    <select
                      disabled={subjectsLoading || (!formData.branch || !formData.semester)}
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      className="w-full pl-4 pr-10 py-3.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none disabled:opacity-50"
                    >
                      <option value="">{subjectsLoading ? "Loading..." : "Select Subject"}</option>
                      {options.subjects.map((sub) => (
                        <option key={sub.id} value={sub.id} className="text-black">{sub.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {subjectsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !formData.subject} 
                className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Start Analysis"}
              </Button>
            </form>
          </GlassCard>
        </motion.div>

        {/* --- TESTIMONIAL SLIDER SECTION --- */}
        <div className="mt-10 overflow-hidden relative">
          <div className="text-center mb-6">
            <h3 className="text-sm font-semibold tracking-widest uppercase text-primary/80">Student Success Stories</h3>
          </div>
          
          <div className="flex w-max">
            <motion.div 
              className="flex gap-6 animate-infinite-scroll"
              animate={{ x: [0, -1035] }} // Adjust based on total width
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            >
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, index) => (
                <div 
                  key={index} 
                  className="w-[300px] p-6 rounded-2xl bg-card/30 border border-border backdrop-blur-sm shadow-lg"
                >
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}
                  </div>
                  <p className="text-sm italic mb-4 text-foreground/80">"{t.text}"</p>
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}