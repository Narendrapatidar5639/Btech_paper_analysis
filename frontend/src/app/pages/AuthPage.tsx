import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Mail, Lock, User, Eye, EyeOff, Loader2, 
  ArrowLeft, Terminal, ShieldCheck, CheckCircle2, XCircle
} from "lucide-react";
import { auth, googleProvider } from "../../lib/firebase"; 
import { signInWithPopup } from "firebase/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { GlassCard } from "../components/GlassCard";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();
const API_BASE_URL = "https://narendrapatidarbtai-btech-backend.hf.space/";

  // --- Password Strength Logic ---
  const passwordCriteria = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[@$!%*?&]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordCriteria).every(Boolean);

  // --- Google Auth Sync ---
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
            email: user.email,
            full_name: user.displayName || "Google User",
            is_google: true 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Saving full user object to AuthContext & LocalStorage
        const userData = {
            id: data.user.id,
            full_name: data.user.full_name || user.displayName,
            email: data.user.email,
            avatar: user.photoURL
        };
        login(data.token || "session_active", JSON.stringify(userData));
        localStorage.setItem("user", JSON.stringify(userData));
        
        toast.success(`Access Initialized: Welcome ${userData.full_name}`);
        navigate("/selection");
      } else {
        toast.error(data.error || "Neural sync failed.");
      }
    } catch (error) {
      toast.error("Google Uplink failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Form Submit Logic ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations for Signup
    if (!isLogin && !isForgotPassword) {
      if (!isPasswordStrong) {
        return toast.error("Password does not meet security protocols!");
      }
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Neural Keys (Passwords) do not match!");
      }
    }

    setIsLoading(true);
    try {
      let endpoint = isLogin ? "/api/auth/login/" : "/api/auth/signup/";
      if (isForgotPassword) endpoint = "/api/auth/forgot-password/";

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          is_google: false
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (isForgotPassword) {
          toast.success("Recovery link dispatched to neural-mail.");
          setIsForgotPassword(false);
        } else {
          // Success Login/Signup
          const userData = data.user || { full_name: formData.name, email: formData.email };
          login(data.token || "session_active", JSON.stringify(userData));
          localStorage.setItem("user", JSON.stringify(userData));
          
          toast.success(isLogin ? `Identity Verified: ${userData.full_name}` : `Identity Created: ${userData.full_name}`);
          navigate("/selection");
        }
      } else {
        toast.error(data.error || "Authentication Protocol Failed.");
      }
    } catch (error) {
      toast.error("Server Backbone Offline.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden bg-[#02020a] font-sans">
      
      {/* Background Neural Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-fuchsia-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.1] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Brand & Visuals */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="hidden lg:flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <ShieldCheck className="w-3 h-3" /> Secure Neural Access
          </div>
          
          <h1 className="text-7xl font-black mb-6 italic uppercase leading-[0.9] tracking-tighter text-white">
            JOIN THE <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white' }}>REVOLUTION</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-12 max-w-md font-medium border-l-2 border-indigo-600 pl-6">
            Enter the neural network of <span className="text-white font-bold">PatternBTech</span> and unlock high-precision exam analytics.
          </p>

          <div className="relative w-72 h-72 flex items-center justify-center ml-10">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/20" />
            <div className="relative w-48 h-48 rounded-full overflow-hidden border border-indigo-500/30 p-2 bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(99,102,241,0.2)]">
               <img src="/logo.png" className="w-full h-full object-cover rounded-full brightness-110" alt="PatternBTech Logo" />
            </div>
            <div className="absolute -top-4 -right-4 p-3 bg-[#0a0a1a] border border-white/10 rounded-xl shadow-2xl">
                <Terminal className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Terminal */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
          <GlassCard className="p-10 border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem]">
            <div className="space-y-8">
              
              {!isForgotPassword && (
                <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5">
                  <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}>Login</button>
                  <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}>Sign Up</button>
                </div>
              )}

              <div className="text-center space-y-2">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                  {isForgotPassword ? "Recovery" : (isLogin ? "Welcome Back" : "New Account")}
                </h2>
                <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                  {isForgotPassword ? "Access your neural link" : "Authentication Required"}
                </p>
              </div>

              {!isForgotPassword && (
                <div className="space-y-6">
                  <Button onClick={handleGoogleAuth} variant="outline" disabled={isLoading} className="w-full border-white/5 bg-white/5 hover:bg-white/10 py-7 gap-4 rounded-2xl transition-all group active:scale-95">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="font-bold text-sm tracking-tight text-white/90">Sign in with Google</span>
                  </Button>
                  <div className="relative flex items-center gap-4 py-2">
                    <div className="h-[1px] w-full bg-white/5" /><span className="text-[9px] text-gray-600 uppercase font-black tracking-[0.3em]">OR</span><div className="h-[1px] w-full bg-white/5" />
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && !isForgotPassword && (
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-4 w-5 h-5 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
                      <Input placeholder="NARENDRA PATIDAR" className="pl-12 h-14 bg-black/40 border-white/5 rounded-2xl focus:border-indigo-500/50 transition-all text-white placeholder:text-gray-700" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})} required />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
                    <Input type="email" placeholder="USER@PATTERN.TECH" className="pl-12 h-14 bg-black/40 border-white/5 rounded-2xl focus:border-indigo-500/50 transition-all text-white placeholder:text-gray-700" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                </div>

                {!isForgotPassword && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Secure Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-600 group-focus-within:text-indigo-500 transition-colors" />
                        <Input type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-12 h-14 bg-black/40 border-white/5 rounded-2xl focus:border-indigo-500/50 transition-all text-white" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-600 hover:text-white transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                      </div>
                    </div>

                    {/* --- NEW: Password Strength Indicator --- */}
                    {!isLogin && formData.password.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 px-2">
                         <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase ${passwordCriteria.length ? 'text-emerald-500' : 'text-gray-600'}`}>
                            {passwordCriteria.length ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />} 8+ Chars
                         </div>
                         <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase ${passwordCriteria.upper ? 'text-emerald-500' : 'text-gray-600'}`}>
                            {passwordCriteria.upper ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />} 1 Uppercase
                         </div>
                         <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase ${passwordCriteria.number ? 'text-emerald-500' : 'text-gray-600'}`}>
                            {passwordCriteria.number ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />} 1 Number
                         </div>
                         <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase ${passwordCriteria.special ? 'text-emerald-500' : 'text-gray-600'}`}>
                            {passwordCriteria.special ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />} 1 Special
                         </div>
                      </div>
                    )}
                  </div>
                )}

                {!isLogin && !isForgotPassword && (
                   <div className="space-y-2">
                   <Label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-2">Verify Password</Label>
                   <div className="relative">
                     <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-600" />
                     <Input type="password" placeholder="••••••••" className="pl-12 h-14 bg-black/40 border-white/5 rounded-2xl text-white" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
                   </div>
                 </div>
                )}

                {isLogin && !isForgotPassword && (
                  <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors w-full text-right font-black uppercase tracking-widest">Forget Access Key?</button>
                )}

                <Button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 h-14 text-white font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]">
                  {isLoading ? <div className="flex items-center gap-3"><Loader2 className="animate-spin w-5 h-5" /><span>Syncing...</span></div> : (isForgotPassword ? "Send Link" : (isLogin ? "Initialize Access" : "Create Identity"))}
                </Button>
              </form>

              {isForgotPassword && (
                <button onClick={() => setIsForgotPassword(false)} className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 mx-auto hover:text-white transition-colors"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Terminal</button>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}