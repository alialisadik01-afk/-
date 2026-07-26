import React from 'react';
import { Leaf, Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface FooterProps {
  language: Language;
  onNavigate: (view: string) => void;
}

export default function Footer({ language, onNavigate }: FooterProps) {
  const t = TRANSLATIONS[language];
  
  const handleLinkClick = (view: string) => {
    onNavigate(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-emerald-950 text-emerald-100 pt-16 pb-8 border-t border-emerald-900/40">
      
      {/* Main Footer Sitemap Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 text-sm">
        
        {/* Brand details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center border border-emerald-800">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-display">
              Herbs <span className="text-emerald-400 font-medium">77</span>
            </span>
          </div>

          <p className="text-emerald-300 leading-relaxed font-sans max-w-sm">
            {t.footerDesc}
          </p>

          <div className="flex space-x-4 rtl:space-x-reverse pt-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors !ml-0 pl-[11px] !mr-[8px]">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Column Products */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-white font-bold font-display uppercase tracking-wider text-xs">
            {t.footerLinksProducts}
          </h4>
          <ul className="space-y-3 text-emerald-300 font-sans">
            <li>
              <button onClick={() => handleLinkClick('products')} className="hover:text-emerald-400 transition-colors cursor-pointer text-[13px]">
                {language === 'fr' ? 'Irrigateur Dentaire Portable' : 'خيط الأسنان المائي المحمول'}
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('products')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                {language === 'fr' ? 'GingiHerbe Bain de Bouche' : 'غسول جنجي هيرب الطبيعي'}
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('products')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                {language === 'fr' ? 'Anchor Clove Power Dentifrice' : 'معجون القرنفل أنكور'}
              </button>
            </li>
          </ul>
        </div>

        {/* Column Useful links */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-white font-bold font-display uppercase tracking-wider text-xs">
            {t.footerLinksUseful}
          </h4>
          <ul className="space-y-3 text-emerald-300 font-sans">
            <li>
              <button onClick={() => handleLinkClick('home')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                {t.navHome}
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('why-us')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                {t.navWhyUs}
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('products')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                {t.navProducts}
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('reviews')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                {t.navReviews}
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('faq')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                {t.navFaq}
              </button>
            </li>
          </ul>
        </div>

        {/* Column Support Contact Details */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="text-white font-bold font-display uppercase tracking-wider text-xs">
            {t.footerLinksService}
          </h4>
          <ul className="space-y-3.5 text-emerald-300 font-sans">
            <li className="flex items-center space-x-3 rtl:space-x-reverse">
              <Phone className="w-4.5 h-4.5 text-emerald-500" />
              <a href="tel:0612961540" className="hover:text-emerald-400 transition-colors">0612961540</a>
            </li>
            <li className="flex items-center space-x-3 rtl:space-x-reverse">
              <Mail className="w-4.5 h-4.5 text-emerald-500" />
              <a href="mailto:9990.999900aaaaaazzzz@gmail.com" className="hover:text-emerald-400 transition-colors break-all text-[13px]">9990.999900aaaaaazzzz@gmail.com</a>
            </li>
            <li className="flex items-start space-x-3 rtl:space-x-reverse">
              <MapPin className="w-4.5 h-4.5 text-emerald-500 mt-0.5" />
              <span>Casablanca, Maroc</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Under footer: copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-emerald-900/40 pt-8 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-400">
          
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <span>{t.footerCopyright}</span>
          </div>

        </div>
      </div>

    </footer>
  );
}
