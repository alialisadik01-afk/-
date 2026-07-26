import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Language } from '../types';
import { FAQS, TRANSLATIONS } from '../data';

interface FAQProps {
  language: Language;
}

export default function FAQ({ language }: FAQProps) {
  const t = TRANSLATIONS[language];
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="scroll-mt-24 sm:scroll-mt-28 py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-mono mb-3">
            {language === 'fr' ? 'RÉPONSES RAPIDES' : 'إجابات سريعة'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display tracking-tight mb-4">
            {t.sectionFaqTitle}
          </h2>
          <p className="text-gray-500 font-sans text-sm sm:text-base leading-relaxed">
            {t.sectionFaqSubtitle}
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl transition-all duration-300 ${
                  isOpen ? 'border-emerald-200 bg-emerald-50/10 shadow-sm' : 'border-gray-150 hover:border-gray-250'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center py-5 px-6 text-left rtl:text-right font-semibold text-gray-800 font-display text-sm sm:text-base cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5 rtl:space-x-reverse">
                    <HelpCircle className={`w-5 h-5 flex-shrink-0 transition-colors ${isOpen ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>{faq.question[language]}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100/50 font-sans">
                        {faq.answer[language]}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
