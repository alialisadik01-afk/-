import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ArrowLeft, ShieldCheck, Check, Phone, User, MapPin, Building2, ShoppingBag, ChevronLeft, ChevronRight, CheckCircle2, Shield, Truck, RotateCcw } from 'lucide-react';
import { Product, Language, CartItem } from '../types';
import { TRANSLATIONS } from '../data';
import { auth, saveOrder, getUserProfile } from '../lib/firebase';
const completePackImage = 'https://i.pinimg.com/736x/3b/eb/4a/3beb4ab6a99e9d7b318c0107cf27c9ab.jpg';

interface BundleDetailProps {
  language: Language;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, selectedColor?: string) => void;
  autoScrollToCheckout?: boolean;
}

export const BUNDLE_PRODUCT: Product = {
  id: 'pack-soin-complet',
  name: {
    fr: 'Pack Soin Complet',
    ar: 'الباك المتكامل للعناية بالأسنان'
  },
  tagline: {
    fr: 'Économisez jusqu\'à 17%',
    ar: 'وفر حتى 17%'
  },
  description: {
    fr: 'Le pack ultime de soins bucco-dentaires premium. Comprend nos trois produits phares pour une routine complète, saine et ultra-fraîche : l\'irrigateur dentaire portable, le bain de bouche naturel GingiHerbe et le dentifrice puissant Anchor Clove.',
    ar: 'الباك المتكامل والأقوى للعناية بالفم والأسنان. يضم منتجاتنا الثلاثة الأساسية لروتين يومي صحي ومنعش للغاية: جهاز خيط الأسنان المائي المحمول، غسول الفم الطبيعي جنجي هيرب، ومعجون الأسنان أنكور بقوة القرنفل الطبيعية.'
  },
  price: 249,
  originalPrice: 300,
  discount: 17,
  rating: 4.9,
  reviewsCount: 198,
  image: completePackImage,
  images: [
    completePackImage,
    'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg', // White Flosser
    'https://i.pinimg.com/736x/0c/8f/c1/0c8fc1d1dea09df8fa22735795a07f66.jpg', // Mouthwash
    'https://i.pinimg.com/736x/99/81/8e/99818e1aa4b474d2dadc539b62d8a10a.jpg'  // Toothpaste
  ],
  colors: [
    { name: { fr: 'Blanc', ar: 'أبيض' }, hex: '#ffffff' },
    { name: { fr: 'Rose', ar: 'وردي' }, hex: '#fbcfe8' },
    { name: { fr: 'Noir', ar: 'أسود' }, hex: '#111827' },
    { name: { fr: 'Vert', ar: 'أخضر' }, hex: '#a7f3d0' }
  ],
  specs: {
    fr: [
      { label: 'Contenu du pack', value: '1 Irrigateur Portable + 1 Bain de bouche + 1 Dentifrice' },
      { label: 'Garantie irrigateur', value: '1 an de garantie complète' },
      { label: 'Ingrédients', value: 'Formules naturelles à base de clou de girofle et menthe poivrée' }
    ],
    ar: [
      { label: 'محتويات الباك', value: '1 خيط مائي محمول + 1 غسول للفم + 1 معجون أسنان بالقرنفل' },
      { label: 'ضمان الجهاز المائي', value: 'ضمان كامل لمدة سنة' },
      { label: 'المكونات', value: 'تركيبات طبيعية بالقرنفل والنعناع المنعش' }
    ]
  },
  benefits: {
    fr: [
      'Routine complète de blanchiment et de soin des gencives',
      'Élimination maximale de la plaque bactérienne',
      'Économisez plus de 100 MAD par rapport aux achats individuels',
      'Livraison rapide et gratuite à domicile avec paiement à la livraison'
    ],
    ar: [
      'روتين متكامل لتبييض الأسنان والعناية باللثة',
      'محاربة قصوى للبلاك وتراكم الجير والبكتيريا',
      'وفر أكثر من 100 درهم مقارنة بشراء المنتجات بشكل منفصل',
      'توصيل سريع ومجاني حتى باب المنزل مع الدفع عند الاستلام'
    ]
  },
  themeColor: 'from-[#f0fdf4] to-[#ccfbf1] text-emerald-950',
  accentColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  textColor: 'text-emerald-800'
};

// Color to specific high quality product images
const COLOR_IMAGES: Record<string, string> = {
  'Blanc': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
  'أبيض': 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
  
  'Rose': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
  'وردي': 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg',
  
  'Vert': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
  'أخضر': 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg',
  
  'Noir': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg',
  'أسود': 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg'
};

export default function BundleDetail({
  language,
  onBack,
  onAddToCart,
  autoScrollToCheckout
}: BundleDetailProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [quantity, setQuantity] = useState(1);
  const [selectedColorFr, setSelectedColorFr] = useState('Blanc');
  const [selectedColorAr, setSelectedColorAr] = useState('أبيض');
  
  const currentFlosserColorName = isRtl ? selectedColorAr : selectedColorFr;
  
  // Gallery images list. Update the second element dynamically based on chosen color.
  const [gallery, setGallery] = useState<string[]>([
    completePackImage,
    COLOR_IMAGES['Blanc'],
    BUNDLE_PRODUCT.images?.[2] || '',
    BUNDLE_PRODUCT.images?.[3] || ''
  ]);

  const [activeImage, setActiveImage] = useState(gallery[0]);

  // Sync color selection
  const handleColorChange = (colorObj: { name: { fr: string; ar: string } }) => {
    setSelectedColorFr(colorObj.name.fr);
    setSelectedColorAr(colorObj.name.ar);
    
    // update secondary flosser image in gallery
    const matchingImage = COLOR_IMAGES[colorObj.name.fr] || COLOR_IMAGES['Blanc'];
    const newGallery = [
      completePackImage,
      matchingImage,
      BUNDLE_PRODUCT.images?.[2] || '',
      BUNDLE_PRODUCT.images?.[3] || ''
    ];
    setGallery(newGallery);
    setActiveImage(matchingImage);
  };

  const activeIndex = gallery.indexOf(activeImage) !== -1 ? gallery.indexOf(activeImage) : 0;

  const handlePrevImage = () => {
    const prevIndex = (activeIndex - 1 + gallery.length) % gallery.length;
    setActiveImage(gallery[prevIndex]);
  };

  const handleNextImage = () => {
    const nextIndex = (activeIndex + 1) % gallery.length;
    setActiveImage(gallery[nextIndex]);
  };

  // Checkout Form states
  const [formData, setFormData] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const orderFormRef = useRef<HTMLDivElement>(null);

  // Scroll to checkout form
  const handleAcheterMaintenant = () => {
    if (orderFormRef.current) {
      orderFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Trigger scroll if requested
  useEffect(() => {
    if (autoScrollToCheckout) {
      const timer = setTimeout(() => {
        handleAcheterMaintenant();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoScrollToCheckout]);

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
    }
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = t.requiredField;
    if (!formData.phone.trim()) {
      errors.phone = t.requiredField;
    } else if (!/^(05|06|07)\d{8}$/.test(formData.phone.trim().replace(/\s/g, ''))) {
      errors.phone = language === 'fr' ? 'Numéro de téléphone marocain invalide (ex: 0612345678)' : 'رقم هاتف مغربي غير صحيح (مثال: 0612345678)';
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
      id: BUNDLE_PRODUCT.id,
      name: `${BUNDLE_PRODUCT.name.fr} (${selectedColorFr})`,
      nameFr: `${BUNDLE_PRODUCT.name.fr} (${selectedColorFr})`,
      nameAr: `${BUNDLE_PRODUCT.name.ar} (${selectedColorAr})`,
      image: completePackImage, // Keep the general bundle image as the main order item image
      quantity: quantity,
      price: BUNDLE_PRODUCT.price,
      selectedColor: selectedColorFr,
      isBundle: true,
      bundleItems: [
        {
          id: 'water-flosser',
          nameFr: `Irrigateur Dentaire Portable (${selectedColorFr})`,
          nameAr: `جهاز خيط الأسنان المائي المحمول (${selectedColorAr})`,
          image: COLOR_IMAGES[selectedColorFr] || 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg',
          selectedColor: selectedColorFr
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
      ]
    }];

    const orderData = {
      fullName: formData.name,
      phone: formData.phone,
      city: formData.city,
      address: formData.address,
      notes: formData.notes,
      paymentMethod: 'COD',
      items: orderItems,
      total: BUNDLE_PRODUCT.price * quantity,
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
        console.error('Error submitting direct bundle order:', err);
        setIsOrdering(false);
      });
  };

  const handleAddToCartWithColor = () => {
    onAddToCart(BUNDLE_PRODUCT, quantity, selectedColorFr);
  };

  return (
    <div className="pt-28 sm:pt-36 pb-16 min-h-screen bg-gradient-to-b from-white via-slate-50 to-white" id="bundle-detail-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="group flex items-center space-x-2 rtl:space-x-reverse text-slate-600 hover:text-emerald-600 font-bold mb-8 transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          <span>{language === 'fr' ? 'Retour à la boutique' : 'العودة إلى المتجر'}</span>
        </button>

        {/* Main Product Sheet Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
          
          {/* LEFT COLUMN: Gallery & Included Products */}
          <div className="space-y-8">
            {/* Gallery Frame */}
            <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt="Pack Soin Complet"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {/* Slider Controls */}
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-all cursor-pointer border border-slate-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-all cursor-pointer border border-slate-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Red Discount badge */}
              <div className="absolute top-6 left-6">
                <span className="bg-[#ff2c3c] text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                  {language === 'fr' ? '-17% DE RÉDUCTION' : 'خصم -17%'}
                </span>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-4 justify-center">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                    activeImage === img ? 'border-emerald-500 scale-105 shadow-sm' : 'border-slate-100 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>

            {/* COLOR SELECTOR: Water Flosser */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider font-mono">
                  {language === 'fr' ? 'Choisissez votre couleur' : 'اختر لون جهاز الخيط المائي'}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {currentFlosserColorName}
                </span>
              </div>

              <div className="flex gap-[14px]">
                {BUNDLE_PRODUCT.colors?.map((col, idx) => {
                  const isSelected = selectedColorFr === col.name.fr;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleColorChange(col)}
                      className={`relative w-11 h-11 rounded-full cursor-pointer transition-all flex items-center justify-center border-2 ${
                        isSelected ? 'border-emerald-500 scale-110 shadow-md' : 'border-slate-200 hover:scale-105 hover:border-slate-300'
                      }`}
                      style={{ 
                        backgroundColor: col.hex
                      }}
                      title={col.name[language]}
                    >
                      {/* Check icon centered */}
                      {isSelected && (
                        <Check className={`w-5 h-5 ${col.hex === '#ffffff' ? 'text-slate-800' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3 shadow-sm">
              <div className="flex justify-between items-center text-xs sm:text-sm text-slate-500 font-medium pb-2 border-b border-slate-150/50">
                <span>{language === 'fr' ? 'Prix individuel :' : 'السعر الفردي للمنتجات :'}</span>
                <span className="line-through font-semibold text-slate-400">300 MAD</span>
              </div>

              <div className="flex justify-between items-center text-xs sm:text-sm text-emerald-700 font-medium pb-2 border-b border-slate-150/50">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  {language === 'fr' ? 'Frais de livraison :' : 'خدمة التوصيل :'}
                </span>
                <span className="font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded font-mono">
                  {language === 'fr' ? '0 MAD (Gratuit 🎉)' : '0 درهم (مجاني 🎉)'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm sm:text-base text-slate-900 font-extrabold py-1">
                <span>{language === 'fr' ? 'Prix Pack (Livraison incluse) :' : 'سعر الباك الكامل (شامل التوصيل) :'}</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-display">
                  249 <span className="text-base font-bold">MAD</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-xs sm:text-sm text-[#ff2c3c] bg-[#ff2c3c]/5 border border-[#ff2c3c]/10 rounded-xl px-4 py-2.5 font-bold">
                <span>{language === 'fr' ? 'Économie totale :' : 'مجموع التوفير الخاص بك :'}</span>
                <span className="font-extrabold text-sm font-mono">51 MAD (-17%)</span>
              </div>
            </div>

            {/* Free Shipping Guarantee Card */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 p-4 rounded-2xl border border-emerald-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-950 font-extrabold text-xs sm:text-sm">
                <Truck className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>{language === 'fr' ? '🚚 Garantie Livraison 100% Gratuite' : '🚚 ضمان التوصيل المجاني 100%'}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'fr'
                  ? "En commandant le Pack Complet, nous prenons en charge l'intégralité des frais de livraison vers toutes les villes du Maroc. Vous ne payerez exactement que 249 MAD à la réception."
                  : "عند طلب الباك الكامل، يتكفل متجرنا بجميع مصاريف التوصيل لجميع مدن المملكة المغربية. المبلغ الصافي الصريح الذي ستدفعه للموزع عند الاستلام هو 249 درهم فقط بدون أي سنتيم إضافي."}
              </p>
            </div>

            {/* Quantity Selector & Main Buttons */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                {/* Quantity counter */}
                <div className="flex items-center justify-between border border-slate-200 bg-slate-50/50 p-1 rounded-full w-full sm:w-36 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-slate-500 hover:text-emerald-700 hover:bg-white hover:shadow-md transition-all duration-300 active:scale-90 cursor-pointer select-none bg-white/60 border border-slate-100"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-black text-slate-800 font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-slate-500 hover:text-emerald-700 hover:bg-white hover:shadow-md transition-all duration-300 active:scale-90 cursor-pointer select-none bg-white/60 border border-slate-100"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCartWithColor}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 px-6 py-4 rounded-2xl font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <span>{language === 'fr' ? 'Ajouter le Pack au panier' : 'إضافة الباك إلى السلة'}</span>
                </button>

                {/* Acheter maintenant */}
                <button
                  onClick={handleAcheterMaintenant}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{language === 'fr' ? 'Acheter maintenant' : 'اشترِ الآن'}</span>
                </button>
              </div>
            </div>

            {/* Included products detail layout */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="text-md sm:text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{language === 'fr' ? 'Les 3 Produits Inclus dans le Pack' : 'المنتجات الثلاثة المشمولة في الباك'}</span>
              </h3>

              <div className="space-y-4">
                {/* Product 1: Mouthwash */}
                <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                  <img 
                    src="https://i.pinimg.com/736x/0c/8f/c1/0c8fc1d1dea09df8fa22735795a07f66.jpg" 
                    alt="GingiHerbe Bain de Bouche" 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {language === 'fr' ? '1. GingiHerbe Bain de Bouche Naturel' : '1. غسول الفم الطبيعي جنجي هيرب'}
                    </h4>
                    <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                      {language === 'fr' ? '125 ml de formule pure de clou de girofle et menthe fraîche' : '125 مل من خلاصة النعناع الفلفلي وزيت القرنفل المركز'}
                    </p>
                  </div>
                </div>

                {/* Product 2: Toothpaste */}
                <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                  <img 
                    src="https://i.pinimg.com/736x/99/81/8e/99818e1aa4b474d2dadc539b62d8a10a.jpg" 
                    alt="Anchor Clove Toothpaste" 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {language === 'fr' ? '2. Anchor Clove Power Dentifrice' : '2. معجون الأسنان أنكور بقوة القرنفل'}
                    </h4>
                    <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                      {language === 'fr' ? '175 g de soin fortifiant complet contre le tartre et la sensibilité' : '175 غرام من تركيبة القرنفل الفعالة المضادة للتسوس والتهابات اللثة'}
                    </p>
                  </div>
                </div>

                {/* Product 3: Water Flosser */}
                <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors">
                  <img 
                    src={COLOR_IMAGES[selectedColorFr]} 
                    alt="Portable Water Flosser" 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 bg-white" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {language === 'fr' ? '3. Irrigateur Dentaire Portable (Water Flosser)' : '3. جهاز خيط الأسنان المائي المحمول'}
                    </h4>
                    <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                      {language === 'fr' ? `Couleur sélectionnée : ${selectedColorFr}. 3 modes de nettoyage, IPX7 étanche, batterie rechargeable.` : `اللون المختار: ${selectedColorAr}. 3 أوضاع تنظيف ومقاومة كاملة للماء.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Details, Color Selector, Checkout Form */}
          <div className="space-y-8">
            
            {/* Title Block */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{language === 'fr' ? 'Économie maximale' : 'توفير استثنائي للباك'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-display leading-tight tracking-tight">
                {BUNDLE_PRODUCT.name[language]}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                {BUNDLE_PRODUCT.description[language]}
              </p>
            </div>



            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-slate-100 py-6 text-center text-slate-500 font-medium text-[10px] sm:text-xs">
              <div className="flex flex-col items-center space-y-1.5">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-700">{language === 'fr' ? 'Livraison rapide' : 'توصيل سريع ومجاني'}</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-700">{language === 'fr' ? 'Garantie 1 An' : 'ضمان كامل لمدة سنة'}</span>
              </div>
              <div className="flex flex-col items-center space-y-1.5">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-700">{language === 'fr' ? 'Paiement à la livraison' : 'الدفع عند الاستلام كاش'}</span>
              </div>
            </div>

            {/* Embedded COD Checkout Form */}
            <div 
              ref={orderFormRef} 
              className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm transition-all"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 font-mono">
                  {language === 'fr' ? 'Formulaire Express (Pas d\'inscription requise)' : 'نموذج الشراء السريع (بدون تسجيل حساب)'}
                </span>
                <h3 className="text-md sm:text-lg font-black text-slate-900 font-display">
                  {language === 'fr' ? 'Confirmez votre commande en 1 minute' : 'أكّد طلبك الآن في أقل من دقيقة'}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {language === 'fr' 
                    ? 'Remplissez vos informations de livraison ci-dessous. Le paiement s\'effectue en espèces lors de la réception de votre colis.' 
                    : 'أدخل معلومات التوصيل الخاصة بك أدناه. الدفع نقدًا عند استلام طلبك ومعاينته.'}
                </p>
              </div>

              {orderSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-150 rounded-2xl p-6 text-center space-y-3"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    {language === 'fr' ? 'Commande envoyée avec succès !' : 'تم استقبال طلبك بنجاح!'}
                  </h4>
                  <p className="text-slate-600 text-xs max-w-md mx-auto leading-relaxed">
                    {language === 'fr'
                      ? 'Félicitations ! Notre service clientèle va vous appeler dans quelques heures sur votre numéro de téléphone pour confirmer l\'expédition.'
                      : 'تهانينا! سيتصل بك أحد موظفينا خلال بضع ساعات على هاتفك لتأكيد الشحن والتوصيل.'}
                  </p>
                  <button 
                    onClick={() => setOrderSuccess(false)}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-sm"
                  >
                    {language === 'fr' ? 'Commander à nouveau' : 'تقديم طلب آخر'}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleQuickOrder} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'fr' ? 'Nom et Prénom' : 'الاسم الكامل'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'fr' ? 'Ex: Ahmed El Alami' : 'مثال: أحمد العلمي'}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all"
                    />
                    {formErrors.name && <p className="text-red-500 text-[10px] font-bold mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'fr' ? 'Numéro de Téléphone' : 'رقم الهاتف'}</span>
                    </label>
                    <input
                      type="tel"
                      placeholder={language === 'fr' ? 'Ex: 0612345678' : 'مثال: 0612345678'}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all text-left"
                      dir="ltr"
                    />
                    {formErrors.phone && <p className="text-red-500 text-[10px] font-bold mt-1">{formErrors.phone}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'fr' ? 'Ville' : 'المدينة'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'fr' ? 'Ex: Casablanca, Rabat, Marrakech...' : 'مثال: الدار البيضاء، الرباط، طنجة...'}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all"
                    />
                    {formErrors.city && <p className="text-red-500 text-[10px] font-bold mt-1">{formErrors.city}</p>}
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'fr' ? 'Adresse de livraison' : 'عنوان الشحن والتوصيل'}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'fr' ? 'Ex: Quartier El Maârif, Rue 4, Num 12' : 'مثال: حي الرياض، شارع النخيل، رقم 4'}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all"
                    />
                    {formErrors.address && <p className="text-red-500 text-[10px] font-bold mt-1">{formErrors.address}</p>}
                  </div>

                  {/* Special Notes (Optional) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider font-mono">
                      {language === 'fr' ? 'Notes ou instructions (optionnel)' : 'ملاحظات أو تعليمات إضافية (اختياري)'}
                    </label>
                    <textarea
                      placeholder={language === 'fr' ? 'Ex: Appeler avant la livraison...' : 'مثال: يرجى الاتصال قبل القدوم للتوصيل...'}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Total calculation indicator */}
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex justify-between items-center text-xs text-slate-700">
                    <span className="font-bold">{language === 'fr' ? 'Total à payer :' : 'المجموع الإجمالي للدفع عند الاستلام :'}</span>
                    <span className="font-extrabold font-mono text-emerald-800 text-sm">{BUNDLE_PRODUCT.price * quantity} MAD</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isOrdering}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isOrdering ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>
                          {language === 'fr' 
                            ? `Confirmer ma commande (${BUNDLE_PRODUCT.price * quantity} MAD)` 
                            : `تأكيد شراء طلبك الآن (${BUNDLE_PRODUCT.price * quantity} درهم)`}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
