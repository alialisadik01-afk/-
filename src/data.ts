import { Product, Testimonial, FAQItem } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'water-flosser',
    name: {
      fr: 'Irrigateur Dentaire Portable',
      ar: 'جهاز خيط الأسنان المائي المحمول'
    },
    tagline: {
      fr: 'Hygiène Dentaire, Où Que Vous Soyez',
      ar: 'نظافة الأسنان، أينما كنت'
    },
    description: {
      fr: 'Le jet dentaire portable élimine efficacement la plaque dentaire et les résidus alimentaires pour des dents plus propres et des gencives plus saines.',
      ar: 'يزيل خيط الأسنان المائي المحمول بفعالية طبقة البلاك وبقايا الطعام للحصول على أسنان أكثر نظافة ولثة أكثر صحة.'
    },
    price: 299,
    originalPrice: 399,
    discount: 25,
    rating: 4.9,
    reviewsCount: 128,
    image: 'https://i.pinimg.com/736x/8c/b0/3b/8cb03bdc70028db297ac99dab7466ce0.jpg',
    images: [
      'https://i.pinimg.com/736x/8c/b0/3b/8cb03bdc70028db297ac99dab7466ce0.jpg'
    ],
    colors: [
      { name: { fr: 'Blanc Pur', ar: 'أبيض ناصع' }, hex: '#ffffff', image: 'https://i.pinimg.com/736x/8c/b0/3b/8cb03bdc70028db297ac99dab7466ce0.jpg' },
      { name: { fr: 'Rose poudré', ar: 'وردي لطيف' }, hex: '#fbcfe8', image: 'https://i.pinimg.com/736x/29/e6/7b/29e67b82254f2281f590da301acc76b8.jpg' },
      { name: { fr: 'Vert Menthe', ar: 'أخضر نعناعي' }, hex: '#a7f3d0', image: 'https://i.pinimg.com/736x/64/e9/e0/64e9e0f132bbde851e884cbd4f97797c.jpg' },
      { name: { fr: 'Noir Onyx', ar: 'أسود أونيكس' }, hex: '#111827', image: 'https://i.pinimg.com/736x/93/e6/81/93e681570895e395c8f661f167e1fda3.jpg' }
    ],
    themeColor: 'from-[#f0fdf4] to-[#ccfbf1] text-emerald-950',
    accentColor: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
    textColor: 'text-emerald-800',
    specs: {
      fr: [
        { label: 'Modes de nettoyage', value: '3 modes (Normal, Doux, Pulsé)' },
        { label: 'Étanchéité', value: 'IPX7 étanche à l\'eau' },
        { label: 'Autonomie', value: 'Jusqu\'à 40 jours de batterie' },
        { label: 'Capacité réservoir', value: '300 ml amovible' },
        { label: 'Nozzles inclus', value: '4 buses interchangeables à 360°' }
      ],
      ar: [
        { label: 'أوضاع التنظيف', value: '3 أوضاع (عادي، لطيف، نابض)' },
        { label: 'مقاومة الماء', value: 'مقاوم للماء بالكامل بمعيار IPX7' },
        { label: 'عمر البطارية', value: 'يصل إلى 40 يومًا بـشحنة واحدة' },
        { label: 'سعة الخزان', value: '300 مل قابل للفصل' },
        { label: 'الرؤوس المرفقة', value: '4 فوهات دوارة 360 درجة قابلة للاستبدال' }
      ]
    },
    benefits: {
      fr: [
        'Élimine jusqu\'à 99.9% de la plaque dentaire',
        'Idéal pour nettoyer les bagues et implants',
        'Améliore la santé des gencives en seulement 2 semaines',
        'Format compact parfait pour les voyages'
      ],
      ar: [
        'يزيل ما يصل إلى 99.9% من طبقة البلاك',
        'مثالي لتنظيف تقويم الأسنان والزرعات',
        'يحسن صحة اللثة في غضون أسبوعين فقط',
        'تصميم مدمج ومثالي للسفر'
      ]
    }
  },
  {
    id: 'mouthwash',
    name: {
      fr: 'GingiHerbe Bain de Bouche Naturel',
      ar: 'غسول الفم الطبيعي جنجي هيرب'
    },
    tagline: {
      fr: 'Sourire Sain, Confiance Au Quotidien',
      ar: 'ابتسامة صحية، ثقة كل يوم'
    },
    description: {
      fr: 'Le bain de bouche naturel au clou de girofle et menthe protège vos gencives, combat les bactéries et rafraîchit votre haleine naturellement.',
      ar: 'غسول الفم الطبيعي المستخلص من القرنفل والنعناع يحمي لثتك، يحارب البكتيريا، وينعش أنفاسك بشكل طبيعي.'
    },
    price: 69,
    originalPrice: 99,
    discount: 30,
    rating: 4.8,
    reviewsCount: 96,
    image: 'https://i.pinimg.com/736x/0c/8f/c1/0c8fc1d1dea09df8fa22735795a07f66.jpg',
    images: [
      'https://i.pinimg.com/736x/0c/8f/c1/0c8fc1d1dea09df8fa22735795a07f66.jpg'
    ],
    themeColor: 'from-[#f0fdf4] to-[#dcfce7] text-green-950',
    accentColor: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white',
    textColor: 'text-green-800',
    specs: {
      fr: [
        { label: 'Volume', value: '125 ml de pure formule' },
        { label: 'Ingrédients', value: '100% origine naturelle' },
        { label: 'Sans alcool', value: 'Oui, formule douce et non irritante' },
        { label: 'Fabrication', value: 'Testé cliniquement' },
        { label: 'Arôme', value: 'Menthe fraîche et clou de girofle' }
      ],
      ar: [
        { label: 'الحجم', value: '125 مل من التركيبة المركزة' },
        { label: 'المكونات', value: 'مستخلصات طبيعية 100%' },
        { label: 'خالٍ من الكحول', value: 'نعم، تركيبة لطيفة غير مسببة للتهيج' },
        { label: 'الصنع', value: 'مختبر طبيًا وسريريًا' },
        { label: 'النكهة', value: 'نعناع منعش وقرنفل بلدي' }
      ]
    },
    benefits: {
      fr: [
        'Protection complète contre la plaque et la gingivite',
        'Combat la mauvaise haleine à la source',
        'Prend soin des gencives sensibles et irritées',
        'Soutient l\'équilibre du microbiome buccal'
      ],
      ar: [
        'حماية كاملة ضد البلاك والتهاب اللثة',
        'يحارب رائحة الفم الكريهة من مصدرها',
        'يعتني باللثة الحساسة والمتهيجة',
        'يدعم التوازن الطبيعي لبكتيريا الفم النافعة'
      ]
    },
    ingredients: {
      fr: ['Extrait de menthe poivrée', 'Huile essentielle de clou de girofle', 'Extrait de camomille', 'Aloe Vera biologique'],
      ar: ['مستخلص النعناع الفلفلي', 'زيت القرنفل الأساسي', 'مستخلص البابونج الطبيعي', 'الألوفيرا العضوية']
    }
  },
  {
    id: 'toothpaste',
    name: {
      fr: 'Anchor Clove Power Dentifrice',
      ar: 'معجون الأسنان أنكور بقوة القرنفل'
    },
    tagline: {
      fr: 'La Puissance Des Clous, Le Soin Au Quotidien',
      ar: 'قوة القرنفل، العناية اليومية المتكاملة'
    },
    description: {
      fr: 'Enrichi en huile de clou de girofle naturelle, le dentifrice Anchor Clove Power aide à protéger vos gencives, combattre les bactéries et rafraîchir naturellement.',
      ar: 'معجون الأسنان أنكور بقوة القرنفل الغني بزيت القرنفل الطبيعي، يساعد على حماية اللثة، محاربة البكتيريا، وتبييض الأسنان بشكل طبيعي وآمن.'
    },
    price: 39,
    originalPrice: 59,
    discount: 34,
    rating: 4.7,
    reviewsCount: 74,
    image: 'https://i.pinimg.com/736x/62/1e/98/621e984049aa9f575c0ac89e049f8022.jpg',
    images: [
      'https://i.pinimg.com/736x/62/1e/98/621e984049aa9f575c0ac89e049f8022.jpg'
    ],
    themeColor: 'from-[#fffbeb] to-[#fef3c7] text-amber-950',
    accentColor: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white',
    textColor: 'text-amber-800',
    specs: {
      fr: [
        { label: 'Poids net', value: '175 g' },
        { label: 'Actifs principaux', value: 'Huile naturelle de clou de girofle' },
        { label: 'Ingrédients nocifs', value: 'Sans parabènes, sans fluor chimique' },
        { label: 'Actions', value: 'Anti-caries, Fortifiant gencives' },
        { label: 'Convient à', value: 'Toute la famille' }
      ],
      ar: [
        { label: 'الوزن الصافي', value: '175 جرام' },
        { label: 'المادة الفعالة', value: 'زيت القرنفل الطبيعي الفعال' },
        { label: 'المواد الضارة', value: 'خالٍ من البارابين والفلور الاصطناعي' },
        { label: 'الفوائد الرئيسية', value: 'مقاوم للتسوس، مقوي للثة والأسنان' },
        { label: 'مناسب لـ', value: 'جميع أفراد العائلة' }
      ]
    },
    benefits: {
      fr: [
        'Aide à maintenir des dents fortes et blanches',
        'Propriétés antibactériennes puissantes',
        'Calme instantanément les sensibilités dentaires',
        'Formule douce respectueuse de l\'émail'
      ],
      ar: [
        'يساعد في الحفاظ على أسنان قوية وناصعة البياض',
        'يتميز بخصائص طبيعية مضادة للبكتيريا',
        'يهدئ آلام الأسنان واللثة الحساسة فورًا',
        'تركيبة لطيفة تحمي مينا الأسنان من التآكل'
      ]
    }
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: {
      fr: 'Meryem El Bouri',
      ar: 'مريم البوري'
    },
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop',
    rating: 3.7,
    text: {
      fr: 'Des produits incroyables ! Mon sourire n\'a jamais été aussi éclatant. L\'irrigateur portable est très puissant et le bain de bouche GingiHerbe laisse une fraîcheur naturelle incomparable.',
      ar: 'منتجات مذهلة حقًا! لم تكن ابتسامتي مشرقة هكذا من قبل. خيط الأسنان المائي قوي جدًا وغسول جنجي هيرب يترك انتعاشًا طبيعيًا لا يصدق.'
    },
    product: {
      fr: 'Gamme Complète',
      ar: 'المجموعة الكاملة'
    },
    verified: true
  },
  {
    id: 't2',
    name: {
      fr: 'Houssam El Mansouri',
      ar: 'حسام المنصوري'
    },
    avatar: 'https://png.pngtree.com/thumb_back/fh260/background/20250331/pngtree-portrait-of-a-handsome-young-man-wearing-blue-sweatshirt-and-glasses-image_17160297.jpg',
    rating: 4.2,
    text: {
      fr: 'Souffrant de gencives sensibles, le dentifrice Anchor Clove a changé mon quotidien. Moins de saignements et une haleine ultra fraîche. Le service client de Howari est exceptionnel !',
      ar: 'كنت أعاني من نزيف اللثة الحساسة، لكن معجون أنكور بالقرنفل غير حياتي اليومية. نزيف أقل ونفس منعش للغاية. خدمة عملاء هواري ممتازة وسريعة!'
    },
    product: {
      fr: 'Dentifrice Anchor Clove',
      ar: 'معجون أسنان أنكور القرنفل'
    },
    verified: true
  },
  {
    id: 't3',
    name: {
      fr: 'Achraf Ziani',
      ar: 'اشرف الزياني'
    },
    avatar: 'https://images.unsplash.com/photo-1695927621677-ec96e048dce2?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZmlsJTIwbWFzY3VsaW58ZW58MHx8MHx8fDA%3D',
    rating: 4.9,
    text: {
      fr: 'Cet irrigateur est un vrai plus au quotidien ! J\'ai choisi la couleur Noir Onyx, très classe et masculine. La pression d\'eau est excellente, nettoie en profondeur après les repas et la batterie tient facilement un mois sans recharge.',
      ar: 'جهاز الخيط المائي ممتاز جداً وعملي! اخترت اللون الأسود الأونيكس، فخم وأنيق للغاية. ضغط الماء قوي ينظف الأسنان بفعالية بعد كل وجبة، والبطارية تدوم لأكثر من شهر بشحنة واحدة.'
    },
    product: {
      fr: 'Irrigateur Dentaire Portable',
      ar: 'جهاز خيط الأسنان المائي المحمول'
    },
    verified: true
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq1',
    question: {
      fr: 'Quels sont les délais de livraison au Maroc ?',
      ar: 'ما هي مدة التوصيل داخل المغرب؟'
    },
    answer: {
      fr: 'Nous livrons partout au Maroc sous 24 à 48 heures. La livraison est rapide et directement à votre domicile ou bureau.',
      ar: 'نوفر خدمة التوصيل إلى جميع مدن المغرب خلال 24 إلى 48 ساعة فقط. التوصيل سريع ومباشرة إلى منزلك أو مقر عملك.'
    }
  },
  {
    id: 'faq2',
    question: {
      fr: 'Est-il possible de passer la commande via WhatsApp ?',
      ar: 'هل يمكن تسجيل الطلب عبر وتساب'
    },
    answer: {
      fr: 'Oui, cliquez simplement sur l\'icône WhatsApp pour passer votre commande.',
      ar: 'نعم قم بالنقر على ايقونه وتساب تسجيل طلبك'
    }
  },
  {
    id: 'faq3',
    question: {
      fr: 'Le dentifrice et le bain de bouche conviennent-ils aux enfants ?',
      ar: 'هل معجون الأسنان وغسول الفم مناسبان للأطفال؟'
    },
    answer: {
      fr: 'Oui, nos formules à base d\'ingrédients naturels de clou de girofle et menthe sont douces et adaptées aux enfants de plus de 6 ans sous surveillance parentale.',
      ar: 'نعم، تركيباتنا الطبيعية المستخلصة من القرنفل والنعناع لطيفة وآمنة تمامًا للأطفال فوق سن 6 سنوات تحت إشراف الوالدين.'
    }
  },
  {
    id: 'faq4',
    question: {
      fr: 'Le paiement à la livraison est-il disponible ?',
      ar: 'هل تتوفر خدمة الدفع عند الاستلام؟'
    },
    answer: {
      fr: 'Oui, absolument. Vous pouvez commander en toute confiance et payer en espèces uniquement au moment de la réception de votre colis.',
      ar: 'نعم، بكل تأكيد. يمكنك الطلب بكل ثقة والدفع نقدًا (كاش) فقط عند استلام طلبك ومعاينته.'
    }
  }
];

export const TRANSLATIONS = {
  fr: {
    siteName: 'Herbs 77',
    navHome: 'Accueil',
    navProducts: 'Produits',
    navWhyUs: 'Pourquoi nous',
    navReviews: 'Avis Clients',
    navFaq: 'FAQ',
    navContact: 'Contact',
    heroBadge: 'SOINS DENTAIRES PREMIUM',
    heroTitle: 'Un sourire éclatant & une confiance absolue',
    heroSubtitle: 'Votre sourire éclatant commence ici. Découvrez nos soins bucco-dentaires naturels et innovants pour une blancheur impeccable et une fraîcheur durable au quotidien.',
    btnBuyNow: 'Découvrez notre pack et économisez 17%',
    btnViewProducts: 'Découvrir nos produits',
    featureSecurePayment: 'Paiement sécurisé',
    featureFastDelivery: 'Livraison rapide',
    featureFreeReturn: 'Crédibilité & Sécurité',
    featureQualityGuarantee: 'Garantie qualité',
    benefitNatural: 'Ingrédients naturels',
    benefitNaturalDesc: 'Sains et efficaces',
    benefitProtection: 'Protection complète',
    benefitProtectionDesc: 'Bouche saine chaque jour',
    benefitQuality: 'Qualité garantie',
    benefitQualityDesc: 'Produits testés et approuvés',
    benefitDelivery: 'Livraison rapide',
    benefitDeliveryDesc: 'Partout au Maroc',
    benefitSupport: 'Support client',
    benefitSupportDesc: 'À votre écoute',
    sectionProductsTitle: 'Nos produits',
    sectionProductsSubtitle: 'Explorez nos 3 solutions exclusives formulées pour votre bien-être buccal.',
    sectionTestimonialsTitle: 'Avis de nos clients',
    sectionTestimonialsSubtitle: 'Des milliers de sourires marocains nous font confiance au quotidien.',
    sectionFaqTitle: 'Questions Fréquentes',
    sectionFaqSubtitle: 'Tout ce que vous devez savoir sur nos produits et services.',
    sectionNewsletterTitle: 'Inscrivez-vous à notre newsletter',
    sectionNewsletterSubtitle: 'Recevez nos offres exclusives, conseils d\'hygiène dentaire et actualités directement dans votre boîte mail.',
    placeholderEmail: 'Votre adresse email',
    btnSubscribe: 'S\'abonner',
    cartTitle: 'Votre Panier',
    cartEmpty: 'Votre panier est vide',
    cartSubtotal: 'Sous-total',
    cartShipping: 'Livraison',
    cartTotal: 'Total',
    btnCheckout: 'Passer la commande',
    btnCheckoutLoading: 'Validation en cours...',
    checkoutSuccess: 'Commande reçue ! Nous allons vous contacter par téléphone pour confirmer la livraison.',
    freeShippingBadge: 'Livraison Gratuite partout au Maroc !',
    btnAddToCart: 'Ajouter au panier',
    btnAddedToCart: 'Ajouté !',
    wishlistTitle: 'Vos Favoris',
    wishlistEmpty: 'Aucun produit favori sauvegardé',
    accountTitle: 'Mon Compte',
    accountOrders: 'Mes Commandes',
    accountSettings: 'Paramètres',
    accountWelcome: 'Bienvenue chez Herbs 77',
    accountActiveOrders: 'Commandes en cours',
    accountOrderNumber: 'Commande #',
    accountOrderStatus: 'Statut',
    accountOrderPending: 'En attente de confirmation',
    accountOrderShipped: 'Expédié',
    accountOrderDelivered: 'Livré',
    originalPriceLabel: 'Prix initial',
    ratingLabel: 'Note',
    reviewsLabel: 'avis',
    colorLabel: 'Sélectionnez un coloris',
    specsTitle: 'Spécifications techniques',
    benefitsTitle: 'Bénéfices clés',
    ingredientsTitle: 'Ingrédients clés',
    btnBackToStore: 'Retour à la boutique',
    footerDesc: 'Des produits naturels pour une hygiène bucco-dentaire saine et un sourire éclatant chaque jour.',
    footerLinksProducts: 'Produits',
    footerLinksUseful: 'Liens utiles',
    footerLinksService: 'Service client',
    footerNewsletter: 'Newsletter',
    footerCopyright: '© 2026 Herbs 77. Tous droits réservés.',
    secureCheckoutFooter: 'Paiement sécurisé à la livraison partout au Maroc',
    btnMoreDetails: 'Détails du produit',
    whyUsTitle: 'Pourquoi choisir Herbs 77 ?',
    whyUsSubtitle: 'Nous combinons la puissance de la nature et l\'innovation technologique.',
    formName: 'Nom complet *',
    formPhone: 'Numéro de téléphone *',
    formCity: 'Ville *',
    formAddress: 'Adresse complète *',
    formNotes: 'Notes (facultatif)',
    formSubmit: 'Confirmer la commande',
    requiredField: 'Ce champ est requis',
    phonePlaceholder: 'Ex: 0612345678',
    cityPlaceholder: 'Ex: Casablanca, Rabat, Marrakech...',
    addressPlaceholder: 'Ex: Rue 14, Appt 5, Quartier Palmier',
    notesPlaceholder: 'Instructions spéciales pour la livraison...',
    paymentMethodCOD: 'Paiement à la livraison (COD)'
  },
  ar: {
    siteName: 'Herbs 77',
    navHome: 'الرئيسية',
    navProducts: 'منتجاتنا',
    navWhyUs: 'لماذا نحن',
    navReviews: 'آراء العملاء',
    navFaq: 'الأسئلة الشائعة',
    navContact: 'اتصل بنا',
    heroBadge: 'عناية ممتازة بالأسنان',
    heroTitle: 'ابتسامة مشرقة وثقة تامة تدوم طوال اليوم',
    heroSubtitle: 'ابتسامتك المشرقة تبدأ من هنا. اكتشف منتجاتنا الطبيعية والمبتكرة المصممة خصيصاً لتمنحك أسناناً ناصعة البياض ونفساً منعشاً وصحة فم مثالية يومياً.',
    btnBuyNow: 'اكتشف حزمتنا ووفر 17%',
    btnViewProducts: 'اكتشف منتجاتنا',
    featureSecurePayment: 'دفع آمن عند الاستلام',
    featureFastDelivery: 'توصيل سريع للغاية',
    featureFreeReturn: 'المصداقية والأمان',
    featureQualityGuarantee: 'ضمان الجودة العالية',
    benefitNatural: 'مكونات طبيعية',
    benefitNaturalDesc: 'صحية وفعالة 100%',
    benefitProtection: 'حماية متكاملة',
    benefitProtectionDesc: 'فم صحي ونفس منعش كل يوم',
    benefitQuality: 'ضمان الجودة',
    benefitQualityDesc: 'منتجات مختبرة ومعتمدة',
    benefitDelivery: 'توصيل سريع',
    benefitDeliveryDesc: 'لكل المدن في المغرب',
    benefitSupport: 'دعم العملاء',
    benefitSupportDesc: 'في خدمتكم دائمًا',
    sectionProductsTitle: 'منتجاتنا الرائدة',
    sectionProductsSubtitle: 'اكتشف حلولنا الثلاثة الحصرية والمبتكرة لجمال وصحة فمك وأسنانك.',
    sectionTestimonialsTitle: 'آراء عملائنا الكرام',
    sectionTestimonialsSubtitle: 'آلاف الابتسامات المغربية تثق بمنتجاتنا وتستخدمها يوميًا وبكل أمان.',
    sectionFaqTitle: 'الأسئلة الشائعة والجواب',
    sectionFaqSubtitle: 'كل ما تود معرفته حول منتجاتنا العالية الجودة، خدمات التوصيل والضمان.',
    sectionNewsletterTitle: 'اشترك الآن في نشرتنا الإخبارية',
    sectionNewsletterSubtitle: 'احصل على العروض الحصرية، الخصومات المميزة ونصائح خبراء الأسنان مباشرة في بريدك الإلكتروني.',
    placeholderEmail: 'بريدك الإلكتروني المفضل',
    btnSubscribe: 'اشتراك',
    cartTitle: 'سلة المشتريات',
    cartEmpty: 'سلة مشترياتك فارغة حاليًا',
    cartSubtotal: 'المجموع الفرعي',
    cartShipping: 'مصاريف التوصيل',
    cartTotal: 'المجموع الإجمالي',
    btnCheckout: 'تأكيد الطلب',
    btnCheckoutLoading: 'جاري تأكيد طلبكم...',
    checkoutSuccess: 'تم استلام طلبكم بنجاح! سنتصل بكم هاتفيًا في أقرب وقت لتأكيد الشحن والتوصيل.',
    freeShippingBadge: 'توصيل مجاني وسريع لكافة مدن المغرب!',
    btnAddToCart: 'أضف إلى السلة',
    btnAddedToCart: 'تمت الإضافة!',
    wishlistTitle: 'قائمة المفضلة',
    wishlistEmpty: 'لم تقم بإضافة أي منتج للمفضلة بعد',
    accountTitle: 'حسابي الخاص',
    accountOrders: 'طلباتي السابقة',
    accountSettings: 'إعدادات الحساب',
    accountWelcome: 'مرحبًا بك في عائلة Herbs 77',
    accountActiveOrders: 'الطلبات الجارية حاليًا',
    accountOrderNumber: 'رقم الطلب #',
    accountOrderStatus: 'حالة الطلب',
    accountOrderPending: 'في انتظار التأكيد الهاتفي',
    accountOrderShipped: 'تم الشحن',
    accountOrderDelivered: 'تم التوصيل بنجاح',
    originalPriceLabel: 'السعر الأصلي',
    ratingLabel: 'التقييم',
    reviewsLabel: 'تقييم',
    colorLabel: 'اختر اللون المفضل',
    specsTitle: 'المواصفات التقنية والمميزات',
    benefitsTitle: 'الفوائد والنتائج الرئيسية',
    ingredientsTitle: 'المكونات الطبيعية النشطة',
    btnBackToStore: 'العودة للتسوق',
    footerDesc: 'منتجات طبيعية ممتازة للعناية اليومية المتكاملة بصحة الفم والأسنان لابتسامة ساحرة تدوم طويلاً.',
    footerLinksProducts: 'المنتجات',
    footerLinksUseful: 'روابط مفيدة',
    footerLinksService: 'خدمة العملاء',
    footerNewsletter: 'النشرة البريدية',
    footerCopyright: '© 2026 Herbs 77. جميع الحقوق محفوظة.',
    secureCheckoutFooter: 'دفع آمن عند الاستلام وتوصيل سريع لكافة المدن المغربية',
    btnMoreDetails: 'عرض التفاصيل',
    whyUsTitle: 'لماذا تختار منتجات Herbs 77؟',
    whyUsSubtitle: 'نحن ندمج بين أسرار الطبيعة العشبية وأحدث التقنيات الطبية الذكية.',
    formName: 'الاسم الكامل *',
    formPhone: 'رقم الهاتف *',
    formCity: 'المدينة *',
    formAddress: 'العنوان الكامل *',
    formNotes: 'ملاحظات (اختياري)',
    formSubmit: 'تأكيد الطلب',
    requiredField: 'هذا الحقل مطلوب للتوصيل',
    phonePlaceholder: 'مثال: 0612345678',
    cityPlaceholder: 'مثال: الدار البيضاء، الرباط، مراكش...',
    addressPlaceholder: 'مثال: حي الرياض، شارع النخيل، عمارة 4، شقة 10',
    notesPlaceholder: 'مثال: أي ملاحظات أو تعليمات خاصة بالتوصيل...',
    paymentMethodCOD: 'الدفع عند الاستلام (COD)'
  }
};
