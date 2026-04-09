import { motion } from "motion/react";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void; // Defined in interface
}

// 1. Destructure 'onClick' here from the props
export function GlassCard({ 
  children, 
  className = "", 
  hover = true, 
  glow = false, 
  onClick // <--- Added this
}: GlassCardProps) {
  return (
    <motion.div
      // 2. Attach the 'onClick' to the motion.div
      onClick={onClick} 
      className={`relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden ${className}`}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      transition={{ duration: 0.3 }}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--glow-blue)] via-[var(--glow-purple)] to-[var(--glow-cyan)] opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}