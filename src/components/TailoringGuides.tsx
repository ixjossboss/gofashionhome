import { useState } from 'react';
import { Calendar, Clock, ArrowRight, X, Sparkles, Shirt, Droplets, Flame, Ruler, ChevronDown, HelpCircle, Tag, ShieldCheck, Globe, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LazyImage from './LazyImage';
import MeasurementGuideModal from './MeasurementGuideModal';

interface Guide {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  date: string;
  summary: string;
  image: string;
  keywords: string[];
  content: {
    sectionTitle: string;
    paragraphs: string[];
  }[];
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: any;
}

const faqData: FAQItem[] = [
  {
    id: 'faq-fabric-choices',
    category: 'Fabric Choices',
    icon: Shirt,
    question: 'How do I choose between Ankara, Senator Cashmere, French Lace, or Silk Crepe?',
    answer: 'Our master tailors guide your choice based on garment structure and occasion. High-density Ankara and Cashmere Wool provide defined, crisp lines for Senator suits and Agbadas. Silk Crepe and French Lace offer liquid-smooth drape for evening gowns and reception dresses. You can either supply your own textiles or select from our curated atelier fabric bank in Akure.'
  },
  {
    id: 'faq-turnaround-times',
    category: 'Turnaround Times',
    icon: Clock,
    question: 'What are your standard turnaround times for bespoke fittings and express emergency orders?',
    answer: 'Standard custom bespoke orders take 7 to 14 business days, including a midway fitting session. For urgent events in Akure or Ondo State, we offer Express Tailoring (48 to 72 hours) for Senator wear and standard outfits. Complex bridal gowns and heavily embroidered royal Agbadas recommend 3 to 4 weeks lead time for ultimate precision.'
  },
  {
    id: 'faq-pricing-models',
    category: 'Pricing Models',
    icon: Tag,
    question: 'How are custom bespoke tailoring orders priced compared to ready-to-wear items?',
    answer: 'Ready-to-Wear catalog pieces have fixed transparent prices based on standard sizing. Custom bespoke outfits are priced based on 3 transparent factors: 1) Pattern complexity & corsetry boning, 2) Fabric selection (client-supplied vs. atelier-sourced), and 3) Embroidery intensity (plain, machine damask, or hand-beaded royal embroidery). Detailed quotes are provided up-front with zero hidden fees.'
  },
  {
    id: 'faq-fitting-guarantee',
    category: 'Fittings & Alterations',
    icon: ShieldCheck,
    question: 'What happens if my outfit requires minor adjustments after the final fitting?',
    answer: 'We provide a 100% Precision Fit Guarantee. Every bespoke piece includes complimentary fitting alterations within 14 days of delivery at our Akure showroom. We refine every millimeter until your garment feels like a second skin.'
  },
  {
    id: 'faq-remote-orders',
    category: 'Remote & Shipping',
    icon: Globe,
    question: 'Can I order custom bespoke outfits if I live outside Akure or abroad?',
    answer: 'Absolutely! Over 35% of our clientele resides in Lagos, Abuja, the UK, US, and Canada. We conduct guided virtual measurement consultations over video call, provide easy sizing templates, and ship internationally via express door-to-door courier services.'
  }
];

const guidesData: Guide[] = [
  {
    id: 'fabric-body-type',
    title: 'How to Choose the Right Fabric for Your Body Type',
    subtitle: 'A Masterclass in Silhouette, Drape & Textile Chemistry',
    category: 'Style & Fitting',
    readTime: '5 min read',
    date: 'July 19, 2026',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    summary: 'Discover how different fabrics interact with your body shape to build structure, flow gracefully, and enhance your confidence.',
    keywords: ['Akure bespoke tailoring', 'custom fitting', 'Ankara designs', 'Senatorial wear Akure', 'Ondo State fashion', 'custom wedding gowns'],
    content: [
      {
        sectionTitle: 'The Secret of Textile Dynamics',
        paragraphs: [
          'When it comes to luxury custom tailoring in Akure, the secret to a jaw-dropping garment doesn\'t just lie in the precision of the stitch—it begins with the choice of fabric. Every textile possesses its own weight, drape, memory, and behavior. At GO Fashion Home, we believe that understanding how different fabrics interact with your body type is the ultimate step toward sartorial confidence.',
          'Choosing the wrong fabric for a design can make a perfectly measured piece fit awkwardly. On the other hand, the correct fabric breathes life into a garment, highlighting your best features and creating a spectacular silhouette.'
        ]
      },
      {
        sectionTitle: '1. Understanding Fabric Weight & Structure',
        paragraphs: [
          'Fabric weight determines how much structure a garment can hold. Different silhouettes require distinct levels of rigidness or fluidity.',
          '• Stiff & Structured Fabrics (High-Weight Ankara, Premium Jacquard, Brocade): These fabrics have "memory"—they stay where they are put. They are spectacular for creating shape where there is none, or for cleanly accentuating curves without clinging. If you have a Pear or Athletic shape, structured Ankara is your best friend. A structured Ankara peplum gown or a defined A-line skirt acts as a beautiful sculpture, balancing out your shoulders and drawing eyes to a narrowed waist.',
          '• Fluid & Flowing Fabrics (Chiffon, Silk Crepe, Soft Lace, Georgette): These fabrics drape and contour. They fall close to the skin, moving gracefully with every stride. Perfect for Hourglass and Tall figures, these fabrics celebrate natural curves without adding unnecessary volume. At our Akure fitting atelier, we love using premium silk crepe for custom reception dresses that drape like liquid gold.'
        ]
      },
      {
        sectionTitle: '2. Matching Textiles to Your Silhouette',
        paragraphs: [
          '• The Hourglass Figure: Your goal is to honor your natural balance. Look for medium-weight fabrics with a bit of fluid drape, such as stretch-crepe, premium velvet, or soft lace. Avoid overly stiff stiffeners that hide your natural waistline.',
          '• The Pear Shape: Balance is achieved by drawing attention upward and creating volume at the shoulders. Stiff Ankara or rich lace work perfectly for structured bodices, paired with soft, dark-colored A-line drapes from the waist down.',
          '• The Petite Frame: Opt for lightweight, small-print fabrics. Heavy brocades or oversized Ankara patterns can overwhelm a shorter stature. Instead, vertical-weaving lace or single-toned senator cashmere in matching hues can create an unbroken line, making you appear taller.',
          '• The Athletic / Rectangle Frame: If you have a straighter athletic frame, we use structure to build curves. Rigid Ankara corsetry, structured corsetry, and pleated brocades are perfect for creating the illusion of a defined, cinched waist.'
        ]
      },
      {
        sectionTitle: '3. For the Modern Gentleman: Senator & Agbada Selections',
        paragraphs: [
          'In Ondo State, native menswear demands impeccable crispness. The right textile transforms a traditional outfit from casual to presidential.',
          '• For Senatorial Wear, look for high-twist Italian cashmere or 100% heavy-weight wool. These fabrics resist wrinkling and hold a sharp crease along the trousers and collar, ensuring you stand out at any Akure event.',
          '• For a Royal Agbada, choose premium hand-woven Aso-Oke or high-density damask to ensure the embroidery sits proudly and the shoulders maintain their majestic, boxy silhouette.'
        ]
      },
      {
        sectionTitle: 'Visit Our Akure Fitting Atelier',
        paragraphs: [
          'Ready to experience custom luxury? Visit our Akure showroom at Road C, Ore-Ofe Quarters, Opposite Kikiowo Bus Stop, Oda Road, Akure, Ondo State. Our master fitters are ready to touch, feel, and discuss these premium materials for your next custom look. Let\'s design a silhouette that belongs solely to you.'
        ]
      }
    ]
  },
  {
    id: 'caring-traditional-attire',
    title: 'Caring for Traditional Akure Attire',
    subtitle: 'Preservation and Maintenance Tips for Exquisite Native Wear & Embroidery',
    category: 'Garment Care',
    readTime: '4 min read',
    date: 'July 19, 2026',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
    summary: 'Keep your luxury Ankara, Senator wear, and embroidered Agbada looking brand new for years with these expert care techniques.',
    keywords: ['Akure tailoring care', 'traditional wear maintenance', 'Agbada preservation Ondo', 'best tailor in Akure', 'native wear cleaning'],
    content: [
      {
        sectionTitle: 'Preserving Cultural Masterpieces',
        paragraphs: [
          'Traditional Nigerian attire—be it a heavily embroidered Agbada, a delicate lace dress, a crystal-embellished bridal gown, or custom hand-woven Aso-Oke—is more than just clothing. It is an investment in culture, luxury, and heritage.',
          'As the premier bespoke tailor in Akure, GO Fashion Home has put together this guide to detail how to clean, press, and store your traditional garments so they retain their vibrant colors and pristine shape for generations.'
        ]
      },
      {
        sectionTitle: '1. The Golden Rule of Cleaning: Say No to Harsh Washing',
        paragraphs: [
          '• Embroidered Agbadas & Senator Outfits: Intricate machine and hand-embroidery are held together by specialized threads. Throwing these garments into a standard washing machine is a recipe for disaster—it loosens the tension of the embroidery and ruins the crispness of the collar. Always professional dry-clean your luxury Agbadas and Senator wear.',
          '• Delicate Lace & Ankara: If dry cleaning is not accessible, hand-wash these garments in cold water using a mild, dye-free liquid detergent. Never wring or twist Ankara or lace; instead, press the water out gently by rolling the garment in a clean, dry towel.',
          '• Hand-Woven Aso-Oke: Aso-Oke should never be fully submerged in water. For minor stains, spot-clean immediately using a damp, soft microfiber cloth and a drop of gentle soap.'
        ]
      },
      {
        sectionTitle: '2. The Art of Pressing: Never Burn the Masterpiece',
        paragraphs: [
          '• Ironing Embroidery: Never let a hot iron touch the face of embroidery directly! This can melt the threads, burn the delicate fibers, and flatten the dimensional texture. Always turn the garment inside out and place a clean, white cotton pressing cloth over the embroidery before applying heat. Use medium steam.',
          '• Ankara & Senator Wear: Iron while the fabric is slightly damp to erase tough creases easily. Use a high heat setting for 100% cotton Ankara, but drop it to medium-low for cashmere blends to prevent shine marks.'
        ]
      },
      {
        sectionTitle: '3. Storage and Preservation Secrets',
        paragraphs: [
          'Proper storage is the ultimate shield against the elements, especially in the tropical climate of Ondo State.',
          '• Never Hang Heavy Agbadas: The sheer weight of an Agbada can stretch the shoulder lines and cause the fabric to sag or warp on a hanger. Instead, fold your Agbada neatly and store it flat in a breathable cotton garment bag.',
          '• Avoid Plastic Garment Bags: Plastic traps moisture, which can lead to mold, mildew, and yellowing of white lace or bridal gowns in our humid climate. Use acid-free tissue paper and breathable fabric bags.',
          '• Keep Away from Direct Sunlight: Store your colorful Ankara and custom pieces in a cool, dark wardrobe. Prolonged exposure to sunlight will fade those rich, premium dyes that define GO Fashion Home\'s collections.'
        ]
      },
      {
        sectionTitle: 'A Lifetime of Sartorial Excellence',
        paragraphs: [
          'By incorporating these simple steps into your routine, your bespoke wear will always look fresh, sharp, and regal. For major restoration, professional resizing, or custom repairs, the team at GO Fashion Home is always happy to assist you at our Akure atelier.'
        ]
      }
    ]
  },
  {
    id: 'measurement-guide',
    title: 'Tailoring Measurement Guide: How to Take Body Figures',
    subtitle: 'Precision Measurement Techniques for Corsets, Dresses, and Native Attire',
    category: 'Fitting & Measurement',
    readTime: '6 min read',
    date: 'July 25, 2026',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600',
    summary: 'Master the art of measuring yourself for bespoke tailoring. Step-by-step instructions for bust, underbust, waist, hips, and gown lengths.',
    keywords: ['Akure measurement guide', 'self measuring tailoring', 'corset measurement Akure', 'how to measure bust waist hips', 'Senator outfit measurement'],
    content: [
      {
        sectionTitle: 'Why Accurate Measurements Matter',
        paragraphs: [
          'Custom tailoring is an art form built on precision millimeter accuracy. Whether you are ordering a fitted corset dress for an Akure wedding or a traditional Senator outfit, taking exact body measurements ensures your garment sits comfortably without pulling or gaping.',
          'At GO Fashion Home, we provide a complete interactive popup measurement tool right here on our website so you can record your dimensions before your consultation appointment.'
        ]
      },
      {
        sectionTitle: 'Core Measurement Guidelines',
        paragraphs: [
          '1. Use a Flexible Cloth Tape: Always use a soft tailor\'s tape measure—never a rigid metal tape measure used for construction.',
          '2. Natural Standing Posture: Stand naturally with feet close together and arms relaxed at your sides. Do not hold your breath or suck in your stomach.',
          '3. The Two-Finger Rule: Slide two fingers flat under the measuring tape when checking waist and chest boundaries to allow comfortable movement and breathing room.',
          '4. Bra Selection Matters: For womenswear and corsetry, wear the exact undergarment or bra style you plan to wear beneath the finished outfit.'
        ]
      },
      {
        sectionTitle: 'Key Anatomical Landmarks',
        paragraphs: [
          '• Bust / Chest: Wrap tape horizontally around the fullest part of your bust.',
          '• Underbust: Measure snugly directly under the bust line (essential for boned corsetry).',
          '• Natural Waist: Measure around the narrowest section above your navel.',
          '• Full Hip: Measure around the widest part of your hips and glutes.',
          '• Full Length: From shoulder peak down to your desired hemline, accounting for heel height.'
        ]
      }
    ]
  }
];

interface TailoringGuidesProps {
  onBookConsultation?: (measurementNotes?: string) => void;
}

export default function TailoringGuides({ onBookConsultation }: TailoringGuidesProps) {
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-fabric-choices');

  return (
    <section id="guides" className="py-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800 relative scroll-mt-16 transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(216,0,100,0.05),transparent_40%)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D80064]/10 border border-[#D80064]/20 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#D80064] mb-4">
            Atelier Journals & Mastery
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-950 dark:text-white uppercase" id="guides-title">
            Tailoring Guides & Styling
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 font-sans max-w-2xl mx-auto">
            Expert insights from Akure's premier bespoke tailoring house. Learn the secrets of luxury fabric pairing, garment silhouettes, and preservation of native wear.
          </p>
        </div>

        {/* Featured Interactive Measurement Guide Hero Callout */}
        <div className="max-w-5xl mx-auto mb-12 bg-gradient-to-r from-[#0A235C] via-slate-900 to-slate-950 border border-[#D80064]/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D80064]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#D80064]">
                <Ruler className="w-4 h-4" />
                Interactive Customer Tool
              </div>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white uppercase tracking-wide">
                Tailoring Measurement Guide
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Taking measurements before your consultation? Use our interactive guide to measure bust, waist, hips, sleeve, and gown lengths accurately with pro tailor tips.
              </p>
            </div>

            <button
              onClick={() => setIsMeasurementModalOpen(true)}
              id="open-measurement-guide-modal-btn"
              className="bg-[#D80064] hover:bg-[#D80064]/90 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 flex items-center space-x-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-pink-900/30 hover:scale-105 active:scale-95"
            >
              <Ruler className="w-4 h-4" />
              <span>Launch Measurement Guide</span>
            </button>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {guidesData.map((guide) => (
            <div 
              key={guide.id}
              id={`guide-card-${guide.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none overflow-hidden hover:border-[#D80064]/40 dark:hover:border-[#D80064]/40 hover:shadow-lg dark:hover:shadow-black/30 transition-all duration-300 flex flex-col group"
            >
              <div className="aspect-[16/9] relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                <LazyImage 
                  src={guide.image} 
                  alt={guide.title}
                  id={`guide-image-${guide.id}`}
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-[#D80064] z-10">
                  {guide.category}
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {guide.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {guide.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-slate-950 dark:text-white mb-3 group-hover:text-[#D80064] dark:group-hover:text-[#D80064] transition-colors leading-tight">
                    {guide.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                    {guide.summary}
                  </p>
                </div>

                <button
                  id={`btn-read-guide-${guide.id}`}
                  onClick={() => setSelectedGuide(guide)}
                  aria-label={`Read full guide: ${guide.title}`}
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-950 dark:text-white hover:text-[#D80064] dark:hover:text-[#D80064] transition-colors group/btn cursor-pointer self-start"
                >
                  Read Full Guide 
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Garment Care Quick Guide Section */}
        <div className="mt-20 pt-16 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D80064] mb-2 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Garment Care & Longevity
            </h4>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 dark:text-white uppercase">
              Preserving Your Masterpieces
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2">
              Bespoke garments are investments in heritage and style. Follow these professional tips to maintain the rich texture, crisp lines, and brilliant colors of your custom attire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            
            {/* Senator & Agbada Care */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#D80064]/20">
              <div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-[#0A235C] dark:text-[#D80064] mb-4">
                  <Shirt className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-serif font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-2">
                  Bespoke Native Wear
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Heavy embroidered Agbadas should be folded flat in breathable cotton garment bags instead of hung, to prevent shoulder lines from stretching and sagging over time.
                </p>
              </div>
              <div className="mt-4 text-[10px] font-mono font-bold text-[#D80064] dark:text-slate-500 uppercase tracking-widest">
                Agbadas & Senators
              </div>
            </div>

            {/* Delicate Fabrics Care */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#D80064]/20">
              <div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-[#0A235C] dark:text-[#D80064] mb-4">
                  <Droplets className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-serif font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-2">
                  Delicate Wash Rules
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Hand-wash premium French laces, soft crepes, and luxury silks in cold water with dye-free liquid detergent. Never wring or machine-spin delicate, custom-beaded gowns.
                </p>
              </div>
              <div className="mt-4 text-[10px] font-mono font-bold text-[#D80064] dark:text-slate-500 uppercase tracking-widest">
                Lace & Silk Crepe
              </div>
            </div>

            {/* Pressing and Ironing Care */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#D80064]/20">
              <div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-[#0A235C] dark:text-[#D80064] mb-4">
                  <Flame className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-serif font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-2">
                  Precision Ironing
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Turn embroidered pieces inside-out and place a clean white cotton cloth over embroidery before pressing with medium steam. Never let iron direct contact touch lace or crystals.
                </p>
              </div>
              <div className="mt-4 text-[10px] font-mono font-bold text-[#D80064] dark:text-slate-500 uppercase tracking-widest">
                Embroidery & Beads
              </div>
            </div>

            {/* Prints & Storage Care */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between transition-all duration-300 hover:border-[#D80064]/20">
              <div>
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 text-[#0A235C] dark:text-[#D80064] mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-serif font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-2">
                  Ankara & Storage
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Store premium Ankara away from humid walls and direct sunlight to prevent colors from fading. Wash print designs separately to avoid any minor bleed onto other garments.
                </p>
              </div>
              <div className="mt-4 text-[10px] font-mono font-bold text-[#D80064] dark:text-slate-500 uppercase tracking-widest">
                Prints & Cotton
              </div>
            </div>

          </div>
        </div>

        {/* Interactive FAQ Accordion Section */}
        <div className="mt-20 pt-16 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D80064]/10 border border-[#D80064]/20 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#D80064] mb-3">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 dark:text-white uppercase">
              Bespoke Tailoring & Atelier FAQ
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
              Click any question below to explore our fabric recommendations, turnaround timelines, transparent pricing models, and fitting guarantees.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq) => {
              const isOpen = openFaqId === faq.id;
              const IconComp = faq.icon;

              return (
                <div
                  key={faq.id}
                  id={`accordion-item-${faq.id}`}
                  className={`bg-white dark:bg-slate-900 border transition-all duration-300 rounded-none overflow-hidden ${
                    isOpen 
                      ? 'border-[#D80064] shadow-md dark:shadow-black/50' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`accordion-content-${faq.id}`}
                    id={`accordion-button-${faq.id}`}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#D80064]"
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 pr-2">
                      <div className={`w-9 h-9 shrink-0 flex items-center justify-center border transition-colors ${
                        isOpen 
                          ? 'bg-[#D80064] text-white border-[#D80064]' 
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#D80064] block mb-0.5">
                          {faq.category}
                        </span>
                        <h4 className="text-sm sm:text-base font-serif font-bold text-slate-950 dark:text-white leading-snug">
                          {faq.question}
                        </h4>
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-none shrink-0 flex items-center justify-center border transition-transform duration-300 ${
                      isOpen
                        ? 'bg-[#D80064]/10 border-[#D80064]/30 text-[#D80064] rotate-180'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`accordion-content-${faq.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans bg-slate-50/50 dark:bg-slate-950/30">
                          <p>{faq.answer}</p>
                          <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                            <span className="text-slate-500 font-mono">
                              Have more specific questions?
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onBookConsultation) {
                                  onBookConsultation(`Inquiry regarding: ${faq.question}`);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 text-[#D80064] font-mono font-bold uppercase tracking-wider hover:underline cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Ask Master Tailor</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Local search callout */}
        <div className="mt-16 bg-[#0A235C]/5 dark:bg-[#0A235C]/20 border border-[#0A235C]/10 dark:border-[#0A235C]/40 p-6 max-w-3xl mx-auto text-center rounded-none">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans">
            Need tailored advice or custom measurements? Reach out to <strong className="text-slate-950 dark:text-white">GO Fashion Home</strong>, the most trusted bespoke tailor in Akure, Ondo State. Let's craft your masterpiece.
          </p>
        </div>

      </div>

      {/* Guide Article Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none shadow-2xl overflow-hidden my-8"
              id="guide-modal-content"
            >
              {/* Header Image Cover */}
              <div className="relative h-48 sm:h-64 bg-slate-100 dark:bg-slate-950">
                <LazyImage 
                  src={selectedGuide.image} 
                  alt={selectedGuide.title}
                  id={`guide-modal-image-${selectedGuide.id}`}
                  className="opacity-90 dark:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent z-10" />
                
                {/* Close Button */}
                <button
                  id="close-guide-modal-btn"
                  onClick={() => setSelectedGuide(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-none flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Guide Modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6">
                  <div className="inline-block bg-[#D80064] text-white text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 mb-2">
                    {selectedGuide.category}
                  </div>
                  <h1 className="text-xl sm:text-3xl font-serif font-black tracking-tight text-slate-950 dark:text-white uppercase drop-shadow-md leading-tight">
                    {selectedGuide.title}
                  </h1>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 font-sans text-sm leading-relaxed scrollbar-thin">
                
                {/* Intro Subtitle */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <p className="text-slate-600 dark:text-slate-400 font-serif italic text-base">
                    {selectedGuide.subtitle}
                  </p>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-2">
                    <span>Published: {selectedGuide.date}</span>
                    <span>•</span>
                    <span>Read Time: {selectedGuide.readTime}</span>
                    <span>•</span>
                    <span>By: GO Fashion Home Fitting Masters</span>
                  </div>
                </div>

                {/* Main Body */}
                {selectedGuide.content.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-md font-serif font-bold text-slate-950 dark:text-white uppercase tracking-wide border-l-2 border-[#D80064] pl-3">
                      {sec.sectionTitle}
                    </h4>
                    {sec.paragraphs.map((p, pidx) => (
                      <p key={pidx} className="text-slate-600 dark:text-slate-300">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}

                {/* SEO Keyword Footer / Tags */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-xs font-mono uppercase tracking-widest text-[#D80064] mb-2.5">SEO keywords & Local Authority Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.keywords.map((kw, kwIdx) => (
                      <span key={kwIdx} className="text-[10px] font-mono bg-slate-50 dark:bg-slate-950 px-2 py-1 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        #{kw.replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer CTA */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-slate-600 dark:text-slate-400 text-xs text-center sm:text-left">
                  Schedule your tailored session in our Akure atelier.
                </p>
                <div className="flex gap-3 w-full sm:w-auto justify-center">
                  <button
                    id="guide-modal-close-btn"
                    onClick={() => setSelectedGuide(null)}
                    aria-label="Close guide details modal"
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white text-xs font-mono uppercase tracking-widest cursor-pointer"
                  >
                    Close
                  </button>
                  <a
                    id="guide-modal-whatsapp-btn"
                    href="https://wa.me/2347043564488"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Contact WhatsApp Atelier for advice"
                    className="px-4 py-2 bg-[#D80064] hover:bg-[#D80064]/95 text-white text-xs font-bold tracking-widest uppercase cursor-pointer"
                  >
                    WhatsApp Atelier
                  </a>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Measurement Guide Modal Overlay */}
      <MeasurementGuideModal
        isOpen={isMeasurementModalOpen}
        onClose={() => setIsMeasurementModalOpen(false)}
        onBookConsultation={(notes) => {
          setIsMeasurementModalOpen(false);
          if (onBookConsultation) {
            onBookConsultation(notes);
          }
        }}
      />
    </section>
  );
}
