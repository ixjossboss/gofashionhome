import { MapPin, Phone, Mail, Compass } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function MapLocator() {
  return (
    <section id="locator" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0.1} distance={30}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-bold tracking-widest text-white uppercase bg-[#D80064] px-4 py-2 rounded-none font-mono">
              Atelier Map
            </span>
            <h2 className="mt-6 text-3xl sm:text-4xl font-serif font-black text-slate-950 dark:text-white tracking-tight uppercase transition-colors duration-300">
              Visit Our Akure Fitting Atelier
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed transition-colors duration-300">
              Walk into our physical location for professional body measurements, luxury fabric selection, and bespoke designer fittings.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Address Details & Contact Card */}
          <div className="lg:col-span-4">
            <ScrollReveal direction="right" delay={0.2} distance={35} className="h-full">
              <div className="flex flex-col justify-between bg-slate-50 dark:bg-slate-900 p-8 rounded-none border border-slate-200 dark:border-slate-800 shadow-none transition-colors duration-300 h-full">
                <div>
                  <div className="w-12 h-12 bg-[#0A235C] dark:bg-[#D80064] text-white rounded-none flex items-center justify-center mb-6 border border-white/10">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif font-bold uppercase tracking-wider text-slate-950 dark:text-white mb-4">Location & Contact</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-1 transition-colors">
                        <MapPin className="w-4 h-4 text-[#0A235C] dark:text-[#D80064]" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Physical Address</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed mt-1 font-mono uppercase">
                          ROAD C, ORE-OFE QUARTERS<br />
                          OPPOSITE KIKIOWO BUS STOP<br />
                          ODA ROAD AKURE, ONDO STATE
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-1 transition-colors">
                        <Phone className="w-4 h-4 text-[#0A235C] dark:text-[#D80064]" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Direct Hotline</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 font-bold mt-1">
                          <a 
                            href="tel:+2347043564488" 
                            aria-label="Call direct hotline at +234 704 356 4488"
                            className="hover:text-[#D80064] transition-colors"
                          >
                            +234 704 356 4488
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 rounded-none bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-1 transition-colors">
                        <Mail className="w-4 h-4 text-[#0A235C] dark:text-[#D80064]" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Official Email</p>
                        <p className="text-sm text-slate-700 dark:text-slate-200 font-bold mt-1 break-all">
                          <a 
                            href="mailto:gofashionhomeacad@gmail.com" 
                            aria-label="Send email to gofashionhomeacad@gmail.com"
                            className="hover:text-[#D80064] transition-colors"
                          >
                            gofashionhomeacad@gmail.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=7.2467664,5.2163914&destination_place_id=ChIJc60jA_GPRxARYzfYUN9tLPM"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get directions to GO Fashion Home via Google Maps"
                    className="w-full bg-[#0A235C] dark:bg-[#D80064] text-white text-center text-xs font-bold tracking-widest uppercase py-3.5 px-4 rounded-none flex items-center justify-center space-x-2 shadow-none transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <span>Navigate via Google Maps</span>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Map Viewer Container */}
          <div className="lg:col-span-8">
            <ScrollReveal direction="left" delay={0.3} distance={35} className="h-full">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-none overflow-hidden border border-slate-200 dark:border-slate-800 relative min-h-[450px] flex flex-col justify-center transition-colors duration-300 h-full">
                <iframe
                  title="Atelier Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.947932495039!2d5.2138111094385735!3d7.246766392729516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10478ff10323ad73%3A0xf32c6ddf50d83763!2sGO%20FASHION%20HOME!5e0!3m2!1sen!2sng!4v1784436833661!5m2!1sen!2sng"
                  className="w-full h-full min-h-[450px] border-0 dark:invert-[0.9] dark:hue-rotate-180"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                ></iframe>
              </div>
            </ScrollReveal>
          </div>

        </div>

      </div>
    </section>
  );
}
