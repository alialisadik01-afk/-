import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';
import { Language } from '../types';

interface SplashScreenProps {
  language: Language;
  onFinish?: () => void;
  duration?: number; // duration in ms
}

export default function SplashScreen({ language, onFinish, duration = 1800 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (elapsed >= duration) {
        clearInterval(interval);
        if (onFinish) {
          onFinish();
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, onFinish]);

  const loadingText = language === 'ar' ? 'تحميل آمن...' : 'CHARGEMENT SÉCURISÉ...';
  const taglineText = language === 'ar' ? '🌱 100% أعشاب طبيعية • جودة عالية' : '🌱 100% NATUREL • QUALITÉ SUPÉRIEURE';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed inset-0 z-[99999] bg-[#FAFCFB] flex flex-col items-center justify-between py-12 select-none overflow-hidden"
    >
      {/* Soft Green Subtle Ambient Radial Background */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div />

      <div className="flex flex-col items-center justify-center text-center px-4 relative z-10">
        {/* Luxury Emerald & Gold Rounded Logo Badge */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-950/15 border border-emerald-700/20 mb-5 relative overflow-hidden"
        >
          {/* Light Reflection Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-amber-300/15" />
          
          <div className="flex items-center justify-center gap-0.5 relative z-10">
            <span className="text-amber-300 text-2xl sm:text-3xl font-black tracking-wider drop-shadow-sm font-sans">
              H
            </span>
            <Leaf className="w-3.5 h-3.5 text-emerald-300 -mt-2 -ml-0.5 transform -rotate-12" />
          </div>
        </motion.div>

        {/* Brand Name in Deep Herbal Emerald */}
        <motion.h1
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-xs sm:text-sm font-black tracking-[0.25em] text-emerald-950 uppercase mb-1.5"
        >
          HERBES 77
        </motion.h1>

        {/* Subtitle Status */}
        <motion.p
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-[10px] sm:text-[11px] font-bold tracking-widest text-emerald-700/80 uppercase mb-6"
        >
          {loadingText}
        </motion.p>

        {/* Smooth Animated Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="w-28 sm:w-36 h-1.5 bg-emerald-100/80 rounded-full overflow-hidden relative shadow-inner"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 rounded-full shadow-sm"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </motion.div>
      </div>

      {/* Footer Natural Quality Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-[10px] sm:text-xs font-bold tracking-wider text-emerald-800/60 uppercase relative z-10 bg-emerald-50/60 px-4 py-1.5 rounded-full border border-emerald-100/80"
      >
        {taglineText}
      </motion.div>
    </motion.div>
  );
}
