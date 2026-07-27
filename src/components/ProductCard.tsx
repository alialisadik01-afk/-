import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Star, ShoppingCart, Check, ChevronLeft, ChevronRight, Truck } from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface ProductCardProps {
  key?: string;
  product: Product;
  language: Language;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onViewDetails: (productId: string) => void;
  onQuickOrder: (product: Product) => void;
}

export default function ProductCard({
  product,
  language,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onViewDetails,
  onQuickOrder
}: ProductCardProps) {
  const t = TRANSLATIONS[language];
  const [isAdded, setIsAdded] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const categoryLabel = {
    'water-flosser': { fr: 'HYGIÈNE DENTAIRE', ar: 'العناية بالأسنان' },
    'mouthwash': { fr: 'SOIN NATUREL', ar: 'عناية طبيعية' },
    'toothpaste': { fr: 'DENTIFRICE', ar: 'معجون الأسنان' }
  }[product.id] || { fr: 'SOIN BUCCO-DENTAIRE', ar: 'العناية بالفم' };

  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImg = galleryImages[currentImgIndex] || product.image;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % galleryImages.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      whileHover={{ 
        y: -10,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
      }}
      onMouseLeave={() => setCurrentImgIndex(0)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-gray-150/80 hover:border-emerald-500/30 shadow-sm flex flex-col justify-between h-full cursor-pointer transition-all duration-300"
      onClick={() => onViewDetails(product.id)}
    >
      {/* Product Image Frame with Soft Gradient Background (aspect-ratio 4:5 to match screenshot) */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 rounded-t-3xl select-none">
        {/* Soft color backdrop matching product theme */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${product.themeColor} opacity-15 group-hover:opacity-25 transition-all duration-300 z-10 pointer-events-none`} />
        
        {/* Absolute Top-Left Badges ("NOUVEAU" and "TENDANCE") */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start pointer-events-none">
          <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#00b58a] text-white font-extrabold text-[10px] tracking-wider px-2.5 py-1 rounded-md uppercase shadow-sm"
          >
            {language === 'fr' ? 'NOUVEAU' : 'جديد'}
          </motion.span>
          <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#b07d57] text-white font-extrabold text-[10px] tracking-wider px-2.5 py-1 rounded-md uppercase shadow-sm"
          >
            {language === 'fr' ? 'TENDANCE' : 'شائع'}
          </motion.span>
        </div>

        {/* Wishlist Button - White circular button on top-right */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className={`absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-gray-100 text-gray-500 hover:text-rose-500 pointer-events-auto cursor-pointer`}
          title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4.5 h-4.5 transition-colors duration-300 ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-500'}`} />
        </motion.button>

        {/* Red Discount Badge at Bottom Right of the Image Frame */}
        <div className="absolute bottom-3 right-4 z-20 pointer-events-none">
          <span className="bg-[#ff2c3c] text-white font-black text-xs px-2.5 py-1.5 rounded-md shadow-md">
            -{product.discount}%
          </span>
        </div>

        {/* Left/Right micro-arrows for image browsing (fades in on hover) */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 text-gray-600 hover:text-emerald-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto"
              title={language === 'fr' ? 'Précédent' : 'السابق'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100 text-gray-600 hover:text-emerald-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto"
              title={language === 'fr' ? 'Suivant' : 'التالي'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Pagination Line Indicators at the bottom of image container */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1 pointer-events-none transition-opacity duration-300">
              {galleryImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    currentImgIndex === idx ? 'w-4 bg-emerald-600' : 'w-1.5 bg-gray-300/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <motion.img
          key={activeImg}
          src={activeImg}
          alt={product.name[language]}
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0.85, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Product Info Section */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Category Label */}
          <span className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase block mb-1">
            {categoryLabel[language]}
          </span>

          {/* Product Name */}
          <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300 font-sans tracking-tight leading-snug min-h-[1.5rem] line-clamp-1">
            {product.name[language]}
          </h3>

          {/* Product Tagline / Description (truncated to 2 lines to match layout) */}
          <p className="text-xs text-gray-400 line-clamp-2 mt-1 mb-2 leading-relaxed font-sans min-h-[2.5rem]">
            {product.tagline[language]}
          </p>

          {/* Delivery Fee Notice Badge */}
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/60 shadow-2xs">
              <Truck className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span>
                {language === 'fr' 
                  ? 'Livraison : +35 MAD (Gratuite avec le Pack)' 
                  : 'التوصيل : +35 د.م (مجاني عند أخذ الباك)'}
              </span>
            </span>
          </div>

          {/* Metadata Row: Rating (left-aligned) & Price (right-aligned) */}
          <div className="flex justify-between items-end mt-2 mb-4">
            {/* Rating */}
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse mb-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-gray-800">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[11px] font-medium text-gray-400">
                ({product.reviewsCount})
              </span>
            </div>

            {/* Price Block */}
            <div className="flex flex-col items-end text-right">
              {/* Original Price */}
              <span className="text-[11px] text-gray-400 line-through leading-none mb-1">
                {product.originalPrice}.00 MAD
              </span>
              {/* Current Price */}
              <span className="text-base sm:text-lg font-black text-gray-900 leading-none">
                {product.price}.00 <span className="text-xs font-extrabold text-gray-700">MAD</span>
              </span>
            </div>
          </div>
        </div>

        {/* Buy Action Row */}
        <div className="flex space-x-2 rtl:space-x-reverse items-center">
          {/* Direct Order Now button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onQuickOrder(product);
            }}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex-grow py-3 rounded-2xl font-bold text-sm bg-orange-500 hover:bg-orange-600 text-white transition-all duration-300 flex items-center justify-center space-x-1.5 rtl:space-x-reverse cursor-pointer shadow-sm hover:shadow-md ml-[19px]"
          >
            <span>{language === 'fr' ? 'Commander' : 'اطلب الآن'}</span>
          </motion.button>

          {/* Add to Cart icon button */}
          <motion.button
            onClick={handleAddClick}
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className={`p-3 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center cursor-pointer border ${
              isAdded
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-none'
                : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800'
            }`}
            title={language === 'fr' ? 'Ajouter au panier' : 'إضافة إلى السلة'}
          >
            {isAdded ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
