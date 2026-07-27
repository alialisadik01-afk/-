import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trash2, ShoppingBag, ShieldCheck, Check, User, Phone, MapPin, Building2, Truck, Sparkles } from 'lucide-react';
import { CartItem, Language } from '../types';
import { TRANSLATIONS } from '../data';
import { saveOrder, getUserProfile } from '../lib/firebase';

interface CartProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, color?: string) => void;
  onRemoveItem: (productId: string, color?: string) => void;
  onClearCart: () => void;
  currentUser: any; // Firebase User or null
}

export default function Cart({
  language,
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser
}: CartProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [formData, setFormData] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Dynamic delivery fee logic:
  // If cart contains the bundle ("pack-soin-complet"), delivery is 0 MAD (FREE).
  // Otherwise, if single products, delivery is 35 MAD.
  const hasBundle = cartItems.some((item) => item.product.id === 'pack-soin-complet');
  const deliveryFee = cartItems.length === 0 ? 0 : (hasBundle ? 0 : 35);
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  // Autofill if logged in
  React.useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.displayName || '',
      }));
      getUserProfile(currentUser.uid).then((dbProfile) => {
        if (dbProfile) {
          setFormData({
            name: dbProfile.displayName || currentUser.displayName || '',
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
  }, [currentUser, isOpen]);

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

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsCheckingOut(true);

    const colorMap: Record<string, string> = {
      'Blanc': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
      'أبيض': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
      'Rose': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
      'وردي': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
      'Vert': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
      'أخضر': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
      'Noir': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg',
      'أسود': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg',
      'Blanc Pur': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
      'أبيض ناصع': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
      'Rose poudré': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
      'وردي لطيف': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
      'Vert Menthe': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
      'أخضر نعناعي': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
      'Noir Onyx': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg',
      'أسود أونيكس': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg'
    };

    const orderItems = cartItems.map((item) => {
      const isBundle = item.product.id === 'pack-soin-complet';
      const itemImage = isBundle 
        ? 'https://i.pinimg.com/736x/3b/eb/4a/3beb4ab6a99e9d7b318c0107cf27c9ab.jpg' 
        : (item.selectedColor && colorMap[item.selectedColor] ? colorMap[item.selectedColor] : item.product.image);
      
      const displayNameFr = item.selectedColor 
        ? `${item.product.name.fr} (${item.selectedColor})` 
        : item.product.name.fr;
        
      const displayNameAr = item.selectedColor 
        ? `${item.product.name.ar} (${item.selectedColor})` 
        : item.product.name.ar;

      // Color mapping for sub-product inside the bundle
      const flosserArColor = item.selectedColor === 'Blanc' || item.selectedColor === 'Blanc Pur' || !item.selectedColor ? 'أبيض' :
                             item.selectedColor === 'Rose' || item.selectedColor === 'Rose poudré' ? 'وردي' :
                             item.selectedColor === 'Noir' || item.selectedColor === 'Noir Onyx' ? 'أسود' :
                             item.selectedColor === 'Vert' || item.selectedColor === 'Vert Menthe' ? 'أخضر' : item.selectedColor;

      const bundleItems = isBundle ? [
        {
          id: 'water-flosser',
          nameFr: `Irrigateur Dentaire Portable (${item.selectedColor || 'Blanc'})`,
          nameAr: `جهاز خيط الأسنان المائي المحمول (${flosserArColor})`,
          image: (item.selectedColor && colorMap[item.selectedColor]) || 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
          selectedColor: item.selectedColor || 'Blanc'
        },
        {
          id: 'mouthwash',
          nameFr: 'GingiHerbe Bain de Bouche Naturel',
          nameAr: 'غسول الفم الطبيعي جنجي هيرب',
          image: 'https://i.pinimg.com/736x/0c/8f/c1/0c8fc1d1dea09df8fa22735795a07f66.jpg'
        },
        {
          id: 'toothpaste',
          nameFr: 'Anchor Clove Power Dentifrice',
          nameAr: 'معجون الأسنان أنكور بقوة القرنفل',
          image: 'https://i.pinimg.com/736x/99/81/8e/99818e1aa4b474d2dadc539b62d8a10a.jpg'
        }
      ] : undefined;

      return {
        id: item.product.id,
        name: displayNameFr,
        nameFr: displayNameFr,
        nameAr: displayNameAr,
        image: itemImage,
        quantity: item.quantity,
        price: item.product.price,
        selectedColor: item.selectedColor,
        isBundle,
        bundleItems
      };
    });

    const orderData = {
      fullName: formData.name,
      phone: formData.phone,
      city: formData.city,
      address: formData.address,
      notes: formData.notes,
      paymentMethod: 'COD',
      items: orderItems,
      shippingFee: deliveryFee,
      total,
      userId: currentUser ? currentUser.uid : null,
      isGuest: !currentUser
    };

    saveOrder(orderData)
      .then(() => {
        setIsCheckingOut(false);
        setCheckoutSuccess(true);
        setTimeout(() => {
          onClearCart();
          setCheckoutSuccess(false);
          setFormData({ name: '', phone: '', city: '', address: '', notes: '' });
          onClose();
        }, 4000);
      })
      .catch((err) => {
        console.error('Error submitting order to Firebase:', err);
        setIsCheckingOut(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-black/55 transition-opacity" 
      />

      {/* Cart Panel Frame */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="w-screen max-w-md bg-white flex flex-col justify-between shadow-2xl h-full border-l border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
              <ShoppingBag className="w-5.5 h-5.5 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900 font-display">
                {t.cartTitle}
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                {cartItems.length}
              </span>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Checkout Success Screen */}
          {checkoutSuccess ? (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center bg-emerald-50/50">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-emerald-600 animate-bounce" />
              </div>
              <h3 className="text-xl font-extrabold text-emerald-950 font-display mb-3">
                {language === 'fr' ? 'Commande Reçue !' : 'تم استلام طلبكم !'}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed max-w-xs mx-auto mb-6">
                {t.checkoutSuccess}
              </p>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full font-mono uppercase tracking-wider">
                {t.freeShippingBadge}
              </span>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart View */
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 font-display">{t.cartEmpty}</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">{language === 'fr' ? 'Ajoutez vos produits buccaux préférés pour démarrer votre routine.' : 'أضف منتجاتك المفضلة لبدء الحفاظ على نظافة فمك.'}</p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full shadow-md cursor-pointer transition-all duration-300"
              >
                {t.btnBackToStore}
              </button>
            </div>
          ) : (
            /* Active Items List & Checkout Form Roll */
            <div className="flex-grow overflow-y-auto divide-y divide-gray-100 p-6 space-y-6">
              
              {/* Smart Marketing Delivery Banner */}
              {!hasBundle && (
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 text-white p-4 rounded-2xl border border-emerald-500/40 shadow-sm space-y-2">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-amber-300">
                    <Sparkles className="w-4 h-4 animate-pulse flex-shrink-0" />
                    <span>{language === 'fr' ? '💡 ÉCONOMISEZ 35 MAD DE LIVRAISON' : '💡 احصل على توصيل مجاني 100%'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-100 leading-relaxed font-sans">
                    {language === 'fr'
                      ? 'Les produits individuels incluent 35 MAD de frais de livraison. Choisissez le Pack Complet (249 MAD) pour débloquer la LIVRAISON GRATUITE !'
                      : 'المنتجات الفردية تتطلب 35 درهم رسوم توصيل. اطلب الباك الكامل بـ 249 درهم واستفد من التوصيل المجاني 100% لجميع المدن.'}
                  </p>
                </div>
              )}

              {/* Items listing */}
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const isBundle = item.product.id === 'pack-soin-complet';
                  
                  const colorMap: Record<string, string> = {
                    'Blanc': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
                    'أبيض': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
                    'Rose': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
                    'وردي': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
                    'Vert': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
                    'أخضر': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
                    'Noir': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg',
                    'أسود': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg',
                    'Blanc Pur': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
                    'أبيض ناصع': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
                    'Rose poudré': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
                    'وردي لطيف': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
                    'Vert Menthe': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
                    'أخضر نعناعي': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
                    'Noir Onyx': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg',
                    'أسود أونيكس': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg'
                  };

                  const itemImage = isBundle 
                    ? 'https://i.pinimg.com/736x/3b/eb/4a/3beb4ab6a99e9d7b318c0107cf27c9ab.jpg' 
                    : (item.selectedColor && colorMap[item.selectedColor] ? colorMap[item.selectedColor] : item.product.image);
                  
                  const flosserImage = (isBundle && item.selectedColor)
                    ? (colorMap[item.selectedColor] || 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg')
                    : 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg';

                  return (
                    <div key={`${item.product.id}-${item.selectedColor || ''}`} className="flex flex-col py-4 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-start space-x-4 rtl:space-x-reverse">
                        {/* Thumbnail */}
                        <div className={`w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center relative overflow-hidden ${isBundle ? '' : 'p-2'}`}>
                          <img
                            src={itemImage}
                            alt={item.product.name[language]}
                            className={`${isBundle ? 'w-full h-full object-cover' : 'w-14 h-14 object-contain rounded-lg'} relative z-10 animate-fade-in`}
                            referrerPolicy="no-referrer"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-tr ${item.product.themeColor} opacity-20 rounded-2xl z-20 pointer-events-none`} />
                        </div>

                        {/* Meta details */}
                        <div className="flex-grow mr-3">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-2 font-display leading-tight">
                              {item.product.name[language]}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(item.product.id, item.selectedColor)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {item.selectedColor && (
                            <span className="text-[11px] font-semibold text-slate-500 mt-1 block">
                              {language === 'fr' ? 'Couleur choisi' : 'اللون المختار'}: {item.selectedColor}
                            </span>
                          )}

                          <div className="flex justify-between items-center mt-3">
                            {/* Quantity picker */}
                            <div className="flex items-center border border-gray-200 rounded-full p-1 bg-gray-50 scale-90 origin-left rtl:origin-right">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-gray-600 hover:bg-white hover:shadow-sm cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-gray-600 hover:bg-white hover:shadow-sm cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Price segment */}
                            <span className="text-sm font-black text-emerald-700 font-mono">
                              {item.product.price * item.quantity} MAD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Display included products if it's the Pack/Bundle */}
                      {isBundle && (
                        <div className="mt-4 mx-2 bg-gradient-to-br from-emerald-50/50 to-slate-50/50 rounded-2xl p-3.5 border border-emerald-100/60 shadow-xs">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 bg-emerald-100/40 px-2 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {language === 'fr' ? 'Contenu du Pack Trio (3 pièces)' : 'محتويات الباك الثلاثي (3 قطع)'}
                            </span>
                          </div>
                          
                          <div className="space-y-2.5">
                            {/* 1. Selected Flosser */}
                            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-2xs hover:border-emerald-200/50 transition-all duration-300">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100/50 flex-shrink-0 flex items-center justify-center p-1 relative">
                                <img 
                                  src={flosserImage} 
                                  alt="Flosser" 
                                  className="w-8 h-8 object-contain rounded"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">✓</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                                    {language === 'fr' ? 'Jet Dentaire Hydro-propulseur' : 'جهاز الخيط المائي المحمول'}
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                    {item.selectedColor}
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-400 block truncate">
                                  {language === 'fr' ? 'Technologie de pulsation d\'eau' : 'تنظيف عميق بالنبض المائي'}
                                </span>
                              </div>
                            </div>

                            {/* 2. Mouthwash */}
                            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-2xs hover:border-emerald-200/50 transition-all duration-300">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100/50 flex-shrink-0 flex items-center justify-center p-1 relative">
                                <img 
                                  src="https://i.pinimg.com/736x/0c/8f/c1/0c8fc1d1dea09df8fa22735795a07f66.jpg" 
                                  alt="Mouthwash" 
                                  className="w-8 h-8 object-cover rounded"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">✓</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                                    {language === 'fr' ? 'GingiHerbe Bain de Bouche' : 'غسول الفم جنجي هيرب الطبيعي'}
                                  </span>
                                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                    {language === 'fr' ? 'Inclus' : 'مرفق'}
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-400 block truncate">
                                  {language === 'fr' ? 'Extrait de clou de girofle naturel' : 'مستخلص طبيعي مضاد للبكتيريا'}
                                </span>
                              </div>
                            </div>

                            {/* 3. Toothpaste */}
                            <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-2xs hover:border-emerald-200/50 transition-all duration-300">
                              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100/50 flex-shrink-0 flex items-center justify-center p-1 relative">
                                <img 
                                  src="https://i.pinimg.com/736x/99/81/8e/99818e1aa4b474d2dadc539b62d8a10a.jpg" 
                                  alt="Toothpaste" 
                                  className="w-8 h-8 object-cover rounded"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">✓</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                                    {language === 'fr' ? 'Anchor Clove Dentifrice' : 'معجون أسنان أنكور بالقرنفل'}
                                  </span>
                                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                    {language === 'fr' ? 'Inclus' : 'مرفق'}
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-400 block truncate">
                                  {language === 'fr' ? 'Protection complète' : 'حماية متكاملة من التسوس'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Secure checkout Cash-on-Delivery details Form */}
              <div className="pt-6 space-y-4">
                <div className="text-center pb-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                    {language === 'fr' ? 'Validation Rapide CoD' : 'تأكيد الطلب السريع كاش'}
                  </span>
                  <h3 className="text-base font-bold text-emerald-950 font-display mt-2">
                    {language === 'fr' ? 'Informations de livraison' : 'معلومات الشحن والتوصيل'}
                  </h3>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
                  {/* Name */}
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t.formName}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full py-2.5 pl-9 pr-4 rtl:pl-4 rtl:pr-9 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${
                          formErrors.name ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {formErrors.name && <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.name}</span>}
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder={t.formPhone}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full py-2.5 pl-9 pr-4 rtl:pl-4 rtl:pr-9 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {formErrors.phone && <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.phone}</span>}
                  </div>

                  {/* City */}
                  <div>
                    <div className="relative">
                      <Building2 className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t.formCity}
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className={`w-full py-2.5 pl-9 pr-4 rtl:pl-4 rtl:pr-9 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${
                          formErrors.city ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {formErrors.city && <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.city}</span>}
                  </div>

                  {/* Address */}
                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={t.formAddress}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={`w-full py-2.5 pl-9 pr-4 rtl:pl-4 rtl:pr-9 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all ${
                          formErrors.address ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                    {formErrors.address && <span className="text-[10px] text-red-500 mt-0.5 block">{formErrors.address}</span>}
                  </div>

                  {/* Notes (Optional) */}
                  <div>
                    <textarea
                      placeholder={t.notesPlaceholder}
                      value={formData.notes}
                      rows={2}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full py-2 px-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white transition-all"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 rtl:text-right">
                      {language === 'fr' ? 'Mode de paiement' : 'طريقة الدفع'}
                    </label>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse bg-white p-2.5 rounded-lg border border-emerald-500/30">
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

                  {/* Order Total Breakdown Box */}
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>{language === 'fr' ? 'Sous-total :' : 'مجموع المشتريات :'}</span>
                      <span className="font-bold font-mono">{subtotal} MAD</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        {language === 'fr' ? 'Frais de livraison :' : 'رسوم التوصيل :'}
                      </span>
                      {hasBundle ? (
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
                      <span>{language === 'fr' ? 'Total à payer :' : 'المجموع الصافي عند الاستلام :'}</span>
                      <span className="text-base font-black text-emerald-700 font-mono">{total} MAD</span>
                    </div>

                    <p className="text-[10px] text-slate-500 pt-1 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {language === 'fr'
                        ? "⚠️ C'est le montant net exact indiqué sur le bon de livraison (aucun frais caché)."
                        : "⚠️ هذا هو المبلغ المكتوب على وصل الطلب والذي ستدفعه للموزع عند الاستلام بدون أي زيادة."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md shadow-orange-100"
                  >
                    <span>{isCheckingOut ? t.btnCheckoutLoading : t.formSubmit}</span>
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* Bottom Summary (Only shown if items exist and checkout is not active/success) */}
          {!checkoutSuccess && cartItems.length > 0 && (
            <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-4">
              <div className="space-y-1.5 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.cartSubtotal}</span>
                  <span className="text-gray-900 font-mono font-bold">{subtotal} MAD</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-xs">
                  <span className="text-gray-500">{t.cartShipping}</span>
                  {hasBundle ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase font-mono">
                      {language === 'fr' ? '0 MAD (GRATUIT)' : '0 درهم (مجاني 🎉)'}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold font-mono">
                      35 MAD
                    </span>
                  )}
                </div>
                <div className="border-t border-gray-200/50 pt-3 flex justify-between text-base font-black text-gray-900">
                  <span>{t.cartTotal}</span>
                  <span className="text-lg text-emerald-700 font-mono font-black">{total} MAD</span>
                </div>
              </div>

              {/* Secure certification footer */}
              <div className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-[10px] text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t.secureCheckoutFooter}</span>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
