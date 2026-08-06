import { useEffect } from 'react';
import { X, Scissors, Heart, Award, ShieldCheck, Ruler } from 'lucide-react';
import ConsultationForm from './ConsultationForm';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialNotes?: string;
  onOpenMeasurementGuide?: () => void;
}

export default function ConsultationModal({ isOpen, onClose, initialNotes, onOpenMeasurementGuide }: ConsultationModalProps) {
  // Prevent scrolling on background when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Outer Click Close Area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-slate-950 border border-white/10 w-full max-w-4xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible">
        
        {/* Decorative Panel (Left side) */}
        <div className="md:col-span-4 bg-gradient-to-br from-[#0A235C] via-slate-950 to-slate-900 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden hidden md:flex">
          {/* Accent Glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D80064]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="w-10 h-10 bg-[#D80064] flex items-center justify-center border border-white/10">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-xl font-serif font-black uppercase tracking-wider text-white">
                The Atelier Fit
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed font-sans">
                Every appointment is a dedicated session with our Lead Tailor to take precise measurements, review fabrics, and map out your dream design.
              </p>
            </div>

            {onOpenMeasurementGuide && (
              <button
                type="button"
                onClick={onOpenMeasurementGuide}
                className="w-full bg-white/10 hover:bg-[#D80064] text-white p-3 text-[11px] font-mono uppercase tracking-wider border border-white/10 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Ruler className="w-4 h-4 text-[#D80064]" />
                <span>View Measurement Guide</span>
              </button>
            )}
          </div>

          {/* Quick Pillars */}
          <div className="space-y-4 pt-8 border-t border-white/5 relative z-10 font-mono text-[10px] text-slate-400">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#D80064] shrink-0" />
              <span>100% Custom Measurement</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-[#D80064] shrink-0" />
              <span>Premium Quality Linings</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#D80064] shrink-0" />
              <span>Timely Delivery Guarantee</span>
            </div>
          </div>
        </div>

        {/* Form Panel (Right side) */}
        <div className="col-span-12 md:col-span-8 p-6 sm:p-10 relative flex flex-col">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 space-y-1 pr-8">
            <h2 className="text-2xl font-serif font-black text-white uppercase tracking-wide">
              Book A Consultation
            </h2>
            <p className="text-slate-400 text-xs font-sans">
              Provide your details below to schedule an appointment at our Akure atelier.
            </p>
          </div>

          {/* Scrollable Form Body inside Modal */}
          <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
            <ConsultationForm 
              initialNotes={initialNotes}
              onOpenMeasurementGuide={onOpenMeasurementGuide}
              onSuccess={(booking) => {
                console.log('Successfully booked appointment:', booking);
              }} 
            />
          </div>

        </div>

      </div>

    </div>
  );
}
