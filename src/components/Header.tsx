import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, User, Menu, X, Globe, Leaf, Home, Lock, Check, Mail, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { auth, googleProvider, saveUserProfile } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, updateProfile, sendPasswordResetEmail } from 'firebase/auth';


interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  setIsCartOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export default function Header({
  language,
  setLanguage,
  currentView,
  setCurrentView,
  cartCount,
  wishlistCount,
  setIsCartOpen,
  isLoggedIn,
  setIsLoggedIn
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  // WhatsApp Config
  const whatsappPhoneNumber = '212612961540';
  const whatsappDefaultMessage = 'السلام عليكم أود الاستفسار عن منتجات العناية بالأسنان المتوفرة لديكم وكيفية الطلب والتوصيل. شكراً لكم!';
  const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(whatsappDefaultMessage)}`;
  const [authStep, setAuthStep] = useState<'welcome' | 'login' | 'register' | 'forgot-password' | 'success'>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Form states for login/signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear form state on modal close or step change
  React.useEffect(() => {
    if (!showGuestModal) {
      setName('');
      setEmail('');
      setPassword('');
      setError(null);
      setShowPassword(false);
      setResetEmailSent(false);
    }
  }, [showGuestModal]);

  React.useEffect(() => {
    setError(null);
    setResetEmailSent(false);
  }, [authStep]);

  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [isAdmin, setIsAdmin] = useState(false);
  React.useEffect(() => {
    const checkAdmin = () => {
      const email = auth.currentUser?.email;
      setIsAdmin(!!email && (email === '9990.999900aaaaaazzzz@gmail.com' || email === '099853ssf@gmail.com'));
    };
    checkAdmin();
    const unsubscribe = auth.onAuthStateChanged(() => {
      checkAdmin();
    });
    return () => unsubscribe();
  }, [isLoggedIn]);

  const menuItems = [
    { view: 'home', label: t.navHome },
    { view: 'why-us', label: t.navWhyUs },
    { view: 'products', label: t.navProducts },
    { view: 'reviews', label: t.navReviews },
    { view: 'faq', label: t.navFaq }
  ];

  const handleNavClick = (view: string) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      setCurrentView('account');
    } else {
      setAuthStep('welcome');
      setShowGuestModal(true);
    }
  };

  const getAuthErrorMessage = (errorObj: any): string => {
    const code = errorObj?.code || '';
    const message = errorObj?.message || '';
    const combined = `${code} ${message}`.toLowerCase();

    if (language === 'fr') {
      if (combined.includes('invalid-credential') || combined.includes('wrong-password') || combined.includes('user-not-found')) {
        return 'Identifiants invalides. Veuillez vérifier votre adresse e-mail et votre mot de passe (ou si vous vous êtes inscrit via Google).';
      }
      if (combined.includes('email-already-in-use')) {
        return 'Cette adresse e-mail est déjà utilisée par un autre compte.';
      }
      if (combined.includes('weak-password')) {
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      }
      if (combined.includes('invalid-email')) {
        return 'Adresse e-mail invalide.';
      }
      return 'Une erreur est survenue lors de l\'authentification.';
    } else {
      if (combined.includes('invalid-credential') || combined.includes('wrong-password') || combined.includes('user-not-found')) {
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق من صحتهما (أو التأكد من أنك لم تسجل الدخول باستخدام Google).';
      }
      if (combined.includes('email-already-in-use')) {
        return 'هذا البريد الإلكتروني مستخدم بالفعل في حساب آخر.';
      }
      if (combined.includes('weak-password')) {
        return 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.';
      }
      if (combined.includes('invalid-email')) {
        return 'البريد الإلكتروني غير صالح.';
      }
      return 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة لاحقاً.';
    }
  };

  const handleFirebaseAuth = async (e: React.FormEvent, type: 'login' | 'register') => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (type === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        await saveUserProfile(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(userCredential.user, { displayName: name });
        await saveUserProfile(userCredential.user, { displayName: name });
      }

      setLoading(false);
      setAuthStep('success');
      setTimeout(() => {
        setIsLoggedIn(true);
        setShowGuestModal(false);
        setCurrentView('account');
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      console.error('Firebase Auth Error:', err);
      setError(getAuthErrorMessage(err));
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      await saveUserProfile(userCredential.user);
      
      setLoading(false);
      setAuthStep('success');
      setTimeout(() => {
        setIsLoggedIn(true);
        setShowGuestModal(false);
        setCurrentView('account');
      }, 1500);
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed or cancelled the login popup window intentionally
        return;
      }
      console.error('Google Auth Error:', err);
      setError(getAuthErrorMessage(err));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, normalizedEmail);
      setResetEmailSent(true);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      console.error('Password Reset Error:', err);
      setError(getAuthErrorMessage(err));
    }
  };


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            
            {/* Logo */}
            <div 
              onClick={() => handleNavClick('home')} 
              className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer group"
              id="logo-container"
            >
              <div className="w-[34.1875px] h-[35px] ml-[1px] mr-[-4px] mt-0 mb-0 pr-0 text-[13px] rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition-colors duration-300">
                <Leaf className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-[16px] ml-[0px] mr-[9px] font-bold tracking-tight text-gray-900 font-display">
                Herbs <span className="text-emerald-600 font-medium">77</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-8 rtl:space-x-reverse">
              {menuItems.map((item, index) => (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`relative py-2 text-sm font-medium transition-colors duration-300 cursor-pointer ${
                    currentView === item.view ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-500'
                  } ${index === 3 ? 'ml-[23px] mr-[24px] pl-[2px]' : ''}`}
                >
                  {item.label}
                  {currentView === item.view && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-3 rtl:space-x-reverse">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                className="hidden xl:flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-full border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all duration-300 text-xs font-semibold text-gray-700 cursor-pointer"
                title={language === 'fr' ? 'Changer de langue' : 'تغيير اللغة'}
              >
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
              </button>

              {/* Wishlist Icon */}
              <button
                onClick={() => setCurrentView('wishlist')}
                className={`hidden xl:inline-flex relative p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer ${
                  currentView === 'wishlist' ? 'text-rose-500 bg-rose-50' : 'text-gray-600'
                }`}
                id="wishlist-btn"
              >
                <Heart className="w-5 h-5" fill={currentView === 'wishlist' ? 'currentColor' : 'none'} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Icon */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="hidden xl:inline-flex relative p-2.5 rounded-full hover:bg-emerald-50 hover:text-emerald-600 text-gray-600 transition-all duration-300 cursor-pointer"
                id="cart-btn"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Admin Dashboard Icon */}
              {isAdmin && (
                <button
                  onClick={() => setCurrentView('admin')}
                  style={{ backgroundColor: '#009966', color: '#ffffff' }}
                  className="hidden xl:inline-flex px-3.5 py-1.5 rounded-full font-bold text-xs items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-sm border border-emerald-600/20"
                  id="admin-dashboard-btn"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Admin' : 'الإدارة'}</span>
                </button>
              )}

              {/* Account Icon */}
              <button
                onClick={handleAccountClick}
                className={`hidden xl:inline-flex p-2.5 rounded-full hover:bg-gray-100 transition-colors duration-300 cursor-pointer ${
                  currentView === 'account' ? 'text-emerald-600 bg-emerald-50/50' : 'text-gray-600'
                }`}
                id="account-btn"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Desktop WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex relative p-2.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-[#25D366] hover:text-white transition-all duration-300 cursor-pointer border border-emerald-100 shadow-xs hover:shadow-md hover:scale-105 active:scale-95"
                id="desktop-whatsapp-btn"
                title={language === 'fr' ? 'Contactez-nous sur WhatsApp' : 'تواصل معنا عبر واتساب'}
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 .007c-6.627 0-12 5.373-12 12 0 2.112.546 4.16 1.587 5.978L.007 24l6.185-1.622c1.762.961 3.738 1.467 5.808 1.467 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12zm7.25 16.516c-.265.743-1.545 1.455-2.148 1.53-.546.068-1.258.114-3.59-.834-2.986-1.213-4.908-4.246-5.059-4.45-.152-.204-1.213-1.614-1.213-3.08 0-1.465.765-2.186 1.037-2.48.273-.295.59-.364.79-.364.196 0 .393.003.567.011.18.008.423-.068.662.507.245.592.836 2.031.91 2.181.074.152.124.327.023.53-.102.203-.153.328-.306.507-.152.18-.32.401-.456.537-.152.152-.31.318-.133.621.177.3.785 1.291 1.685 2.091.773.687 1.423.899 1.726 1.05.303.152.48.127.659-.077.18-.204.78-.908.985-1.218.204-.31.408-.26.689-.158.28.102 1.785.84 2.091.993.306.152.51.229.576.342.066.113.066.653-.199 1.396z" />
                </svg>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 xl:hidden rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer"
                id="mobile-menu-btn"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="xl:hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 pt-2 pb-6 space-y-1 sm:px-6">
                {menuItems.map((item) => (
                  <button
                    key={item.view}
                    onClick={() => handleNavClick(item.view)}
                    className={`block w-full text-left rtl:text-right px-4 py-3 rounded-xl text-base font-medium transition-colors cursor-pointer ${
                      currentView === item.view
                        ? 'bg-emerald-50 text-emerald-600 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                
                {isAdmin && (
                  <button
                    onClick={() => {
                      setCurrentView('admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left rtl:text-right px-4 py-3 rounded-xl text-base font-extrabold transition-colors cursor-pointer flex items-center gap-2 ${
                      currentView === 'admin'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>{language === 'fr' ? 'Panneau Administration' : 'لوحة التحكم والإدارة'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-5 h-16">
          {/* Home */}
          <button
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer pb-2 ${
              currentView === 'home' ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'
            }`}
          >
            <div className="relative p-1">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 tracking-tight text-center px-1 truncate w-full">
              {language === 'fr' ? 'Accueil' : 'الرئيسية'}
            </span>
            {currentView === 'home' && (
              <motion.div
                layoutId="activeBottomNavIndicator"
                className="absolute bottom-1 w-1 h-1 bg-emerald-600 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => handleNavClick('wishlist')}
            className={`flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer pb-2 ${
              currentView === 'wishlist' ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'
            }`}
          >
            <div className="relative p-1">
              <Heart className="w-5 h-5" fill={currentView === 'wishlist' ? 'currentColor' : 'none'} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 tracking-tight text-center px-1 truncate w-full">
              {language === 'fr' ? 'Favoris' : 'المفضلة'}
            </span>
            {currentView === 'wishlist' && (
              <motion.div
                layoutId="activeBottomNavIndicator"
                className="absolute bottom-1 w-1 h-1 bg-rose-500 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer pb-2 text-gray-500 hover:text-emerald-600"
          >
            <div className="relative p-1">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 tracking-tight text-center px-1 truncate w-full">
              {language === 'fr' ? 'Panier' : 'السلة'}
            </span>
          </button>

          {/* WhatsApp (Replaces Account on Mobile bottom bar) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer pb-2 text-emerald-600 hover:text-emerald-700"
            id="mobile-bottom-whatsapp-btn"
          >
            <div className="relative p-1 bg-emerald-50 rounded-full w-[33px] h-[33px] flex items-center justify-center border border-emerald-100 shadow-xs hover:scale-105 active:scale-95 transition-transform">
              <svg
                role="img"
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-emerald-600"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 .007c-6.627 0-12 5.373-12 12 0 2.112.546 4.16 1.587 5.978L.007 24l6.185-1.622c1.762.961 3.738 1.467 5.808 1.467 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12zm7.25 16.516c-.265.743-1.545 1.455-2.148 1.53-.546.068-1.258.114-3.59-.834-2.986-1.213-4.908-4.246-5.059-4.45-.152-.204-1.213-1.614-1.213-3.08 0-1.465.765-2.186 1.037-2.48.273-.295.59-.364.79-.364.196 0 .393.003.567.011.18.008.423-.068.662.507.245.592.836 2.031.91 2.181.074.152.124.327.023.53-.102.203-.153.328-.306.507-.152.18-.32.401-.456.537-.152.152-.31.318-.133.621.177.3.785 1.291 1.685 2.091.773.687 1.423.899 1.726 1.05.303.152.48.127.659-.077.18-.204.78-.908.985-1.218.204-.31.408-.26.689-.158.28.102 1.785.84 2.091.993.306.152.51.229.576.342.066.113.066.653-.199 1.396z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black mt-0.5 tracking-tight text-center px-1 truncate w-full text-emerald-700">
              {language === 'fr' ? 'WhatsApp' : 'واتساب'}
            </span>
          </a>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex flex-col items-center justify-center transition-all duration-300 relative cursor-pointer pb-2 text-gray-500 hover:text-emerald-600"
          >
            <div className="relative p-1">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold mt-0.5 tracking-tight text-center px-1 truncate w-full">
              {language === 'fr' ? 'العربية' : 'Français'}
            </span>
          </button>
        </div>
      </div>

      {/* Guest Authentication Modal */}
      <AnimatePresence>
        {showGuestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuestModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden p-6 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowGuestModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step: Welcome / Guest Options */}
              {authStep === 'welcome' && (
                <div className="text-center py-4 space-y-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <User className="w-7 h-7" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 font-display">
                      {language === 'fr' ? 'Bienvenue' : 'مرحباً بك'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'fr' ? 'Profitez du shopping en tant qu\'invité.' : 'استمتع بالتسوق كزائر.'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 text-xs bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2.5 pt-2">
                    <button
                      onClick={() => setAuthStep('login')}
                      className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      {language === 'fr' ? 'Se connecter avec E-mail' : 'تسجيل الدخول بالبريد'}
                    </button>
                    
                    <button
                      onClick={() => setAuthStep('register')}
                      className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {language === 'fr' ? 'Créer un compte' : 'إنشاء حساب'}
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2.5 rtl:space-x-reverse"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                      </svg>
                      <span>{language === 'fr' ? 'Se connecter avec Google' : 'تسجيل الدخول بـ Google'}</span>
                    </button>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-medium uppercase font-mono">OR</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                    {language === 'fr' 
                      ? 'Vous pouvez également continuer vos achats sans compte.' 
                      : 'يمكنك أيضاً متابعة التسوق بدون حساب.'}
                  </p>
                </div>
              )}

              {/* Step: Login Form */}
              {authStep === 'login' && (
                <div className="py-2">
                  <h3 className="text-base font-bold text-gray-900 font-display mb-4 text-center">
                    {language === 'fr' ? 'Connexion' : 'تسجيل الدخول'}
                  </h3>

                  {error && (
                    <div className="p-3 text-xs bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium mb-4 text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={(e) => handleFirebaseAuth(e, 'login')} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {language === 'fr' ? 'Adresse e-mail' : 'البريد الإلكتروني'}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          placeholder="your-email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full py-2.5 pl-10 pr-4 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {language === 'fr' ? 'Mot de passe' : 'كلمة المرور'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setAuthStep('forgot-password')}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold transition-colors cursor-pointer"
                        >
                          {language === 'fr' ? 'Mot de passe oublié ?' : 'نسيت كلمة المرور؟'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full py-2.5 pl-10 pr-10 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer"
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>{language === 'fr' ? 'Se connecter' : 'تسجيل الدخول'}</span>
                      )}
                    </button>
                  </form>

                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-[9px] text-gray-300 font-bold uppercase font-mono">OR</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2.5 rtl:space-x-reverse"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>{language === 'fr' ? 'Se connecter avec Google' : 'تسجيل الدخول بـ Google'}</span>
                  </button>

                  <button
                    onClick={() => setAuthStep('welcome')}
                    className="w-full text-center text-xs text-gray-400 hover:text-emerald-600 font-bold transition-colors mt-4 cursor-pointer"
                  >
                    {language === 'fr' ? 'Retour' : 'الرجوع'}
                  </button>
                </div>
              )}

              {/* Step: Register Form */}
              {authStep === 'register' && (
                <div className="py-2">
                  <h3 className="text-base font-bold text-gray-900 font-display mb-4 text-center">
                    {language === 'fr' ? 'Créer un compte' : 'إنشاء حساب'}
                  </h3>

                  {error && (
                    <div className="p-3 text-xs bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium mb-4 text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={(e) => handleFirebaseAuth(e, 'register')} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {language === 'fr' ? 'Nom complet' : 'الاسم الكامل'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          placeholder={language === 'fr' ? 'Votre nom complet' : 'مثال: أحمد الإدريسي'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full py-2.5 pl-10 pr-4 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {language === 'fr' ? 'Adresse e-mail' : 'البريد الإلكتروني'}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          placeholder="your-email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full py-2.5 pl-10 pr-4 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                        />
                      </div>
                    </div>

                     <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        {language === 'fr' ? 'Mot de passe' : 'كلمة المرور'}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full py-2.5 pl-10 pr-10 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer"
                    >
                      {loading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>{language === 'fr' ? 'Créer mon compte' : 'إنشاء حساب جديد'}</span>
                      )}
                    </button>
                  </form>

                  <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-[9px] text-gray-300 font-bold uppercase font-mono">OR</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center space-x-2.5 rtl:space-x-reverse"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>{language === 'fr' ? 'S\'enregistrer avec Google' : 'التسجيل بـ Google'}</span>
                  </button>

                  <button
                    onClick={() => setAuthStep('welcome')}
                    className="w-full text-center text-xs text-gray-400 hover:text-emerald-600 font-bold transition-colors mt-4 cursor-pointer"
                  >
                    {language === 'fr' ? 'Retour' : 'الرجوع'}
                  </button>
                </div>
              )}

              {/* Step: Forgot Password */}
              {authStep === 'forgot-password' && (
                <div className="py-2">
                  <h3 className="text-base font-bold text-gray-900 font-display mb-2 text-center">
                    {language === 'fr' ? 'Réinitialiser le mot de passe' : 'إعادة تعيين كلمة المرور'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 text-center">
                    {language === 'fr'
                      ? 'Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.'
                      : 'أدخل بريدك الإلكتروني لتلقي رابط إعادة تعيين كلمة المرور.'}
                  </p>

                  {error && (
                    <div className="p-3 text-xs bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium mb-4 text-center">
                      {error}
                    </div>
                  )}

                  {resetEmailSent ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-medium text-center space-y-3">
                      <p>
                        {language === 'fr'
                          ? 'Un e-mail de réinitialisation a été envoyé à :'
                          : 'تم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور إلى:'}
                      </p>
                      <p className="font-bold underline">{email}</p>
                      <p className="text-[10px] text-emerald-600">
                        {language === 'fr'
                          ? 'Veuillez vérifier votre boîte de réception et vos spams.'
                          : 'يرجى التحقق من صندوق الوارد والبريد المهمل.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setAuthStep('login')}
                        className="w-full mt-2 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        {language === 'fr' ? 'Retour à la connexion' : 'العودة لتسجيل الدخول'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          {language === 'fr' ? 'Adresse e-mail' : 'البريد الإلكتروني'}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            required
                            placeholder="your-email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer"
                      >
                        {loading ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <span>{language === 'fr' ? 'Envoyer le lien' : 'إرسال رابط التعيين'}</span>
                        )}
                      </button>
                    </form>
                  )}

                  {!resetEmailSent && (
                    <button
                      onClick={() => setAuthStep('login')}
                      className="w-full text-center text-xs text-gray-400 hover:text-emerald-600 font-bold transition-colors mt-4 cursor-pointer"
                    >
                      {language === 'fr' ? 'Retour' : 'الرجوع'}
                    </button>
                  )}
                </div>
              )}

              {/* Step: Success screen */}
              {authStep === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 font-display">
                      {language === 'fr' ? 'Connexion réussie !' : 'تم الدخول بنجاح !'}
                    </h3>
                    <p className="text-xs text-emerald-800 font-medium mt-1">
                      {language === 'fr' ? 'Ravi de vous revoir chez Howari.' : 'مرحباً بك مجدداً في عائلة هواري.'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
