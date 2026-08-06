import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ruler, X, Check, Copy, Sparkles, Info, Shirt, User, ArrowRight, MessageCircle, Heart, CheckCircle2 } from 'lucide-react';

interface MeasurementGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookConsultation?: (measurementNotes?: string) => void;
}

interface MeasurementPoint {
  id: string;
  name: string;
  instruction: string;
  proTip: string;
  category: 'female' | 'male' | 'special';
  placeholder: string;
}

const MEASUREMENT_POINTS: MeasurementPoint[] = [
  // Female Measurements
  {
    id: 'bust',
    name: 'Bust / Chest',
    instruction: 'Wrap the tape measure across the fullest part of your bust, keeping the tape parallel to the floor.',
    proTip: 'Wear the exact style of bra you plan to wear with the final custom garment.',
    category: 'female',
    placeholder: 'e.g. 36 inches'
  },
  {
    id: 'underbust',
    name: 'Underbust (Crucial for Corsets)',
    instruction: 'Measure directly under your bust, right where the bra band sits snugly.',
    proTip: 'Breathe normally and keep tape snug against the ribcage for structured corsetry.',
    category: 'female',
    placeholder: 'e.g. 30 inches'
  },
  {
    id: 'waist',
    name: 'Natural Waist',
    instruction: 'Measure around the narrowest part of your waistline, usually 1-2 inches above your navel.',
    proTip: 'Bend slightly to one side—the crease that forms is your natural waist point.',
    category: 'female',
    placeholder: 'e.g. 28 inches'
  },
  {
    id: 'hip',
    name: 'Full Hip',
    instruction: 'Stand with feet together and measure around the fullest part of your hips and buttocks.',
    proTip: 'Ensure the tape stays level around the back and does not slip downward.',
    category: 'female',
    placeholder: 'e.g. 40 inches'
  },
  {
    id: 'shoulder',
    name: 'Shoulder Width',
    instruction: 'Measure across the back from the outer edge of one shoulder bone to the edge of the other.',
    proTip: 'Keep shoulders relaxed and down—do not hunch or pull back.',
    category: 'female',
    placeholder: 'e.g. 15 inches'
  },
  {
    id: 'shoulderToWaist',
    name: 'Shoulder to Waist (Front Length)',
    instruction: 'From the top of your shoulder (near the neck base), measure vertically down over the bust point to your natural waist.',
    proTip: 'Essential for peplum tops, corset bodices, and waist-jointed dresses.',
    category: 'female',
    placeholder: 'e.g. 16.5 inches'
  },
  {
    id: 'dressLength',
    name: 'Full Dress / Gown Length',
    instruction: 'Measure from the top of shoulder down to your desired hemline (knee, midi, or floor length).',
    proTip: 'Wear or account for the height of the heels you intend to pair with the dress.',
    category: 'female',
    placeholder: 'e.g. 60 inches'
  },
  {
    id: 'sleeveLength',
    name: 'Sleeve Length',
    instruction: 'From the tip of your shoulder down to your wrist bone or desired sleeve stopping point.',
    proTip: 'Bend your arm slightly if measuring for long fitted sleeves.',
    category: 'female',
    placeholder: 'e.g. 23 inches'
  },

  // Male Measurements
  {
    id: 'neck',
    name: 'Neck / Collar',
    instruction: 'Measure around the base of your neck where the shirt collar sits naturally.',
    proTip: 'Insert one finger under the tape for comfortable breathing room.',
    category: 'male',
    placeholder: 'e.g. 16 inches'
  },
  {
    id: 'maleChest',
    name: 'Chest Width',
    instruction: 'Measure under armpits around the broadest part of your chest and across shoulder blades.',
    proTip: 'Keep tape firm but not tight, with arms resting down at your sides.',
    category: 'male',
    placeholder: 'e.g. 42 inches'
  },
  {
    id: 'maleWaist',
    name: 'Trouser Waist',
    instruction: 'Measure around your natural waistline or where you comfortably wear your trouser band.',
    proTip: 'Do not tuck in your stomach—measure naturally for maximum comfort.',
    category: 'male',
    placeholder: 'e.g. 34 inches'
  },
  {
    id: 'trouserLength',
    name: 'Trouser Length (Outseam)',
    instruction: 'Measure from top of the waistband down the outside of your leg to the top of your shoe heel.',
    proTip: 'Stand straight and look forward; have someone assist you with this measurement.',
    category: 'male',
    placeholder: 'e.g. 41 inches'
  },
  {
    id: 'senatorLength',
    name: 'Senator / Agbada Top Length',
    instruction: 'Measure from shoulder base down to your mid-thigh or knee level.',
    proTip: 'Traditional Senator tops look best finishing 2-3 inches above the knee.',
    category: 'male',
    placeholder: 'e.g. 38 inches'
  }
];

export default function MeasurementGuideModal({
  isOpen,
  onClose,
  onBookConsultation
}: MeasurementGuideModalProps) {
  const [activeCategory, setActiveCategory] = useState<'female' | 'male' | 'tips'>('female');
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (id: string, val: string) => {
    setUserInputs(prev => ({ ...prev, [id]: val }));
  };

  const currentPoints = MEASUREMENT_POINTS.filter(p => p.category === activeCategory);

  const generateFormattedSummary = () => {
    const lines = Object.entries(userInputs)
      .filter(([_, val]) => val.trim() !== '')
      .map(([id, val]) => {
        const pt = MEASUREMENT_POINTS.find(p => p.id === id);
        return `${pt ? pt.name : id}: ${val}`;
      });

    if (lines.length === 0) return '';
    return `Customer Self-Taken Measurements:\n${lines.join('\n')}`;
  };

  const handleCopyMeasurements = () => {
    const summary = generateFormattedSummary();
    if (!summary) return;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToConsultation = () => {
    const summary = generateFormattedSummary();
    onClose();
    if (onBookConsultation) {
      onBookConsultation(summary);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      
      {/* Outer Overlay Close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden my-auto z-10 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0A235C] via-slate-900 to-slate-950 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#D80064] text-white flex items-center justify-center border border-white/20 shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D80064] font-bold block">
                Atelier Masterclass
              </span>
              <h2 className="text-lg sm:text-2xl font-serif font-black text-white uppercase tracking-tight">
                Tailoring Measurement Guide
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-measurement-guide-btn"
            className="w-9 h-9 bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Measurement Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveCategory('female')}
            id="tab-female-measurements"
            className={`flex-1 min-w-[120px] py-3 px-4 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeCategory === 'female'
                ? 'border-[#D80064] text-white font-bold bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shirt className="w-3.5 h-3.5 text-[#D80064]" />
            <span>Womenswear & Corsets</span>
          </button>

          <button
            onClick={() => setActiveCategory('male')}
            id="tab-male-measurements"
            className={`flex-1 min-w-[120px] py-3 px-4 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeCategory === 'male'
                ? 'border-[#D80064] text-white font-bold bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#D80064]" />
            <span>Menswear & Senator</span>
          </button>

          <button
            onClick={() => setActiveCategory('tips')}
            id="tab-fitting-tips"
            className={`flex-1 min-w-[120px] py-3 px-4 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeCategory === 'tips'
                ? 'border-[#D80064] text-white font-bold bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D80064]" />
            <span>Pro Fitting Golden Rules</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-300 font-sans text-sm leading-relaxed scrollbar-thin">
          
          {activeCategory !== 'tips' ? (
            <div className="space-y-6">
              
              {/* Category Intro banner */}
              <div className="bg-[#0A235C]/30 border border-[#0A235C]/60 p-4 flex items-start space-x-3 text-xs">
                <Info className="w-5 h-5 text-[#D80064] shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  Follow these step-by-step points for precision. You can enter your figures directly into the fields below to record them for your consultation!
                </p>
              </div>

              {/* Grid of measurement points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {currentPoints.map((pt) => (
                  <div
                    key={pt.id}
                    className="bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between space-y-3 hover:border-[#D80064]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-serif font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                          <span className="w-2 h-2 bg-[#D80064] inline-block" />
                          {pt.name}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {pt.instruction}
                      </p>
                      <div className="mt-2 text-[11px] text-pink-300/80 bg-pink-950/20 p-2 border border-pink-900/30 font-mono">
                        💡 <strong>Pro Tip:</strong> {pt.proTip}
                      </div>
                    </div>

                    {/* Interactive Value Input */}
                    <div className="pt-2">
                      <label htmlFor={`input-${pt.id}`} className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Your Measurement (Optional)
                      </label>
                      <input
                        id={`input-${pt.id}`}
                        type="text"
                        placeholder={pt.placeholder}
                        value={userInputs[pt.id] || ''}
                        onChange={(e) => handleInputChange(pt.id, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#D80064] font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            /* Golden Rules & Pro Tips Content */
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                
                <div className="bg-slate-900 border border-slate-800 p-5 space-y-3">
                  <div className="w-8 h-8 bg-[#D80064]/20 border border-[#D80064]/40 text-[#D80064] flex items-center justify-center font-mono font-bold text-sm">
                    01
                  </div>
                  <h4 className="font-serif font-bold text-white text-sm uppercase">Use Soft Fabric Tape</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Always use a flexible cloth or vinyl measuring tape. Metal construction tape measures will distort your body contours and lead to tight fitting mistakes.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 space-y-3">
                  <div className="w-8 h-8 bg-[#D80064]/20 border border-[#D80064]/40 text-[#D80064] flex items-center justify-center font-mono font-bold text-sm">
                    02
                  </div>
                  <h4 className="font-serif font-bold text-white text-sm uppercase">Two-Finger Ease Rule</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Keep two fingers flat underneath the tape measure when recording waist and chest sizes. This ensures comfortable sitting, breathing, and walking ease.
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 space-y-3">
                  <div className="w-8 h-8 bg-[#D80064]/20 border border-[#D80064]/40 text-[#D80064] flex items-center justify-center font-mono font-bold text-sm">
                    03
                  </div>
                  <h4 className="font-serif font-bold text-white text-sm uppercase">Account for Footwear</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    When taking gown or trouser lengths, wear the shoes or heel height you plan to wear to your event. A 4-inch heel alters your hemline dramatically!
                  </p>
                </div>

              </div>

              {/* Special Corsetry & Agbada Note */}
              <div className="bg-gradient-to-r from-[#0A235C]/40 to-slate-900 border border-[#0A235C] p-6 space-y-3">
                <h4 className="text-base font-serif font-bold text-white uppercase flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#D80064]" />
                  Visiting Our Akure Atelier for Professional Fitting
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  While self-taken measurements work wonderfully for general custom sewing, complex bridal corsetry, structured reception dresses, or heavy embroidered Agbadas are best measured directly in person. Our lead tailor will take over 20 specific anatomical measurements at our Akure showroom.
                </p>
              </div>

            </div>
          )}

          {/* User Recorded Measurements Scratchpad summary */}
          {Object.keys(userInputs).some(k => userInputs[k].trim() !== '') && (
            <div className="p-4 bg-slate-900 border border-[#D80064]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#D80064] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Your Recorded Measurements Summary
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {Object.values(userInputs).filter(v => v.trim() !== '').length} points recorded
                </span>
              </div>
              <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-3 border border-slate-800 whitespace-pre-wrap leading-relaxed">
                {generateFormattedSummary()}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Ruler className="w-4 h-4 text-[#D80064]" />
            <span>Need live help? Chat with our master tailor via WhatsApp.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {Object.keys(userInputs).some(k => userInputs[k].trim() !== '') && (
              <button
                onClick={handleCopyMeasurements}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono uppercase tracking-wider border border-slate-700 flex items-center space-x-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Figures'}</span>
              </button>
            )}

            {onBookConsultation && (
              <button
                onClick={handleSendToConsultation}
                id="btn-use-measurements-booking"
                className="px-5 py-2.5 bg-[#D80064] hover:bg-[#D80064]/90 text-white text-xs font-bold uppercase tracking-widest flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-pink-900/20"
              >
                <span>Book Consultation With Measurements</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono uppercase tracking-wider border border-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
