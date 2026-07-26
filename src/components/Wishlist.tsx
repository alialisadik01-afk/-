import { motion } from 'motion/react';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Product, Language } from '../types';
import { TRANSLATIONS } from '../data';

interface WishlistProps {
  language: Language;
  wishlistItems: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (productId: string) => void;
  onBackToStore: () => void;
}

export default function Wishlist({
  language,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
  onViewProduct,
  onBackToStore
}: WishlistProps) {
  const t = TRANSLATIONS[language];

  return (
    <div className="pt-28 sm:pt-36 pb-16 min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={onBackToStore}
          className="group flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-emerald-600 font-semibold mb-8 transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
          <span>{t.btnBackToStore}</span>
        </button>

        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-8">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <Heart className="w-5 h-5" fill="currentColor" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-display">
            {t.wishlistTitle}
          </h1>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 mx-auto mb-6">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-display">{t.wishlistEmpty}</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto">
              {language === 'fr' 
                ? 'Sauvegardez vos produits préférés ici pour les retrouver facilement plus tard.' 
                : 'احفظ منتجاتك المفضلة هنا ليسهل عليك العثور عليها وطلبها لاحقًا.'}
            </p>
            <button
              onClick={onBackToStore}
              className="mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-full shadow-md transition-colors cursor-pointer"
            >
              {t.btnBackToStore}
            </button>
          </motion.div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistItems.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Preview */}
                <div 
                  onClick={() => onViewProduct(product.id)}
                  className="relative aspect-square rounded-2xl bg-gray-50 flex items-center justify-center p-4 cursor-pointer overflow-hidden group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr ${product.themeColor} opacity-15`} />
                  <img
                    src={product.image}
                    alt={product.name[language]}
                    className="w-[75%] h-[75%] object-contain rounded-xl relative z-10 transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Details and Actions */}
                <div className="pt-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => onViewProduct(product.id)}
                      className="text-base font-bold text-gray-900 font-display hover:text-emerald-600 cursor-pointer transition-colors"
                    >
                      {product.name[language]}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium italic mt-0.5 mb-3">
                      {product.tagline[language]}
                    </p>
                    <div className="flex items-baseline space-x-2 rtl:space-x-reverse mb-4">
                      <span className="text-lg font-black text-emerald-700">{product.price} MAD</span>
                      <span className="text-xs text-gray-400 line-through">{product.originalPrice} MAD</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onRemoveFromWishlist(product)}
                      className="w-full py-2.5 rounded-xl border border-gray-150 hover:border-red-200 hover:text-red-500 text-gray-500 text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Retirer' : 'حذف'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onAddToCart(product);
                        onRemoveFromWishlist(product);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 rtl:space-x-reverse transition-colors cursor-pointer shadow-sm shadow-emerald-100"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{t.btnAddToCart}</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
