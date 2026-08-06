import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search, Instagram, Facebook, MessageCircle, Sun, Moon, Sparkles, Palette, Sliders, ChevronDown, Check } from 'lucide-react';

export type VisualTheme = 'classic' | 'modern' | 'minimal';

interface HeaderProps {
  currentHash: string;
  onNavigate: (hash: string) => void;
  onOpenConsultation: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  visualTheme: VisualTheme;
  onSelectVisualTheme: (theme: VisualTheme) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const THEME_OPTIONS: { id: VisualTheme; label: string; icon: any; tag: string }[] = [
  { id: 'classic', label: 'Classic', icon: Sparkles, tag: 'Bespoke Luxury' },
  { id: 'modern', label: 'Modern', icon: Palette, tag: 'Contemporary' },
  { id: 'minimal', label: 'Minimal', icon: Sliders, tag: 'Haute Editorial' },
];

export default function Header({ 
  currentHash, 
  onNavigate, 
  onOpenConsultation, 
  isDarkMode, 
  onToggleDarkMode,
  visualTheme,
  onSelectVisualTheme,
  searchQuery,
  onSearchChange
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close theme menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentThemeObj = THEME_OPTIONS.find(t => t.id === visualTheme) || THEME_OPTIONS[0];
  const CurrentThemeIcon = currentThemeObj.icon;

  const handleLinkClick = (hash: string) => {
    onNavigate(hash);
    setIsOpen(false);
  };

  const navItems: { label: string; hash: string; icon?: any }[] = [
    { label: 'Home', hash: '#home' },
    { label: 'Collection', hash: '#catalog' },
    { label: 'Tailoring Guides', hash: '#guides' },
    { label: 'Store Locator', hash: '#locator' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0A235C]/95 backdrop-blur-md shadow-lg border-b border-white/10 py-3' 
          : 'bg-[#0A235C] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <div 
            onClick={() => handleLinkClick('#home')}
            className="flex items-center space-x-3 cursor-pointer group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLinkClick('#home'); }}
            aria-label="GO Fashion Home - Return to home"
          >
            <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-[#D80064] to-[#0A235C] p-0.5 shadow-lg flex items-center justify-center transition-transform group-hover:scale-105 border border-white/20">
              <div className="w-full h-full rounded-none bg-[#0A235C] flex items-center justify-center">
                <span className="font-mono text-xs font-black tracking-widest text-white">GOF</span>
              </div>
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center">
                GO FASHION HOME
              </span>
              <p className="text-[10px] font-mono tracking-widest text-[#D80064] uppercase font-bold -mt-1">Luxury Bespoke Tailoring</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive = currentHash === item.hash;
              const Icon = item.icon;
              return (
                <button
                  key={item.hash}
                  onClick={() => handleLinkClick(item.hash)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLinkClick(item.hash);
                    }
                  }}
                  aria-label={`Navigate to ${item.label}`}
                  className={`relative py-2 text-sm font-medium tracking-wide transition-colors duration-200 cursor-pointer flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D80064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A235C] ${
                    isActive 
                      ? 'text-[#D80064] font-semibold' 
                      : 'text-slate-200 hover:text-[#D80064]'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 mr-1 text-[#D80064]" />}
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D80064]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop Global Search Bar */}
          <div className="hidden md:flex items-center relative max-w-[180px] lg:max-w-xs w-full mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search styles or categories..."
                aria-label="Search catalog styles or categories"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (window.location.hash !== '#catalog' && window.location.hash !== '#home') {
                    onNavigate('#catalog');
                  } else if (window.location.hash === '#home') {
                    // Smoothly scroll down to catalog if already on homepage
                    const catEl = document.getElementById('catalog');
                    if (catEl) {
                      catEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#D80064] text-white text-xs placeholder-slate-400 focus:outline-none transition-all rounded-none font-sans"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search input"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Social Icons & CTAs */}
          <div className="hidden lg:flex items-center space-x-4">
            <a 
              href="https://instagram.com/gofashionhome" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-[#D80064] transition-colors p-1.5"
              aria-label="Instagram Handle"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="https://wa.me/2347043564488" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-[#D80064] transition-colors p-1.5"
              aria-label="WhatsApp Channel"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a 
              href="https://facebook.com/gofashionhome" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-[#D80064] transition-colors p-1.5"
              aria-label="Facebook Handle"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href="https://tiktok.com/@gofashionhome" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-300 hover:text-[#D80064] transition-colors p-1.5 flex items-center"
              aria-label="TikTok Handle"
            >
              {/* Custom High-Contrast TikTok Icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.51-.71-.53-1.28-1.22-1.74-1.99v7.41c.02 1.84-.45 3.74-1.63 5.13-1.42 1.75-3.83 2.58-6.02 2.22-2.48-.34-4.75-2.14-5.54-4.57-.91-2.61-.26-5.75 1.68-7.74 1.65-1.74 4.24-2.39 6.51-1.67v4.14c-1.13-.42-2.45-.19-3.32.61-.8.7-.99 1.86-.59 2.81.42.98 1.51 1.56 2.57 1.41 1.09-.1 1.94-.96 2.01-2.06.02-3.15.01-6.31.01-9.47 0-1.48-.02-2.96-.02-4.44z" />
              </svg>
            </a>
            {/* Visual Theme Selector Dropdown Button */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="text-slate-200 hover:text-white px-3 py-2 transition-all border border-white/10 hover:border-white/25 hover:bg-white/5 rounded-none flex items-center space-x-2 text-xs font-mono uppercase tracking-wider cursor-pointer"
                title="Switch Visual Theme Style"
                aria-label="Switch Visual Theme"
              >
                <CurrentThemeIcon className="w-3.5 h-3.5 text-[#D80064]" />
                <span className="hidden xl:inline">{currentThemeObj.label}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isThemeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover Dropdown Menu */}
              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#0A235C] border border-white/15 shadow-2xl rounded-none py-2 z-50 backdrop-blur-xl animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-white/10 mb-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Visual Theme</p>
                  </div>
                  {THEME_OPTIONS.map((theme) => {
                    const ThemeIcon = theme.icon;
                    const isSelected = theme.id === visualTheme;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          onSelectVisualTheme(theme.id);
                          setIsThemeMenuOpen(false);
                        }}
                        aria-label={`Select ${theme.label} theme`}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected 
                            ? 'bg-[#D80064]/20 text-white font-bold border-l-2 border-[#D80064]' 
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <ThemeIcon className={`w-4 h-4 ${isSelected ? 'text-[#D80064]' : 'text-slate-400'}`} />
                          <div>
                            <p className="font-semibold">{theme.label}</p>
                            <p className="text-[9px] text-slate-400 font-mono">{theme.tag}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#D80064]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              onClick={onToggleDarkMode}
              className="text-slate-300 hover:text-white p-2.5 transition-all border border-white/10 hover:border-white/25 hover:bg-white/5 rounded-none flex items-center justify-center cursor-pointer"
              aria-label="Toggle Dark / Light theme"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-200" />}
            </button>
            <button 
              onClick={onOpenConsultation}
              aria-label="Book a bespoke fashion consultation"
              className="bg-[#D80064] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded-none hover:bg-[#D80064]/90 transition-all shadow-md cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
            >
              Book Consultation
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button 
              onClick={() => handleLinkClick('#catalog')}
              aria-label="Shop collection catalog"
              className="bg-[#D80064] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-none"
            >
              Shop
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-200 hover:text-white p-2"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#0A235C] border-t border-white/10 py-4 px-4 animate-fadeIn">
          <div className="flex flex-col space-y-4">
            
            {/* Mobile Global Search Bar */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search styles or categories..."
                aria-label="Search catalog styles or categories"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (window.location.hash !== '#catalog' && window.location.hash !== '#home') {
                    onNavigate('#catalog');
                  } else if (window.location.hash === '#home') {
                    const catEl = document.getElementById('catalog');
                    if (catEl) {
                      catEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-950/40 border border-white/10 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#D80064] rounded-none font-sans"
              />
              <Search className="absolute left-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search input"
                  className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {navItems.map((item) => (
              <button
                key={item.hash}
                onClick={() => handleLinkClick(item.hash)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleLinkClick(item.hash);
                  }
                }}
                aria-label={`Navigate to ${item.label}`}
                className={`text-left py-2.5 text-sm font-medium tracking-wide border-b border-white/5 pb-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D80064] ${
                  currentHash === item.hash ? 'text-[#D80064] font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Visual Theme toggle row in Mobile Drawer */}
            <div className="flex flex-col space-y-2 py-2 border-b border-white/5">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300">Visual Theme</span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 border border-white/10">
                {THEME_OPTIONS.map((theme) => {
                  const ThemeIcon = theme.icon;
                  const isSelected = theme.id === visualTheme;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => onSelectVisualTheme(theme.id)}
                      aria-label={`Select ${theme.label} visual theme`}
                      className={`flex flex-col items-center justify-center py-2 px-1 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-[#D80064] text-white font-bold shadow-sm' 
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ThemeIcon className="w-3.5 h-3.5 mb-1" />
                      <span>{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dark Mode toggle row in Mobile Drawer */}
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300">Theme Preference</span>
              <button
                onClick={onToggleDarkMode}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 text-white text-xs font-mono uppercase tracking-widest cursor-pointer"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-300" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Social handles in Mobile */}
            <div className="flex items-center space-x-6 pt-2">
              <a href="https://instagram.com/gofashionhome" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#D80064]" aria-label="Instagram Handle">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/2347043564488" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#D80064]" aria-label="WhatsApp Channel">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/gofashionhome" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#D80064]" aria-label="Facebook Handle">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://tiktok.com/@gofashionhome" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-[#D80064]" aria-label="TikTok Handle">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.51-.71-.53-1.28-1.22-1.74-1.99v7.41c.02 1.84-.45 3.74-1.63 5.13-1.42 1.75-3.83 2.58-6.02 2.22-2.48-.34-4.75-2.14-5.54-4.57-.91-2.61-.26-5.75 1.68-7.74 1.65-1.74 4.24-2.39 6.51-1.67v4.14c-1.13-.42-2.45-.19-3.32.61-.8.7-.99 1.86-.59 2.81.42.98 1.51 1.56 2.57 1.41 1.09-.1 1.94-.96 2.01-2.06.02-3.15.01-6.31.01-9.47 0-1.48-.02-2.96-.02-4.44z" />
                </svg>
              </a>
            </div>
            
            <a 
              href="https://wa.me/2347043564488?text=Hello%20Go%20Fashion%20Home%2C%20I%20would%20like%20to%20book%20a%20bespoke%20fashion%20consultation." 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              aria-label="Order or inquire via WhatsApp"
              className="bg-[#D80064] hover:bg-[#D80064]/90 text-white text-center text-xs font-bold tracking-widest uppercase py-4 rounded-none mt-2 transition-colors"
            >
              Order / Inquire via WhatsApp
            </a>
            <button 
              onClick={() => {
                setIsOpen(false);
                onOpenConsultation();
              }}
              aria-label="Book consultation via online form"
              className="bg-white/10 text-white text-center text-xs font-bold tracking-widest uppercase py-4 rounded-none border border-white/10 mt-2 cursor-pointer"
            >
              Book Consultation (Online Form)
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
