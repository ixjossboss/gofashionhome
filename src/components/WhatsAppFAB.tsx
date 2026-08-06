import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Sparkles } from 'lucide-react';

export default function WhatsAppFAB() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show conversational tooltip after a 4-second delay to catch attention gently
    const timer = setTimeout(() => {
      // Check if user has already dismissed it in this session
      const dismissed = sessionStorage.getItem('whatsapp_tooltip_dismissed');
      if (!dismissed) {
        setShowTooltip(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowTooltip(false);
    sessionStorage.setItem('whatsapp_tooltip_dismissed', 'true');
  };

  const whatsappNumber = '2347043564488';
  const welcomeText = encodeURIComponent(
    'Hello GO Fashion Home! I would like to inquire about booking a bespoke tailoring consultation / custom design.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${welcomeText}`;

  return (
    <div 
      id="whatsapp-fab-container" 
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none"
    >
      {/* Speech Bubble Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            id="whatsapp-speech-bubble"
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto mb-3 max-w-xs bg-[#0A235C] text-white p-4 rounded-2xl shadow-2xl border border-blue-900/30 relative flex flex-col gap-1.5"
          >
            {/* Symmetrical tail representing a Speech Bubble */}
            <div className="absolute right-6 -bottom-2 w-4 h-4 bg-[#0A235C] rotate-45 border-r border-b border-blue-900/30" />
            
            {/* Header / Dismiss row */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                Active Atelier
              </span>
              <button 
                id="close-whatsapp-tooltip"
                onClick={handleDismissTooltip}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Dismiss chat prompt"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Main message */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs leading-relaxed text-slate-100 hover:text-white font-sans font-medium"
            >
              Need a custom dress, Traditional attire, or fitting? Chat with our expert tailors right now!
            </a>

            {/* Instant Action CTA inside bubble */}
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-[#D80064] uppercase tracking-wider hover:underline mt-0.5"
            >
              Start Chat • Offline / Online
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.a
        id="whatsapp-fab-button"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="pointer-events-auto flex items-center bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full p-4 shadow-2xl transition-all duration-300 relative focus:outline-none group"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20, 
          delay: 0.8 
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing Outer Ambient Ring for high-end feel */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 -z-10 animate-ping opacity-60" />

        {/* Dynamic Expandable Label */}
        <AnimatePresence initial={false}>
          {isHovered && (
            <motion.span
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
              exit={{ width: 0, opacity: 0, marginLeft: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="text-sm font-sans font-bold tracking-wide whitespace-nowrap overflow-hidden flex items-center pr-1"
            >
              Chat on WhatsApp
            </motion.span>
          )}
        </AnimatePresence>

        {/* Floating custom icon container */}
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-white text-[#25D366]" />
          
          {/* Subtle online badge inside FAB */}
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#00E676] border-2 border-white rounded-full animate-pulse" />
        </div>
      </motion.a>
    </div>
  );
}
