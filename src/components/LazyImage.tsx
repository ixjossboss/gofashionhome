import { useState, useEffect } from 'react';
import { Sparkles, Shirt } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  id?: string;
  wrapperClassName?: string;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800';

export default function LazyImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  id,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  ...props
}: LazyImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasTriedFallback(false);
    setHasError(false);
  }, [src]);

  const handleImageError = () => {
    if (!hasTriedFallback && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasTriedFallback(true);
      setCurrentSrc(fallbackSrc);
      setIsLoaded(false);
    } else {
      setHasError(true);
    }
  };

  const elementId = id || (src ? `lazy-img-${src.split('/').pop()?.split('?')[0]}` : 'lazy-img');

  return (
    <div 
      id={`${elementId}-wrapper`}
      className={`relative overflow-hidden w-full h-full bg-slate-100 dark:bg-slate-900 ${wrapperClassName}`}
    >
      {/* Loading Shimmer Overlay */}
      {!isLoaded && !hasError && (
        <div 
          id={`${elementId}-shimmer`}
          className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 dark:bg-slate-900"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 dark:via-white/5 to-transparent -translate-x-full animate-shimmer" />
          <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-[#D80064] rounded-full animate-spin" />
        </div>
      )}

      {/* Luxury Brand Fallback (replaces raw error state) */}
      {hasError && (
        <div 
          id={`${elementId}-fallback`}
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0A235C] via-slate-900 to-[#0A235C] p-4 text-center border border-white/10"
        >
          <div className="w-10 h-10 bg-[#D80064]/20 border border-[#D80064]/40 rounded-none flex items-center justify-center mb-2">
            <Shirt className="w-5 h-5 text-[#D80064]" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#D80064]" /> GO FASHION HOME
          </span>
          <span className="text-[9px] font-mono text-slate-400 max-w-[160px] truncate">
            {alt || 'Bespoke Couture Design'}
          </span>
        </div>
      )}

      {/* The Actual Image with lazy loading and referrerPolicy */}
      {!hasError && currentSrc && (
        <img
          id={elementId}
          src={currentSrc}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}

