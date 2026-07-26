import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import Account from './components/Account';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import BundleDetail, { BUNDLE_PRODUCT } from './components/BundleDetail';
import { Product, CartItem, Language } from './types';
import { PRODUCTS, TRANSLATIONS } from './data';
import { auth, getFirestoreProducts, saveFirestoreProduct } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  // Localization state
  const [language, setLanguage] = useState<Language>('ar');
  const isRtl = language === 'ar';
  const t = TRANSLATIONS[language];

  // Guest Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Dynamic products list from Firestore with fallback to static PRODUCTS
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  const fetchProducts = async () => {
    try {
      const fetched = await getFirestoreProducts(PRODUCTS);
      if (fetched && fetched.length > 0) {
        setProductsList(fetched);
      }
    } catch (err) {
      console.error('Error fetching dynamic products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Admin access detection
  const isAdminUser = currentUser && (currentUser.email === '9990.999900aaaaaazzzz@gmail.com' || currentUser.email === '099853ssf@gmail.com');

  // Sync auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Router View States
  // 'home' | 'products' | 'product-detail' | 'wishlist' | 'account' | 'admin'
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [bundleAutoScrollToCheckout, setBundleAutoScrollToCheckout] = useState<boolean>(false);

  // Programmatic scroll state tracking to prevent feedback loops in scrollspy
  const isScrollingRef = React.useRef(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleSetViewManual = (view: string) => {
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    setCurrentView(view);
    
    // Immediately trigger scrolling for section views (to support clicking the same view again)
    if (['products', 'why-us', 'reviews', 'faq'].includes(view)) {
      const targetId = view === 'products' ? 'individual-products' : view;
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const headerHeight = window.innerWidth < 640 ? 115 : 135;
          const targetPosition = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
        }
      }, 100);
    } else if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  };

  // Cart & Wishlist storage engines
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('howari_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('howari_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('howari_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('howari_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handle HTML document direction on language switch
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  // Handle scroll navigation for homepage sections
  useEffect(() => {
    if (!isScrollingRef.current) return;

    if (['products', 'why-us', 'reviews', 'faq'].includes(currentView)) {
      const targetId = currentView === 'products' ? 'individual-products' : currentView;
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const headerHeight = window.innerWidth < 640 ? 115 : 135;
          const targetPosition = el.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    } else if (currentView === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  // Active section scroll spy handler
  useEffect(() => {
    const handleScroll = () => {
      // Skip if programmatic scrolling is active
      if (isScrollingRef.current) return;

      // Only spy on homepage views
      if (!['home', 'products', 'why-us', 'reviews', 'faq'].includes(currentView)) return;

      const sections = [
        { id: 'why-us', view: 'why-us' },
        { id: 'products-list', view: 'products' },
        { id: 'reviews', view: 'reviews' },
        { id: 'faq', view: 'faq' }
      ];

      let activeView = 'home';
      const scrollPosition = window.scrollY + 200; // threshold offset for header

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            activeView = section.view;
          }
        }
      }

      // If at bottom, force faq highlight
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        activeView = 'faq';
      }

      if (activeView !== currentView) {
        setCurrentView(activeView);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentView]);

  // Shopping Cart Actions
  const handleAddToCart = (product: Product, quantity = 1, selectedColor?: string) => {
    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === selectedColor
      );

      if (existingIdx > -1) {
        const newCart = [...prevCart];
        newCart[existingIdx] = {
          ...newCart[existingIdx],
          quantity: newCart[existingIdx].quantity + quantity
        };
        return newCart;
      }

      return [...prevCart, { product, quantity, selectedColor }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, color?: string) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter((item) => !(item.product.id === productId && item.selectedColor === color));
      }
      return prevCart.map((item) =>
        item.product.id === productId && item.selectedColor === color ? { ...item, quantity } : item
      );
    });
  };

  const handleRemoveFromCart = (productId: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedColor === color))
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist Actions
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      const isExist = prevWishlist.some((item) => item.id === product.id);
      if (isExist) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const isProductWishlisted = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Navigation handlers
  const handleViewProductDetails = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStore = () => {
    setCurrentView('home');
    setSelectedProductId(null);
    setBundleAutoScrollToCheckout(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeDetailProduct = productsList.find((p) => p.id === selectedProductId);

  return (
    <div className={`min-h-screen bg-white text-gray-900 transition-all duration-300 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 ${
      isRtl ? 'font-display' : ''
    }`}>
      {/* Header Bar */}
      <Header
        language={language}
        setLanguage={setLanguage}
        currentView={currentView}
        setCurrentView={handleSetViewManual}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        setIsCartOpen={setIsCartOpen}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />

      {/* Cart Slider Drawer Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <Cart
            language={language}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

      {/* Main Container Pages Wrapper */}
      <main className="transition-all duration-300 pb-16 xl:pb-0">
        <AnimatePresence mode="wait">
          {['home', 'products', 'why-us', 'reviews', 'faq'].includes(currentView) && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Premium Hero Banner */}
              <Hero
                language={language}
                onViewProducts={() => {
                  const el = document.getElementById('individual-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onBuyNow={() => {
                  handleSetViewManual('bundle-detail');
                }}
              />

              {/* Beautiful Product Cards Grid (Our Products) */}
              <section id="products-list" className="py-24 bg-gray-50/30 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  
                  {/* Premium Pack CTA Banner */}
                  <div className="max-w-4xl mx-auto mb-20">
                    <motion.div
                      whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)" }}
                      transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      onClick={() => handleSetViewManual('bundle-detail')}
                      className="relative cursor-pointer overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/20 rounded-[20px] border border-emerald-100/40 p-8 sm:p-12 text-center shadow-[0_10px_35px_-10px_rgba(0,0,0,0.02)] hover:border-emerald-200/50 transition-all duration-300"
                    >
                      {/* Abstract subtle gradient background glows */}
                      <div className="absolute -top-12 -left-12 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-12 -right-12 w-56 h-56 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto space-y-6">
                        {/* Small Badge */}
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-100/50 text-emerald-800 text-xs sm:text-sm font-bold tracking-wide uppercase">
                          {language === 'fr' ? '🔥 Offre Exclusive' : '🔥 عرض حصري'}
                        </span>

                        {/* Large Title */}
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
                          {language === 'fr' ? 'Découvrez notre Pack Complet' : 'اكتشف حزمتنا المتكاملة'}
                        </h2>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl font-semibold text-emerald-600">
                          {language === 'fr' ? "Obtenez les 3 produits ensemble et économisez jusqu'à 17%." : 'احصل على المنتجات الثلاثة معًا ووفر حتى 17%.'}
                        </p>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-light">
                          {language === 'fr' 
                            ? 'Le Pack réunit nos trois meilleures solutions pour une hygiène bucco-dentaire complète.' 
                            : 'تجمع هذه الحزمة بين أفضل ثلاثة حلول لدينا للعناية الشاملة بالفم والأسنان.'}
                        </p>

                        {/* Elegant Button with Green Gradient */}
                        <div className="pt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetViewManual('bundle-detail');
                            }}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-full shadow-lg shadow-emerald-600/10 hover:shadow-xl hover:shadow-emerald-600/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 text-sm sm:text-base cursor-pointer"
                          >
                            <span>{language === 'fr' ? 'Découvrir le Pack →' : 'اكتشف الحزمة ←'}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Individual Products Grid */}
                  <div id="individual-products" className="scroll-mt-24 sm:scroll-mt-28">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight mb-3">
                        {t.sectionProductsTitle}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {t.sectionProductsSubtitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {productsList.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          language={language}
                          onAddToCart={(p) => handleAddToCart(p, 1)}
                          onToggleWishlist={handleToggleWishlist}
                          isWishlisted={isProductWishlisted(product.id)}
                          onViewDetails={handleViewProductDetails}
                          onQuickOrder={(p) => {
                            handleAddToCart(p, 1);
                            setIsCartOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </section>

              {/* Testimonials Block */}
              <Testimonials language={language} />

              {/* FAQ Accordion Block */}
              <FAQ language={language} />
            </motion.div>
          )}

          {/* Product Detail Deep Dive Page */}
          {currentView === 'product-detail' && activeDetailProduct && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <ProductDetail
                product={activeDetailProduct}
                language={language}
                onBack={handleBackToStore}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isProductWishlisted(activeDetailProduct.id)}
              />
            </motion.div>
          )}

          {/* Bundle Detail Deep Dive Page */}
          {currentView === 'bundle-detail' && (
            <motion.div
              key="bundle-detail"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
            >
              <BundleDetail
                language={language}
                onBack={handleBackToStore}
                onAddToCart={handleAddToCart}
                autoScrollToCheckout={bundleAutoScrollToCheckout}
              />
            </motion.div>
          )}

          {/* Wishlist Favorites page */}
          {currentView === 'wishlist' && (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Wishlist
                language={language}
                wishlistItems={wishlist}
                onRemoveFromWishlist={handleToggleWishlist}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onViewProduct={handleViewProductDetails}
                onBackToStore={handleBackToStore}
              />
            </motion.div>
          )}

          {/* User Account page */}
          {currentView === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Account 
                language={language} 
                onBackToStore={handleBackToStore} 
                onLogout={async () => {
                  try {
                    await auth.signOut();
                  } catch (e) {
                    console.error("Error signing out:", e);
                  }
                  handleBackToStore();
                }}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {/* Admin Dashboard Page */}
          {currentView === 'admin' && isAdminUser && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AdminDashboard
                language={language}
                onBackToStore={handleBackToStore}
                currentUser={currentUser}
                fallbackProducts={PRODUCTS}
                onRefreshProducts={fetchProducts}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Luxury Footer (Newsletter, Socials, Secured COD badges) */}
      <Footer language={language} onNavigate={(view) => {
        if (view === 'home') {
          handleBackToStore();
        } else {
          handleSetViewManual(view);
        }
      }} />
    </div>
  );
}
