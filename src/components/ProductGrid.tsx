import { useState, useEffect } from 'react';
import { Search, MessageCircle, ArrowUpRight, Grid, Filter, Scissors, Sparkles, ArrowUpDown, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, Category } from '../types';
import LazyImage from './LazyImage';
import ScrollReveal, { ScrollRevealItem } from './ScrollReveal';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type QuickFilter = 'All' | 'Bridal' | 'Native Wear' | 'Accessories';

export default function ProductGrid({ products, isLoading, searchQuery, onSearchChange }: ProductGridProps) {
  const [selectedQuickTag, setSelectedQuickTag] = useState<QuickFilter>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name-asc'>('newest');
  const [selectedBudgetPreset, setSelectedBudgetPreset] = useState<'all' | 'under50' | '50to150' | 'over150' | 'custom'>('all');
  const [customMaxPrice, setCustomMaxPrice] = useState<number>(300000);

  // Synchronize customMaxPrice default with maximum product price when products load
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => {
        const clean = p.price.replace(/[^\d]/g, '');
        return clean ? parseInt(clean, 10) : 0;
      }).filter(p => p > 0);
      if (prices.length > 0) {
        setCustomMaxPrice(Math.max(...prices));
      }
    }
  }, [products]);

  const quickFilters: { id: QuickFilter; label: string }[] = [
    { id: 'All', label: 'All Masterpieces' },
    { id: 'Bridal', label: 'Bridal & Occasion' },
    { id: 'Native Wear', label: 'Native Wear' },
    { id: 'Accessories', label: 'Accessories' }
  ];

  const parsePrice = (priceStr: string): number => {
    const clean = priceStr.replace(/[^\d]/g, '');
    return clean ? parseInt(clean, 10) : 0;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.postType && product.postType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    // Quick tag collections filter
    if (selectedQuickTag !== 'All') {
      const textToMatch = `${product.title} ${product.category} ${product.postType || ''} ${product.description || ''}`.toLowerCase();
      
      if (selectedQuickTag === 'Bridal') {
        if (!(textToMatch.includes('bridal') || 
              textToMatch.includes('wedding') || 
              textToMatch.includes('gown') || 
              textToMatch.includes('corset') || 
              textToMatch.includes('dress') || 
              textToMatch.includes('statement'))) {
          return false;
        }
      } else if (selectedQuickTag === 'Native Wear') {
        if (!(textToMatch.includes('native') || 
              textToMatch.includes('traditional') || 
              textToMatch.includes('agbada') || 
              textToMatch.includes('aso-oke') || 
              textToMatch.includes('ankara') || 
              textToMatch.includes('classic') || 
              textToMatch.includes('wrapper') || 
              textToMatch.includes('blouse') || 
              textToMatch.includes('kaftan') || 
              textToMatch.includes('boubou'))) {
          return false;
        }
      } else if (selectedQuickTag === 'Accessories') {
        if (!(textToMatch.includes('accessory') || 
              textToMatch.includes('accessories') || 
              textToMatch.includes('kit') || 
              textToMatch.includes('bag') || 
              textToMatch.includes('jacket') || 
              textToMatch.includes('kimono'))) {
          return false;
        }
      }
    }

    // Budget range filter
    const itemPrice = parsePrice(product.price);
    if (selectedBudgetPreset === 'under50') {
      if (itemPrice > 50000) return false;
    } else if (selectedBudgetPreset === '50to150') {
      if (itemPrice < 50000 || itemPrice > 150000) return false;
    } else if (selectedBudgetPreset === 'over150') {
      if (itemPrice < 150000) return false;
    } else if (selectedBudgetPreset === 'custom') {
      if (itemPrice > customMaxPrice) return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return parsePrice(a.price) - parsePrice(b.price);
    }
    if (sortBy === 'price-desc') {
      return parsePrice(b.price) - parsePrice(a.price);
    }
    if (sortBy === 'name-asc') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleWhatsAppOrder = (product: Product) => {
    const brandPhone = "2347043564488";
    const productRef = product.referenceUrl || `${window.location.origin}/#catalog`;
    
    const message = `Hello Go Fashion Home,\nI would like to place an order for the following item:\n- Product Name: ${product.title}\n- Price: ${product.price}\n- Product Reference: ${productRef}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${brandPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section id="catalog" className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <ScrollReveal direction="up" delay={0.1} distance={30}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-bold tracking-widest text-white uppercase bg-[#D80064] px-4 py-2 rounded-none font-mono">
              The Catalog
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl font-serif font-black text-slate-950 dark:text-white tracking-tight uppercase transition-colors duration-300">
              Exquisite Bespoke Collections
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 font-sans text-sm sm:text-base leading-relaxed transition-colors duration-300">
              Browse our premium custom pieces and high-quality tailoring equipment. Select any design below to customize and order directly via WhatsApp with our master tailors.
            </p>
          </div>
        </ScrollReveal>

        {/* Filter, Search, and Sort Panel */}
        <div className="flex flex-col gap-6 mb-12 bg-white dark:bg-slate-950 p-6 rounded-none shadow-none border border-slate-200 dark:border-slate-800 transition-colors duration-300">
          
          {/* Row 1: Categories, Search, and Sort */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-900 transition-colors duration-300">
            {/* Quick Collection Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
              <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center shrink-0">
                <Filter className="w-3.5 h-3.5 mr-2 text-[#D80064]" /> Categories:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedQuickTag(filter.id)}
                    aria-label={`Filter by category: ${filter.label}`}
                    className={`px-4 py-2 rounded-none text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                      selectedQuickTag === filter.id
                        ? 'bg-[#0A235C] dark:bg-[#D80064] text-white border-[#0A235C] dark:border-[#D80064]'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Sort Area */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search styles..."
                  aria-label="Search catalog styles"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-none border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064] focus:border-[#0A235C] dark:focus:border-[#D80064] transition-all bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans"
                />
                <Search className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Sort Dropdown */}
              <div className="relative w-full sm:w-48 flex items-center">
                <span className="absolute left-3 text-slate-400 shrink-0 pointer-events-none">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  aria-label="Sort product catalog by criteria"
                  className="w-full pl-9 pr-8 py-2.5 rounded-none border border-slate-200 dark:border-slate-800 text-xs font-mono uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064] focus:border-[#0A235C] dark:focus:border-[#D80064] transition-all bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Budget/Price Finder (Sliders and Preset categories) */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
            {/* Presets */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 mr-2 text-[#0A235C] dark:text-[#D80064]" /> Price Range:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Any Budget' },
                  { id: 'under50', label: 'Under ₦50k' },
                  { id: '50to150', label: '₦50k - ₦150k' },
                  { id: 'over150', label: 'Over ₦150k' },
                  { id: 'custom', label: 'Custom Slider' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedBudgetPreset(preset.id as any);
                      if (preset.id === 'custom') {
                        const prices = products.map(p => {
                          const clean = p.price.replace(/[^\d]/g, '');
                          return clean ? parseInt(clean, 10) : 0;
                        }).filter(p => p > 0);
                        if (prices.length > 0) {
                          setCustomMaxPrice(Math.max(...prices));
                        }
                      }
                    }}
                    aria-label={`Filter price range: ${preset.label}`}
                    className={`px-3 py-1.5 rounded-none text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedBudgetPreset === preset.id
                        ? 'bg-[#0A235C] dark:bg-[#D80064] text-white border-[#0A235C] dark:border-[#D80064]'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Slider */}
            {selectedBudgetPreset === 'custom' ? (
              <div className="flex items-center gap-4 w-full md:w-80 bg-slate-50 dark:bg-slate-900/40 p-3 border border-slate-150 dark:border-slate-800/80 transition-all duration-300">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">Max Budget</span>
                    <span className="text-xs font-mono font-bold text-[#D80064] dark:text-white">
                      ₦{customMaxPrice.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max={products.length > 0 ? Math.max(...products.map(p => {
                      const clean = p.price.replace(/[^\d]/g, '');
                      return clean ? parseInt(clean, 10) : 0;
                    })) : 300000}
                    step="5000"
                    value={customMaxPrice}
                    onChange={(e) => setCustomMaxPrice(parseInt(e.target.value, 10))}
                    aria-label="Custom maximum budget price slider in Naira"
                    className="w-full accent-[#D80064] dark:accent-white h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center text-[11px] font-mono text-slate-400 dark:text-slate-500 italic transition-all duration-300">
                Select "Custom Slider" to adjust maximum value.
              </div>
            )}
          </div>
        </div>

        {/* Catalog Output */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-slate-950 rounded-none overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-none flex flex-col animate-pulse"
              >
                {/* Image Placeholder with Shimmer */}
                <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
                  {/* Subtle shimmer sheen */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  <Scissors className="w-8 h-8 text-slate-200 dark:text-slate-800" />
                  
                  {/* Category tag skeleton */}
                  <div className="absolute top-3 left-3 bg-slate-200/80 dark:bg-slate-800 h-8 w-24 rounded-none border border-transparent" />
                </div>

                {/* Info Section Placeholder */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-slate-950">
                  <div>
                    {/* Title skeleton */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="h-5 bg-slate-200 dark:bg-slate-800 w-3/4 rounded-none" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 w-4 rounded-none shrink-0" />
                    </div>
                    {/* Description skeleton */}
                    <div className="space-y-2 mb-4">
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-900 w-full rounded-none" />
                      <div className="h-3.5 bg-slate-100 dark:bg-slate-900 w-5/6 rounded-none" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    {/* Price row skeleton */}
                    <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mb-4">
                      <div className="h-3 bg-slate-100 dark:bg-slate-900 w-20 rounded-none" />
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 w-24 rounded-none" />
                    </div>

                    {/* Order CTA button skeleton */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-12 rounded-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-none border border-dashed border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <Scissors className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-slate-800 dark:text-white uppercase">No matching creations found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or filter to see more styles.
            </p>
          </div>
        ) : (
          <ScrollReveal staggerChildren={0.08} direction="up" distance={30}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {sortedProducts.map((product) => (
                <ScrollRevealItem key={product.id}>
                  <article 
                    className="group bg-white dark:bg-slate-950 rounded-none overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-none hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-900 overflow-hidden border-b border-slate-200 dark:border-slate-800">
                      <LazyImage
                        src={product.image}
                        alt={product.title}
                        id={`product-image-${product.id}`}
                        className="transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-[#0A235C] dark:bg-[#D80064] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-none border border-white/10 shadow-sm flex flex-col items-start gap-0.5 z-10">
                        <span className="text-white">{product.category}</span>
                        {product.postType && (
                          <span className="text-pink-300 border-t border-white/10 pt-0.5 mt-0.5 text-[9px] lowercase font-mono">
                            {product.postType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-white dark:bg-slate-950 transition-colors duration-300">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white group-hover:text-[#0A235C] dark:group-hover:text-[#D80064] transition-colors leading-snug uppercase tracking-wide">
                            {product.title}
                          </h3>
                          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#D80064] transition-colors shrink-0 mt-0.5" />
                        </div>
                        {product.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto">
                        {/* Price - Highlighted in Magenta */}
                        <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mb-4">
                          <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Custom Tailoring</span>
                          <span className="text-[#D80064] text-lg font-extrabold font-mono tracking-tight">
                            {product.price}
                          </span>
                        </div>

                        {/* Order CTA Button */}
                        <button
                          onClick={() => handleWhatsAppOrder(product)}
                          aria-label={`Order ${product.title} for ${product.price} via WhatsApp`}
                          className="w-full bg-[#D80064] hover:bg-[#D80064]/95 text-white py-3.5 px-4 rounded-none text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-none hover:scale-[1.02] active:scale-95"
                        >
                          <MessageCircle className="w-4 h-4 fill-current" />
                          <span>Order via WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </article>
                </ScrollRevealItem>
              ))}
            </div>
          </ScrollReveal>
        )}

      </div>
    </section>
  );
}
