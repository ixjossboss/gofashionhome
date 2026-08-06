import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { Scissors, Heart, ArrowDown, ShoppingBag, Eye, Users, Award, Shirt, Crown, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import Header, { VisualTheme } from './components/Header';
import ProductGrid from './components/ProductGrid';
import TailoringGuides from './components/TailoringGuides';
import MapLocator from './components/MapLocator';
import Footer from './components/Footer';
import { Product } from './types';
import ConsultationModal from './components/ConsultationModal';
import MeasurementGuideModal from './components/MeasurementGuideModal';
import SplashScreen from './components/SplashScreen';
import WhatsAppFAB from './components/WhatsAppFAB';
import BackToTop from './components/BackToTop';
import { DEFAULT_PRODUCTS } from './lib/products';
import LazyImage from './components/LazyImage';
import ScrollReveal, { ScrollRevealItem } from './components/ScrollReveal';
import SEO from './components/SEO';
import HeroShowcase from './components/HeroShowcase';

const AdminPortal = lazy(() => import('./pages/AdminPortal'));


export default function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isMeasurementGuideOpen, setIsMeasurementGuideOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenConsultationWithNotes = (notes?: string) => {
    if (notes) {
      setConsultationNotes(notes);
    }
    setIsConsultationOpen(true);
  };

  // Parallax scroll hooks for luxury hero section using window scrollY
  const { scrollY } = useScroll();

  const heroImageY = useTransform(scrollY, [0, 600], [0, 60]);
  const heroImageScale = useTransform(scrollY, [0, 600], [1, 1.08]);
  const floatBadgeLeftY = useTransform(scrollY, [0, 600], [0, -30]);
  const floatBadgeRightY = useTransform(scrollY, [0, 600], [0, -45]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('gof_theme');
    // Default to dark since GO Fashion Home branding is elegant luxury dark!
    return saved ? saved === 'dark' : true;
  });

  const [visualTheme, setVisualTheme] = useState<VisualTheme>(() => {
    const saved = localStorage.getItem('gof_visual_theme');
    return (saved === 'modern' || saved === 'minimal' || saved === 'classic') ? saved : 'classic';
  });

  // Synchronize visual theme preference
  useEffect(() => {
    localStorage.setItem('gof_visual_theme', visualTheme);
    document.documentElement.setAttribute('data-visual-theme', visualTheme);
  }, [visualTheme]);

  // Keep dark/light mode preference synchronized with localstorage
  useEffect(() => {
    localStorage.setItem('gof_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Synchronize hash state for back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      setCurrentHash(hash);
      
      if (hash && hash !== '#admin' && hash !== '#guides' && hash !== '#locator') {
        // Wait for React to render/mount the home sections if we're coming from admin/guides/locator page
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (hash === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 150);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial scroll on load
    setTimeout(handleHashChange, 300);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchProducts = async (retries = 2) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          return;
        }
      }
      throw new Error('Server returned invalid product catalog response format');
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchProducts(retries - 1), 300);
        return;
      }
      console.warn('Network API fetch unvailable, loading default products catalog:', err);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleNavigate = (hash: string) => {
    window.location.hash = hash;
    setCurrentHash(hash);
  };

  const getSeoDetails = (hash: string) => {
    switch (hash) {
      case '#catalog':
        return {
          title: "Ready-To-Wear & Custom Fashion Catalog | GO Fashion Home Akure",
          description: "Explore GO Fashion Home's bespoke catalog: Royal Agbada sets, Imperial dresses, Aso-Oke outfits, tailor scissors, and sewing accessories in Akure.",
          canonicalUrl: "https://gofashionhome.com/#catalog"
        };
      case '#guides':
        return {
          title: "Tailoring & Fitting Guides | GO Fashion Home Akure",
          description: "Master measurement techniques, fabric selection, and garment care with GO Fashion Home's luxury tailoring masterclass and body measurement guide.",
          canonicalUrl: "https://gofashionhome.com/#guides"
        };
      case '#locator':
        return {
          title: "Akure Atelier Store Locator | GO Fashion Home",
          description: "Visit our physical tailoring showroom at Oda Road Akure, Ondo State. Book an in-person measurement appointment with our master tailor.",
          canonicalUrl: "https://gofashionhome.com/#locator"
        };
      case '#admin':
        return {
          title: "Staff & Management Portal | GO Fashion Home",
          description: "Internal staff administration portal for GO Fashion Home catalog management and consultation appointments.",
          canonicalUrl: "https://gofashionhome.com/#admin"
        };
      default:
        return {
          title: "GO Fashion Home - Luxury Bespoke Tailoring & Fashion House, Akure",
          description: "GO Fashion Home is Akure's premier bespoke fashion brand. Expert tailoring for majestic native wear, custom royal Agbada, bride/groom attire, and premium tailoring accessories in Ondo State, Nigeria.",
          canonicalUrl: "https://gofashionhome.com/"
        };
    }
  };

  const seoInfo = getSeoDetails(currentHash);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans selection:bg-[#D80064] selection:text-white transition-colors duration-300`}>
      <SEO 
        title={seoInfo.title}
        description={seoInfo.description}
        canonicalUrl={seoInfo.canonicalUrl}
      />

      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#D80064] focus:text-white focus:outline-none focus:ring-2 focus:ring-white text-xs font-mono font-bold uppercase tracking-widest shadow-2xl"
      >
        Skip to Main Content
      </a>
      
      {/* Header */}
      <Header 
        currentHash={currentHash} 
        onNavigate={handleNavigate} 
        onOpenConsultation={() => setIsConsultationOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        visualTheme={visualTheme}
        onSelectVisualTheme={setVisualTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <main id="main-content" className="flex-grow">
        {currentHash === '#admin' ? (
          <div className="pt-20">
            {/* Elegant Back Nav Bar across Admin and other pages */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <button
                onClick={() => handleNavigate('#home')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-mono uppercase tracking-widest transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#D80064]" />
                Back to Home Page
              </button>
            </div>
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-2 border-[#D80064]/20 rounded-full animate-pulse" />
                  <div className="absolute inset-2 border-t-2 border-[#D80064] rounded-full animate-spin" />
                </div>
                <p className="text-slate-400 text-xs font-mono uppercase tracking-widest animate-pulse">Establishing Secure Atelier Link...</p>
              </div>
            }>
              <AdminPortal 
                onProductAdded={fetchProducts} 
                onNavigateHome={() => handleNavigate('#home')} 
              />
            </Suspense>
          </div>
        ) : currentHash === '#guides' ? (
          <div className="pt-20">
            {/* Elegant Back Nav Bar across Admin and other pages */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <button
                onClick={() => handleNavigate('#home')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-mono uppercase tracking-widest transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#D80064]" />
                Back to Home Page
              </button>
            </div>
            <TailoringGuides onBookConsultation={handleOpenConsultationWithNotes} />
          </div>
        ) : currentHash === '#locator' ? (
          <div className="pt-20">
            {/* Elegant Back Nav Bar across Admin and other pages */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <button
                onClick={() => handleNavigate('#home')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-none text-xs font-mono uppercase tracking-widest transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#D80064]" />
                Back to Home Page
              </button>
            </div>
            <MapLocator />
          </div>
        ) : (
          <>
            {/* Luxury Hero Banner Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-slate-950">
          
          {/* Subtle Aesthetic Overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,0,100,0.12),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(10,35,92,0.6),transparent_55%)]" />
          
          {/* Geometric Accent rotated blocks */}
          <div className="absolute top-24 left-12 w-48 h-48 bg-white/5 rotate-45 pointer-events-none hidden lg:block" />
          <div className="absolute bottom-36 right-1/3 w-64 h-64 bg-[#D80064]/5 -rotate-12 pointer-events-none hidden lg:block" />
          
          {/* Animated Background Line Art Decor */}
          <div className="absolute inset-y-0 right-0 w-1/2 opacity-10 pointer-events-none hidden md:block">
            <svg className="w-full h-full text-white stroke-current" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
              <path d="M0,50 L100,50" strokeWidth="0.5" />
              <path d="M50,0 L50,100" strokeWidth="0.3" />
              <path d="M0,0 L100,100" strokeWidth="0.2" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 text-center md:text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              
              {/* Hero Copywriting */}
              <div className="md:col-span-7 space-y-8">

                <ScrollReveal direction="up" delay={0.1} distance={40}>
                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-6xl font-serif font-black tracking-tight leading-[1.1] text-white uppercase">
                      Welcome to <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-[#D80064]">
                        GO FASHION HOME
                      </span>
                    </h1>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-sans">
                      We make clothes for women who know how they want to look and just need someone who can sew it right. We do traditional wear, occasion pieces, and full custom tailoring, all in-house.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Hero CTAs */}
                <ScrollReveal direction="up" delay={0.2} distance={30}>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => handleNavigate('#catalog')}
                      className="bg-[#D80064] text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-none transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-pink-900/10 cursor-pointer"
                    >
                      Explore Ready-to-Wear
                    </button>
                    <button
                      onClick={() => setIsConsultationOpen(true)}
                      className="bg-white/10 hover:bg-[#D80064] border border-white/20 text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-none transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Book A Consultation
                    </button>
                    <button
                      onClick={() => handleNavigate('#locator')}
                      className="border border-white/10 hover:border-white/20 bg-transparent text-slate-400 hover:text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-none transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Locate Atelier
                    </button>
                  </div>
                </ScrollReveal>

                {/* Trust Points */}
                <ScrollReveal direction="up" delay={0.3} distance={25}>
                  <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg mx-auto md:mx-0">
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white font-serif">100%</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Custom Tailored</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white font-serif">Corsets</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Mastery Experts</p>
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-white font-serif">Akure, NG</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Physical Presence</p>
                    </div>
                  </div>
                </ScrollReveal>

              </div>

              {/* Hero Interactive Showcase displaying at least 3 last uploaded products */}
              <div className="md:col-span-5 relative">
                <HeroShowcase
                  products={products}
                  heroImageY={heroImageY}
                  heroImageScale={heroImageScale}
                  floatBadgeLeftY={floatBadgeLeftY}
                  floatBadgeRightY={floatBadgeRightY}
                  onInquireProduct={handleOpenConsultationWithNotes}
                  onExploreCatalog={() => handleNavigate('#catalog')}
                />
              </div>

            </div>
          </div>

          {/* Scroll Down Anchor */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center animate-bounce cursor-pointer" onClick={() => handleNavigate('#values')}>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block mb-2">Our Pillars</span>
            <ArrowDown className="w-4 h-4 mx-auto text-slate-400" />
          </div>

        </section>

        {/* Pillars / Brand Value Proposition Section */}
        <section id="values" className="py-24 bg-[#0A235C] relative overflow-hidden border-t border-b border-white/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rotate-45"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Header */}
            <ScrollReveal direction="up" delay={0.1} distance={30}>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-serif font-black tracking-tight text-white uppercase">
                  WHAT WE SEW FOR YOU
                </h2>
                <p className="text-slate-200 text-sm mt-3 font-sans">
                  We do traditional wear, occasion pieces, and full custom tailoring, all in-house.
                </p>
              </div>
            </ScrollReveal>

            {/* Bento Values Grid */}
            <ScrollReveal staggerChildren={0.12} direction="up" distance={40}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Classics */}
                <ScrollRevealItem>
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-none hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden cursor-pointer h-full"
                  >
                    <div className="absolute bottom-0 left-0 h-[3px] bg-[#D80064] w-0 group-hover:w-full transition-all duration-300 ease-out" />
                    <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-[#D80064] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    
                    <div className="w-12 h-12 bg-[#D80064] text-white rounded-none flex items-center justify-center mb-6 border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Crown className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white mb-2 uppercase tracking-wide">The Classics</h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Iro and Buba, Boubou, Kaftans, Female Agbada, George wrappers, and Blouse, if you want the classics done properly.
                    </p>
                  </motion.div>
                </ScrollRevealItem>

                {/* Structured / Fitted */}
                <ScrollRevealItem>
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-none hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden cursor-pointer h-full"
                  >
                    <div className="absolute bottom-0 left-0 h-[3px] bg-[#D80064] w-0 group-hover:w-full transition-all duration-300 ease-out" />
                    <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-[#D80064] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />

                    <div className="w-12 h-12 bg-[#D80064] text-white rounded-none flex items-center justify-center mb-6 border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Heart className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white mb-2 uppercase tracking-wide">Structured & Fitted</h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Ankara peplum gowns, Corset dresses, Mermaid gowns, Jumpsuits, Wrap Dresses, if you want something more structured or fitted.
                    </p>
                  </motion.div>
                </ScrollRevealItem>

                {/* Easier Days */}
                <ScrollRevealItem>
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-none hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden cursor-pointer h-full"
                  >
                    <div className="absolute bottom-0 left-0 h-[3px] bg-[#D80064] w-0 group-hover:w-full transition-all duration-300 ease-out" />
                    <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-[#D80064] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />

                    <div className="w-12 h-12 bg-[#D80064] text-white rounded-none flex items-center justify-center mb-6 border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white mb-2 uppercase tracking-wide">The Easier Days</h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Kimonos, maxi dresses, skirt and blouse sets for the easier days.
                    </p>
                  </motion.div>
                </ScrollRevealItem>

                {/* Office / English Wear */}
                <ScrollRevealItem>
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-none hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden cursor-pointer h-full"
                  >
                    <div className="absolute bottom-0 left-0 h-[3px] bg-[#D80064] w-0 group-hover:w-full transition-all duration-300 ease-out" />
                    <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-[#D80064] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />

                    <div className="w-12 h-12 bg-[#D80064] text-white rounded-none flex items-center justify-center mb-6 border border-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Scissors className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-white mb-2 uppercase tracking-wide">For The Office</h3>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      Blazers, trousers, and English wear for the office.
                    </p>
                  </motion.div>
                </ScrollRevealItem>

              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* Dynamic Products Catalog */}
        <ProductGrid 
          products={products} 
          isLoading={isLoading} 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* SEO Editorial block - Local Authority and Search Presence */}
        <section className="py-20 bg-slate-950 border-t border-slate-900 relative">
          <ScrollReveal direction="up" delay={0.1} distance={35}>
            <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-wider text-[#D80064] uppercase">
                Every piece is fitted to you. Not the other way around.
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans text-center max-w-3xl mx-auto">
                Bring us a wedding, a birthday, a work event, or a wardrobe you're just tired of. Come in for a consultation and we'll sort out what you actually need.
              </p>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-mono text-center max-w-2xl mx-auto">
                Find us at ROAD C, ORE-OFE QUARTERS, OPPOSITE KIKIOWO BUS STOP, ODA ROAD AKURE, ONDO STATE, or send a message to book your consultation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-mono text-slate-500">
                <span className="bg-white/5 px-3 py-1.5 rounded-none border border-white/5">#AkureTailoring</span>
                <span className="bg-white/5 px-3 py-1.5 rounded-none border border-white/5">#OndoStateFashion</span>
                <span className="bg-white/5 px-3 py-1.5 rounded-none border border-white/5">#CorsetMastery</span>
                <span className="bg-white/5 px-3 py-1.5 rounded-none border border-white/5">#BridalAtelier</span>
                <span className="bg-white/5 px-3 py-1.5 rounded-none border border-white/5">#GoFashionHome</span>
              </div>
            </div>
          </ScrollReveal>
        </section>
          </>
        )}
      </main>

      {/* Footer (JSON-LD Injected here) */}
      <Footer onNavigate={handleNavigate} />

      {/* Overlays and Modals */}
      <ConsultationModal 
        isOpen={isConsultationOpen} 
        onClose={() => setIsConsultationOpen(false)} 
        initialNotes={consultationNotes}
        onOpenMeasurementGuide={() => setIsMeasurementGuideOpen(true)}
      />

      <MeasurementGuideModal
        isOpen={isMeasurementGuideOpen}
        onClose={() => setIsMeasurementGuideOpen(false)}
        onBookConsultation={handleOpenConsultationWithNotes}
      />

      <WhatsAppFAB />
      <BackToTop />

    </div>
  );
}
