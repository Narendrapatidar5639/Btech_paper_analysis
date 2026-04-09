import { motion } from "framer-motion";
import { 
  Brain, Target, Zap, Users, Code, Database, Cpu, 
  Github, Linkedin, Mail, ExternalLink, Sparkles, 
  Terminal, Award, Layers, Rocket 
} from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

export function AboutPage() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // Tech Stack with detailed info
  const techStack = [
    { name: "React & TS", icon: Code, color: "from-blue-500 to-indigo-500", desc: "Modern UI Architecture" },
    { name: "Python AI/ML", icon: Brain, color: "from-purple-500 to-fuchsia-500", desc: "Model Development" },
    { name: "NLP & LLM", icon: Cpu, color: "from-pink-500 to-rose-500", desc: "Text Analytics" },
    { name: "Vector DB", icon: Database, color: "from-cyan-500 to-blue-500", desc: "Memory Systems" },
  ];

  const stats = [
    { label: "Models Deployed", value: "10+", icon: Rocket },
    { label: "Accuracy Rate", value: "98%", icon: Target },
    { label: "Papers Analyzed", value: "500+", icon: Layers },
    { label: "Students Helped", value: "1K+", icon: Users },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen transition-colors duration-500 bg-slate-50 dark:bg-[#030303] text-slate-900 dark:text-white overflow-hidden font-sans">
      
      {/* Background Decor - Theme Responsive */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-500/10 dark:bg-fuchsia-500/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-24 px-6 lg:px-8">
        
        {/* 1. Hero / Founder Section */}
        <section className="mb-40">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
                <Sparkles className="w-3 h-3" /> Meet the Architect
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter italic uppercase leading-[0.85]">
                NARENDRA <br />
                <span className="text-transparent" style={{ WebkitTextStroke: '1.5px currentColor' }}>PATIDAR</span>
              </h1>

              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-8 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <Terminal className="w-5 h-5 text-indigo-500" />
                </div>
                AI/ML Engineer & Full Stack Dev
              </h2>

              <p className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed mb-10 max-w-xl italic">
                I bridge the gap between complex Deep Learning architectures and seamless user experiences. 
                With a focus on <span className="text-indigo-500 font-bold">NLP and Predictive Analytics</span>, I built PatternBTech to solve the fundamental challenge of exam uncertainty.
              </p>
              
              <div className="flex gap-4 mb-12">
                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/in/narendra-patidar-836b21365" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all text-slate-600 dark:text-white group"
                >
                  <Linkedin className="w-6 h-6 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                </a>

                {/* GitHub */}
                <a 
                  href="https://github.com/Narendrapatidar5639" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-900 dark:hover:border-white hover:shadow-2xl transition-all text-slate-600 dark:text-white group"
                >
                  <Github className="w-6 h-6 group-hover:text-slate-900 dark:group-hover:text-white group-hover:scale-110 transition-all" />
                </a>

                {/* Mail */}
                <a 
                  href="mailto:narendrapatidar5639@gmail.com" 
                  className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-500/20 transition-all text-slate-600 dark:text-white group"
                >
                  <Mail className="w-6 h-6 group-hover:text-rose-400 group-hover:scale-110 transition-all" />
                </a>
              </div>
            </motion.div>

            {/* Photo Section */}
            <motion.div 
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 1 }}
  className="relative group max-w-[500px] mx-auto" // Max width di taaki image fail na jaye
>
  {/* Neon Gradient Border Glow */}
  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
  
  <GlassCard className="relative aspect-[4/5] lg:aspect-square overflow-hidden border-slate-200 dark:border-white/10 flex items-center justify-center bg-[#050510]">
      
      {/* Image with Padding and Top Alignment */}
      <img 
        src="/NP2.jpeg" 
        alt="Narendra Patidar"
        className="w-full h-full object-contain p-4 lg:p-8 object-top transform group-hover:scale-102 transition-transform duration-1000 ease-out"
      />

      {/* Floating Innovation Badge Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/90 via-black/20 to-transparent translate-y-6 group-hover:translate-y-0 transition-transform duration-700">
        <div className="flex flex-col items-center gap-3">
           <Award className="w-8 h-8 text-indigo-400" />
           <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/80 font-bold text-center">
             Innovation Driven Engineering
           </p>
        </div>
      </div>
  </GlassCard>
</motion.div>
          </div>
        </section>

        {/* 2. Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center hover:border-indigo-500/50 transition-colors group"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-6 text-indigo-500 group-hover:scale-110 transition-transform" />
              <div className="text-5xl font-black mb-2 italic tracking-tighter">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* 3. Core Mission Section */}
        <section className="mb-40">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black italic uppercase">Our Core Mission</h2>
            <div className="w-24 h-2 bg-indigo-500 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: Target, title: "The Mission", color: "text-indigo-500", text: "To empower B.Tech students with AI-driven insights that transform raw data into a clear study roadmap." },
              { icon: Zap, title: "Innovation", color: "text-fuchsia-500", text: "Utilizing OCR and LLMs to predict exam trends with surgical precision, saving hundreds of hours." },
              { icon: Users, title: "Community", color: "text-cyan-500", text: "Built by a student who understands the pressure. We prioritize accuracy and ease of use over everything." }
            ].map((item, idx) => (
              <GlassCard key={idx} className="p-10 border-slate-200 dark:border-white/10 hover:translate-y-[-12px] transition-all duration-500 group">
                <item.icon className={`w-14 h-14 ${item.color} mb-8 group-hover:rotate-12 transition-transform`} />
                <h3 className="text-2xl font-black mb-5 italic uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-500 dark:text-gray-400 leading-relaxed text-lg italic">
                  {item.text}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* 4. Tech Stack Section */}
        <section className="mb-40">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-black rounded-[4rem] p-12 lg:p-24 relative overflow-hidden shadow-3xl">
             <div className="absolute top-0 right-0 p-10 opacity-5">
                <Code className="w-80 h-80" />
             </div>
             
             <div className="relative z-10">
                <h2 className="text-5xl md:text-7xl font-black italic uppercase mb-16 tracking-tighter">The Tech Stack</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                  {techStack.map((tech) => (
                    <div key={tech.name} className="group cursor-default">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                        <tech.icon className="w-7 h-7 text-white" />
                      </div>
                      <h4 className="text-2xl font-black mb-3 uppercase italic">{tech.name}</h4>
                      <p className="text-xs opacity-70 font-black uppercase tracking-widest">{tech.desc}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </section>

        {/* 5. CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative text-center py-32 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[5rem] border border-indigo-500/10 overflow-hidden"
        >
          {/* Decorative background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

          <h2 className="relative z-10 text-5xl md:text-7xl font-black italic uppercase mb-10 leading-[0.9] tracking-tighter">
            Let's Redefine <br /> <span className="text-indigo-500">Education</span> Together
          </h2>
          <p className="relative z-10 text-slate-500 dark:text-gray-400 mb-14 max-w-2xl mx-auto text-xl italic leading-relaxed">
            Whether you are a student looking for guidance or a developer interested in collaboration, let's explore the future of AI learning.
          </p>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/contact")} 
            className="relative z-10 px-16 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase italic tracking-tighter text-2xl rounded-full transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center gap-6 mx-auto group"
          >
            Contact Narendra 
            <ExternalLink className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}