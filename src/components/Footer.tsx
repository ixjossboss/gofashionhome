import { useState } from 'react';
import { Mail, Phone, MapPin, Scissors, Instagram, Facebook, MessageCircle, Clock, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (hash: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      const existing = localStorage.getItem('gof_newsletter_subscribers');
      const subscribers = existing ? JSON.parse(existing) : [];
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('gof_newsletter_subscribers', JSON.stringify(subscribers));
      }
    } catch (err) {
      console.error('Failed to save email subscription:', err);
    }
    
    setSubmitted(true);
    setEmail('');
  };

  const localSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ClothingStore"],
    "name": "GO Fashion Home",
    "alternateName": ["GOF", "GO Fashion Home Akure", "GOF Bespoke Tailors"],
    "description": "Elite bespoke custom tailoring, premium Nigerian traditional native wear, bespoke bridal gowns, luxury suits, and premium fashion accessories in Akure, Ondo State. The premier tailoring service in Akure.",
    "image": [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=600"
    ],
    "@id": "https://gofashionhome.com/#localbusiness",
    "url": "https://gofashionhome.com",
    "telephone": "+2347043564488",
    "email": "gofashionhomeacad@gmail.com",
    "priceRange": "₦₦-₦₦₦",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ROAD C, ORE-OFE QUARTERS, OPPOSITE KIKIOWO BUS STOP, ODA ROAD",
      "addressLocality": "Akure",
      "addressRegion": "Ondo State",
      "postalCode": "340110",
      "addressCountry": "NG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 7.2467664,
      "longitude": 5.2163914
    },
    "hasMap": "https://share.google/MEdzuBEmnozB6h0E2",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "08:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://share.google/MEdzuBEmnozB6h0E2",
      "https://instagram.com/gofashionhome",
      "https://facebook.com/gofashionhome",
      "https://tiktok.com/@gofashionhome"
    ],
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Akure"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Ondo State"
      },
      {
        "@type": "AdministrativeArea",
        "name": "Nigeria"
      }
    ],
    "knowsAbout": [
      "Bespoke Tailoring",
      "Native Wear Designing",
      "Traditional Nigerian Men and Women Outfits",
      "Bridal Gowns & Wedding Attire Styling",
      "Custom Suit Stitching",
      "Fashion Design",
      "Akure Tailoring Services",
      "Ondo State Fashion & Style Ateliers"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Bespoke Tailoring & Bridal Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Bespoke Custom Tailoring",
            "description": "Meticulously crafted custom senator fits, agbadas, suits, and bespoke shirts tailormade to precise measurements."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Traditional & Native Wear",
            "description": "Exquisite, cultural, and modern Nigerian native styles, handstitched using finest textiles in Akure."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Bridal Gowns & Bespoke Wedding Attire",
            "description": "Dream wedding dresses, bridesmaid gowns, reception outfits, and comprehensive bridal tailoring services."
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Ready-to-Wear Collection",
            "description": "Premium styled, high quality pre-crafted designs and luxury ready-to-wear pieces."
          }
        }
      ]
    }
  };

  return (
    <footer className="bg-[#0A235C] text-white pt-16 pb-8 border-t border-white/10">
      
      {/* Inject Structured Local Business Schema for Search Engines */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }} 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Atelier Newsletter Integration */}
        <div className="border-b border-white/10 pb-10 mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 transition-all duration-300">
          <div className="max-w-md">
            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#D80064] font-mono mb-1">Seasonal collection launches</h4>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">Stay Connected with the Atelier</h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
              Subscribe to receive exclusive tailoring offers, seasonal couture collection lookbooks, and private fitting slot updates.
            </p>
          </div>
          <div className="w-full lg:w-auto shrink-0 max-w-md">
            {submitted ? (
              <div className="bg-white/5 border border-[#D80064] px-4 py-3 text-xs sm:text-sm text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D80064] shrink-0 animate-pulse" />
                <span>Thank you! Your private invitation has been reserved.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-stretch border border-white/20 bg-white/5 hover:border-white/40 focus-within:border-[#D80064] transition-all">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    aria-label="Email address for newsletter subscription"
                    className="w-full pl-10 pr-4 py-3 bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-0 font-sans"
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="px-6 py-3 bg-[#D80064] hover:bg-[#b00050] text-white text-xs font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-none bg-[#D80064] flex items-center justify-center border border-white/20 shadow-md">
                <span className="font-mono text-xs font-black tracking-widest text-white">GOF</span>
              </div>
              <span className="font-serif text-lg font-bold tracking-tight">GO FASHION HOME</span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              Empowering confidence through fine luxury tailoring, bespoke bridal gowns, elite native wears, and authentic accessories. Engineered for perfection in Akure, Nigeria.
            </p>
            <div className="flex items-center space-x-3">
              <a href="https://instagram.com/gofashionhome" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-none bg-white/5 hover:bg-[#D80064] text-slate-300 hover:text-white transition-all flex items-center justify-center border border-white/10" aria-label="Follow GO Fashion Home on Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://wa.me/2347043564488" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-none bg-white/5 hover:bg-[#D80064] text-slate-300 hover:text-white transition-all flex items-center justify-center border border-white/10" aria-label="Contact GO Fashion Home on WhatsApp">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="https://facebook.com/gofashionhome" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-none bg-white/5 hover:bg-[#D80064] text-slate-300 hover:text-white transition-all flex items-center justify-center border border-white/10" aria-label="Follow GO Fashion Home on Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com/@gofashionhome" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-none bg-white/5 hover:bg-[#D80064] text-slate-300 hover:text-white transition-all flex items-center justify-center border border-white/10" aria-label="Follow GO Fashion Home on TikTok">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.51-.71-.53-1.28-1.22-1.74-1.99v7.41c.02 1.84-.45 3.74-1.63 5.13-1.42 1.75-3.83 2.58-6.02 2.22-2.48-.34-4.75-2.14-5.54-4.57-.91-2.61-.26-5.75 1.68-7.74 1.65-1.74 4.24-2.39 6.51-1.67v4.14c-1.13-.42-2.45-.19-3.32.61-.8.7-.99 1.86-.59 2.81.42.98 1.51 1.56 2.57 1.41 1.09-.1 1.94-.96 2.01-2.06.02-3.15.01-6.31.01-9.47 0-1.48-.02-2.96-.02-4.44z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#D80064] mb-4">The Brand</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 font-sans">
              <li>
                <button onClick={() => onNavigate('#home')} aria-label="Navigate to Bespoke Atelier section" className="hover:text-[#D80064] transition-colors cursor-pointer text-left flex items-center space-x-1.5 group">
                  <span className="text-slate-500 group-hover:text-[#D80064] font-mono text-xs">›</span>
                  <span>Bespoke Atelier</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#catalog')} aria-label="Navigate to Ready-to-Wear Catalog section" className="hover:text-[#D80064] transition-colors cursor-pointer text-left flex items-center space-x-1.5 group">
                  <span className="text-slate-500 group-hover:text-[#D80064] font-mono text-xs">›</span>
                  <span>Ready-to-Wear Catalog</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#guides')} aria-label="Navigate to Tailoring Guides section" className="hover:text-[#D80064] transition-colors cursor-pointer text-left flex items-center space-x-1.5 group">
                  <span className="text-slate-500 group-hover:text-[#D80064] font-mono text-xs">›</span>
                  <span>Tailoring Guides</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#locator')} aria-label="Navigate to Atelier Map Locator section" className="hover:text-[#D80064] transition-colors cursor-pointer text-left flex items-center space-x-1.5 group">
                  <span className="text-slate-500 group-hover:text-[#D80064] font-mono text-xs">›</span>
                  <span>Atelier Map Locator</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('#admin')} aria-label="Navigate to Private Staff Portal" className="hover:text-[#D80064] transition-colors cursor-pointer text-left flex items-center space-x-1.5 group">
                  <span className="text-slate-500 group-hover:text-[#D80064] font-mono text-xs">›</span>
                  <span>Private Staff Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#D80064] mb-4">Hours of Fitting</h4>
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Monday - Saturday</p>
                  <p className="text-xs">08:00 AM - 06:00 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 text-slate-400">
                <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Sunday</p>
                  <p className="text-xs">Closed for fittings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Local Business Details */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#D80064] mb-4">Akure HQ Address</h4>
            <address className="space-y-3 not-italic text-xs sm:text-sm text-slate-300">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                <span className="font-mono uppercase text-xs">
                  ROAD C, ORE-OFE QUARTERS, OPPOSITE KIKIOWO BUS STOP, ODA ROAD AKURE, ONDO STATE
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a href="tel:+2347043564488" aria-label="Call GO Fashion Home at +234 704 356 4488" className="hover:text-white transition-colors">
                  +234 704 356 4488
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a href="mailto:gofashionhomeacad@gmail.com" aria-label="Email GO Fashion Home at gofashionhomeacad@gmail.com" className="hover:text-white transition-colors break-all">
                  gofashionhomeacad@gmail.com
                </a>
              </div>
              <div className="pt-2">
                <a 
                  href="https://share.google/MEdzuBEmnozB6h0E2" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="View GO Fashion Home Google Business Profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#D80064] hover:text-white text-slate-300 border border-white/10 hover:border-transparent text-[11px] font-mono uppercase tracking-wider transition-all"
                >
                  <MapPin className="w-3 h-3 text-[#D80064]" />
                  Google Business Profile
                </a>
              </div>
            </address>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>
            &copy; 2026 GO Fashion Home. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span className="hover:text-white transition-colors">
              Tailoring & Bridal wear in Ondo State
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
