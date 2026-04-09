import React from 'react';
import { useNavigate } from "react-router"; 
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Brain, 
  ArrowRight, 
  Zap, 
  Network,
  TrendingUp,
  Github,
  Linkedin,
  Mail,
  Quote,
  Activity,
  PieChart,
  CheckCircle2
} from 'lucide-react';

// Contexts
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeProvider"; // Theme hook import kiya

interface TechDetailProps {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
  tags: string[];
  isDark: boolean;
}

const ImmersiveCollage = ({ isDark }: { isDark: boolean }) => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'} bg-[url('https://www.transparenttextures.com/patterns/graph-paper.png')]`} />
    
    <motion.div 
      animate={{ y: [0, -40, 0], rotate: [0, 10, 0] }}
      transition={{ duration: 15, repeat: Infinity }}
      className="absolute top-20 left-10 opacity-10"
    >
      <PieChart className={`w-64 h-64 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
    </motion.div>

    <motion.div 
      animate={{ x: [0, 50, 0], opacity: [0.05, 0.15, 0.05] }}
      transition={{ duration: 20, repeat: Infinity }}
      className="absolute bottom-40 right-20 opacity-10"
    >
      <div className="flex items-end gap-2 h-48">
        {[80, 40, 90, 60, 30, 70, 50].map((h, i) => (
          <div key={i} style={{ height: `${h}%` }} className={`w-8 ${isDark ? 'bg-cyan-400' : 'bg-indigo-500'} rounded-t-lg`} />
        ))}
      </div>
    </motion.div>

    <div className={`absolute top-1/4 right-1/4 w-96 h-96 blur-[120px] rounded-full ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/5'}`} />
  </div>
);

const TechDetail = ({ icon: Icon, title, desc, tags, isDark }: TechDetailProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`p-8 rounded-[2rem] border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:border-cyan-500/50' : 'bg-white border-black/5 shadow-xl hover:border-indigo-500/50'}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-600 text-white'}`}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className={`text-2xl font-black italic uppercase mb-4 tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
    <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>{desc}</p>
    <div className="flex flex-wrap gap-2">
      {tags.map(t => <span key={t} className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase ${isDark ? 'bg-white/5 text-gray-500' : 'bg-black/5 text-slate-500'}`}>{t}</span>)}
    </div>
  </motion.div>
);

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // FIX: Theme global state se fetch ho rahi hai
  const { theme } = useTheme(); 
  const isDark = theme === "dark";

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/selection");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className={`${isDark ? 'bg-[#02020a] text-white' : 'bg-[#fcfdff] text-slate-900'} min-h-screen transition-colors duration-700 selection:bg-cyan-500/30 font-sans relative`}>
      
      <ImmersiveCollage isDark={isDark} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <motion.div style={{ scale }} className="z-10 text-center max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <span className={`px-6 py-2 rounded-full text-[11px] font-black tracking-[0.3em] uppercase border ${isDark ? 'bg-white/5 border-white/10 text-cyan-400' : 'bg-black/5 border-black/10 text-indigo-600'}`}>
              <Zap className="w-3 h-3 inline mr-2 mb-1" />
              AI-Powered Analysis Platform
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-[8rem] lg:text-[10rem] font-black tracking-[-0.05em] leading-[0.85] uppercase italic mb-10">
            Pattern<br />
            <span className={`text-transparent ${isDark ? 'stroke-white' : 'stroke-black'}`} style={{ WebkitTextStroke: isDark ? '2px white' : '2px black' }}>BTech</span>
          </h1>

          <p className={`max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Analyze previous year papers using state-of-the-art NLP. 
            Identify trends, most asked topics, and boost your performance with intelligent insights.
          </p>

          <div className="mt-14 flex flex-col md:flex-row gap-6 justify-center items-center">
            <button 
              onClick={handleGetStarted}
              className={`w-full md:w-auto px-12 py-6 font-black uppercase text-xl italic shadow-2xl transition-all hover:translate-y-[-4px] active:translate-y-0 ${isDark ? 'bg-white text-black hover:bg-cyan-400' : 'bg-black text-white hover:bg-indigo-600'}`}
            >
              {isAuthenticated ? "Go to Selection" : "Start Analysis"} <ArrowRight className="inline ml-2" />
            </button>
            
            <div className="flex -space-x-4">
              {[1,2,3,4].map(i => (
                <div key={i} className={`w-12 h-12 rounded-full border-4 ${isDark ? 'border-[#02020a] bg-gray-800' : 'border-white bg-slate-200'}`} />
              ))}
              <div className={`flex items-center pl-8 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Used by 10K+ Students</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-10 opacity-30">
          <div className={`w-[1px] h-20 ${isDark ? 'bg-white' : 'bg-black'}`} />
        </motion.div>
      </section>

      {/* Features Deep Dive */}
      <section className="relative py-32 px-6 max-w-7xl mx-auto z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6">The Technology</h2>
          <p className={`max-w-2xl mx-auto ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Humne engineering aur data science ko merge kiya hai taaki aapka result improve ho sake.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TechDetail 
            isDark={isDark}
            icon={Brain} 
            title="NLP Extraction" 
            desc="Har PDF se engineering metadata extract kiya jata hai. Tokenization aur TF-IDF se hum 'High Weightage' keywords ka pattern nikalte hain."
            tags={["Tokenization", "Metadata", "POS Tagging"]}
          />
          <TechDetail 
            isDark={isDark}
            icon={Network} 
            title="Smart Clustering" 
            desc="Unsupervised ML algorithms questions ko modules mein group karte hain, jisse ye pata chalta hai ki kis topic se sabse zyada questions aate hain."
            tags={["K-Means", "Vectorization", "Clustering"]}
          />
          <TechDetail 
            isDark={isDark}
            icon={TrendingUp} 
            title="Trend Prediction" 
            desc="Pichle 10 saalon ke patterns analyze karke hum module-wise weightage predict karte hain jo current semester mein ane ke chances hain."
            tags={["Random Forest", "Regression", "Trends"]}
          />
        </div>
      </section>

      {/* Stats/Visualization Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className={`rounded-[4rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-2xl'} p-10 md:p-20 max-w-7xl mx-auto relative`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <h3 className="text-5xl md:text-6xl font-black italic uppercase leading-none">Smart<br/><span className="text-cyan-500">Visualization</span></h3>
               <p className={isDark ? 'text-gray-400' : 'text-slate-600'}>Hum sirf list nahi dikhate, charts ke zariye batate hain ki aapka syllabus kis direction mein move ho raha hai.</p>
               <div className="space-y-4">
                  {['Most Asked Topics', 'Complexity Analysis', 'Module Coverage'].map(item => (
                    <div key={item} className="flex items-center gap-4">
                      <CheckCircle2 className="text-cyan-400" />
                      <span className={`font-bold uppercase italic text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{item}</span>
                    </div>
                  ))}
               </div>
            </div>
            <div className={`relative aspect-video ${isDark ? 'bg-black/40' : 'bg-slate-100'} rounded-3xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-black/5'} flex items-end justify-between p-8 gap-1`}>
                {[...Array(12)].map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${Math.random() * 80 + 20}%` }}
                    viewport={{ once: true }}
                    className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-md opacity-70"
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                   <Activity className={`w-20 h-20 ${isDark ? 'text-white/10' : 'text-black/5'} animate-pulse`} />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architect / Founder Section */}
     <section className={`py-32 px-10 ${isDark ? 'bg-[#05051a]' : 'bg-slate-50'}`}>
  <div className="max-w-6xl mx-auto">
    {/* Items-start direct image align karega desktop pe, gap badhaya hai */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-30 lg:gap-20 items-start">
      
      {/* --- Architect Photo Section --- */}
      <div className="lg:col-span-5 relative flex justify-center lg:justify-start">
        <div className="relative group w-full max-w-sm lg:max-w-none">
          {/* Neon Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/30 to-cyan-400/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
          
          {/* Portrait Container Fix: Maine isko 4/5 ka portrait ratio diya hai instead of square */}
          <div className={`relative rounded-[3rem] overflow-hidden border-8 ${isDark ? 'border-white/5' : 'border-white'} aspect-[4/5] shadow-2xl`}>
            {/* FIXED: object-contain head portion ko cut hone se rokega, pure picture ko dikhayega */}
            <img 
              src="/NP2.jpeg" 
              alt="Architect Narendra Patidar" 
              className="w-full h-full object-contain bg-[#030310] scale-150 group-hover:scale-100 transition-transform duration-700 ease-out" 
            />
          </div>
        </div>
      </div>
      
      {/* --- Architect Profile Details Section --- */}
      <div className="lg:col-span-7 space-y-12 lg:pt-6">
        <div className="flex items-center gap-6">
          <Quote className="w-16 h-16 text-cyan-500 opacity-20" />
          {/* Mobile optimization */}
          <div className="hidden sm:block h-[1px] flex-1 bg-white/5" /> 
        </div>

        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">
          Meet The <br /><span className="text-indigo-500">Architect</span>
        </h2>
        
        <p className={`text-xl leading-relaxed italic ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
          "PatternBTech sirf ek tool nahi, engineering exams ko crack karne ka ek naya perspective hai. Hum data ko results mein badalte hain."
        </p>
        
        <div className="pt-4 border-t border-white/5">
          <p className={`text-3xl font-black uppercase italic ${isDark ? 'text-white' : 'text-slate-900'}`}>NARENDRA PATIDAR</p>
          <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" /> AI & NLP Specialist
          </p>
        </div>
        
        {/* --- Social Links (Fixed & Responsive) --- */}
        <div className={`flex items-center gap-8 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {/* LinkedIn Fixed Link */}
          <motion.a 
            href="https://www.linkedin.com/in/narendra-patidar-836b21365" 
            target="_blank" 
            rel="noopener noreferrer" 
            whileHover={{ scale: 1.2, y: -4 }}
            className="group"
          >
            <Linkedin className="w-7 h-7 text-gray-500 group-hover:text-indigo-500 cursor-pointer transition-all active:scale-95" />
          </motion.a>

          {/* Github Fixed Link */}
          <motion.a 
            href="https://github.com/Narendrapatidar5639" 
            target="_blank" 
            rel="noopener noreferrer" 
            whileHover={{ scale: 1.2, y: -4 }}
            className="group"
          >
            <Github className="w-7 h-7 text-gray-500 group-hover:text-fuchsia-500 cursor-pointer transition-all active:scale-95" />
          </motion.a>

          {/* Mail Link */}
          <motion.a 
            href="mailto:narendrapatidar5639@gmail.com" 
            whileHover={{ scale: 1.2, y: -4 }}
            className="group"
          >
            <Mail className="w-7 h-7 text-gray-500 group-hover:text-cyan-500 cursor-pointer transition-all active:scale-95" />
          </motion.a>
        </div>
      </div>

    </div>
  </div>
</section>
    </div>
  );
}