import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ShieldCheck, Truck, BadgeCheck, Award, ShoppingBag, ChevronLeft, ChevronRight, Star, Sparkles, Users, ThumbsUp, PackageCheck, TrendingUp } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import radiantSmileImg from '../assets/images/radiant_smile_hero_1784318556895.jpg';
import radiantSmileImg2 from '../assets/images/radiant_smile_two_1784669814282.jpg';
import radiantSmileImg3 from '../assets/images/radiant_smile_three_1784669828330.jpg';

interface HeroProps {
  language: Language;
  onViewProducts: () => void;
  onBuyNow: () => void;
}

export default function Hero({ language, onViewProducts, onBuyNow }: HeroProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const slides = [
    {
      img: radiantSmileImg,
      alt: language === 'ar' ? 'ابتسامة مشرقة وصحية' : 'Sourire éclatant et sain',
      badge: language === 'ar' ? 'طبيعي 100%' : '100% Naturel',
      rating: '4.9/5',
      reviews: language === 'ar' ? '1,500+ تقييم' : '1,500+ avis'
    },
    {
      img: radiantSmileImg2,
      alt: language === 'ar' ? 'ثقة وجمال دائم' : 'Confiance & Beauté',
      badge: language === 'ar' ? 'جودة ممتازة' : 'Qualité Premium',
      rating: '4.9/5',
      reviews: language === 'ar' ? '1,200+ تقييم' : '1,200+ avis'
    },
    {
      img: radiantSmileImg3,
      alt: language === 'ar' ? 'أسنَان ناصعة البياض' : 'Dents étincelantes',
      badge: language === 'ar' ? 'موصى به طبياً' : 'Recommandé',
      rating: '4.8/5',
      reviews: language === 'ar' ? '950+ تقييم' : '950+ avis'
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const trustBadges = [
    { icon: ShieldCheck, label: t.featureSecurePayment },
    { icon: Truck, label: t.featureFastDelivery },
    { icon: BadgeCheck, label: t.featureFreeReturn },
    { icon: Award, label: t.featureQualityGuarantee }
  ];

  const stats = [
    {
      value: '+500',
      title: language === 'ar' ? 'زبون سعيد بالمغرب' : 'Clients Satisfaits',
      subtitle: language === 'ar' ? 'ثقة متجددة ونتائج مضمونة' : 'Confiance & résultats garantis',
      badge: language === 'ar' ? 'زبناء سعداء' : 'Avis vérifiés',
      icon: Users
    },
    {
      value: '98.7%',
      title: language === 'ar' ? 'نسبة رضا الزبناء' : 'Taux de Satisfaction',
      subtitle: language === 'ar' ? 'تقييمات 5 نجوم ممتازة' : 'Évaluations 5 étoiles',
      badge: language === 'ar' ? 'جودة ممتازة' : 'Excellence',
      icon: ThumbsUp
    },
    {
      value: '+478',
      title: language === 'ar' ? 'طلبية تم توصيلها' : 'Commandes Livrées',
      subtitle: language === 'ar' ? 'توصيل سريع لجميع المدن' : 'Livraison rapide partout',
      badge: language === 'ar' ? 'توصيل موثوق' : 'Express',
      icon: PackageCheck
    },
    {
      value: '100%',
      title: language === 'ar' ? 'منتجات أصلية وطبيعية' : 'Produits Authentiques',
      subtitle: language === 'ar' ? 'ضمان الأمان والجودة العالية' : 'Qualité 100% Garantie',
      badge: language === 'ar' ? 'أصلي 100%' : '100% Naturel',
      icon: Award
    }
  ];

  return (
    <section className="relative min-h-screen pt-28 sm:pt-36 pb-16 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#f4faf6] via-white to-white">
      {/* Soft Background Glowing Lights & Floating Leaves */}
      <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-[-10%] w-[400px] h-[400px] rounded-full bg-teal-50/40 blur-3xl pointer-events-none" />

      {/* Floating Leaves Micro-animations */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-28 right-[15%] w-8 h-8 opacity-20 hidden md:block"
      >
        <svg viewBox="0 0 24 24" className="fill-emerald-600 w-full h-full">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.31,18C11.5,18 16.38,15.5 19.38,12C21,10 21.5,7.5 21,6C20,6.5 18.5,7 17,8Z" />
        </svg>
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-32 left-[10%] w-10 h-10 opacity-15 hidden md:block"
      >
        <svg viewBox="0 0 24 24" className="fill-green-600 w-full h-full">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.31,18C11.5,18 16.38,15.5 19.38,12C21,10 21.5,7.5 21,6C20,6.5 18.5,7 17,8Z" />
        </svg>
      </motion.div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex items-center w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full py-6">
          
          {/* Left Column: Localized Typography Hero Texts */}
          <div className="lg:col-span-5 text-center lg:text-left rtl:lg:text-right z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-800 tracking-wider font-mono">
                {t.heroBadge}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight font-display mb-6 animate-fade-in"
            >
              {language === 'fr' ? (
                <>
                  Un sourire <span className="text-emerald-600">éclatant</span> & une confiance <span className="text-emerald-600">absolue</span>
                </>
              ) : (
                <>
                  ابتسامة <span className="text-emerald-600">مشرقة</span> وثقة تامة تدوم طوال اليوم
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 font-sans leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              {t.heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={onViewProducts}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
                style={{ fontSize: '15px' }}
              >
                <span>{t.btnViewProducts}</span>
                <ArrowRight className="w-5 h-5 rtl:rotate-180 flex-shrink-0" />
              </button>
              <button
                onClick={onBuyNow}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-gray-200 hover:border-emerald-500 hover:text-emerald-600 text-gray-700 hover:bg-emerald-50/20 font-semibold transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md"
                style={{ fontSize: '15px' }}
              >
                <ShoppingBag className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{t.btnBuyNow}</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Premium Radiant Smile Visual Asset */}
          <div className="lg:col-span-7 flex justify-center items-center relative z-0 min-h-[420px] sm:min-h-[500px] lg:min-h-[540px] w-full">
            {/* Soft backdrop platforms */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-[88%] h-24 sm:h-32 bg-gradient-to-b from-[#eaf6ee] to-[#d6eddcf0] rounded-[100%] border border-emerald-100/50 shadow-xl opacity-80 blur-[2px]" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[98%] sm:w-[92%] h-14 bg-emerald-950/5 rounded-[100%] blur-xl" />

            {/* Glowing Backdrop Spotlight */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Circle graphic decoration */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] opacity-20 pointer-events-none"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-emerald-400 stroke-[0.5] stroke-dasharray-[2_4]">
                <circle cx="50" cy="50" r="45" />
                <circle cx="50" cy="50" r="35" />
              </svg>
            </motion.div>

            {/* Radiant Smile Photo Showcase Container - Enlarged to fill section */}
            <div className="relative w-full max-w-[640px] h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center px-1 sm:px-3">
              <div 
                className="w-full h-full relative group cursor-pointer overflow-hidden rounded-[2.5rem] border-2 border-white/90 shadow-[0_20px_50px_rgba(16,185,129,0.14)] bg-emerald-50/30"
                onClick={onViewProducts}
              >
                {/* Background ambient lighting */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-[2.5rem] blur-2xl opacity-60 group-hover:opacity-95 transition-opacity duration-700 pointer-events-none z-0" />

                {/* Slider Image with AnimatePresence */}
                <div className="w-full h-full overflow-hidden relative z-10">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeSlide}
                      src={slides[activeSlide].img}
                      alt={slides[activeSlide].alt}
                      decoding="async"
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="w-full h-full object-cover rounded-[2.5rem]"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                </div>

                {/* Slide Info Glass Overlay at bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent p-6 pt-16 z-20 flex flex-col justify-end pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-[10px] sm:text-xs font-extrabold text-white uppercase tracking-wider mb-2 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        {slides[activeSlide].badge}
                      </span>
                      <h4 className="text-white text-base sm:text-lg font-bold tracking-tight font-display">
                        {slides[activeSlide].alt}
                      </h4>
                    </div>
                    {/* Compact Dynamic Stars */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-white text-xs font-black">{slides[activeSlide].rating}</span>
                      </div>
                      <span className="text-slate-300 text-[10px] font-medium mt-0.5">
                        {slides[activeSlide].reviews}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next/Prev Navigation Buttons (Always visible, responsive, polished styling) */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 hover:scale-110 active:scale-95 text-slate-800 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg z-30 cursor-pointer"
                  aria-label={language === 'fr' ? 'Image précédente' : 'الصورة السابقة'}
                >
                  <ChevronLeft className="w-5 h-5 text-slate-800 rtl:rotate-180" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 hover:scale-110 active:scale-95 text-slate-800 flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg z-30 cursor-pointer"
                  aria-label={language === 'fr' ? 'Image suivante' : 'الصورة التالية'}
                >
                  <ChevronRight className="w-5 h-5 text-slate-800 rtl:rotate-180" />
                </button>

                {/* Bullet Indicators */}
                <div className="absolute top-4 right-6 flex items-center gap-1.5 z-30 pointer-events-auto bg-slate-950/20 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSlide(index);
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        index === activeSlide 
                          ? 'w-5 bg-emerald-400' 
                          : 'w-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Trust Badges Bar */}
      <div id="why-us" className="scroll-mt-24 sm:scroll-mt-28 border-y border-emerald-100/80 bg-emerald-50/70 py-10 mt-10 shadow-xs relative overflow-hidden transform-gpu">
        {/* Subtle glowing reflection beneath glassmorphism panel */}
        <div className="absolute top-0 left-1/4 w-[50%] h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
            {trustBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  key={idx}
                  className="flex flex-col items-center justify-center p-5 sm:p-6 bg-white border border-emerald-100/80 hover:border-emerald-300 hover:bg-emerald-50/30 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group transform-gpu"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-50/75 border border-emerald-100/50 flex items-center justify-center mb-3 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)] group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-300">
                    <Icon className="w-5 h-5 text-emerald-600 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight font-display group-hover:text-emerald-700 transition-colors duration-300">
                    {badge.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Standalone Customer Trust & Growth Statistics Section - Directly under Hero */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-b from-white via-[#f0fdf4] to-white overflow-hidden border-b border-emerald-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#043d2e] via-[#08523f] to-[#022c21] p-6 sm:p-10 md:p-12 text-white shadow-2xl shadow-emerald-950/20 border border-emerald-600/30"
          >
            {/* Background Glows & Accent Shapes */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
            
            {/* Header Badge & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10 pb-6 border-b border-emerald-700/50">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/30 text-[11px] sm:text-xs text-emerald-200 font-semibold mb-2.5 sm:mb-3 shadow-inner">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                  <span>{language === 'ar' ? 'المتجر الأوّل الموثوق بالمغرب' : '#1 Choix de confiance au Maroc'}</span>
                </div>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display flex items-center gap-2.5 sm:gap-3">
                  <span className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-400"></span>
                  </span>
                  <span>{language === 'ar' ? 'إحصائيات ثقة ونجاح خيار الزبناء' : 'Nos chiffres clés & Confiance clients'}</span>
                </h3>
              </div>
              
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-emerald-200/90 bg-emerald-950/60 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-emerald-700/40 self-start sm:self-auto">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>{language === 'ar' ? 'تحديث مباشر لنتائج المتجر' : 'Résultats mis à jour'}</span>
              </div>
            </div>

            {/* Stats Grid - Responsive for all screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="relative group p-4 sm:p-6 rounded-2xl bg-white/10 border border-white/15 hover:border-emerald-400/60 hover:bg-white/15 transition-all duration-300 flex flex-col justify-between h-full min-h-[160px] shadow-md min-w-0 transform-gpu"
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/25 shrink-0">
                        {stat.badge}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-end">
                      <div className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display mb-1 sm:mb-1.5 group-hover:text-emerald-300 transition-colors break-words">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-100 mb-0.5 leading-snug break-words">
                        {stat.title}
                      </div>
                      <p className="text-[11px] sm:text-xs text-emerald-200/75 font-normal leading-relaxed break-words">
                        {stat.subtitle}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>
    </section>
  );
}
