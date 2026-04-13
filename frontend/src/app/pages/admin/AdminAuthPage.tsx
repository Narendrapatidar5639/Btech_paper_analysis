import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Shield, User, Lock, Eye, EyeOff, Loader2, BrainCircuit, Terminal, Activity } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { GlassCard } from "../../components/GlassCard";
import { toast } from "sonner";

export function AdminAuthPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // --- BACKEND API FIX ---const API_BASE_URL = "https://pattern-btech-backend.onrender.com/api";
      const response = await fetch("https://pattern-btech-backend.onrender.com/api/admin/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Access Granted: Welcome, Admin.");
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminUser", result.user || "Admin");
        
        // Dashboard par navigate karein
        navigate("/admin/dashboard");
      } else {
        toast.error(result.error || "Authentication Failed: Invalid Credentials");
      }
    } catch (error) {
      toast.error("Engine Offline: Make sure the Django server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#02020a] relative overflow-hidden font-sans">
      
      {/* 1. Cyber Grid Background Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.15]" 
           style={{ backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      
      {/* 2. Neural Glow Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 md:p-10 border border-white/10 shadow-[0_0_80px_-15px_rgba(79,70,229,0.4)] overflow-hidden">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
               {/* Logo Circle */}
               <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500/40 p-1.5 bg-black/60 backdrop-blur-2xl">
                  <img 
                    src="/logo.png" 
                    alt="PatternBTech" 
                    className="w-full h-full object-cover rounded-full shadow-inner"
                  />
               </div>
               {/* Status Pulse */}
               <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#02020a] animate-pulse" />
            </div>

            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
              Admin<span className="text-indigo-500">Portal</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1 flex items-center justify-center gap-2">
              <Activity className="w-3 h-3 text-indigo-500" /> Neural Analysis Engine v2.0
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <Label htmlFor="admin-username" className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 ml-1">Identity ID</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Terminal className="w-4 h-4 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                  id="admin-username"
                  type="text"
                  placeholder="enter admin username"
                  className="pl-10 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-700 focus:border-indigo-500/50 focus:ring-indigo-500/10 rounded-xl"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <Label htmlFor="admin-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 ml-1">Cryptographic Key</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-700 focus:border-indigo-500/50 focus:ring-indigo-500/10 rounded-xl"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 transition-all font-black uppercase tracking-[0.2em] shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)] rounded-xl border border-white/10 active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </span>
              ) : (
                "Authorize Access"
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
            <button 
              onClick={() => navigate("/")} 
              className="text-[9px] font-bold text-gray-600 hover:text-indigo-400 transition-all uppercase tracking-widest"
            >
              ← Terminate Session
            </button>
            <div className="flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20" />
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
            </div>
          </div>

        </GlassCard>
        
        {/* Hardware Status */}
        <div className="mt-6 flex justify-between px-2">
           <div className="flex flex-col">
              <span className="text-[8px] font-bold text-gray-600 uppercase">Server Status</span>
              <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">Online</span>
           </div>
           <div className="flex flex-col text-right">
              <span className="text-[8px] font-bold text-gray-600 uppercase">Encryption</span>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">AES-256 Active</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}