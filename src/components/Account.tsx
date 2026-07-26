import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Package, Settings, MapPin, Phone, Mail, Clock, ShieldAlert, ArrowLeft, LogOut, Check } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { getUserProfile, getUserOrders, saveUserProfile } from '../lib/firebase';

interface AccountProps {
  language: Language;
  onBackToStore: () => void;
  onLogout: () => void;
  currentUser: any; // Firebase User
}

export default function Account({ language, onBackToStore, onLogout, currentUser }: AccountProps) {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'settings'>('orders');

  // Form profile states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Load profile fields from Firestore
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.displayName || '');
      getUserProfile(currentUser.uid).then((dbProfile) => {
        if (dbProfile) {
          if (dbProfile.displayName) setName(dbProfile.displayName);
          if (dbProfile.phone) setPhone(dbProfile.phone);
          if (dbProfile.city) setCity(dbProfile.city);
          if (dbProfile.address) setAddress(dbProfile.address);
        }
      });
    }
  }, [currentUser]);

  // Load orders from Firestore
  useEffect(() => {
    if (currentUser) {
      setLoadingOrders(true);
      getUserOrders(currentUser.uid).then((fetchedOrders) => {
        setOrders(fetchedOrders);
        setLoadingOrders(false);
      });
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setUpdating(true);
    setUpdateSuccess(false);
    try {
      await saveUserProfile(currentUser, {
        displayName: name,
        phone,
        city,
        address
      });
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="pt-28 sm:pt-36 pb-16 min-h-screen bg-gray-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={onBackToStore}
          className="group flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-emerald-600 font-semibold mb-8 transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1 rtl:group-hover:translate-x-1" />
          <span>{t.btnBackToStore}</span>
        </button>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse text-center sm:text-left rtl:sm:text-right">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 font-display">
                {name || currentUser?.displayName || 'Client Howari'}
              </h1>
              <p className="text-sm text-gray-500 font-sans mt-0.5">
                {currentUser?.email}
              </p>
            </div>
          </div>
          <span className="bg-emerald-50 border border-emerald-100/50 text-emerald-800 text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider font-mono">
            {t.accountWelcome}
          </span>
        </div>

        {/* Dynamic Nav Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center space-x-3 rtl:space-x-reverse transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-white border border-gray-150 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.accountOrders}</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center space-x-3 rtl:space-x-reverse transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-white border border-gray-150 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{language === 'fr' ? 'Adresse de livraison' : 'عنوان الشحن والتوصيل'}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center space-x-3 rtl:space-x-reverse transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-white border border-gray-150 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t.accountSettings}</span>
            </button>

            {/* Logout Option */}
            <button
              onClick={onLogout}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center space-x-3 rtl:space-x-reverse transition-all bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 mt-6 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{language === 'fr' ? 'Se déconnecter' : 'تسجيل الخروج'}</span>
            </button>
          </div>

          {/* Active Tab Content Window */}
          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm min-h-[300px]"
            >
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-4">
                    {t.accountActiveOrders}
                  </h3>
                  
                  {loadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <span className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                      <p className="text-xs text-gray-400 font-medium">{language === 'fr' ? 'Chargement de vos commandes...' : 'جاري تحميل طلباتك...'}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-xs text-gray-500 font-bold">{language === 'fr' ? 'Aucune commande trouvée.' : 'لا توجد أي طلبات حالية.'}</p>
                      <button 
                        onClick={onBackToStore}
                        className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                      >
                        {language === 'fr' ? 'Continuer mes achats' : 'ابدأ التسوق الآن'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-100 rounded-2xl p-5 hover:border-emerald-100 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <Clock className="w-5 h-5 text-gray-400" />
                              <div>
                                <span className="text-xs font-bold text-gray-400 font-mono uppercase">
                                  {t.accountOrderNumber}#{order.id.slice(0, 8).toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400 block mt-0.5">
                                  {order.createdAt?.seconds 
                                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'ar-MA', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })
                                    : ''}
                                </span>
                              </div>
                            </div>
                            
                            {/* Order status badges */}
                            <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${
                              order.status === 'pending' 
                                ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {order.status === 'pending' 
                                ? (language === 'fr' ? 'En attente de confirmation' : 'في انتظار التأكيد الهاتفي') 
                                : (language === 'fr' ? 'Livré' : 'تم التوصيل')}
                            </span>
                          </div>

                          <div className="space-y-2.5 mb-4">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-xs text-gray-700 font-medium">
                                <span>{item.quantity}x {language === 'fr' ? (item.nameFr || item.name) : (item.nameAr || item.name)} {item.selectedColor ? `(${item.selectedColor})` : ''}</span>
                                <span className="font-mono">{item.price} MAD</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-gray-100 gap-2">
                            <p className="text-xs font-bold text-gray-400">
                              {language === 'fr' ? 'Adresse:' : 'العنوان:'} <span className="text-gray-600 font-medium font-sans">{order.address}, {order.city}</span>
                            </p>
                            <span className="text-base font-black text-emerald-700 font-mono">
                              {order.total} MAD
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-4">
                    {language === 'fr' ? 'Détails de facturation et de livraison' : 'تفاصيل عنوان الشحن والتوصيل'}
                  </h3>

                  {updateSuccess && (
                    <div className="p-3 text-xs bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center space-x-2 rtl:space-x-reverse">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'fr' ? 'Votre profil de livraison a été mis à jour avec succès !' : 'تم تحديث عنوان الشحن والتوصيل بنجاح!'}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                          {language === 'fr' ? 'Numéro de téléphone' : 'رقم الهاتف'}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="tel"
                            required
                            placeholder="0612345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          {language === 'fr' ? 'Ville' : 'المدينة'}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            placeholder={language === 'fr' ? 'Ex: Casablanca' : 'مثال: الدار البيضاء'}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          {language === 'fr' ? 'Adresse complète' : 'العنوان الكامل'}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            placeholder={language === 'fr' ? 'Ex: 24, Bd d\'Anfa' : 'مثال: حي الرياض، شارع النخيل'}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full py-2.5 pl-10 pr-4 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2 flex items-center justify-center cursor-pointer"
                    >
                      {updating ? (
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>{language === 'fr' ? 'Enregistrer les modifications' : 'حفظ التعديلات'}</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-4">
                    {language === 'fr' ? 'Sécurité et Confidentialité' : 'الأمان والخصوصية'}
                  </h3>

                  <div className="border border-emerald-150 rounded-2xl p-5 flex items-start space-x-4 rtl:space-x-reverse bg-emerald-50/50">
                    <ShieldAlert className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">
                        {language === 'fr' ? 'Compte Utilisateur Sécurisé' : 'حساب مستخدم محمي'}
                      </h4>
                      <p className="text-xs text-emerald-800 leading-relaxed mt-1">
                        {language === 'fr' 
                          ? 'Vous êtes connecté avec une identité vérifiée via Firebase. Vos historiques d\'achat et vos données de livraison sont stockés de manière hautement sécurisée.' 
                          : 'أنت مسجل حاليًا كعضو في هواري معتمد من خوادم Firebase الآمنة. طلباتك وعنوانك مسجلة بأمان كامل.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
}
