import { motion } from 'motion/react';
import { Star, Quote, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { TESTIMONIALS, TRANSLATIONS } from '../data';

interface TestimonialsProps {
  language: Language;
}

export default function Testimonials({ language }: TestimonialsProps) {
  const t = TRANSLATIONS[language];

  return (
    <section id="reviews" className="scroll-mt-24 sm:scroll-mt-28 py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider font-mono mb-3">
            {language === 'fr' ? 'RETOURS D\'EXPÉRIENCE' : 'تجارب حقيقية'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display tracking-tight mb-4">
            {t.sectionTestimonialsTitle}
          </h2>
          <p className="text-gray-500 font-sans text-sm sm:text-base leading-relaxed">
            {t.sectionTestimonialsSubtitle}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Quotation icon and Rating */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="flex items-center space-x-0.5" style={{ direction: 'ltr' }}>
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const fillAmount = Math.max(0, Math.min(1, review.rating - (starIndex - 1)));
                        return (
                          <div key={starIndex} className="relative w-4 h-4">
                            <Star className="w-4 h-4 text-gray-200 fill-gray-200 absolute inset-0" />
                            {fillAmount > 0 && (
                              <div
                                className="absolute inset-y-0 left-0 overflow-hidden"
                                style={{ width: `${fillAmount * 100}%` }}
                              >
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400 min-w-[16px] min-h-[16px]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-mono">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  <Quote className="w-8 h-8 text-emerald-100 transform rotate-180" />
                </div>

                {/* Review Text */}
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-sans italic mb-6">
                  "{review.text[language]}"
                </p>
              </div>

              {/* User Profiling Row */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-2">
                <div className="flex items-center gap-5">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.name[language]}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover shrink-0 shadow-sm border border-emerald-900/20"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#043d2e] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm border border-emerald-900/20 font-sans select-none">
                      {review.name.fr.trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 font-display">{review.name[language]}</h4>
                    <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wide">
                      {review.product[language]}
                    </span>
                  </div>
                </div>

                {review.verified && (
                  <div className="flex items-center space-x-1 rtl:space-x-reverse text-emerald-600 text-xs font-bold" title={language === 'fr' ? 'Achat vérifié' : 'شراء مؤكد'}>
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {language === 'fr' ? 'Vérifié' : 'مؤكد'}
                    </span>
                  </div>
                )}
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
