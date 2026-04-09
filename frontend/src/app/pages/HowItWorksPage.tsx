import { motion, useScroll, useSpring } from "motion/react";
import { LogIn, Filter, FileText, Brain, BarChart3, Download, ArrowRight, Cpu, Search, Database, Network, Key, Target, Zap } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { useNavigate } from "react-router";
import { useRef } from "react";

export function HowItWorksPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Steps array with Icon components instead of broken image URLs
  const steps = [
    { 
      icon: LogIn, 
      title: "Secure Access", 
      description: "Login to sync your university data.", 
      color: "from-blue-600 to-indigo-600",
      visual: <Key className="w-16 h-16 text-blue-500/40" />
    },
    { 
      icon: Filter, 
      title: "Smart Selection", 
      description: "Filter by University, Semester & Branch.", 
      color: "from-indigo-600 to-purple-600",
      visual: <Target className="w-16 h-16 text-indigo-500/40" />
    },
    { 
      icon: FileText, 
      title: "Data Pulling", 
      description: "AI extracts 10+ years of previous papers.", 
      color: "from-purple-600 to-fuchsia-600",
      visual: <Database className="w-16 h-16 text-purple-500/40" />
    },
    { 
      icon: Brain, 
      title: "Pattern Mapping", 
      description: "LLM analyzes semantic question trends.", 
      color: "from-fuchsia-600 to-rose-600",
      visual: <Brain className="w-16 h-16 text-rose-500/40" />
    },
    { 
      icon: BarChart3, 
      title: "Live Dashboard", 
      description: "Visualize importance & repetition scores.", 
      color: "from-rose-600 to-orange-600",
      visual: <BarChart3 className="w-16 h-16 text-rose-500/40" />
    },
    { 
      icon: Download, 
      title: "Export Guide", 
      description: "Download the final study roadmap in PDF.", 
      color: "from-orange-600 to-amber-600",
      visual: <Zap className="w-16 h-16 text-orange-500/40" />
    },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#030303] text-slate-900 dark:text-white overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-20 -left-20 w-[500px] h-[500px] border border-slate-200 dark:border-white/5 rounded-full" />
      </div>

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 z-50 origin-left" style={{ scaleX }} />

      <div className="relative z-10 max-w-7xl mx-auto py-24 px-6">
        
        {/* 1. Header Section */}
        <header className="text-center mb-32 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-9xl font-black mb-4 tracking-tighter uppercase italic leading-none">
              HOW IT <span className="text-transparent stroke-slate-900 dark:stroke-white" style={{ WebkitTextStroke: '1px' }}>WORKS</span>
            </h1>
            <p className="text-slate-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              Simplifying the complex intersection of NLP and Academic Analysis.
            </p>
          </motion.div>
        </header>

        {/* 2. THE RESTORED NEURAL ENGINE VISUAL */}
        <section className="mb-40">
          <GlassCard className="p-1 border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 p-8 md:p-16 items-center">
              <div>
                <div className="flex items-center gap-2 text-indigo-500 font-bold uppercase tracking-widest text-xs mb-4">
                  <Cpu className="w-4 h-4" /> Core Technology
                </div>
                <h2 className="text-4xl font-black mb-6 uppercase italic">The Neural Engine</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 h-10 w-1 bg-indigo-500" />
                    <div>
                      <h4 className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-sm">Semantic Logic</h4>
                      <p className="text-slate-500 text-sm">Goes beyond keywords to understand core exam intent.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 h-10 w-1 bg-purple-500" />
                    <div>
                      <h4 className="font-bold text-purple-600 dark:text-purple-400 uppercase text-sm">Weighted Patterns</h4>
                      <p className="text-slate-500 text-sm">Frequency analysis of questions across 10 years.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex justify-center py-10">
                <div className="w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] absolute animate-pulse" />
                <div className="relative border border-slate-200 dark:border-white/10 p-10 rounded-[2.5rem] bg-white/80 dark:bg-black/60 backdrop-blur-3xl shadow-2xl">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-14 w-20 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl animate-pulse" />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div animate={{ x: [-200, 300] }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div animate={{ x: [300, -200] }} transition={{ repeat: Infinity, duration: 2 }} className="h-full w-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                    </div>
                  </div>
                  <p className="text-[10px] text-center mt-6 text-indigo-500 font-mono tracking-tighter uppercase font-bold">Engine Operational: 99.8% Accuracy</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* 3. STEPS WITH VISUALS (Fixed Image Loading Issue) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-40">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group flex flex-col"
              >
                <div className="relative mb-6 overflow-hidden rounded-3xl bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 aspect-video flex items-center justify-center p-6">
                   {/* Visual Placeholder using Icons and Motion for a premium look */}
                   <motion.div 
                     whileHover={{ scale: 1.1, rotate: 5 }}
                     className="relative z-10"
                   >
                     {step.visual}
                   </motion.div>
                   
                   {/* Animated background glow for each step */}
                   <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                   
                   <div className="absolute top-4 left-4 bg-white dark:bg-black/50 p-2 rounded-xl backdrop-blur-md border border-slate-200 dark:border-white/10">
                      <Icon className="w-5 h-5 text-indigo-500" />
                   </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 uppercase italic dark:text-white text-slate-800">{step.title}</h3>
                <p className="text-slate-500 dark:text-gray-500 text-sm">{step.description}</p>
                <div className="mt-4 h-px w-10 bg-indigo-500 transition-all group-hover:w-full" />
              </motion.div>
            );
          })}
        </div>

        {/* 4. PURE THEORY SECTION (Model Procedure) */}
        <section className="py-20 border-t border-slate-200 dark:border-white/5">
          <div className="grid lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-4xl font-black uppercase italic mb-8">System Architecture</h2>
              <p className="text-slate-600 dark:text-gray-400 mb-6 leading-relaxed">
                The PatternBTech engine is built on a custom **Hybrid NLP Stack**. Unlike traditional search tools, our model processes university archives through multiple neural layers to ensure that students focus only on what matters.
              </p>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold border border-indigo-500/20">1</div>
                  <div>
                    <h5 className="font-bold mb-2 uppercase">Data Ingestion (OCR)</h5>
                    <p className="text-sm text-slate-500 leading-relaxed">We use high-precision Optical Character Recognition to convert handwritten and printed exam PDFs into structured data strings.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold border border-purple-500/20">2</div>
                  <div>
                    <h5 className="font-bold mb-2 uppercase">Semantic Tokenization</h5>
                    <p className="text-sm text-slate-500 leading-relaxed">Our NLP pipeline breaks down questions into semantic tokens, identifying the "Topic Weightage" by analyzing the context rather than just words.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 font-bold border border-rose-500/20">3</div>
                  <div>
                    <h5 className="font-bold mb-2 uppercase">LLM Scoring Engine</h5>
                    <p className="text-sm text-slate-500 leading-relaxed">A Large Language Model runs a final pass to predict the probability of a question appearing in the next cycle based on historical gaps.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-200/30 dark:bg-white/5 rounded-[3rem] p-10 flex flex-col justify-center border border-slate-200 dark:border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                   <Database className="w-64 h-64 text-indigo-500" />
                </div>
                <h4 className="text-2xl font-bold mb-4">Why it works?</h4>
                <p className="text-slate-500 italic leading-loose">
                  "Most students fail not because they don't study, but because they study everything equally. Our engine applies the Pareto Principle (80/20 rule) to academic data, highlighting the 20% of the syllabus that produces 80% of the marks."
                </p>
                <div className="mt-8 flex items-center gap-4">
                   <div className="h-px flex-1 bg-slate-300 dark:bg-white/10" />
                   <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">PatternBTech Neural Engine</span>
                </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <div className="text-center mt-20">
           <button 
             onClick={() => navigate("/selection")} 
             className="group relative px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all shadow-xl hover:shadow-indigo-500/40 overflow-hidden"
           >
             <span className="relative z-10 flex items-center gap-3">
               Start Engine Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </span>
           </button>
        </div>
      </div>
    </div>
  );
}