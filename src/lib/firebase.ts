import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, getDoc, setDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, deleteDoc, updateDoc, getDocFromServer } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDcS5nNyJNWPzKGOZYWWqbVF4MuQi9dhZE",
  authDomain: "gen-lang-client-0124862842.firebaseapp.com",
  projectId: "gen-lang-client-0124862842",
  storageBucket: "gen-lang-client-0124862842.firebasestorage.app",
  messagingSenderId: "410254504361",
  appId: "1:410254504361:web:afcb5c61d86b14ec0414b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with auto-detect long polling enabled to handle network/proxy stream interruptions smoothly
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, "ai-studio-howarimarket-cbfde68e-04be-4d71-adac-b96429928a6c");

// Non-blocking connection check
setTimeout(async () => {
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch {
    // Silent catch for initial connection test
  }
}, 2000);

// Initialize Auth
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error('Failed to set auth persistence:', err);
});

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper: Deeply sanitize objects to replace or remove 'undefined' values for Firestore compatibility
export function sanitizeData(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }
  if (typeof obj === 'object') {
    // If it's a FirestoreFieldValue (like serverTimestamp), return it as-is
    if (obj.constructor && obj.constructor.name === 'FieldValue') {
      return obj;
    }
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          newObj[key] = sanitizeData(val);
        }
      }
    }
    return newObj;
  }
  return obj;
}

// Helper: Save user profile to Firestore on first login
export async function saveUserProfile(user: any, additionalData: any = {}) {
  const userRef = doc(db, 'users', user.uid);
  let userSnap;
  try {
    userSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
  }
  
  const profileData = sanitizeData({
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
    email: user.email,
    photoURL: user.photoURL || '',
    phone: additionalData.phone || '',
    city: additionalData.city || '',
    address: additionalData.address || ''
  });

  try {
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...profileData,
        createdAt: serverTimestamp(),
      });
    } else if (Object.keys(additionalData).length > 0) {
      // Update delivery profile fields if provided
      const sanitizedAddData = sanitizeData(additionalData);
      await setDoc(userRef, sanitizedAddData, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Helper: Fetch user profile from Firestore
export async function getUserProfile(uid: string) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}

// Helper: Save order to Firestore (works for guest & authenticated users)
export async function saveOrder(orderData: {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  paymentMethod: string;
  items: Array<{
    id: string;
    name: string;
    nameFr?: string;
    nameAr?: string;
    image?: string;
    quantity: number;
    price: number;
    selectedColor?: string;
  }>;
  total: number;
  userId: string | null;
  isGuest: boolean;
}) {
  try {
    const ordersRef = collection(db, 'orders');
    const sanitizedOrderData = sanitizeData(orderData);
    const docRef = await addDoc(ordersRef, {
      ...sanitizedOrderData,
      createdAt: serverTimestamp(),
      status: 'pending' // Default status
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
  }
}

// Helper: Get user's order history from Firestore
export async function getUserOrders(userId: string) {
  try {
    const ordersRef = collection(db, 'orders');
    let querySnapshot;
    try {
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      querySnapshot = await getDocs(q);
    } catch {
      const qFallback = query(ordersRef, where('userId', '==', userId));
      querySnapshot = await getDocs(qFallback);
    }
    const orders: any[] = [];
    querySnapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return orders;
  } catch (error) {
    console.warn('Could not fetch user orders:', error);
    return [];
  }
}

// Helper: Get all users (Admin only)
export async function getAllUsers() {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users: any[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push({
        uid: docSnap.id,
        ...docSnap.data()
      });
    });
    return users;
  } catch (error) {
    console.warn('Could not fetch users:', error);
    return [];
  }
}

// Helper: Get all orders (Admin only)
export async function getAllOrders() {
  try {
    const ordersRef = collection(db, 'orders');
    let querySnapshot;
    try {
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      querySnapshot = await getDocs(q);
    } catch {
      querySnapshot = await getDocs(ordersRef);
    }
    const orders: any[] = [];
    querySnapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds || (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0);
      const timeB = b.createdAt?.seconds || (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0);
      return timeB - timeA;
    });
    return orders;
  } catch (error) {
    console.warn('Could not fetch all orders:', error);
    return [];
  }
}

// Helper: Update order status (Admin only)
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

// Helper: Delete order (Admin only)
export async function deleteOrder(orderId: string) {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
  }
}

// Helper: Fetch products from Firestore with seeding fallback
export async function getFirestoreProducts(fallbackProducts: any[]) {
  try {
    const productsRef = collection(db, 'products');
    const querySnapshot = await getDocs(productsRef);
    const products: any[] = [];
    
    querySnapshot.forEach((docSnap) => {
      products.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    if (products.length === 0 && fallbackProducts.length > 0) {
      console.log('Seeding products to Firestore...');
      for (const prod of fallbackProducts) {
        try {
          const prodRef = doc(db, 'products', prod.id);
          const sanitized = sanitizeData(prod);
          await setDoc(prodRef, sanitized);
        } catch (e) {
          console.warn('Could not seed product to Firestore:', e);
        }
        products.push(prod);
      }
    }
    
    return products.length > 0 ? products : fallbackProducts;
  } catch (error) {
    console.warn('Could not fetch products from Firestore, using static fallback:', error);
    return fallbackProducts;
  }
}

// Helper: Save or update product in Firestore (Admin only)
export async function saveFirestoreProduct(product: any) {
  try {
    const productRef = doc(db, 'products', product.id);
    const sanitizedProduct = sanitizeData(product);
    await setDoc(productRef, sanitizedProduct, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
  }
}

// Helper: Delete product from Firestore (Admin only)
export async function deleteFirestoreProduct(productId: string) {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }
}

