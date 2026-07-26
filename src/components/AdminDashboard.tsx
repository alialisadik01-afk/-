import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { 
  ShoppingBag, Users, Plus, Edit, Trash2, Check, X, 
  Filter, TrendingUp, DollarSign, Package, MapPin, 
  Phone, Mail, Calendar, Eye, ArrowLeft, RefreshCw, AlertTriangle,
  Download, Upload, Database, RotateCcw, FileText, CheckCircle,
  Printer, MessageCircle, Copy, FileSpreadsheet, PhoneCall, Save
} from 'lucide-react';
import { Product, Language } from '../types';
import { 
  getAllUsers, getAllOrders, updateOrderStatus, deleteOrder,
  getFirestoreProducts, saveFirestoreProduct, deleteFirestoreProduct 
} from '../lib/firebase';

interface AdminDashboardProps {
  language: Language;
  onBackToStore: () => void;
  currentUser: any; // Firebase User
  fallbackProducts: Product[];
  onRefreshProducts: () => void; // Trigger products reload in App
}

export default function AdminDashboard({ 
  language, 
  onBackToStore, 
  currentUser, 
  fallbackProducts,
  onRefreshProducts
}: AdminDashboardProps) {
  const isAr = language === 'ar';
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'clients' | 'backup'>('orders');

  // Core Data
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters / Search
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected details & Modals
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [printableOrder, setPrintableOrder] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // WhatsApp Message Custom Templates
  const DEFAULT_WA_AR = `السلام عليكم {name} 👋
نشكرك على الطلب ديالك معنا من Howari Market
ها التفاصيل ديال الطلب ديالك:
📦 {items} : المنتج
🏠 {address} : العنوان
🏙️ {city} : المدينة
💰 {total} درهم : الثمن الإجمالي`;

  const DEFAULT_WA_FR = `Bonjour {name} 👋
Merci pour votre commande chez Howari Market 🛒
Voici les détails de votre commande:
📦 Produit: {items}
🏠 Adresse: {address}
🏙️ Ville: {city}
💰 Total: {total} DH`;

  const [waTemplateAr, setWaTemplateAr] = useState<string>(() => {
    return localStorage.getItem('whatsapp_template_ar') || DEFAULT_WA_AR;
  });
  const [waTemplateFr, setWaTemplateFr] = useState<string>(() => {
    return localStorage.getItem('whatsapp_template_fr') || DEFAULT_WA_FR;
  });
  const [waSavedStatus, setWaSavedStatus] = useState<boolean>(false);

  // PDF Download Handler
  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-slip-area');
    if (!element || !printableOrder) return;

    setIsGeneratingPdf(true);
    const orderNum = printableOrder.trackingNumber || printableOrder.id || 'order';
    const fileName = `Bon-de-livraison-${orderNum}.pdf`;

    const opt = {
      margin: [6, 6, 6, 6],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 850,
        letterRendering: false,
        onclone: (clonedDoc: Document) => {
          const clonedEl = clonedDoc.getElementById('printable-slip-area');
          if (clonedEl) {
            clonedEl.style.width = '760px';
            clonedEl.style.maxWidth = '760px';
            clonedEl.style.minWidth = '760px';
            clonedEl.style.margin = '0 auto';
            clonedEl.style.padding = '24px';
            clonedEl.style.boxSizing = 'border-box';
            clonedEl.style.direction = 'ltr';

            // Reset letter spacing on ALL child elements inside printable slip
            // This is CRITICAL for html2canvas to render Arabic ligatures correctly without flipping
            const allNodes = clonedEl.querySelectorAll('*');
            allNodes.forEach((node) => {
              const el = node as HTMLElement;
              el.style.letterSpacing = '0px';
              el.style.fontFeatureSettings = '"liga" 1, "calt" 1';
            });
          }

          // Replace unsupported oklch color functions in cloned stylesheet text
          const styleEls = clonedDoc.querySelectorAll('style');
          styleEls.forEach((styleEl) => {
            if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
              styleEl.textContent = styleEl.textContent.replace(/oklch\([^)]+\)/gi, '#000000');
            }
          });

          // Also sanitize any inline style attributes
          const styledEls = clonedDoc.querySelectorAll('[style]');
          styledEls.forEach((el) => {
            const styleAttr = el.getAttribute('style');
            if (styleAttr && styleAttr.includes('oklch')) {
              el.setAttribute('style', styleAttr.replace(/oklch\([^)]+\)/gi, '#000000'));
            }
          });
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const pdfExporter = html2pdf as any;
      if (typeof pdfExporter === 'function') {
        await pdfExporter().set(opt).from(element).save();
      } else {
        const html2pdfModule: any = await import('html2pdf.js');
        const pdfFn = html2pdfModule.default || html2pdfModule;
        await pdfFn().set(opt).from(element).save();
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  // Product Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  
  // Product Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Quick stats
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    clientsCount: 0,
    productsCount: 0
  });

  // Load all admin dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getAllOrders() || [];
      const fetchedUsers = await getAllUsers() || [];
      const fetchedProducts = await getFirestoreProducts(fallbackProducts) || [];

      setOrders(fetchedOrders);
      setClients(fetchedUsers);
      setProducts(fetchedProducts);

      // Calculate stats
      const totalSales = fetchedOrders
        .filter((o: any) => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

      setStats({
        totalSales,
        ordersCount: fetchedOrders.length,
        clientsCount: fetchedUsers.length,
        productsCount: fetchedProducts.length
      });
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    onRefreshProducts();
    setRefreshing(false);
  };

  // Change order status
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setActionLoading(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      // Recalculate stats
      setOrders(currentOrders => {
        const updated = currentOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
        const totalSales = updated
          .filter((o: any) => o.status === 'completed' || o.status === 'delivered')
          .reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
        setStats(prev => ({ ...prev, totalSales }));
        return updated;
      });

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error changing order status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete Order
  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setActionLoading(orderToDelete.id);
    try {
      await deleteOrder(orderToDelete.id);
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      if (selectedOrder?.id === orderToDelete.id) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    } finally {
      setActionLoading(null);
      setOrderToDelete(null);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format WhatsApp link for Moroccan numbers with custom message template
  const getWhatsAppLink = (order: any) => {
    if (!order?.phone) return '#';
    let cleanPhone = order.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '212' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('212') && cleanPhone.length === 9) {
      cleanPhone = '212' + cleanPhone;
    }

    const template = language === 'fr' ? waTemplateFr : waTemplateAr;
    const orderIdShort = order.id?.substring(0, 8) || '';

    const itemsSummary = order.items?.map((it: any) => {
      const name = language === 'fr' ? (it.nameFr || it.name) : (it.name || it.nameFr);
      return `${name}${it.selectedColor ? ` (${it.selectedColor})` : ''} x${it.quantity}`;
    }).join(' + ') || '';

    const message = template
      .replace(/\{name\}/g, order.fullName || '')
      .replace(/\{fullName\}/g, order.fullName || '')
      .replace(/\{id\}/g, orderIdShort)
      .replace(/\{order_id\}/g, orderIdShort)
      .replace(/\{total\}/g, String(order.total || ''))
      .replace(/\{city\}/g, order.city || '')
      .replace(/\{address\}/g, order.address || '')
      .replace(/\{items\}/g, itemsSummary);

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Export filtered orders to CSV
  const handleExportOrdersCSV = () => {
    try {
      const headers = ['Order ID', 'Date', 'Full Name', 'Phone', 'City', 'Address', 'Items', 'Total Price (DH)', 'Status', 'Payment Method'];
      const rows = filteredOrders.map(o => {
        const orderDate = o.createdAt?.toDate 
          ? o.createdAt.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
          : 'N/A';
        const itemsSummary = o.items?.map((it: any) => `${it.nameFr || it.name} (x${it.quantity})`).join(' + ') || '';
        
        return [
          `#${o.id?.substring(0, 8)}`,
          orderDate,
          `"${o.fullName?.replace(/"/g, '""') || ''}"`,
          `"${o.phone || ''}"`,
          `"${o.city?.replace(/"/g, '""') || ''}"`,
          `"${o.address?.replace(/"/g, '""') || ''}"`,
          `"${itemsSummary.replace(/"/g, '""')}"`,
          o.total || 0,
          o.status || 'pending',
          o.paymentMethod || 'cod'
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `howari_orders_${orderFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting orders CSV:', err);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.id) return;

    setActionLoading('save-product');
    try {
      // Synchronize primary image in images array
      let finalImages = [...(productForm.images || [])];
      if (finalImages.length > 0) {
        finalImages[0] = productForm.image || '';
      } else {
        finalImages = [productForm.image || ''];
      }

      // Calculate final properties or apply defaults
      const finalProduct: Product = {
        id: productForm.id,
        name: productForm.name || { fr: '', ar: '' },
        tagline: productForm.tagline || { fr: '', ar: '' },
        description: productForm.description || { fr: '', ar: '' },
        price: Number(productForm.price) || 0,
        originalPrice: Number(productForm.originalPrice) || 0,
        discount: Number(productForm.discount) || 0,
        rating: Number(productForm.rating) || 4.8,
        reviewsCount: Number(productForm.reviewsCount) || 12,
        image: productForm.image || '',
        images: finalImages,
        colors: productForm.colors || [],
        specs: productForm.specs || { fr: [], ar: [] },
        benefits: productForm.benefits || { fr: [], ar: [] },
        themeColor: productForm.themeColor || 'from-[#f0fdf4] to-[#ccfbf1] text-emerald-950',
        accentColor: productForm.accentColor || 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
        textColor: productForm.textColor || 'text-emerald-800'
      };

      await saveFirestoreProduct(finalProduct);
      
      // Update local state
      setProducts(prev => {
        const index = prev.findIndex(p => p.id === finalProduct.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = finalProduct;
          return updated;
        } else {
          return [finalProduct, ...prev];
        }
      });

      onRefreshProducts();
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({});
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete product (opens custom confirmation modal)
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  // Actual execution of delete product from database
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setActionLoading(productToDelete.id);
    try {
      await deleteFirestoreProduct(productToDelete.id);
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      onRefreshProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    } finally {
      setActionLoading(null);
      setProductToDelete(null);
    }
  };

  // Export current catalog as JSON file
  const handleExportBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `howari_products_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Error exporting backup:', err);
      alert(language === 'fr' ? 'Erreur lors de l\'exportation de la sauvegarde' : 'حدث خطأ أثناء تصدير نسخة احتياطية');
    }
  };

  // Import product catalog from JSON file
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmMessage = language === 'fr'
      ? "Êtes-vous sûr de vouloir importer ce catalogue de produits ? Cela fusionnera ou mettra à jour les produits existants."
      : "هل أنت متأكد من استيراد كتالوج المنتجات هذا؟ سيؤدي ذلك إلى تحديث أو دمج المنتجات الحالية.";
    if (!window.confirm(confirmMessage)) return;

    setActionLoading('import-db');
    try {
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const parsedProducts = JSON.parse(content);
          
          if (!Array.isArray(parsedProducts)) {
            throw new Error('Format invalide. Le fichier doit contenir un tableau de produits.');
          }

          // Validate basic shape
          for (const p of parsedProducts) {
            if (!p.id || !p.name) {
              throw new Error('Format invalide. Chaque produit doit avoir un ID et un Nom.');
            }
          }

          // Save each to Firestore
          for (const p of parsedProducts) {
            await saveFirestoreProduct(p);
          }

          // Refresh products
          const fetchedProducts = await getFirestoreProducts(fallbackProducts) || [];
          setProducts(fetchedProducts);
          onRefreshProducts();

          alert(language === 'fr' ? 'Catalogue importé et sauvegardé avec succès !' : 'تم استيراد الكتالوج وحفظه بنجاح!');
        } catch (err: any) {
          console.error('Error parsing file:', err);
          alert(language === 'fr' ? `Erreur lors de l'importation : ${err.message}` : `خطأ أثناء الاستيراد: ${err.message}`);
        } finally {
          setActionLoading(null);
          // Reset file input
          e.target.value = '';
        }
      };
      fileReader.readAsText(file);
    } catch (err) {
      console.error('Error reading backup file:', err);
      setActionLoading(null);
    }
  };

  // Delete all current products and reset to original database
  const handleResetToFallback = async () => {
    const confirmMessage = language === 'fr' 
      ? "ATTENTION : Cela va supprimer TOUS vos produits actuels dans la base de données et restaurer les produits d'origine de Howari Market. Êtes-vous sûr ?" 
      : "تنبيه هام: سيؤدي هذا إلى حذف جميع المنتجات الحالية في قاعدة البيانات واستعادة منتجات Howari Market الأصلية. هل أنت متأكد؟";
    if (!window.confirm(confirmMessage)) return;

    setActionLoading('reset-db');
    try {
      // Delete current products
      for (const prod of products) {
        await deleteFirestoreProduct(prod.id);
      }

      // Add fallback products
      const restoredList: Product[] = [];
      for (const prod of fallbackProducts) {
        await saveFirestoreProduct(prod);
        restoredList.push(prod);
      }

      setProducts(restoredList);
      onRefreshProducts();

      alert(language === 'fr' ? 'Base de données restaurée avec succès !' : 'تم استعادة قاعدة البيانات بنجاح!');
    } catch (err) {
      console.error('Failed to reset DB:', err);
      alert(language === 'fr' ? 'Erreur lors de la réinitialisation' : 'حدث خطأ أثناء إعادة الضبط');
    } finally {
      setActionLoading(null);
    }
  };

  // Open modal for edit/create
  const openProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product });
    } else {
      setEditingProduct(null);
      setProductForm({
        id: 'prod-' + Math.random().toString(36).substring(2, 7),
        name: { fr: '', ar: '' },
        tagline: { fr: '', ar: '' },
        description: { fr: '', ar: '' },
        price: 0,
        originalPrice: 0,
        discount: 0,
        image: '',
        images: [''],
        themeColor: 'from-[#f0fdf4] to-[#ccfbf1] text-emerald-950',
        accentColor: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
        textColor: 'text-emerald-800',
        specs: { fr: [], ar: [] },
        benefits: { fr: [], ar: [] }
      });
    }
    setIsProductModalOpen(true);
  };

  // Helper: check order date filter
  const isOrderInDateRange = (ord: any) => {
    if (dateFilter === 'all') return true;
    if (!ord.createdAt) return true;
    const ordDate = ord.createdAt.toDate ? ord.createdAt.toDate() : new Date(ord.createdAt);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return ordDate.toDateString() === now.toDateString();
    }
    if (dateFilter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return ordDate >= sevenDaysAgo;
    }
    if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return ordDate >= monthAgo;
    }
    return true;
  };

  // Filter orders based on tabs/search/date
  const filteredOrders = orders.filter(o => {
    const matchesFilter = orderFilter === 'all' || (orderFilter === 'pending' ? (o.status === 'pending' || !o.status) : o.status === orderFilter);
    const matchesDate = isOrderInDateRange(o);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      o.fullName?.toLowerCase().includes(searchLower) ||
      o.phone?.includes(searchTerm) ||
      o.city?.toLowerCase().includes(searchLower) ||
      o.id?.toLowerCase().includes(searchLower);
    return matchesFilter && matchesDate && matchesSearch;
  });

  // Badge counts
  const orderCounts = {
    all: orders.filter(isOrderInDateRange).length,
    pending: orders.filter(o => isOrderInDateRange(o) && (o.status === 'pending' || !o.status)).length,
    processing: orders.filter(o => isOrderInDateRange(o) && o.status === 'processing').length,
    shipped: orders.filter(o => isOrderInDateRange(o) && o.status === 'shipped').length,
    completed: orders.filter(o => isOrderInDateRange(o) && (o.status === 'completed' || o.status === 'delivered')).length,
    cancelled: orders.filter(o => isOrderInDateRange(o) && o.status === 'cancelled').length,
  };

  // Financial summary for filtered selection
  const filteredDeliveredSales = filteredOrders
    .filter(o => o.status === 'completed' || o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const filteredPendingSales = filteredOrders
    .filter(o => o.status === 'pending' || !o.status || o.status === 'processing' || o.status === 'shipped')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Filter clients based on search
  const filteredClients = clients.filter(c => {
    return (
      c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter products based on search
  const filteredProducts = products.filter(p => {
    return (
      p.name.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="pt-28 sm:pt-36 pb-20 min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={onBackToStore}
              className="flex items-center space-x-1.5 rtl:space-x-reverse text-emerald-600 hover:text-emerald-700 font-bold mb-2 text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'fr' ? 'Retour au magasin' : 'العودة للمتجر'}</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
              {language === 'fr' ? 'Panneau d\'Administration' : 'لوحة التحكم والإدارة'}
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              {language === 'fr' 
                ? `Connecté en tant que : ${currentUser?.email}`
                : `تم تسجيل الدخول بصفتك: ${currentUser?.email}`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{language === 'fr' ? 'Actualiser' : 'تحديث'}</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium text-sm">
              {language === 'fr' ? 'Chargement des données de gestion...' : 'جاري تحميل بيانات الإدارة...'}
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Sales */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600" style={{ marginLeft: '13px' }}>
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{language === 'fr' ? 'Ventes Livrées' : 'المبيعات المستلمة'}</p>
                  <p className="text-lg sm:text-2xl font-black text-emerald-600 font-display mt-0.5">
                    {stats.totalSales} {language === 'fr' ? 'DH' : 'درهم'}
                  </p>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600" style={{ marginLeft: '10px' }}>
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{language === 'fr' ? 'Commandes' : 'الطلبات الكلية'}</p>
                  <p className="text-lg sm:text-2xl font-black text-slate-800 font-display mt-0.5">
                    {stats.ordersCount}
                  </p>
                </div>
              </div>

              {/* Clients */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600" style={{ marginLeft: '10px' }}>
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{language === 'fr' ? 'Clients' : 'العملاء المسجلين'}</p>
                  <p className="text-lg sm:text-2xl font-black text-slate-800 font-display mt-0.5">
                    {stats.clientsCount}
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center space-x-4 rtl:space-x-reverse">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600" style={{ marginLeft: '10px' }}>
                  <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{language === 'fr' ? 'Produits' : 'المنتجات المعروضة'}</p>
                  <p className="text-lg sm:text-2xl font-black text-slate-800 font-display mt-0.5">
                    {stats.productsCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Tabs Selection */}
            <div className="flex border-b border-slate-200 mb-6 bg-white p-1 rounded-xl shadow-sm overflow-x-auto sm:overflow-x-visible">
              <button
                onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
                className={`flex-1 min-w-[100px] py-3 text-center rounded-lg font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'orders' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'fr' ? 'Commandes' : 'إدارة الطلبات'}</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
                className={`flex-1 min-w-[100px] py-3 text-center rounded-lg font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'products' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>{language === 'fr' ? 'Produits' : 'إدارة المنتجات'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('clients'); setSearchTerm(''); }}
                className={`flex-1 min-w-[100px] py-3 text-center rounded-lg font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'clients' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{language === 'fr' ? 'Clients' : 'العملاء'}</span>
              </button>

              <button
                onClick={() => { setActiveTab('backup'); setSearchTerm(''); }}
                className={`flex-1 min-w-[140px] py-3 text-center rounded-lg font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'backup' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>{language === 'fr' ? 'Sauvegarde & Outils' : 'النسخ الاحتياطي والأدوات'}</span>
              </button>
            </div>

            {/* Search & Action Bar */}
            {activeTab !== 'backup' && (
              <div className="space-y-4 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={
                        activeTab === 'orders'
                          ? (language === 'fr' ? 'Rechercher par client, téléphone, ville ou ID...' : 'بحث باسم العميل، الهاتف، المدينة، أو معرف الطلب...')
                          : activeTab === 'products'
                          ? (language === 'fr' ? 'Rechercher un produit par nom ou ID...' : 'بحث باسم المنتج أو المعرف...')
                          : (language === 'fr' ? 'Rechercher un client...' : 'بحث عن عميل...')
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2.5 pl-4 pr-4 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                    />
                  </div>

                  {/* Orders Tab Action Bar */}
                  {activeTab === 'orders' && (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Date Filter Buttons */}
                      <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-medium">
                        <button
                          onClick={() => setDateFilter('all')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            dateFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {language === 'fr' ? 'Tout' : 'الكل'}
                        </button>
                        <button
                          onClick={() => setDateFilter('today')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            dateFilter === 'today' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {language === 'fr' ? 'Aujourd\'hui' : 'اليوم'}
                        </button>
                        <button
                          onClick={() => setDateFilter('7days')}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            dateFilter === '7days' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {language === 'fr' ? '7 derniers jours' : 'آخر 7 أيام'}
                        </button>
                      </div>

                      {/* CSV Export Button */}
                      <button
                        onClick={handleExportOrdersCSV}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        title={language === 'fr' ? 'Exporter en CSV / Excel' : 'تصدير الطلبات إلى ملف Excel/CSV'}
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'fr' ? 'Exporter Excel/CSV' : 'تصدير لـ Excel'}</span>
                      </button>
                    </div>
                  )}

                  {activeTab === 'products' && (
                    <button
                      onClick={() => openProductModal(null)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer self-stretch sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'fr' ? 'Ajouter un Produit' : 'إضافة منتج جديد'}</span>
                    </button>
                  )}
                </div>

                {/* Status Badges with Live Counts */}
                {activeTab === 'orders' && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { key: 'all', labelFr: 'Tout', labelAr: 'جميع الطلبات', count: orderCounts.all, color: 'bg-slate-800 text-white' },
                      { key: 'pending', labelFr: 'En attente', labelAr: 'معلق', count: orderCounts.pending, color: 'bg-amber-100 text-amber-800 border-amber-200' },
                      { key: 'processing', labelFr: 'Préparation', labelAr: 'قيد التحضير', count: orderCounts.processing, color: 'bg-blue-100 text-blue-800 border-blue-200' },
                      { key: 'shipped', labelFr: 'Expédié', labelAr: 'تم الشحن', count: orderCounts.shipped, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                      { key: 'completed', labelFr: 'Livré', labelAr: 'تم التوصيل', count: orderCounts.completed, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                      { key: 'cancelled', labelFr: 'Annulé', labelAr: 'ملغي', count: orderCounts.cancelled, color: 'bg-red-100 text-red-800 border-red-200' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        onClick={() => setOrderFilter(st.key)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          orderFilter === st.key
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>{language === 'fr' ? st.labelFr : st.labelAr}</span>
                        <span className={`px-1.5 py-0.2 text-[10px] font-mono font-extrabold rounded-full ${
                          orderFilter === st.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {st.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Financial Summary Bar for filtered orders */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      {language === 'fr' ? 'Aperçu du filtre :' : 'ملخص القائمة المعروضة:'}
                    </span>
                    <span className="font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                      {filteredOrders.length} {language === 'fr' ? 'commandes' : 'طلبات'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">{language === 'fr' ? 'Livrées :' : 'المبيعات المستلمة:'}</span>
                      <span className="font-extrabold text-emerald-600 font-mono text-sm">
                        {filteredDeliveredSales} DH
                      </span>
                    </div>

                    <div className="w-px h-4 bg-slate-200 hidden sm:block"></div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">{language === 'fr' ? 'En cours / Attente :' : 'المبالغ المعلقة/قيد الشحن:'}</span>
                      <span className="font-extrabold text-amber-600 font-mono text-sm">
                        {filteredPendingSales} DH
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider font-mono">
                          <th className="py-4 px-6">{language === 'fr' ? 'ID / Date' : 'الطلب / التاريخ'}</th>
                          <th className="py-4 px-6">{language === 'fr' ? 'Client / Contacts' : 'العميل / التواصل المباشر'}</th>
                          <th className="py-4 px-6">{language === 'fr' ? 'Ville / Adresse' : 'المدينة / العنوان'}</th>
                          <th className="py-4 px-6">{language === 'fr' ? 'Articles' : 'المنتجات'}</th>
                          <th className="py-4 px-6">{language === 'fr' ? 'Total' : 'المجموع'}</th>
                          <th className="py-4 px-6 text-center">{language === 'fr' ? 'Statut' : 'الحالة'}</th>
                          <th className="py-4 px-6 text-center">{language === 'fr' ? 'Actions' : 'إجراءات السريعة'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                              {language === 'fr' ? 'Aucune commande trouvée' : 'لا توجد أي طلبات مطابقة للبحث'}
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => {
                            const orderDate = ord.createdAt?.toDate 
                              ? ord.createdAt.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                              : 'N/A';
                            return (
                              <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                                {/* Order Info */}
                                <td className="py-4 px-6">
                                  <span className="font-mono font-bold text-slate-950 block">#{ord.id?.substring(0, 8)}</span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    {orderDate}
                                  </span>
                                </td>
                                
                                {/* Client info & Quick Contact actions */}
                                <td className="py-4 px-6">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <span className="font-bold text-slate-900 block">{ord.fullName}</span>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[10px] text-slate-600 font-mono">{ord.phone}</span>
                                        <button
                                          onClick={() => handleCopy(ord.phone, `phone-${ord.id}`)}
                                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                          title={language === 'fr' ? 'Copier numéro' : 'نسخ الرقم'}
                                        >
                                          {copiedId === `phone-${ord.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Direct Contact Buttons */}
                                    <div className="flex items-center gap-1">
                                      {/* WhatsApp button */}
                                      <a
                                        href={getWhatsAppLink(ord)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                                        title={language === 'fr' ? 'Contacter via WhatsApp' : 'تواصل عبر واتساب للتأكيد'}
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                      </a>
                                      {/* Direct Call button */}
                                      <a
                                        href={`tel:${ord.phone}`}
                                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                                        title={language === 'fr' ? 'Appeler directement' : 'اتصال هاتفي مباشر'}
                                      >
                                        <PhoneCall className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>

                                  {ord.isGuest ? (
                                    <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1">
                                      {language === 'fr' ? 'Invité' : 'زائر'}
                                    </span>
                                  ) : (
                                    <span className="inline-block bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1">
                                      {language === 'fr' ? 'Inscrit' : 'عضو مسجل'}
                                    </span>
                                  )}
                                </td>

                                {/* Delivery Info */}
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                    <span className="font-bold text-slate-900">{ord.city}</span>
                                    <button
                                      onClick={() => handleCopy(`${ord.city}, ${ord.address}`, `addr-${ord.id}`)}
                                      className="text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                                      title={language === 'fr' ? 'Copier l\'adresse' : 'نسخ العنوان الكامل'}
                                    >
                                      {copiedId === `addr-${ord.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block mt-0.5 max-w-xs truncate">{ord.address}</span>
                                </td>

                                {/* Items overview */}
                                <td className="py-4 px-6 font-medium">
                                  <span className="text-slate-700">
                                    {ord.items?.map((it: any) => `${it.nameFr || it.name} (x${it.quantity})`).join(', ')}
                                  </span>
                                </td>

                                {/* Total price */}
                                <td className="py-4 px-6 text-slate-950 font-black font-display text-sm">
                                  {ord.total} {language === 'fr' ? 'DH' : 'درهم'}
                                </td>

                                {/* Status Badge */}
                                <td className="py-4 px-6 text-center">
                                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    ord.status === 'completed' || ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                                    ord.status === 'shipped' ? 'bg-indigo-50 text-indigo-700' :
                                    ord.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                                    ord.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                                    'bg-amber-50 text-amber-700' // pending
                                  }`}>
                                    {ord.status === 'completed' || ord.status === 'delivered' ? (language === 'fr' ? 'Livré' : 'تم التوصيل') :
                                     ord.status === 'shipped' ? (language === 'fr' ? 'Expédié' : 'تم الشحن') :
                                     ord.status === 'processing' ? (language === 'fr' ? 'Préparation' : 'قيد التحضير') :
                                     ord.status === 'cancelled' ? (language === 'fr' ? 'Annulé' : 'ملغي') :
                                     (language === 'fr' ? 'En attente' : 'معلق')}
                                  </span>
                                </td>

                                {/* Status & Quick Actions */}
                                <td className="py-4 px-6">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* View details button */}
                                    <button
                                      onClick={() => setSelectedOrder(ord)}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                      title={language === 'fr' ? 'Voir détails' : 'عرض التفاصيل والمنتجات'}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>

                                    {/* Print/Download voucher button */}
                                    <button
                                      onClick={() => setPrintableOrder(ord)}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                      title={language === 'fr' ? 'Bon de livraison (PDF)' : 'وصل التسليم (تحميل PDF)'}
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>

                                    {/* Delete order button */}
                                    <button
                                      onClick={() => setOrderToDelete(ord)}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                                      title={language === 'fr' ? 'Supprimer la commande' : 'حذف الطلب'}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Status select */}
                                    <select
                                      value={ord.status || 'pending'}
                                      disabled={actionLoading === ord.id}
                                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                      className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg p-1 text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
                                    >
                                      <option value="pending">{language === 'fr' ? 'Attente' : 'معلق'}</option>
                                      <option value="processing">{language === 'fr' ? 'Préparation' : 'تحضير'}</option>
                                      <option value="shipped">{language === 'fr' ? 'Expédié' : 'مشحون'}</option>
                                      <option value="completed">{language === 'fr' ? 'Livré' : 'مستلم'}</option>
                                      <option value="cancelled">{language === 'fr' ? 'Annulé' : 'ملغي'}</option>
                                    </select>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full py-16 text-center bg-white border border-slate-100 rounded-3xl text-slate-400 font-medium">
                    {language === 'fr' ? 'Aucun produit trouvé' : 'لم يتم العثور على أي منتج'}
                  </div>
                ) : (
                  filteredProducts.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                    >
                      {/* Product Header */}
                      <div className="p-4 flex gap-4">
                        <img 
                          src={prod.image} 
                          alt={prod.name.fr} 
                          className="w-20 h-20 rounded-xl object-cover border border-slate-100 bg-slate-50"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">ID: {prod.id}</span>
                          <h3 className="font-extrabold text-slate-900 text-sm truncate mt-0.5">
                            {prod.name.fr}
                          </h3>
                          <p className="text-slate-500 text-[10px] truncate mt-0.5">{prod.name.ar}</p>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-emerald-600 font-black text-sm">
                              {prod.price} {language === 'fr' ? 'DH' : 'درهم'}
                            </span>
                            {prod.originalPrice > prod.price && (
                              <span className="text-slate-400 line-through text-[10px]">
                                {prod.originalPrice} {language === 'fr' ? 'DH' : 'درهم'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info lines */}
                      <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                        <p className="truncate"><strong>FR:</strong> {prod.tagline.fr}</p>
                        <p className="truncate"><strong>AR:</strong> {prod.tagline.ar}</p>
                        <p><strong>Note :</strong> ⭐ {prod.rating} ({prod.reviewsCount} {language === 'fr' ? 'avis' : 'تقييم'})</p>
                      </div>

                      {/* Product actions footer */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                        <button
                          onClick={() => openProductModal(prod)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-200 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>{language === 'fr' ? 'Modifier' : 'تعديل'}</span>
                        </button>
                        <button
                          disabled={actionLoading === prod.id}
                          onClick={() => handleDeleteProduct(prod)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 hover:text-red-700 font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{language === 'fr' ? 'Supprimer' : 'حذف'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: CLIENTS */}
            {activeTab === 'clients' && (
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left rtl:text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider font-mono">
                        <th className="py-4 px-6">{language === 'fr' ? 'Client' : 'العميل'}</th>
                        <th className="py-4 px-6">{language === 'fr' ? 'Adresse E-mail' : 'البريد الإلكتروني'}</th>
                        <th className="py-4 px-6">{language === 'fr' ? 'N° Téléphone' : 'رقم الهاتف'}</th>
                        <th className="py-4 px-6">{language === 'fr' ? 'Ville' : 'المدينة'}</th>
                        <th className="py-4 px-6">{language === 'fr' ? 'Adresse' : 'العنوان'}</th>
                        <th className="py-4 px-6">{language === 'fr' ? 'Créé Le' : 'تاريخ التسجيل'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredClients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                            {language === 'fr' ? 'Aucun client enregistré' : 'لا يوجد أي عملاء مطابقين للبحث'}
                          </td>
                        </tr>
                      ) : (
                        filteredClients.map((cl) => {
                          const registryDate = cl.createdAt?.toDate 
                             ? cl.createdAt.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) 
                             : 'N/A';
                          return (
                            <tr key={cl.uid} className="hover:bg-slate-50/50 transition-colors">
                              {/* Avatar & Display name */}
                              <td className="py-4 px-6 flex items-center space-x-3 rtl:space-x-reverse">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                                  {cl.photoURL ? (
                                    <img src={cl.photoURL} alt="" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    cl.displayName?.substring(0, 2).toUpperCase() || 'US'
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block">{cl.displayName || 'Utilisateur anonyme'}</span>
                                  <span className="text-[9px] font-mono text-slate-400">UID: {cl.uid?.substring(0, 8)}...</span>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="py-4 px-6 font-mono text-slate-600">
                                {cl.email || 'N/A'}
                              </td>

                              {/* Phone */}
                              <td className="py-4 px-6 font-bold text-slate-900">
                                {cl.phone || '-'}
                              </td>

                              {/* City */}
                              <td className="py-4 px-6 text-slate-700">
                                {cl.city || '-'}
                              </td>

                              {/* Full delivery address */}
                              <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                                {cl.address || '-'}
                              </td>

                              {/* Created At */}
                              <td className="py-4 px-6 text-slate-400 font-medium">
                                {registryDate}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: BACKUP & TOOLS */}
            {activeTab === 'backup' && (
              <div className="space-y-8">
                {/* WhatsApp Message Template Customizer */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {language === 'fr' ? 'Modèle de message WhatsApp automatique' : 'تعديل نص رسالة الواتساب الجاهزة للطلبات'}
                        </h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {language === 'fr' 
                            ? 'Personnalisez le texte pré-rempli envoyé aux clients via WhatsApp. Utilisez les variables {name}, {id}, {total}, {city}.' 
                            : 'قم بتعديل النص الذي يظهر تلقائياً عند النقر على زر الواتساب لأي طلب. يمكنك استخدام الكلمات المفتاحية: {name}, {id}, {total}, {city}'}
                        </p>
                      </div>
                    </div>
                    
                    {waSavedStatus && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        ✓ {language === 'fr' ? 'Enregistré avec succès !' : 'تم حفظ نموذج الرسالة بنجاح!'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {language === 'fr' ? 'Message en Arabe (الرسالة بالعربية)' : 'الرسالة الموجهة باللغة العربية'}
                      </label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={waTemplateAr}
                        onChange={(e) => setWaTemplateAr(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {language === 'fr' ? 'Message en Français' : 'الرسالة الموجهة باللغة الفرنسية'}
                      </label>
                      <textarea
                        rows={3}
                        dir="ltr"
                        value={waTemplateFr}
                        onChange={(e) => setWaTemplateFr(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex flex-wrap gap-2 items-center">
                    <span className="font-bold text-slate-700">{language === 'fr' ? 'Variables disponibles :' : 'الكلمات المستبدلة تلقائياً حسب بيانات كل زبون:'}</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 font-bold">{'{name}'}</code>
                    <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 font-bold">{'{items}'}</code>
                    <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 font-bold">{'{address}'}</code>
                    <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 font-bold">{'{city}'}</code>
                    <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 font-bold">{'{total}'}</code>
                    <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 font-bold">{'{id}'}</code>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setWaTemplateAr(DEFAULT_WA_AR);
                        setWaTemplateFr(DEFAULT_WA_FR);
                        localStorage.removeItem('whatsapp_template_ar');
                        localStorage.removeItem('whatsapp_template_fr');
                        setWaSavedStatus(true);
                        setTimeout(() => setWaSavedStatus(false), 3000);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      {language === 'fr' ? 'Réinitialiser' : 'إعادة النص الافتراضي'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('whatsapp_template_ar', waTemplateAr);
                        localStorage.setItem('whatsapp_template_fr', waTemplateFr);
                        setWaSavedStatus(true);
                        setTimeout(() => setWaSavedStatus(false), 3000);
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Enregistrer le modèle' : 'حفظ نموذج الرسالة'}</span>
                    </button>
                  </div>
                </div>

                {/* Intro banner */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fadeIn">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display flex items-center gap-2">
                      <Database className="w-5 h-5 text-emerald-600" />
                      <span>{language === 'fr' ? 'Sauvegarde & Outils de Base de Données' : 'النسخ الاحتياطي وأدوات قاعدة البيانات'}</span>
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
                      {language === 'fr' 
                        ? 'Gérez la sécurité de votre catalogue de produits. Effectuez des sauvegardes complètes en local sous format JSON, restaurez des backups ou réinitialisez les données au catalogue d\'origine de démonstration.'
                        : 'إدارة أمان واستقرار كتالوج المنتجات الخاص بك. قم بإنشاء نسخ احتياطية كاملة محلياً بتنسيق JSON، واستعادتها بأي وقت، أو إعادة تعيين المنتجات إلى كتالوج العرض الافتراضي الأصلي.'}
                    </p>
                  </div>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Export Card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Download className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {language === 'fr' ? 'Exporter le catalogue actuel (Sauvegarde)' : 'تصدير الكتالوج الحالي (حفظ نسخة)'}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {language === 'fr' 
                          ? 'Téléchargez instantanément tous les produits enregistrés dans votre base de données dans un fichier JSON sécurisé sur votre ordinateur.'
                          : 'قم تحميل جميع منتجاتك المسجلة بقاعدة البيانات فوراً في ملف JSON آمن ومحفوظ على جهازك لاستخدامه كنسخة احتياطية.'}
                      </p>
                    </div>
                    <button
                      onClick={handleExportBackup}
                      disabled={actionLoading !== null}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === 'fr' ? 'Télécharger la sauvegarde' : 'تحميل ملف النسخة الاحتياطية'}</span>
                    </button>
                  </div>

                  {/* Import Card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {language === 'fr' ? 'Importer une sauvegarde (Restauration)' : 'استيراد نسخة احتياطية (استعادة)'}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {language === 'fr' 
                          ? 'Sélectionnez un fichier JSON de sauvegarde précédemment exporté pour restaurer ou mettre à jour tous vos produits.'
                          : 'اختر ملف نسخة احتياطية بصيغة JSON تم تحميله مسبقاً لاستيراد المنتجات وتحديث قاعدة البيانات بالكامل.'}
                      </p>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportBackup}
                        disabled={actionLoading !== null}
                        id="backup-file-upload"
                        className="hidden"
                      />
                      <label
                        htmlFor="backup-file-upload"
                        className={`w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          actionLoading !== null ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {actionLoading === 'import-db' ? (
                          <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 text-indigo-500" />
                            <span>{language === 'fr' ? 'Sélectionner et importer' : 'تحديد واستيراد الملف'}</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Reset/Seeding Card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                        <RotateCcw className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {language === 'fr' ? 'Réinitialisation d\'origine (Usine)' : 'إعادة ضبط المصنع واستعادة الافتراضي'}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed">
                        {language === 'fr' 
                          ? 'ATTENTION : Cette action supprimera TOUS les produits de votre base de données et rechargera le catalogue d\'origine initial de Howari Market.'
                          : 'تنبيه: سيؤدي هذا الإجراء إلى مسح كافة المنتجات في قاعدة البيانات وإعادة تحميل الكتالوج التجريبي الافتراضي الأصلي لـ Howari Market.'}
                      </p>
                    </div>
                    <button
                      onClick={handleResetToFallback}
                      disabled={actionLoading !== null}
                      className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading === 'reset-db' ? (
                        <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          <span>{language === 'fr' ? 'Réinitialiser le catalogue' : 'إعادة تعيين المنتجات الافتراضية'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Database Status Card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {language === 'fr' ? 'Statut du système & Statistiques' : 'حالة النظام والإحصائيات'}
                      </h4>
                      <div className="space-y-2 pt-2 text-xs font-medium text-slate-600">
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                          <span>{language === 'fr' ? 'Connexion Firestore' : 'الاتصال بقاعدة البيانات'}</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {language === 'fr' ? 'Connecté (Live)' : 'متصل ومستقر'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                          <span>{language === 'fr' ? 'Total Produits' : 'إجمالي عدد المنتجات'}</span>
                          <span className="font-mono font-bold text-slate-900">{stats.productsCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                          <span>{language === 'fr' ? 'Total Commandes' : 'إجمالي الطلبات'}</span>
                          <span className="font-mono font-bold text-slate-900">{stats.ordersCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span>{language === 'fr' ? 'Total Clients' : 'إجمالي العملاء'}</span>
                          <span className="font-mono font-bold text-slate-900">{stats.clientsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </>
        )}

      </div>

      {/* DETAIL MODAL: ORDER */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {language === 'fr' ? 'Détails de la Commande' : 'تفاصيل طلب الشراء'}
                  </h3>
                  <p className="text-slate-400 font-mono text-[10px] mt-0.5">#{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
                {/* Client contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-2 font-mono">
                      {language === 'fr' ? 'Destinataire' : 'المستلم'}
                    </p>
                    <p className="font-extrabold text-slate-900 text-sm mb-1">{selectedOrder.fullName}</p>
                    <p className="text-slate-600 flex items-center gap-1.5 mt-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      {selectedOrder.phone}
                    </p>
                    <p className="text-slate-600 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      {selectedOrder.city}, {selectedOrder.address}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-2 font-mono">
                        {language === 'fr' ? 'Méthode de Paiement' : 'طريقة الدفع'}
                      </p>
                      <p className="font-bold text-slate-900 text-xs">
                        {selectedOrder.paymentMethod === 'cod' 
                          ? (language === 'fr' ? 'Paiement à la livraison (COD)' : 'الدفع عند الاستلام') 
                          : selectedOrder.paymentMethod}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1 font-mono">
                        {language === 'fr' ? 'Statut actuel' : 'الحالة الحالية'}
                      </p>
                      <select
                        value={selectedOrder.status || 'pending'}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        className="text-xs font-bold bg-white border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none focus:border-emerald-500 w-full"
                      >
                        <option value="pending">{language === 'fr' ? 'En attente' : 'معلق'}</option>
                        <option value="processing">{language === 'fr' ? 'En préparation' : 'قيد التحضير'}</option>
                        <option value="shipped">{language === 'fr' ? 'Expédié' : 'تم الشحن'}</option>
                        <option value="completed">{language === 'fr' ? 'Livré' : 'تم التوصيل'}</option>
                        <option value="cancelled">{language === 'fr' ? 'Annulé' : 'ملغي'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Items Ordered */}
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs mb-3">
                    {language === 'fr' ? 'Articles Commandés' : 'المنتجات المطلوبة'}
                  </h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {selectedOrder.items?.map((item: any, idx: number) => {
                      const matchedProduct = products.find(p => p.id === item.id);
                      const imageUrl = item.image || matchedProduct?.image || '';
                      
                      const isBundle = item.id === 'pack-soin-complet' || item.isBundle;
                      
                      // Fallback matching of bundle items for backwards compatibility (for existing orders in firestore)
                      const bundleItems = isBundle ? (item.bundleItems || [
                        {
                          id: 'water-flosser',
                          nameFr: `Irrigateur Dentaire Portable (${item.selectedColor || 'Blanc'})`,
                          nameAr: `جهاز خيط الأسنان المائي المحمول (${item.selectedColor === 'Blanc' || !item.selectedColor ? 'أبيض' : item.selectedColor === 'Rose' ? 'وردي' : item.selectedColor === 'Noir' ? 'أسود' : item.selectedColor === 'Vert' ? 'أخضر' : item.selectedColor})`,
                          image: item.selectedColor === 'Rose' ? 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg' :
                                 item.selectedColor === 'Vert' ? 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg' :
                                 item.selectedColor === 'Noir' ? 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg' :
                                 'https://i.pinimg.com/736x/5e/ec/0e/5eec0e7e366717899ec76b26a0519bad.jpg', // White
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
                      ]) : null;

                      return (
                        <div key={idx} className="flex flex-col hover:bg-slate-50/20 transition-colors">
                          <div className="p-3.5 flex items-center justify-between gap-4">
                            <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
                              {imageUrl && (
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center p-1 relative overflow-hidden">
                                  <img
                                    src={imageUrl}
                                    alt=""
                                    className="w-10 h-10 object-contain rounded relative z-10"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {language === 'fr' ? (item.nameFr || item.name) : (item.nameAr || item.name)}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  {item.selectedColor ? `${language === 'fr' ? 'Couleur' : 'اللون'} : ${item.selectedColor}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <p className="font-extrabold text-slate-900">{item.price} DH x {item.quantity}</p>
                              <p className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5">{item.price * item.quantity} DH</p>
                            </div>
                          </div>

                          {/* Nested display for the bundle products */}
                          {isBundle && bundleItems && (
                            <div className="px-5 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100/60 space-y-2">
                              <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider font-mono">
                                {language === 'fr' ? 'Composants du Pack :' : 'مكونات هذه الحزمة :'}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {bundleItems.map((sub: any, sIdx: number) => (
                                  <div key={sIdx} className="bg-white p-2.5 border border-slate-100 rounded-xl flex items-center gap-2.5 shadow-sm">
                                    <img 
                                      src={sub.image} 
                                      alt="" 
                                      className="w-9 h-9 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="min-w-0 leading-tight">
                                      <p className="font-bold text-[10px] text-slate-800 truncate">
                                        {language === 'fr' ? sub.nameFr : sub.nameAr}
                                      </p>
                                      <p className="text-[9px] text-slate-400 mt-0.5">
                                        {sub.selectedColor ? `${language === 'fr' ? 'Couleur' : 'اللون'} : ${sub.selectedColor}` : (language === 'fr' ? 'Standard' : 'افتراضي')}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Notes */}
                {selectedOrder.notes && (
                  <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
                    <p className="font-bold text-amber-800 text-[10px] tracking-wide uppercase font-mono mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {language === 'fr' ? 'Note de livraison / Instructions' : 'ملاحظات وتوجيهات المشتري'}
                    </p>
                    <p className="text-amber-900 leading-relaxed font-medium">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Total pricing box */}
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{language === 'fr' ? 'Montant Total :' : 'المبلغ الكلي المستحق :'}</span>
                  <span className="text-xl font-black text-emerald-600 font-display">
                    {selectedOrder.total} DH
                  </span>
                </div>
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {language === 'fr' ? 'Fermer' : 'إغلاق'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PRODUCT EDIT/ADD */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              {/* Modal Header */}
              <form onSubmit={handleSaveProduct} className="flex flex-col h-full overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {editingProduct 
                      ? (language === 'fr' ? 'Modifier le Produit' : 'تعديل بيانات المنتج') 
                      : (language === 'fr' ? 'Nouveau Produit' : 'إضافة منتج جديد')}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
                  {/* Product Type Banner / Pack toggle */}
                  <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        {language === 'fr' ? 'Type de Produit / Offre' : 'نوع المنتج / العرض'}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {language === 'fr' 
                          ? 'Cochez la case pour faire de ce produit un Pack Multi-Produits (Gestion des Packs).' 
                          : 'حدد الخيار لجعل هذا المنتج باقة مجمعة متكاملة (Gestion des Packs).'}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 border border-slate-200 rounded-xl shadow-xs hover:border-emerald-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!productForm.isBundle}
                        onChange={(e) => setProductForm(prev => ({ ...prev, isBundle: e.target.checked }))}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-xs text-slate-800">
                        {language === 'fr' ? 'Est un Pack (3-en-1)' : 'باقة متكاملة (3 منتجات)'}
                      </span>
                    </label>
                  </div>

                  {/* Basic fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {language === 'fr' ? 'Identifiant Unique (ID)' : 'المعرف الفريد (ID)'}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!!editingProduct}
                        value={productForm.id || ''}
                        onChange={(e) => setProductForm(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="e.g. water-flosser"
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {language === 'fr' ? 'Prix de Vente (DH)' : 'سعر البيع (درهم)'}
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.price || ''}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          const orig = productForm.originalPrice || 0;
                          const discount = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
                          setProductForm(prev => ({ ...prev, price, discount }));
                        }}
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {language === 'fr' ? 'Prix Origine (DH)' : 'السعر الأصلي (درهم)'}
                      </label>
                      <input
                        type="number"
                        required
                        value={productForm.originalPrice || ''}
                        onChange={(e) => {
                          const orig = Number(e.target.value);
                          const price = productForm.price || 0;
                          const discount = orig > price ? Math.round(((orig - price) / orig) * 100) : 0;
                          setProductForm(prev => ({ ...prev, originalPrice: orig, discount }));
                        }}
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {language === 'fr' ? 'Réduction (%)' : 'نسبة التخفيض (%)'}
                      </label>
                      <input
                        type="number"
                        value={productForm.discount || ''}
                        onChange={(e) => {
                          const disc = Number(e.target.value);
                          const orig = productForm.originalPrice || 0;
                          const newPrice = orig > 0 ? Math.round(orig * (1 - disc / 100)) : (productForm.price || 0);
                          setProductForm(prev => ({ ...prev, discount: disc, price: newPrice }));
                        }}
                        placeholder="25"
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-black text-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Nom (Français)
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.name?.fr || ''}
                        onChange={(e) => setProductForm(prev => ({ 
                          ...prev, 
                          name: { ...prev.name, fr: e.target.value, ar: prev.name?.ar || '' } 
                        }))}
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        الاسم (بالعربية)
                      </label>
                      <input
                        type="text"
                        required
                        dir="rtl"
                        value={productForm.name?.ar || ''}
                        onChange={(e) => setProductForm(prev => ({ 
                          ...prev, 
                          name: { ...prev.name, ar: e.target.value, fr: prev.name?.fr || '' } 
                        }))}
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Tagline fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Slogan / Accroche (Français)
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.tagline?.fr || ''}
                        onChange={(e) => setProductForm(prev => ({ 
                          ...prev, 
                          tagline: { ...prev.tagline, fr: e.target.value, ar: prev.tagline?.ar || '' } 
                        }))}
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        شعار قصير للمنتج (بالعربية)
                      </label>
                      <input
                        type="text"
                        required
                        dir="rtl"
                        value={productForm.tagline?.ar || ''}
                        onChange={(e) => setProductForm(prev => ({ 
                          ...prev, 
                          tagline: { ...prev.tagline, ar: e.target.value, fr: prev.tagline?.fr || '' } 
                        }))}
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Description fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Description Complète (Français)
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={productForm.description?.fr || ''}
                        onChange={(e) => setProductForm(prev => ({ 
                          ...prev, 
                          description: { ...prev.description, fr: e.target.value, ar: prev.description?.ar || '' } 
                        }))}
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        شرح ووصف المنتج الكامل (بالعربية)
                      </label>
                      <textarea
                        required
                        rows={4}
                        dir="rtl"
                        value={productForm.description?.ar || ''}
                        onChange={(e) => setProductForm(prev => ({ 
                          ...prev, 
                          description: { ...prev.description, ar: e.target.value, fr: prev.description?.fr || '' } 
                        }))}
                        className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Main Image field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      {language === 'fr' ? 'URL de l\'image principale' : 'رابط الصورة الأساسية للمنتج'}
                    </label>
                    <input
                      type="url"
                      required
                      value={productForm.image || ''}
                      onChange={(e) => {
                        const newImg = e.target.value;
                        setProductForm(prev => {
                          const imgs = [...(prev.images || [])];
                          if (imgs.length === 0) imgs.push(newImg);
                          else imgs[0] = newImg;
                          return { ...prev, image: newImg, images: imgs };
                        });
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full py-2.5 px-3.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  {/* Additional Pack / Gallery Images */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                        {language === 'fr' ? 'Galerie de photos (Composants du Pack)' : 'معرض صور مكونات الباقة'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setProductForm(prev => ({
                          ...prev,
                          images: [...(prev.images || [prev.image || '']), '']
                        }))}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                      >
                        + {language === 'fr' ? 'Ajouter une photo' : 'إضافة صورة إضافية'}
                      </button>
                    </div>

                    {(productForm.images && productForm.images.length > 0 ? productForm.images : [productForm.image || '']).map((imgUrl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 w-6">#{idx + 1}</span>
                        <input
                          type="url"
                          value={imgUrl}
                          onChange={(e) => {
                            const updated = [...(productForm.images || [productForm.image || ''])];
                            updated[idx] = e.target.value;
                            setProductForm(prev => ({ 
                              ...prev, 
                              images: updated,
                              image: idx === 0 ? e.target.value : prev.image 
                            }));
                          }}
                          placeholder="https://..."
                          className="flex-1 py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                        {imgUrl ? (
                          <img src={imgUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-200 bg-white flex-shrink-0" referrerPolicy="no-referrer" />
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {/* Colors & Image links per Color */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider font-mono">
                          {language === 'fr' ? 'Couleurs & Images associées' : 'ألوان المنتج والصور المرتبطة بها'}
                        </label>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {language === 'fr' 
                            ? 'Définissez chaque couleur et associez-lui une URL d\'image spécifique.' 
                            : 'قم بإضافة خيارات الألوان وإرفاق رابط صورة خاص بكل لون لتظهر تلقائيًا عند اختيار الزبون للون.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductForm(prev => ({
                          ...prev,
                          colors: [
                            ...(prev.colors || []),
                            { name: { fr: '', ar: '' }, hex: '#10b981', image: '' }
                          ]
                        }))}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                      >
                        + {language === 'fr' ? 'Ajouter une couleur' : 'إضافة لون جديد'}
                      </button>
                    </div>

                    {(!productForm.colors || productForm.colors.length === 0) ? (
                      <p className="text-[11px] text-slate-400 italic py-1">
                        {language === 'fr' ? 'Aucune variante de couleur (Produit unique)' : 'لا توجد ألوان محددة لهذا المنتج'}
                      </p>
                    ) : (
                      <div className="space-y-3 pt-1">
                        {productForm.colors.map((colorItem, cIdx) => (
                          <div key={cIdx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={colorItem.hex || '#000000'}
                                  onChange={(e) => {
                                    const updatedColors = [...(productForm.colors || [])];
                                    updatedColors[cIdx] = { ...updatedColors[cIdx], hex: e.target.value };
                                    setProductForm(prev => ({ ...prev, colors: updatedColors }));
                                  }}
                                  className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer p-0 bg-transparent"
                                />
                                <span className="text-[10px] font-mono font-bold text-slate-500">#{cIdx + 1}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const updatedColors = (productForm.colors || []).filter((_, idx) => idx !== cIdx);
                                  setProductForm(prev => ({ ...prev, colors: updatedColors }));
                                }}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 cursor-pointer transition-colors"
                                title={language === 'fr' ? 'Supprimer cette couleur' : 'حذف هذا اللون'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 mb-0.5">
                                  Nom (FR)
                                </label>
                                <input
                                  type="text"
                                  value={colorItem.name?.fr || ''}
                                  onChange={(e) => {
                                    const updatedColors = [...(productForm.colors || [])];
                                    updatedColors[cIdx] = {
                                      ...updatedColors[cIdx],
                                      name: { ...updatedColors[cIdx].name, fr: e.target.value, ar: updatedColors[cIdx].name?.ar || '' }
                                    };
                                    setProductForm(prev => ({ ...prev, colors: updatedColors }));
                                  }}
                                  placeholder="e.g. Rose poudré"
                                  className="w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-bold text-slate-400 mb-0.5">
                                  الاسم (AR)
                                </label>
                                <input
                                  type="text"
                                  dir="rtl"
                                  value={colorItem.name?.ar || ''}
                                  onChange={(e) => {
                                    const updatedColors = [...(productForm.colors || [])];
                                    updatedColors[cIdx] = {
                                      ...updatedColors[cIdx],
                                      name: { ...updatedColors[cIdx].name, ar: e.target.value, fr: updatedColors[cIdx].name?.fr || '' }
                                    };
                                    setProductForm(prev => ({ ...prev, colors: updatedColors }));
                                  }}
                                  placeholder="مثال: وردي لطيف"
                                  className="w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            </div>

                            {/* Image URL for this specific color */}
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 mb-0.5">
                                {language === 'fr' ? 'URL de l\'image de cette couleur' : 'رابط صورة هذا اللون'}
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="url"
                                  value={colorItem.image || ''}
                                  onChange={(e) => {
                                    const updatedColors = [...(productForm.colors || [])];
                                    updatedColors[cIdx] = { ...updatedColors[cIdx], image: e.target.value };
                                    setProductForm(prev => ({ ...prev, colors: updatedColors }));
                                  }}
                                  placeholder="https://..."
                                  className="flex-1 py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-mono"
                                />
                                {colorItem.image ? (
                                  <img
                                    src={colorItem.image}
                                    alt=""
                                    className="w-7 h-7 rounded-md object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Style/Design presets */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <p className="font-bold text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                      {language === 'fr' ? 'Paramètres d\'apparence Thème' : 'خيارات المظهر والسمات البصرية'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">
                          Gradient (from-to classes)
                        </label>
                        <input
                          type="text"
                          value={productForm.themeColor || ''}
                          onChange={(e) => setProductForm(prev => ({ ...prev, themeColor: e.target.value }))}
                          placeholder="from-[#f0fdf4] to-[#ccfbf1] text-emerald-950"
                          className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">
                          Accent BG Class (button)
                        </label>
                        <input
                          type="text"
                          value={productForm.accentColor || ''}
                          onChange={(e) => setProductForm(prev => ({ ...prev, accentColor: e.target.value }))}
                          placeholder="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white"
                          className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-1">
                          Text Color Class
                        </label>
                        <input
                          type="text"
                          value={productForm.textColor || ''}
                          onChange={(e) => setProductForm(prev => ({ ...prev, textColor: e.target.value }))}
                          placeholder="text-emerald-800"
                          className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {language === 'fr' ? 'Annuler' : 'إلغاء'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === 'save-product'}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center min-w-[100px]"
                  >
                    {actionLoading === 'save-product' ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>{language === 'fr' ? 'Enregistrer' : 'حفظ المنتج'}</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DELETE CONFIRMATION */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden p-6 text-center space-y-6 animate-fadeIn"
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg font-black text-slate-900 font-display">
                  {language === 'fr' ? 'Confirmer la suppression' : 'تأكيد عملية الحذف'}
                </h3>
                
                <p className="text-slate-500 text-xs mt-2 max-w-sm leading-relaxed">
                  {language === 'fr' 
                    ? `Êtes-vous sûr de vouloir supprimer définitivement le produit suivant ? Cette action est irréversible.`
                    : `هل أنت متأكد تمامًا من رغبتك في حذف المنتج التالي نهائياً؟ هذه العملية لا يمكن التراجع عنها.`}
                </p>
              </div>

              {/* Product Info Preview */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 text-right rtl:text-right">
                <img 
                  src={productToDelete.image} 
                  alt={productToDelete.name.fr} 
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-bold text-slate-400 block text-left">ID: {productToDelete.id}</span>
                  <h4 className="font-extrabold text-slate-900 text-xs truncate mt-0.5 text-left">
                    {language === 'fr' ? productToDelete.name.fr : productToDelete.name.ar}
                  </h4>
                  <p className="text-emerald-600 font-black text-xs mt-1 text-left">
                    {productToDelete.price} {language === 'fr' ? 'DH' : 'درهم'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'fr' ? 'Annuler' : 'إلغاء'}
                </button>
                <button
                  type="button"
                  disabled={actionLoading === productToDelete.id}
                  onClick={confirmDeleteProduct}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === productToDelete.id ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{language === 'fr' ? 'Supprimer' : 'تأكيد الحذف'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DELETE ORDER CONFIRMATION */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden p-6 text-center space-y-6"
            >
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 border border-red-100">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                
                <h3 className="text-lg font-black text-slate-900 font-display">
                  {language === 'fr' ? 'Supprimer la commande' : 'تأكيد حذف الطلب'}
                </h3>
                
                <p className="text-slate-500 text-xs mt-2 max-w-sm leading-relaxed">
                  {language === 'fr' 
                    ? `Voulez-vous vraiment supprimer la commande #${orderToDelete.id?.substring(0,8)} de ${orderToDelete.fullName} ?`
                    : `هل أنت متأكد من حذف الطلب رقم #${orderToDelete.id?.substring(0,8)} التابع للعميل ${orderToDelete.fullName}؟`}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  {language === 'fr' ? 'Annuler' : 'إلغاء'}
                </button>
                <button
                  type="button"
                  disabled={actionLoading === orderToDelete.id}
                  onClick={handleConfirmDeleteOrder}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading === orderToDelete.id ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{language === 'fr' ? 'Supprimer' : 'تأكيد الحذف'}</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PRINTABLE DELIVERY SLIP (وصل التسليم) */}
      <AnimatePresence>
        {printableOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header bar */}
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span className="font-extrabold text-sm">
                    {language === 'fr' ? 'Bon de Livraison / وصل التسليم' : 'وصل التسليم الشحن المباشر'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {isGeneratingPdf ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{language === 'fr' ? 'Télécharger PDF' : 'تحميل PDF (مباشرة)'}</span>
                  </button>
                  <button
                    onClick={() => setPrintableOrder(null)}
                    className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer ms-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Ticket Body */}
              <div id="printable-slip-area" className="p-8 bg-white overflow-y-auto space-y-6 text-black text-xs print:p-0 print:overflow-visible" style={{ color: '#000000', backgroundColor: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {/* Header branding */}
                <div className="flex justify-between items-start border-b-2 border-black pb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-black text-base leading-none text-center" style={{ backgroundColor: '#000000', color: '#ffffff', width: '40px', height: '40px' }}>
                        H77
                      </div>
                      <div>
                        <span className="font-black text-xl text-black block tracking-normal uppercase" style={{ letterSpacing: '0px' }}>HERBS 77</span>
                        <span className="text-[10px] text-gray-700 block font-bold" style={{ letterSpacing: '0px' }}>Natural & High Quality Products</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right" style={{ direction: 'ltr' }}>
                    <span className="font-bold font-mono text-black text-base block" style={{ letterSpacing: '0px' }}>
                      #{printableOrder.trackingNumber || printableOrder.id?.substring(0, 10).toUpperCase()}
                    </span>
                    <span className="text-[11px] text-gray-700 block mt-0.5 font-bold" style={{ letterSpacing: '0px' }}>
                      {printableOrder.createdAt?.toDate 
                        ? printableOrder.createdAt.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                        : 'N/A'}
                    </span>
                    <div className="inline-block mt-2 border border-black text-black font-bold text-[10px] px-3 py-1 rounded bg-gray-100" style={{ backgroundColor: '#f3f4f6', color: '#000000', whiteSpace: 'nowrap', direction: 'ltr' }}>
                      <span>Paiement à la livraison (COD)</span>
                      <span className="mx-1">/</span>
                      <span dir="rtl" style={{ unicodeBidi: 'embed', letterSpacing: '0px' }}>الدفع عند الاستلام</span>
                    </div>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border-2 border-black" style={{ backgroundColor: '#f9fafb', borderColor: '#000000' }}>
                  <div className="border-r border-gray-300 pe-4 pb-0" style={{ direction: 'ltr' }}>
                    <span className="text-[11px] font-bold text-black block mb-1">
                      DESTINATAIRE / <span dir="rtl" style={{ unicodeBidi: 'embed', letterSpacing: '0px' }}>معلومات المستلم:</span>
                    </span>
                    <h4 className="font-black text-black text-sm" style={{ letterSpacing: '0px' }}>{printableOrder.fullName}</h4>
                    <p className="font-bold text-black mt-1 text-sm" style={{ letterSpacing: '0px' }}>{printableOrder.phone}</p>
                  </div>

                  <div className="ps-2" style={{ direction: 'ltr' }}>
                    <span className="text-[11px] font-bold text-black block mb-1">
                      ADRESSE DE LIVRAISON / <span dir="rtl" style={{ unicodeBidi: 'embed', letterSpacing: '0px' }}>عنوان التوصيل:</span>
                    </span>
                    <p className="font-black text-black text-sm" style={{ letterSpacing: '0px' }}>{printableOrder.city}</p>
                    <p className="text-black font-semibold mt-0.5 leading-relaxed text-xs" style={{ letterSpacing: '0px' }}>{printableOrder.address}</p>
                    {printableOrder.notes && (
                      <p className="text-[11px] text-black bg-white border border-black p-2 rounded mt-2 font-bold" style={{ backgroundColor: '#ffffff', color: '#000000', letterSpacing: '0px' }}>
                        <span dir="rtl" style={{ unicodeBidi: 'embed' }}>ملاحظات: {printableOrder.notes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-2 border-black rounded-lg overflow-hidden" style={{ borderColor: '#000000', direction: 'ltr' }}>
                  <table className="w-full text-left border-collapse" style={{ direction: 'ltr' }}>
                    <thead>
                      <tr className="bg-gray-100 text-black font-black text-[11px] border-b-2 border-black" style={{ backgroundColor: '#f3f4f6', color: '#000000', borderColor: '#000000' }}>
                        <th className="py-2.5 px-4 border-r border-gray-300">
                          Produit / <span dir="rtl" style={{ unicodeBidi: 'embed', letterSpacing: '0px' }}>المنتج</span>
                        </th>
                        <th className="py-2.5 px-4 text-center border-r border-gray-300">
                          Qté / <span dir="rtl" style={{ unicodeBidi: 'embed', letterSpacing: '0px' }}>الكمية</span>
                        </th>
                        <th className="py-2.5 px-4 text-right border-r border-gray-300">
                          Prix unitaire / <span dir="rtl" style={{ unicodeBidi: 'embed', letterSpacing: '0px' }}>سعر الوحدة</span>
                        </th>
                        <th className="py-2.5 px-4 text-right">
                          Total / <span dir="rtl" style={{ unicodeBidi: 'embed', letterSpacing: '0px' }}>المجموع</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 font-medium text-xs">
                      {printableOrder.items?.map((it: any, idx: number) => (
                        <tr key={idx} className="bg-white" style={{ backgroundColor: '#ffffff' }}>
                          <td className="py-3 px-4 font-black text-black border-r border-gray-200" style={{ letterSpacing: '0px' }}>
                            <span dir="ltr">{it.nameFr || it.name}</span>
                            {it.selectedColor && (
                              <span className="block text-[10px] text-gray-700 font-bold" style={{ letterSpacing: '0px' }}>
                                Couleur: {it.selectedColor}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-black border-r border-gray-200" style={{ letterSpacing: '0px' }}>x{it.quantity}</td>
                          <td className="py-3 px-4 text-right font-bold text-black border-r border-gray-200" style={{ letterSpacing: '0px' }}>{it.price} DH</td>
                          <td className="py-3 px-4 text-right font-black text-black" style={{ letterSpacing: '0px' }}>{it.price * it.quantity} DH</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Total Section */}
                <div className="border-2 border-black p-4 rounded-lg flex justify-between items-center bg-gray-100 text-black" style={{ backgroundColor: '#f3f4f6', color: '#000000', borderColor: '#000000', direction: 'ltr' }}>
                  <div>
                    <span className="text-xs font-black text-black block">
                      MONTANT À COLLECTER (COD) / <span dir="rtl" style={{ unicodeBidi: 'embed', letterSpacing: '0px' }}>المبلغ الإجمالي المطلوب تحصيله عند التسليم:</span>
                    </span>
                    <span className="text-[11px] text-gray-800 font-bold mt-0.5 block" style={{ letterSpacing: '0px' }}>
                      Livraison gratuite / <span dir="rtl" style={{ unicodeBidi: 'embed' }}>توصيل مجاني</span>
                    </span>
                  </div>

                  <span className="text-2xl font-black text-black font-mono" style={{ letterSpacing: '0px' }}>
                    {printableOrder.total} DH
                  </span>
                </div>

                {/* Footer instructions */}
                <div className="text-center pt-3 border-t border-gray-300 text-[11px] text-gray-800 space-y-0.5 font-bold" style={{ direction: 'ltr' }}>
                  <p className="font-black text-black text-xs" style={{ letterSpacing: '0px' }}>
                    <span dir="rtl" style={{ unicodeBidi: 'embed' }}>شكراً لثقتكم واختياركم Herbs 77!</span>
                  </p>
                  <p style={{ letterSpacing: '0px' }}>
                    <span dir="rtl" style={{ unicodeBidi: 'embed' }}>لأي استفسار يرجى التواصل مع خدمة العملاء عبر الموقع أو الواتساب.</span>
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 print:hidden">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  📄 {language === 'fr' ? `Nom du fichier: Bon-de-livraison-${printableOrder?.trackingNumber || printableOrder?.id?.substring(0, 10) || 'order'}.pdf` : `اسم الملف: Bon-de-livraison-${printableOrder?.trackingNumber || printableOrder?.id?.substring(0, 10) || 'order'}.pdf`}
                </span>
                <div className="flex items-center gap-2 ms-auto">
                  <button
                    type="button"
                    onClick={() => setPrintableOrder(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {language === 'fr' ? 'Fermer' : 'إغلاق'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isGeneratingPdf ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>{language === 'fr' ? 'Télécharger PDF' : 'تحميل PDF مباشر'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
