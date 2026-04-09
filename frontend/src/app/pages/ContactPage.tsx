import { useState } from "react";
import { motion } from "motion/react";
import { 
  Mail, MapPin, Phone, Send, Sparkles, 
  MessageSquare, Globe, ArrowRight, 
  MessageCircle, ExternalLink, Code2, Cpu, Brain 
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { GlassCard } from "../components/GlassCard";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeProvider";

export function ContactPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Dynamic Contact Data
  const myEmail = "narendrapatidar5639@gmail.com";
  const myPhone = "+917389674558";
  const myWhatsapp = "917389674558";
  const myAddress = "Mandsaur, MP 458558, India";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Directing to Gmail with pre-filled data
    const mailtoUrl = `mailto:${myEmail}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\n\n${formData.message}`)}`;
    window.location.href = mailtoUrl;
    toast.success("Redirecting to your Email client...");
  };

  const contactActions = [
    {
      icon: Mail,
      title: "Email Me",
      value: myEmail,
      link: `mailto:${myEmail}`,
      color: "from-blue-500 to-indigo-600",
      btnText: "Send Mail"
    },
    {
      icon: Phone,
      title: "Direct Call",
      value: "+91 73896 74558",
      link: `tel:${myPhone}`,
      color: "from-emerald-500 to-teal-600",
      btnText: "Call Now"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "Chat with Narendra",
      link: `https://wa.me/${myWhatsapp}`,
      color: "from-green-500 to-emerald-400",
      btnText: "Open WhatsApp"
    }
  ];

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${isDark ? "bg-[#030303] text-white" : "bg-slate-50 text-slate-900"} py-24 px-6 overflow-hidden`}>
      
      {/* --- 1. NLP/CODE COLLAGE BACKGROUND --- */}
      <div className="absolute inset-0 z-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none select-none">
        <div className="absolute top-20 left-10 rotate-12 font-mono text-sm leading-relaxed whitespace-pre">
          {`import torch\nclass Transformer(nn.Module):\n  def __init__(self):\n    super().__init__()\n    self.nlp = PatternBTech()`}
        </div>
        <div className="absolute bottom-40 right-10 -rotate-12 font-mono text-xs opacity-50">
          {`GET /api/analysis/v1\nHost: patternbtech.ai\nAuthorization: Bearer narendra_key\n{"status": "processing"}`}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex flex-wrap gap-20 items-center justify-center">
            <Code2 className="w-64 h-64 opacity-20" />
            <Cpu className="w-48 h-48 opacity-10" />
            <Brain className="w-80 h-80 opacity-5" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-black uppercase tracking-[0.2em] mb-6">
            <Sparkles className="w-3 h-3" /> Connect with the Engineer
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-6 leading-none">
            Let's build <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500">
              The Future
            </span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Left: Dynamic Action Cards */}
          <div className="lg:col-span-4 space-y-4">
            {contactActions.map((action, index) => (
              <motion.a
                href={action.link}
                key={action.title}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="block group"
              >
                <GlassCard className="p-5 flex items-center justify-between border-slate-200 dark:border-white/10 group-hover:border-indigo-500/50 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{action.title}</h3>
                      <p className="font-bold text-sm">{action.value}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </GlassCard>
              </motion.a>
            ))}

            {/* Address Card */}
            <GlassCard className="p-6 border-slate-200 dark:border-white/10">
                <MapPin className="text-indigo-500 mb-3" />
                <h4 className="font-black italic uppercase text-sm mb-1">Mandsaur Office</h4>
                <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed">
                  {myAddress}
                </p>
            </GlassCard>
          </div>

          {/* Right: Functional Form */}
          <motion.div className="lg:col-span-8">
            <GlassCard className="p-8 md:p-10 border-slate-200 dark:border-white/10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Your Identity</Label>
                    <Input 
                      placeholder="Name" 
                      className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-indigo-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Email Hook</Label>
                    <Input 
                      type="email" 
                      placeholder="Email" 
                      className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Topic</Label>
                  <Input 
                    placeholder="Subject" 
                    className="h-14 rounded-2xl bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Deep Message</Label>
                  <Textarea 
                    placeholder="Write your query here..." 
                    className="min-h-[150px] rounded-[2rem] bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  />
                </div>
                <Button className="w-full h-16 bg-indigo-600 hover:bg-indigo-500 text-white font-black italic uppercase text-xl rounded-full shadow-xl shadow-indigo-500/20">
                  Direct Signal to Narendra <Send className="ml-3 w-5 h-5" />
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        </div>

        {/* --- 2. GOOGLE MAPS INTEGRATION --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 h-[400px] shadow-2xl"
        >
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58543.14488349282!2d75.0416972740925!3d24.041595186083833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39642ea8693c66f7%3A0x6b447605d5d36c1e!2sMandsaur%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1714900000000!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg) grayscale(10%)' : 'none' }} 
            allowFullScreen={true} 
            loading="lazy" 
          />
        </motion.div>

      </div>
    </div>
  );
}