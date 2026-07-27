import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Star, ArrowLeft, ArrowRight, ShieldCheck, Check, Phone, User, MapPin, Building2, ShoppingBag, ChevronLeft, ChevronRight, Camera, Truck, Sparkles, Award, Wallet, Headphones } from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../data';
import { auth, saveOrder, getUserProfile } from '../lib/firebase';

interface ProductDetailProps {
  product: Product;
  language: Language;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export default function ProductDetail({
  product,
  language,
  onBack,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}: ProductDetailProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0].name[language] : undefined
  );

  const COLOR_TO_IMAGE: Record<string, string> = {
    'Blanc Pur': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
    'Rose poudré': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
    'Vert Menthe': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
    'Noir Onyx': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg',
    'أبيض ناصع': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
    'وردي لطيف': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
    'أخضر نعناعي': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
    'أسود أونيكس': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg'
  };

  // Sync selectedColor translation on language switch
  useEffect(() => {
    if (product.colors && product.colors.length > 0 && selectedColor) {
      const matchedColor = product.colors.find(
        (c) => c.name.fr === selectedColor || c.name.ar === selectedColor
      );
      if (matchedColor) {
        setSelectedColor(matchedColor.name[language]);
      }
    }
  }, [language]);

  // Helper to retrieve color-bound image for any product
  const getSelectedColorImage = (): string | undefined => {
    if (selectedColor && product.colors && product.colors.length > 0) {
      const matched = product.colors.find(
        (c) => c.name.fr === selectedColor || c.name.ar === selectedColor
      );
      if (matched && matched.image) {
        return matched.image;
      }
    }
    if (selectedColor && COLOR_TO_IMAGE[selectedColor]) {
      return COLOR_TO_IMAGE[selectedColor];
    }
    return undefined;
  };

  const [activeImage, setActiveImage] = useState(product.image);

  useEffect(() => {
    const colorImg = getSelectedColorImage();
    if (colorImg) {
      setActiveImage(colorImg);
    } else {
      setActiveImage(product.image);
    }
  }, [product, selectedColor]);

  const getGalleryImages = () => {
    const baseGallery = product.images && product.images.length > 0 ? product.images : [product.image];
    const colorImg = getSelectedColorImage();
    if (colorImg) {
      if (!baseGallery.includes(colorImg)) {
        return [colorImg, ...baseGallery];
      }
    }
    return baseGallery;
  };

  const galleryImages = getGalleryImages();
  const activeIndex = galleryImages.indexOf(activeImage) !== -1 ? galleryImages.indexOf(activeImage) : 0;

  const handlePrevImage = () => {
    const prevIndex = (activeIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[prevIndex]);
  };

  const handleNextImage = () => {
    const nextIndex = (activeIndex + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIndex]);
  };
  
  // Checkout Form states
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Autofill if logged in
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || '',
      }));
      getUserProfile(user.uid).then((dbProfile) => {
        if (dbProfile) {
          setFormData({
            name: dbProfile.displayName || user.displayName || '',
            phone: dbProfile.phone || '',
            city: dbProfile.city || '',
            address: dbProfile.address || '',
            notes: ''
          });
        }
      });
    } else {
      setFormData({ name: '', phone: '', city: '', address: '', notes: '' });
    }
  }, [product]);

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t.requiredField;
    if (!formData.phone.trim()) {
      errors.phone = t.requiredField;
    } else if (!/^(05|06|07)\d{8}$/.test(formData.phone.trim().replace(/\s/g, ''))) {
      errors.phone = language === 'fr' ? 'Numéro invalide (ex: 0612345678)' : 'رقم هاتف غير صحيح (مثال: 0612345678)';
    }
    if (!formData.city.trim()) errors.city = t.requiredField;
    if (!formData.address.trim()) errors.address = t.requiredField;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsOrdering(true);
    
    const user = auth.currentUser;
    
    const orderItems = [{
      id: product.id,
      name: selectedColor ? `${product.name.fr} (${selectedColor})` : product.name.fr,
      nameFr: selectedColor ? `${product.name.fr} (${selectedColor})` : product.name.fr,
      nameAr: selectedColor ? `${product.name.ar} (${selectedColor})` : product.name.ar,
      image: getSelectedColorImage() || product.image,
      quantity: quantity,
      price: product.price,
      selectedColor: selectedColor
    }];

    const isBundle = product.id === 'pack-soin-complet';
    const deliveryFee = isBundle ? 0 : 35;
    const subtotal = product.price * quantity;
    const grandTotal = subtotal + deliveryFee;

    const orderData = {
      fullName: formData.name,
      phone: formData.phone,
      city: formData.city,
      address: formData.address,
      notes: formData.notes,
      paymentMethod: 'COD',
      items: orderItems,
      shippingFee: deliveryFee,
      total: grandTotal,
      userId: user ? user.uid : null,
      isGuest: !user
    };

    saveOrder(orderData)
      .then(() => {
        setIsOrdering(false);
        setOrderSuccess(true);
        setFormData({ name: '', phone: '', city: '', address: '', notes: '' });
      })
      .catch((err) => {
        console.error('Error submitting direct order:', err);
        setIsOrdering(false);
      });
  };

  return (
    <div className="pt-28 sm:pt-36 pb-16 min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="group flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-emerald-600 font-semibold mb-8 transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
          <span>{t.btnBackToStore}</span>
        </button>

        {/* Success Modal/Section */}
        {orderSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-display mb-4">
              {language === 'fr' ? 'Félicitations ! Commande reçue' : 'تهانينا! تم استلام طلبكم بنجاح'}
            </h2>
            <p className="text-gray-700 text-base leading-relaxed mb-6 font-sans">
              {t.checkoutSuccess}
            </p>
            <div className="border-t border-emerald-200/50 pt-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 rtl:sm:space-x-reverse">
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full uppercase tracking-wider font-mono">
                {t.freeShippingBadge}
              </span>
            </div>
            <button
              onClick={() => {
                setOrderSuccess(false);
                onBack();
              }}
              className="mt-8 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full shadow-lg hover:shadow-emerald-100 transition-all cursor-pointer"
            >
              {t.btnBackToStore}
            </button>
          </motion.div>
        ) : (
          <>
            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left: Interactive Media Gallery, Specs, Benefits */}
            <div className="lg:col-span-6 space-y-8">
              {/* Product Spotlight Hero Frame */}
              <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden p-0 w-full">
                <div className={`absolute inset-0 bg-gradient-to-tr ${product.themeColor} opacity-10`} />
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  src={activeImage}
                  alt={product.name[language]}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center relative z-10 hover:scale-105 transition-transform duration-500 rounded-3xl"
                  referrerPolicy="no-referrer"
                />

                {/* Left/Right browse buttons */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/95 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 text-gray-700 hover:text-emerald-600 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                      title={language === 'fr' ? 'Précédent' : 'السابق'}
                    >
                      <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/95 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 text-gray-700 hover:text-emerald-600 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                      title={language === 'fr' ? 'Suivant' : 'التالي'}
                    >
                      <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                    </button>
                  </>
                )}

                {/* Camera icon indicator overlay */}
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-1.5 rtl:space-x-reverse bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm select-none">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{activeIndex + 1} / {galleryImages.length}</span>
                  </div>
                )}
              </div>

              {/* Interactive Gallery Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex items-center justify-center gap-3.5 mt-4">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-white transition-all duration-300 cursor-pointer shadow-sm ${
                        activeIndex === idx
                          ? 'border-emerald-500 scale-105 shadow-md'
                          : 'border-gray-100 hover:border-gray-300 hover:scale-102 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumbnail-${idx}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Colors and Quantity Selector Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
                {/* Optional Color swatch */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <span className="block text-sm font-bold text-gray-800 mb-3">{t.colorLabel}</span>
                    <div className="flex gap-3.5">
                      {product.colors.map((color) => (
                        <button
                          key={color.name[language]}
                          onClick={() => handleColorSelect(color.name[language])}
                          className={`relative w-8 h-8 rounded-full border transition-all duration-300 cursor-pointer ${
                            selectedColor === color.name[language] ? 'ring-2 ring-emerald-500 ring-offset-2' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name[language]}
                        >
                          {selectedColor === color.name[language] && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check className={`w-4 h-4 ${color.hex === '#ffffff' ? 'text-gray-900' : 'text-white'}`} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price and Discount Section */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    {language === 'fr' ? 'Prix Spécial' : 'عرض خاص'}
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline space-x-2.5 rtl:space-x-reverse">
                      <span className="text-3xl font-black text-emerald-700">{product.price} MAD</span>
                      <span className="text-sm text-gray-400 line-through">{product.originalPrice} MAD</span>
                    </div>
                    <span className="bg-red-500/10 text-red-600 font-extrabold text-xs px-3.5 py-1.5 rounded-full">
                      {language === 'fr' ? 'ÉCONOMISEZ' : 'وفر'} {product.originalPrice - product.price} MAD (-{product.discount}%)
                    </span>
                  </div>

                  {/* Delivery Fee Info Badge */}
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80">
                      <Truck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>
                        {product.id === 'pack-soin-complet'
                          ? (language === 'fr' ? 'Livraison 100% GRATUITE' : '🎉 التوصيل مجاني 100% لجميع المدن')
                          : (language === 'fr' ? 'Frais de livraison : 35 MAD (Gratuite avec le Pack)' : '🚚 رسوم التوصيل: 35 درهم (أو مجاناً مع الباك الكامل)')}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Quantity and Cart Addition */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between border border-gray-200 rounded-full p-1 bg-gray-50/50 w-full sm:w-36 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-gray-500 hover:text-emerald-700 hover:bg-white hover:shadow-md transition-all duration-300 active:scale-90 cursor-pointer select-none bg-white/60 border border-gray-100"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-black text-gray-800 font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-gray-500 hover:text-emerald-700 hover:bg-white hover:shadow-md transition-all duration-300 active:scale-90 cursor-pointer select-none bg-white/60 border border-gray-100"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      onAddToCart(product, quantity, selectedColor);
                      setQuantity(1);
                    }}
                    className="flex-grow py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100/50 flex items-center justify-center space-x-2.5 rtl:space-x-reverse transition-all duration-300 hover:scale-[1.01] active:scale-95 cursor-pointer text-sm sm:text-base"
                  >
                    <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{t.btnAddToCart}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right: Buy & High-Converting Order Form */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Product Header details */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* Rating overview */}
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                    <span className="text-sm font-bold text-gray-700">{product.rating}</span>
                    <span className="text-xs text-gray-400 font-medium">({product.reviewsCount} {t.reviewsLabel})</span>
                  </div>

                  {/* Save favorite heart */}
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`p-2.5 rounded-full border shadow-sm transition-all duration-300 cursor-pointer ${
                      isWishlisted ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-100 text-gray-400 hover:text-rose-500'
                    }`}
                  >
                    <Star className="w-4 h-4 hidden" />
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={isWishlisted ? 'currentColor' : 'none'} />
                    </svg>
                  </button>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-display tracking-tight mb-2">
                  {product.name[language]}
                </h1>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4 font-mono">
                  {product.tagline[language]}
                </p>
                <p className="text-gray-600 text-base leading-relaxed">
                  {product.description[language]}
                </p>
              </div>



              {/* Express COD Form Panel */}
              <div className="bg-emerald-950/5 border border-emerald-950/10 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="text-center">
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 font-mono">
                    {language === 'fr' ? 'COMMANDE EN 1 CLIC (LIVRAISON GRATUITE)' : 'شراء سريع في خطوة واحدة (توصيل مجاني)'}
                  </span>
                  <h3 className="text-xl font-bold text-emerald-950 font-display">
                    {language === 'fr' ? 'Acheter en Cash à la Livraison' : 'شراء سريع ودفع عند الاستلام'}
                  </h3>
                  <p className="text-xs text-emerald-800/80 mt-1 font-sans">
                    {language === 'fr' ? 'Remplissez vos coordonnées ci-dessous pour valider l\'envoi immédiat.' : 'املأ بيانات الشحن والتوصيل ليرسل لك طلبك فورًا.'}
                  </p>
                </div>

                <form onSubmit={handleQuickOrder} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 rtl:text-right">{t.formName}</label>
                    <div className="relative">
                      <User className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={language === 'fr' ? 'Votre nom complet' : 'مثال: محمد السعدي'}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${
                          formErrors.name ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {formErrors.name && <span className="text-xs text-red-500 mt-1 block">{formErrors.name}</span>}
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 rtl:text-right">{t.formPhone}</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder={t.phonePlaceholder}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {formErrors.phone && <span className="text-xs text-red-500 mt-1 block">{formErrors.phone}</span>}
                  </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City Input */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 rtl:text-right">{t.formCity}</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t.cityPlaceholder}
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={`w-full py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${
                            formErrors.city ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                          }`}
                        />
                      </div>
                      {formErrors.city && <span className="text-xs text-red-500 mt-1 block">{formErrors.city}</span>}
                    </div>

                    {/* Address Input */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 rtl:text-right">{t.formAddress}</label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={t.addressPlaceholder}
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className={`w-full py-3 pl-10 pr-4 rtl:pl-4 rtl:pr-10 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${
                            formErrors.address ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                          }`}
                        />
                      </div>
                      {formErrors.address && <span className="text-xs text-red-500 mt-1 block">{formErrors.address}</span>}
                    </div>
                  </div>

                  {/* Notes (Optional) Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 rtl:text-right">{t.formNotes}</label>
                    <textarea
                      placeholder={t.notesPlaceholder}
                      value={formData.notes}
                      rows={2}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full py-2.5 px-3.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all"
                    />
                  </div>

                  {/* Payment Method Option */}
                  <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-700 mb-2 rtl:text-right">
                      {language === 'fr' ? 'Mode de paiement' : 'طريقة الدفع'}
                    </label>
                    <div className="flex items-center space-x-2.5 rtl:space-x-reverse bg-white p-3 rounded-lg border border-emerald-500/30">
                      <input 
                        type="checkbox" 
                        checked 
                        readOnly 
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 accent-emerald-600 cursor-default" 
                      />
                      <span className="text-xs font-bold text-gray-800">
                        {t.paymentMethodCOD}
                      </span>
                    </div>
                  </div>

                  {/* Clear Delivery & Order Total Breakdown */}
                  <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-sm space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                      <span>{language === 'fr' ? 'Prix du produit :' : 'سعر المنتج :'}</span>
                      <span className="font-bold font-mono text-slate-800">{product.price * quantity} MAD</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        {language === 'fr' ? 'Frais de livraison :' : 'رسوم التوصيل :'}
                      </span>
                      {product.id === 'pack-soin-complet' ? (
                        <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                          {language === 'fr' ? '0 MAD (Gratuit)' : '0 درهم (مجاني 🎉)'}
                        </span>
                      ) : (
                        <span className="font-bold font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          35 MAD
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-1 text-sm font-extrabold text-slate-900">
                      <span>{language === 'fr' ? 'Total à payer à la livraison :' : 'المجموع الصافي عند الاستلام :'}</span>
                      <span className="text-lg font-black text-emerald-700 font-mono">
                        {product.id === 'pack-soin-complet' ? product.price * quantity : (product.price * quantity) + 35} MAD
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 pt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {language === 'fr'
                        ? "⚠️ C'est le montant exact et net inscrit sur le bon de livraison que vous donnerez au livreur (aucune autre taxe ou frais caché)."
                        : "⚠️ هذا هو المبلغ الصافي والمحدد المكتوب على وصل الطلب والذي ستدفعه للموزع عند الاستلام (لا توجد أي مصاريف أو رسوم إضافية)."}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isOrdering}
                    className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-base transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse cursor-pointer shadow-lg shadow-orange-100 mt-2"
                  >
                    <span>{isOrdering ? t.btnCheckoutLoading : t.formSubmit}</span>
                  </button>
                </form>

                {/* Secure Badge */}
                <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-xs text-emerald-800 font-semibold text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.secureCheckoutFooter}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Section: Details, Specifications & Trust elements */}
          <div className="mt-16 border-t border-gray-100 pt-16 space-y-12">
            
            {/* Split row for Benefits & Product Ingredients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Benefits Checklist Card */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 font-display mb-6 flex items-center space-x-2.5 rtl:space-x-reverse">
                  <span>{t.benefitsTitle}</span>
                </h3>
                <ul className="space-y-4">
                  {product.benefits[language].map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3.5 rtl:space-x-reverse text-sm text-gray-600">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ingredients Card (renders dynamically if present) */}
              {product.ingredients && product.ingredients[language] && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-900 font-display mb-6 flex items-center space-x-2.5 rtl:space-x-reverse">
                    <span>{t.ingredientsTitle}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.ingredients[language].map((ing, index) => (
                      <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3.5 rounded-2xl bg-gray-50/50 border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          🌱
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{ing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* For products WITHOUT ingredients, render a Trust & Guarantees Card to fill the gap beautifully! */}
              {(!product.ingredients || !product.ingredients[language]) && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-900 font-display mb-6 flex items-center space-x-2.5 rtl:space-x-reverse">
                    <span>{language === 'fr' ? 'Garantie & Service Client' : 'الضمان وخدمة العملاء'}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100/60 flex items-start gap-3.5 h-full">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-0.5">
                          {language === 'fr' ? 'Livraison Gratuite' : 'توصيل مجاني وسريع'}
                        </h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed">
                          {language === 'fr' ? 'Livraison rapide en 24h à 48h partout au Maroc.' : 'توصيل لباب البيت خلال 24 إلى 48 ساعة بجميع مدن المغرب.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 flex items-start gap-3.5 h-full">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-0.5">
                          {language === 'fr' ? 'Paiement Sécurisé' : 'الدفع عند الاستلام'}
                        </h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed">
                          {language === 'fr' ? 'Payez en espèces uniquement au moment de la livraison.' : 'ادفع نقدًا بكل أمان فقط عندما تستلم منتجك وتفحصه.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-100/60 flex items-start gap-3.5 h-full">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-0.5">
                          {language === 'fr' ? 'Garantie Qualité' : 'ضمان الجودة 100%'}
                        </h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed">
                          {language === 'fr' ? 'Produits 100% originaux, testés et approuvés cliniquement.' : 'منتجات أصلية ومضمونة، مختبرة وموافقة للمعايير الطبية.'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100/60 flex items-start gap-3.5 h-full">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug mb-0.5">
                          {language === 'fr' ? 'Support Téléphone & WA' : 'خدمة العملاء متوفرة'}
                        </h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed">
                          {language === 'fr' ? 'Notre équipe est à votre écoute par téléphone et WhatsApp.' : 'فريقنا في خدمتكم دائمًا عبر الهاتف والواتساب لتسهيل طلبكم.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Technical Specifications: Beautiful 2-Column Vertical Table */}
            <div className="bg-white rounded-3xl p-4 sm:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-display mb-4 sm:mb-6 flex items-center space-x-2.5 rtl:space-x-reverse">
                <span>{t.specsTitle}</span>
              </h3>
              
              <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
                <table className="w-full text-xs sm:text-sm text-left rtl:text-right border-collapse min-w-[280px]">
                  <thead>
                    <tr className="bg-emerald-950 text-white border-b border-emerald-900">
                      <th className="py-3 px-3.5 sm:py-4 sm:px-6 font-bold tracking-wider text-[11px] sm:text-xs uppercase w-2/5 sm:w-1/3 break-words">
                        {language === 'fr' ? 'Propriété / Caractéristique' : 'الخاصية / ميزة المنتج'}
                      </th>
                      <th className="py-3 px-3.5 sm:py-4 sm:px-6 font-bold tracking-wider text-[11px] sm:text-xs uppercase w-3/5 sm:w-2/3 break-words">
                        {language === 'fr' ? 'Valeur / Spécification' : 'القيمة / التفاصيل التقنية'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {product.specs[language].map((spec, index) => (
                      <tr key={index} className="hover:bg-gray-50/60 transition-colors duration-250">
                        <td className="py-3 px-3.5 sm:py-4 sm:px-6 font-bold text-gray-700 bg-gray-50/40 border-r border-gray-100/60 break-words">
                          {spec.label}
                        </td>
                        <td className="py-3 px-3.5 sm:py-4 sm:px-6 text-gray-600 font-semibold leading-relaxed break-words">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                    {/* Trust status row */}
                    <tr className="bg-emerald-50/10">
                      <td className="py-3 px-3.5 sm:py-4 sm:px-6 font-bold text-emerald-800 bg-emerald-50/20 border-r border-gray-100/60 break-words">
                        {language === 'fr' ? 'Disponibilité' : 'حالة التوفر في المخزن'}
                      </td>
                      <td className="py-3 px-3.5 sm:py-4 sm:px-6 text-emerald-700 font-bold flex items-center space-x-1.5 rtl:space-x-reverse break-words">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>{language === 'fr' ? 'En stock (Livraison immédiate)' : 'متوفر حاليًا في المخزن (شحن فوري)'}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          </>
        )}

      </div>
    </div>
  );
}
