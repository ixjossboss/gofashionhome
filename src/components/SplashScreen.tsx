import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Elegant incremental progress simulation
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Wait briefly at 100% to let the user admire the final state
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 800); // Wait for exit animation to finish
          }, 600);
          return 100;
        }
        // Realistic variable speed increment
        const diff = Math.random() * 15 + 5;
        return Math.min(prev + diff, 100);
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="splash-container"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            filter: 'blur(10px)',
            transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-[#030712] via-[#050B1E] to-[#030712] select-none overflow-hidden"
        >
          {/* Elite ambient glow behind logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(216,0,100,0.08),transparent_70%)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(10,35,92,0.15),transparent_70%)] pointer-events-none" />

          {/* Floating tiny particles for premium touch */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 - 50 + 'vw', 
                  y: '110vh', 
                  opacity: 0, 
                  scale: Math.random() * 0.5 + 0.5 
                }}
                animate={{ 
                  y: '-10vh', 
                  opacity: [0, 0.4, 0.4, 0],
                  rotate: Math.random() * 360 
                }}
                transition={{ 
                  duration: Math.random() * 6 + 6, 
                  repeat: Infinity, 
                  delay: Math.random() * 5,
                  ease: 'linear'
                }}
                className="absolute w-1 h-1 bg-[#D80064] rounded-full"
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-lg">
            
            {/* Animated Logo Container */}
            <div className="relative w-72 h-72 mb-8">
              
              {/* Outer decorative spinning dash ring */}
              <svg className="absolute inset-0 w-full h-full rotate-[-45deg]" viewBox="0 0 100 100">
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="rgba(216, 0, 100, 0.15)"
                  strokeWidth="0.5"
                  fill="none"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="46"
                  stroke="#D80064"
                  strokeWidth="1"
                  strokeDasharray="15 8"
                  fill="none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
              </svg>

              {/* Central Vector Artwork representing GO FASHION HOME */}
              <div className="absolute inset-4 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  
                  {/* Glowing filter for high-end look */}
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Stylized Monogram "G" */}
                  <motion.path
                    d="M 72 65 C 55 65, 42 78, 42 100 C 42 122, 55 135, 72 135 C 85 135, 94 126, 96 114 L 75 114 M 75 114"
                    stroke="#1E40AF"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                  />

                  {/* Stylized Monogram "O" and Dress form container */}
                  <motion.path
                    d="M 128 65 C 145 65, 158 78, 158 100 C 158 122, 145 135, 128 135 C 111 135, 98 122, 98 100 C 98 78, 111 65, 128 65 Z"
                    stroke="#1E40AF"
                    strokeWidth="3.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
                  />

                  {/* Inner Mannequin silhouette inside the "O" */}
                  <g id="mannequin-group">
                    {/* Neckstand */}
                    <motion.path
                      d="M 128 72 L 128 76 M 126 72 L 130 72"
                      stroke="#1E40AF"
                      strokeWidth="2"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1.0 }}
                    />
                    
                    {/* Torso Silhouette */}
                    <motion.path
                      d="M 120 85 C 122 82, 134 82, 136 85 C 136 88, 131 92, 131 98 C 131 104, 135 112, 133 118 C 131 121, 125 121, 123 118 C 121 112, 125 104, 125 98 C 125 92, 120 88, 120 85 Z"
                      fill="#1E40AF"
                      initial={{ scaleY: 0, originY: 0.5, opacity: 0 }}
                      animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    />

                    {/* Sweeping Pink Fashion Sash/Wave over dress */}
                    <motion.path
                      d="M 121 95 C 126 95, 133 103, 126 117 C 124 115, 121 110, 122 104 C 122 99, 119 96, 121 95 Z"
                      fill="#D80064"
                      filter="url(#glow)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1.0, delay: 1.4, ease: "backOut" }}
                    />
                  </g>

                  {/* Golden/Pink Needle weaving through */}
                  <motion.g
                    initial={{ x: -20, y: 20, opacity: 0, rotate: -25 }}
                    animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
                  >
                    {/* Needle Body */}
                    <path
                      d="M 152 75 L 174 53"
                      stroke="#94A3B8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Needle Eye */}
                    <ellipse
                      cx="170"
                      cy="57"
                      rx="1"
                      ry="2"
                      transform="rotate(45, 170, 57)"
                      fill="#0F172A"
                    />
                  </motion.g>

                  {/* Swirling Pink Thread path */}
                  <motion.path
                    d="M 170 57 C 178 52, 185 64, 172 74 C 158 84, 142 90, 150 102 C 158 114, 138 122, 115 110"
                    stroke="#D80064"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2.0, delay: 1.0, ease: "easeInOut" }}
                  />

                  {/* Sparkle indicators */}
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, delay: 1.8 }}
                    className="origin-center"
                    transform="translate(148, 82)"
                  >
                    <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z" fill="#FBBF24" />
                  </motion.g>

                </svg>
              </div>

              {/* Pulsing overlay circle */}
              <motion.div
                animate={{ 
                  scale: [0.95, 1.05, 0.95],
                  opacity: [0.3, 0.6, 0.3] 
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 border border-white/5 rounded-full pointer-events-none"
              />
            </div>

            {/* Brand Typography */}
            <div className="space-y-4">
              
              {/* GO FASHION Title */}
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                  className="text-3xl sm:text-4xl font-serif font-black tracking-widest text-white uppercase"
                >
                  GO FASHION
                </motion.h1>
              </div>

              {/* HOME with symmetrical thin lines */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.0 }}
                className="flex items-center justify-center space-x-4"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="h-[1px] bg-[#D80064]"
                />
                <span className="text-[#D80064] text-sm font-serif font-bold tracking-[0.4em] uppercase">
                  HOME
                </span>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 40 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="h-[1px] bg-[#D80064]"
                />
              </motion.div>

              {/* Subtitle: DESIGN • STITCH • STYLE */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-slate-400 flex items-center justify-center gap-2 pt-1"
              >
                <span>DESIGN</span>
                <span className="text-[#D80064]">•</span>
                <span>STITCH</span>
                <span className="text-[#D80064]">•</span>
                <span>STYLE</span>
              </motion.div>
            </div>

            {/* Custom Interactive Tape-Measure Loader Progress Bar */}
            <div className="w-64 mt-12 relative">
              <div className="h-[2px] bg-white/10 w-full relative overflow-hidden">
                {/* Simulated measuring tape tick marks */}
                <div className="absolute inset-0 flex justify-between opacity-35">
                  {[...Array(20)].map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-[1px] bg-slate-400 ${idx % 5 === 0 ? 'h-full' : 'h-[60%]'}`} 
                    />
                  ))}
                </div>

                {/* Progress bar fill */}
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#1E40AF] to-[#D80064] absolute top-0 left-0"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Floating needle icon or scissors indicating current progress */}
              <motion.div 
                className="absolute -top-3.5 text-[#D80064]"
                style={{ left: `calc(${progress}% - 8px)` }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Scissors className="w-4 h-4 transform rotate-90" />
              </motion.div>

              {/* Loading Status Text */}
              <div className="flex justify-between items-center mt-3 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-500 animate-pulse" />
                  Atelier Threading...
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Bottom Brand Mark (House Roof with needle thread heart) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 1.6 }}
              className="mt-12 flex flex-col items-center space-y-2 opacity-50"
            >
              {/* House roof path */}
              <svg className="w-12 h-6 text-slate-500" viewBox="0 0 50 25" fill="none">
                <path d="M 10 20 L 25 10 L 40 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="23" y="15" width="4" height="4" fill="currentColor" opacity="0.8" />
              </svg>
              <p className="text-[8px] font-mono tracking-widest text-slate-500">BESPOKE QUALITY</p>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
