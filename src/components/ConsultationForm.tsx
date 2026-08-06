import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, ChevronDown, ArrowRight, Ruler } from 'lucide-react';

export interface ConsultationSubmission {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  outfitType: string;
  date?: string;
  timeSlot?: string;
  notes?: string;
  status: 'pending' | 'confirmed';
  createdAt: string;
}

export const FORM_CATEGORY_MAP: Record<string, string[]> = {
  'Traditional & Classic Wear': [
    'Iro and Buba',
    'Boubou',
    'Kaftans',
    'Female Agbada',
    'George Wrapper and Blouse'
  ],
  'Structured & Statement Dresses': [
    'Ankara Peplum Gowns',
    'Corset Dresses',
    'Mermaid Gowns',
    'Jumpsuits',
    'Wrap Dresses'
  ],
  'Casual & Easy Wear': [
    'Kimonos',
    'Maxi Dresses',
    'Skirt and Blouse Sets'
  ],
  'Corporate & Office Wear': [
    'Blazers',
    'Trousers',
    'English Wear'
  ],
  'Bridal & Special Occasion': [
    'Bespoke Wedding Gown',
    'Aso-Ebi Entourage Outfit',
    'Reception Dress',
    'Bridal Train Outfit'
  ],
  'Other Custom Tailoring': [
    'Custom Fabric/Style Request',
    'Repairs & Alterations'
  ]
};

interface ConsultationFormProps {
  onSuccess?: (booking: ConsultationSubmission) => void;
  compact?: boolean;
  initialNotes?: string;
  onOpenMeasurementGuide?: () => void;
}

export default function ConsultationForm({ onSuccess, compact = false, initialNotes = '', onOpenMeasurementGuide }: ConsultationFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Traditional & Classic Wear');
  const [outfitType, setOutfitType] = useState('Iro and Buba');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('Morning (10:00 AM - 12:00 PM)');
  const [notes, setNotes] = useState(initialNotes);

  // Sync initialNotes if updated externally
  useEffect(() => {
    if (initialNotes) {
      setNotes(initialNotes);
    }
  }, [initialNotes]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<ConsultationSubmission | null>(null);
  const [error, setError] = useState('');

  // Handle main category change to update specific outfit type
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    const subTypes = FORM_CATEGORY_MAP[cat];
    if (subTypes && subTypes.length > 0) {
      setOutfitType(subTypes[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      const newBooking: ConsultationSubmission = {
        id: `con-${Date.now()}`,
        name,
        phone,
        email,
        category,
        outfitType,
        date,
        timeSlot,
        notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save to local storage for the client to persist
      try {
        const existing = localStorage.getItem('gofashion_consultations');
        const list = existing ? JSON.parse(existing) : [];
        list.push(newBooking);
        localStorage.setItem('gofashion_consultations', JSON.stringify(list));
      } catch (err) {
        console.error('Failed to save booking to localStorage:', err);
      }

      setIsSubmitting(false);
      setSubmitSuccess(newBooking);
      if (onSuccess) {
        onSuccess(newBooking);
      }

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setCategory('Traditional & Classic Wear');
      setOutfitType('Iro and Buba');
      setDate('');
      setTimeSlot('Morning (10:00 AM - 12:00 PM)');
      setNotes('');
    }, 1200);
  };

  if (submitSuccess) {
    return (
      <div className="bg-slate-900 border border-emerald-500/30 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto rounded-none">
          <CheckCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-serif font-bold text-white uppercase tracking-wide">
            Consultation Booked Successfully!
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-sans">
            Thank you, <span className="font-bold text-[#D80064]">{submitSuccess.name}</span>. Our Lead Tailor will contact you shortly via phone or email to confirm your exact appointment.
          </p>
        </div>

        {/* Display Summary */}
        <div className="bg-slate-950 p-4 border border-white/5 text-left text-xs space-y-3 max-w-md mx-auto font-mono text-slate-400">
          <div className="border-b border-white/5 pb-2 font-bold text-slate-200 flex justify-between">
            <span>REQUEST SUMMARY</span>
            <span className="text-[#D80064] text-[10px] uppercase">PENDING CONFIRMATION</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-slate-500">Contact:</span>
            <span className="col-span-2 text-slate-300">{submitSuccess.phone} ({submitSuccess.email})</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-slate-500">Service:</span>
            <span className="col-span-2 text-slate-300">{submitSuccess.category} &gt; {submitSuccess.outfitType}</span>
          </div>
          {submitSuccess.date && (
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">Proposed Date:</span>
              <span className="col-span-2 text-slate-300">{submitSuccess.date} ({submitSuccess.timeSlot})</span>
            </div>
          )}
          {submitSuccess.notes && (
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500">Notes:</span>
              <span className="col-span-2 text-slate-300 italic">"{submitSuccess.notes}"</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setSubmitSuccess(null)}
          aria-label="Book another consultation appointment"
          className="border border-[#D80064] text-[#D80064] hover:bg-[#D80064] hover:text-white transition-all text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none font-mono"
        >
          Book Another Consultation
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left font-sans">
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      <div className={compact ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-5"}>
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Full Name *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <User className="w-4 h-4" />
            </span>
            <input
              id="fullName"
              type="text"
              required
              placeholder="e.g. Funmi Adebayo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label htmlFor="phoneNumber" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Phone Number *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <Phone className="w-4 h-4" />
            </span>
            <input
              id="phoneNumber"
              type="tel"
              required
              placeholder="e.g. +234 803 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className={compact ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-5"}>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="emailAddress" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Email Address *
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <Mail className="w-4 h-4" />
            </span>
            <input
              id="emailAddress"
              type="email"
              required
              placeholder="e.g. funmi@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors"
            />
          </div>
        </div>

        {/* Main Category */}
        <div className="space-y-1.5">
          <label htmlFor="requestCategory" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Event / Request Category *
          </label>
          <div className="relative">
            <select
              id="requestCategory"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors appearance-none"
            >
              {Object.keys(FORM_CATEGORY_MAP).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 pointer-events-none">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      <div className={compact ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-5"}>
        {/* Specific Outfit Type */}
        <div className="space-y-1.5">
          <label htmlFor="requestOutfitType" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Specific Outfit / Style *
          </label>
          <div className="relative">
            <select
              id="requestOutfitType"
              value={outfitType}
              onChange={(e) => setOutfitType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors appearance-none"
            >
              {FORM_CATEGORY_MAP[category]?.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 pointer-events-none">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Appointment Date */}
        <div className="space-y-1.5">
          <label htmlFor="appointmentDate" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Preferred Consultation Date (Optional)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              id="appointmentDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors"
            />
          </div>
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Preferred Time Slot */}
          <div className="space-y-1.5">
            <label htmlFor="appointmentTime" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Preferred Time Slot
            </label>
            <div className="relative">
              <select
                id="appointmentTime"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors appearance-none"
              >
                <option value="Morning (10:00 AM - 12:00 PM)">Morning (10:00 AM - 12:00 PM)</option>
                <option value="Midday (12:00 PM - 2:00 PM)">Midday (12:00 PM - 2:00 PM)</option>
                <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
              </select>
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Consultation Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="notes" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Special Instructions or Fit Notes
              </label>
              {onOpenMeasurementGuide && (
                <button
                  type="button"
                  onClick={onOpenMeasurementGuide}
                  className="text-[10px] font-mono uppercase text-[#D80064] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Ruler className="w-3 h-3" />
                  <span>Measurement Guide</span>
                </button>
              )}
            </div>
            <input
              id="notes"
              type="text"
              placeholder="e.g. I will be bringing my own lace fabric"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors"
            />
          </div>
        </div>
      )}

      {compact && (
        <div className="space-y-1.5">
          <label htmlFor="notes" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Special Instructions / Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={2}
            placeholder="e.g. I will be bringing my own lace fabric"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-[#D80064] focus:ring-1 focus:ring-[#D80064] rounded-none transition-colors resize-none"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        aria-label="Submit consultation request"
        className="w-full bg-[#D80064] text-white text-xs font-bold tracking-widest uppercase py-4 rounded-none transition-all duration-300 hover:bg-[#D80064]/90 flex items-center justify-center space-x-2 font-mono disabled:opacity-75 disabled:cursor-wait"
      >
        {isSubmitting ? (
          <>
            <Clock className="w-4 h-4 animate-spin" />
            <span>Processing Booking...</span>
          </>
        ) : (
          <>
            <span>Submit Consultation Request</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
