import { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionValue } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Tag, ArrowUpRight, Scissors } from 'lucide-react';
import LazyImage from './LazyImage';
import ScrollReveal from './ScrollReveal';
import { Product } from '../types';
import { DEFAULT_PRODUCTS } from '../lib/products';

interface HeroShowcaseProps {
  products: Product[];
  heroImageY?: MotionValue<number>;
  heroImageScale?: MotionValue<number>;
  floatBadgeLeftY?: MotionValue<number>;
  floatBadgeRightY?: MotionValue<number>;
  onInquireProduct?: (productTitle: string) => void;
  onExploreCatalog?: () => void;
}

export default function HeroShowcase({
  products,
  heroImageY,
  heroImageScale,
  floatBadgeLeftY,
  floatBadgeRightY,
  onInquireProduct,
  onExploreCatalog
}: HeroShowcaseProps) {
  // Ensure we have at least 3 products by combining provided products with DEFAULT_PRODUCTS
  let combined = [...products];
  if (combined.length < 3) {
    const existingIds = new Set(combined.map(p => p.id));
    const fallbackItems = DEFAULT_PRODUCTS.filter(p => !existingIds.has(p.id));
    combined = [...combined, ...fallbackItems];
  }

  // Sort by createdAt descending to get the last uploaded products
  const lastUploadedProducts = combined
    .slice()
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3); // Display strictly at least 3 last uploaded products

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 4.5 seconds unless hovered
  useEffect(() => {
    if (isPaused || lastUploadedProducts.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % lastUploadedProducts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, lastUploadedProducts.length]);

  const currentProduct = lastUploadedProducts[activeIndex] || lastUploadedProducts[0] || DEFAULT_PRODUCTS[0];

  const handleNext = () => {
    setActiveIndex((activeIndex + 1) % lastUploadedProducts.length);
  };

  const handlePrev = () => {
    setActiveIndex((activeIndex - 1 + lastUploadedProducts.length) % lastUploadedProducts.length);
  };

  return (
    <div 
      className="relative w-full max-w-md mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header Badge for the Showcase */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D80064]/15 border border-[#D80064]/30 text-[#D80064] text-[10px] font-mono font-bold uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-[#D80064] animate-pulse" />
          <span>3 Latest Atelier Uploads</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          0{activeIndex + 1} / 0{lastUploadedProducts.length}
        </span>
      </div>

      {/* Main Interactive Card Container */}
      <ScrollReveal direction="left" delay={0.2} distance={45}>
        <motion.div 
          style={{ y: heroImageY }}
          className="relative mx-auto aspect-[4/5] rounded-none overflow-hidden border border-white/20 shadow-2xl p-2 bg-gradient-to-tr from-[#D80064] to-[#0A235C] transition-shadow duration-500 ease-out hover:shadow-[#D80064]/25 hover:shadow-3xl group"
        >
          <div 
            id="hero-showcase-image-wrapper"
            className="w-full h-full rounded-none overflow-hidden bg-slate-900 relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct.id || activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-full h-full relative"
              >
                <motion.div style={{ scale: heroImageScale }} className="w-full h-full">
                  <LazyImage
                    src={currentProduct.image}
                    alt={currentProduct.altText || currentProduct.title}
                    id={`hero-showcase-image-${activeIndex}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </motion.div>

                {/* Dark Gradient Overlay for Typography Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85" />

                {/* Active Product Details Badge Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end text-left z-10">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#D80064] bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 border border-[#D80064]/40">
                      <Tag className="w-3 h-3" />
                      {currentProduct.category || 'Atelier Collection'}
                    </span>
                    <span className="text-xs font-serif font-bold text-white bg-[#D80064] px-2.5 py-0.5 shadow-md">
                      {currentProduct.price}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-black text-white uppercase tracking-wide line-clamp-1">
                    {currentProduct.title}
                  </h3>

                  {currentProduct.description && (
                    <p className="text-slate-300 text-[11px] line-clamp-1 font-sans mt-0.5 opacity-90">
                      {currentProduct.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onInquireProduct) {
                          onInquireProduct(`Inquiry for Latest Upload: ${currentProduct.title} (${currentProduct.price})`);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-white hover:text-[#D80064] transition-colors cursor-pointer group/btn"
                    >
                      <span>Inquire This Style</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#D80064] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>

                    {onExploreCatalog && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExploreCatalog();
                        }}
                        className="text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-widest underline cursor-pointer"
                      >
                        All Styles &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Navigation Arrows */}
            {lastUploadedProducts.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  aria-label="Previous product"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950/70 hover:bg-[#D80064] text-white border border-white/20 rounded-none flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer z-20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label="Next product"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-950/70 hover:bg-[#D80064] text-white border border-white/20 rounded-none flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer z-20"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      </ScrollReveal>

      {/* 3 Last Uploaded Products Thumbnails Bar */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {lastUploadedProducts.map((prod, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={prod.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex items-center gap-2 p-1.5 text-left border transition-all duration-300 cursor-pointer overflow-hidden ${
                isActive
                  ? 'bg-slate-900 border-[#D80064] shadow-lg shadow-pink-950/30'
                  : 'bg-slate-950/80 border-white/10 hover:border-white/30 hover:bg-slate-900/60 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-10 h-12 shrink-0 bg-slate-900 overflow-hidden relative border border-white/10">
                <LazyImage
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#D80064] block truncate">
                  Latest 0{idx + 1}
                </span>
                <p className="text-[11px] font-serif font-bold text-white truncate leading-tight">
                  {prod.title}
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  {prod.price}
                </p>
              </div>
              {isActive && (
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#D80064]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Highlight Cards with Counter-Parallax */}
      {floatBadgeLeftY && (
        <motion.div 
          style={{ y: floatBadgeLeftY }}
          className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-md border border-white/15 p-3 sm:p-4 rounded-none shadow-xl flex items-center space-x-3 hidden sm:flex z-20 pointer-events-none"
        >
          <div className="w-9 h-9 bg-[#D80064] rounded-none flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white uppercase tracking-wider">Bespoke Mastery</p>
            <p className="text-[10px] text-slate-400 font-mono">Precision Fitting</p>
          </div>
        </motion.div>
      )}

      {floatBadgeRightY && (
        <motion.div 
          style={{ y: floatBadgeRightY }}
          className="absolute -top-6 -right-6 bg-slate-900/90 backdrop-blur-md border border-white/15 p-3 sm:p-4 rounded-none shadow-xl flex items-center space-x-3 hidden sm:flex z-20 pointer-events-none"
        >
          <div>
            <p className="text-[11px] font-bold text-white uppercase tracking-wider">Local Heritage</p>
            <p className="text-[10px] text-slate-400 font-mono">100% African Pride</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
