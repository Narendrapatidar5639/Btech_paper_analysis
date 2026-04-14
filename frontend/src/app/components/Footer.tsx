import React from 'react';
import { Link } from "react-router-dom";
// Brain hat gaya hai kyunki hum logo image use kar rahe hain
import { 
  Github, 
  Linkedin, 
  Mail, 
  ShieldCheck, 
  Cpu, 
  Globe,
  Lock,
  MessageCircle,
  Phone,
  MapPin,
  ArrowUpRight
} from "lucide-react";
// motion import kiya hai animation ke liye
import { motion } from "framer-motion";

export function Footer() {
  const isDark = true; 

  const myEmail = "narendrapatidar5639@gmail.com";
  const myPhone = "+917389674558";
  const myWhatsapp = "917389674558";
  const myAddress = "Mandsaur, MP 458558, India";

  const socialLinks = {
    linkedin: "https://linkedin.com/in/narendra-patidar-patternbtech",
    github: "https://github.com/narendra-patidar",
    whatsapp: `https://wa.me/${myWhatsapp}`,
    email: `mailto:${myEmail}`
  };

  return (
    <footer className="relative border-t border-white/5 bg-[#02020a] text-white pt-20 pb-10 overflow-hidden font-sans">
      
      {/* Background Subtle Glows */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      {/* Top Section */}
      <div className="border-b border-white/5 pb-12 mb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-4">Verified Ecosystem</span>
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 group cursor-default">
                    <Cpu className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs tracking-widest">NVIDIA CUDA</span>
                  </div>
                  <div className="flex items-center gap-2 group cursor-default">
                    <Globe className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-xs tracking-widest">GOOGLE CLOUD</span>
                  </div>
                  <div className="flex items-center gap-2 group cursor-default">
                    <div className="font-black italic text-lg text-indigo-500">RGPV</div>
                    <span className="text-[8px] font-bold uppercase leading-none border-l pl-2 border-white/20">Official<br/>Syllabus</span>
                  </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security Protocol</p>
                <p className="text-xs font-bold text-green-400">SSL END-TO-END SECURE</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Brand Info with Logo */}
        <div className="space-y-6">
          {/* --- FIXED: Footer Logo Integration --- */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="relative z-10 w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/30 p-0.5 bg-black/50 backdrop-blur-md">
                <img 
                  src="/logo.png" 
                  alt="PatternBTech Logo" 
                  className="w-full h-full object-cover rounded-full brightness-110" 
                />
              </div>
              {/* Rotating Ring */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-3px] rounded-full border border-dashed border-indigo-500/20 z-0"
              />
            </div>
            <span className="text-2xl font-black italic uppercase tracking-tighter text-white">
              Pattern<span className="text-indigo-500">BTech</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed font-medium">
            Mandsaur's first AI-driven academic analysis engine. Optimizing engineering preparation with Neural Language Processing.
          </p>
          <div className="space-y-3">
             <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>{myAddress}</span>
             </div>
             <div className="flex items-center gap-3 text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                <Phone className="w-4 h-4 text-indigo-500" />
                <span>{myPhone}</span>
             </div>
          </div>
        </div>

        {/* Quick Engine Links */}
        <div>
          <h3 className="font-black uppercase italic text-xs tracking-[0.3em] text-indigo-500 mb-8">Architecture</h3>
          <ul className="space-y-4">
            {['NLP Extraction', 'Paper Analysis', 'Trend Prediction', 'Dataset Hub'].map((item) => (
              <li key={item}>
                <Link to="#" className="text-sm font-bold text-gray-500 hover:text-indigo-400 hover:translate-x-1 flex items-center gap-2 transition-all group">
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support & Resources */}
        <div>
          <h3 className="font-black uppercase italic text-xs tracking-[0.3em] text-indigo-500 mb-8">Resources</h3>
          <ul className="space-y-4">
            {['Exam Strategy', 'RGPV Updates', 'Founder\'s Vision', 'Support Desk'].map((item) => (
              <li key={item}>
                <Link to="#" className="text-sm font-bold text-gray-500 hover:text-white transition-all">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Connect */}
     {/* Social Links & Neural Privacy Section */}
<div className="space-y-8">
  <div>
    <h3 className="font-black uppercase italic text-xs tracking-[0.3em] text-indigo-500 mb-6">
      Connectivity
    </h3>
    <div className="flex gap-3">
      {/* LinkedIn */}
      <a 
        href="https://www.linkedin.com/in/narendra-patidar-836b21365"
        target="_blank" 
        rel="noopener noreferrer"
        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500 text-gray-400 hover:text-white transition-all group"
      >
        <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </a>

      {/* GitHub */}
      <a 
        href="https://github.com/Narendrapatidar5639" 
        target="_blank" 
        rel="noopener noreferrer"
        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white text-gray-400 hover:text-white transition-all group"
      >
        <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </a>

      {/* WhatsApp - Direct Chat Link */}
      <a 
        href="https://wa.me/917389674558"  // <--- Yahan apna Mobile Number (91 ke sath) dalen
        target="_blank" 
        rel="noopener noreferrer"
        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-green-500 text-gray-400 hover:text-green-500 transition-all group"
      >
        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </a>

      {/* Email */}
      <a 
        href="mailto:narendrapatidar5639@gmail.com" 
        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-red-400 text-gray-400 hover:text-white transition-all group"
      >
        <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </a>
    </div>
  </div>

  {/* Neural Privacy Card */}
  <div className="p-5 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 relative group overflow-hidden">
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
      <Lock className="w-10 h-10" />
    </div>
    <div className="flex items-center gap-2 mb-2">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
      <span className="text-[10px] font-black uppercase italic text-indigo-400 tracking-widest">
        Neural Privacy
      </span>
    </div>
    <p className="text-[10px] font-medium leading-relaxed text-indigo-300/60">
      Study patterns are processed locally using encrypted NLP protocols. Zero data leak policy enforced.
    </p>
  </div>
</div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
            © 2026 PATTERNBTECH. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[9px] font-bold text-gray-700">
            ENGINEERED BY NARENDRA PATIDAR • MANDSAUR, INDIA
          </p>
        </div>
        
        <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Terms</Link>
            <div className="h-4 w-[1px] bg-white/10" />
            <span className="text-[10px] font-black italic text-indigo-500 animate-pulse">SYSTEM ACTIVE</span>
        </div>
      </div>
    </footer>
  );
}