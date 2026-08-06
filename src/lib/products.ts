import { 
  db, 
  auth,
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp
} from './firebase';
import { Product } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Royal Majesty Agbada Set",
    price: "₦180,000",
    category: "Traditional & Classic Wear",
    postType: "Female Agbada",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600",
    description: "Rich Royal Blue custom-tailored Agbada with premium gold hand embroidery. Perfect for prestige traditional weddings and ceremonies.",
    referenceUrl: "https://gofashionhome.com/products/royal-majesty-agbada",
    createdAt: new Date("2026-07-18T10:00:00Z").toISOString(),
  },
  {
    id: "prod-2",
    title: "Imperial Magenta Gown",
    price: "₦145,000",
    category: "Structured & Statement Dresses",
    postType: "Corset Dresses",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600",
    description: "Sleek, body-contouring luxury floor-length gown featuring elegant magenta silk draping and fine corset finishing.",
    referenceUrl: "https://gofashionhome.com/products/imperial-magenta-gown",
    createdAt: new Date("2026-07-18T10:01:00Z").toISOString(),
  },
  {
    id: "prod-3",
    title: "Luxury Hand-Woven Aso-Oke Set",
    price: "₦220,000",
    category: "Traditional & Classic Wear",
    postType: "George Wrapper and Blouse",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600",
    description: "Traditional Yoruba woven attire crafted with fine metallic Royal Blue threads, premium cotton, and magenta highlight patterns.",
    referenceUrl: "https://gofashionhome.com/products/aso-oke-set",
    createdAt: new Date("2026-07-18T10:02:00Z").toISOString(),
  },
  {
    id: "prod-4",
    title: "Signature Silk Kimono Jacket",
    price: "₦45,000",
    category: "Casual & Easy Wear",
    postType: "Kimonos",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600",
    description: "Sleek silk blend floral print kimono, perfect for effortless elegant styling.",
    referenceUrl: "https://gofashionhome.com/products/golden-shears-kit",
    createdAt: new Date("2026-07-18T10:03:00Z").toISOString(),
  }
];

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
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
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

const PRODUCTS_COLLECTION = 'products';

// Helper to convert Firestore timestamp to ISO string
const getIsoString = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (val.seconds) {
    return new Date(val.seconds * 1000).toISOString();
  }
  return new Date(val).toISOString();
};

export async function getFirestoreProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === 'pezzjoss@gmail.com') {
        console.log('Firestore products collection is empty and Admin is logged in. Seeding defaults...');
        await seedDefaultProducts();
      } else {
        console.log('Firestore products collection is empty. Returning default products (client-side fallback).');
      }
      return DEFAULT_PRODUCTS;
    }
    
    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        title: data.title || '',
        price: data.price || '',
        category: data.category || '',
        postType: data.postType || '',
        image: data.image || '',
        description: data.description || '',
        referenceUrl: data.referenceUrl || '',
        originalUrl: data.originalUrl || '',
        altText: data.altText || '',
        caption: data.caption || '',
        brand: data.brand || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        currency: data.currency || '',
        width: typeof data.width === 'number' ? data.width : undefined,
        height: typeof data.height === 'number' ? data.height : undefined,
        fileSize: data.fileSize || undefined,
        fileFormat: data.fileFormat || '',
        author: data.author || '',
        createdAt: getIsoString(data.createdAt),
      });
    });
    
    return products;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
  }
}

export async function seedDefaultProducts(): Promise<void> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    for (const prod of DEFAULT_PRODUCTS) {
      const { id, ...data } = prod;
      // Use original ISO string as date
      await addDoc(productsRef, {
        ...data,
        createdAt: new Date(prod.createdAt),
      });
    }
    console.log('Successfully seeded default products in Firestore.');
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, PRODUCTS_COLLECTION);
  }
}

export async function addFirestoreProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const docRef = await addDoc(productsRef, {
      ...productData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PRODUCTS_COLLECTION);
  }
}

export async function updateFirestoreProduct(id: string, productData: Partial<Product>): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    // Strip out fields we don't want to overwrite or that shouldn't be updated
    const { id: _, createdAt: __, ...updateData } = productData;
    await updateDoc(docRef, {
      ...updateData,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}

export async function deleteFirestoreProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${id}`);
  }
}
