import { useState, useEffect } from 'react';
import { 
  Lock, 
  Unlock, 
  PlusCircle, 
  CheckCircle, 
  Image as ImageIcon, 
  RefreshCw, 
  ArrowLeft, 
  Trash2, 
  Edit2, 
  Globe, 
  ExternalLink, 
  X, 
  AlertCircle,
  FileText,
  Tag,
  Info,
  Sparkles,
  History,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Product, Category } from '../types';
import LazyImage from '../components/LazyImage';
import { 
  addFirestoreProduct, 
  updateFirestoreProduct, 
  deleteFirestoreProduct, 
  seedDefaultProducts,
  getFirestoreProducts
} from '../lib/products';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { extractUrlMetadata, isDirectImageUrl } from '../lib/metadataExtractor';

interface AdminPortalProps {
  onProductAdded: () => void;
  onNavigateHome: () => void;
}

const PRESET_IMAGES = [
  {
    name: 'Teal Bridal Gown',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Prestige Royal Agbada',
    url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'African Fabric Threads',
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Master Golden Shears',
    url: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&q=80&w=600',
  },
  {
    name: 'Lace & Embroidery Detail',
    url: 'https://images.unsplash.com/photo-1605497746444-ac9dbd39f69c?auto=format&fit=crop&q=80&w=600'
  },
  {
    name: 'Luxury Bespoke Suit',
    url: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=600'
  }
];

export const CATEGORY_MAP: Record<string, string[]> = {
  'Traditional & Classic Wear': [
    'Iro and Buba',
    'Boubou',
    'Kaftans',
    'Female Agbada',
    'George Wrapper and Blouse'
  ],
  'Structured & Statement Dresses': [
    'Ankara Peplum Gowns',
    'Corset Dresses',
    'Mermaid Gowns',
    'Jumpsuits',
    'Wrap Dresses'
  ],
  'Casual & Easy Wear': [
    'Kimonos',
    'Maxi Dresses',
    'Skirt and Blouse Sets'
  ],
  'Corporate & Office Wear': [
    'Blazers',
    'Trousers',
    'English Wear'
  ]
};

interface FetchedPreviewData {
  title: string;
  description: string;
  image: string;
  price?: string;
  brand?: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  fileSize?: string;
  fileFormat?: string;
  originalUrl?: string;
  tags?: string[];
  author?: string;
  currency?: string;
}

export interface ImportHistoryItem {
  id: string;
  url: string;
  timestamp: string;
  status: 'success' | 'failed';
  error?: string;
  missingFields?: string[];
  title?: string;
  image?: string;
}

export default function AdminPortal({ onProductAdded, onNavigateHome }: AdminPortalProps) {
  const [passkey, setPasskey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showSSO, setShowSSO] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('Traditional & Classic Wear');
  const [postType, setPostType] = useState<string>('Iro and Buba');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // Comprehensive Metadata States
  const [originalUrl, setOriginalUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [brand, setBrand] = useState('');
  const [author, setAuthor] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [currency, setCurrency] = useState('');
  const [imageWidth, setImageWidth] = useState<number | undefined>(undefined);
  const [imageHeight, setImageHeight] = useState<number | undefined>(undefined);
  const [fileSize, setFileSize] = useState<string | undefined>(undefined);
  const [fileFormat, setFileFormat] = useState<string | undefined>(undefined);
  
  // Dynamic Extracted Image Metadata Preview State
  const [fetchedPreview, setFetchedPreview] = useState<FetchedPreviewData | null>(null);

  // Import History & Audit Log State
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('gof_import_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading import history from storage', e);
    }
    return [
      {
        id: 'imp-demo-1',
        url: 'https://example-fashion.com/sample-unresolved-item',
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today',
        status: 'failed',
        error: 'Missing required product image.',
        missingFields: ['image'],
        title: 'Sample Unresolved Import'
      }
    ];
  });

  const [historyFilter, setHistoryFilter] = useState<'all' | 'failed' | 'success'>('all');

  useEffect(() => {
    try {
      localStorage.setItem('gof_import_history', JSON.stringify(importHistory));
    } catch (e) {
      console.error('Failed to save import history to storage', e);
    }
  }, [importHistory]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Track current form binding source (especially for imports and active edits)
  const [productForm, setProductForm] = useState<{ id: string | null; data: any } | null>(null);

  // Custom dialog confirmation states to bypass iframe confirm/alert restrictions
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [adminAlertMessage, setAdminAlertMessage] = useState<string | null>(null);

  // Monitor productForm changes to safely clear, map, and initialize form states
  useEffect(() => {
    if (productForm) {
      // 1. Explicitly clear/reset current form states first to prevent dirty leftovers
      setTitle('');
      setPrice('');
      setCategory('Traditional & Classic Wear');
      setPostType('Iro and Buba');
      setImage('');
      setDescription('');
      setOriginalUrl('');
      setAltText('');
      setCaption('');
      setBrand('');
      setAuthor('');
      setTagsInput('');
      setCurrency('');
      setImageWidth(undefined);
      setImageHeight(undefined);
      setFileSize(undefined);
      setFileFormat(undefined);
      setEditingProductId(null);

      // 2. Map and re-initialize with the imported or active product data objects
      const { id, data } = productForm;
      
      setEditingProductId(id);
      setTitle(data.title || '');
      setPrice(data.price || '');
      
      if (data.category) {
        setCategory(data.category as Category);
      }
      if (data.postType) {
        setPostType(data.postType);
      }
      setImage(data.image || '');
      setDescription(data.description || '');

      setOriginalUrl(data.originalUrl || data.referenceUrl || '');
      setAltText(data.altText || '');
      setCaption(data.caption || '');
      setBrand(data.brand || '');
      setAuthor(data.author || '');
      if (Array.isArray(data.tags)) {
        setTagsInput(data.tags.join(', '));
      } else if (typeof data.tags === 'string') {
        setTagsInput(data.tags);
      } else {
        setTagsInput('');
      }
      setCurrency(data.currency || '');
      setImageWidth(typeof data.width === 'number' ? data.width : undefined);
      setImageHeight(typeof data.height === 'number' ? data.height : undefined);
      setFileSize(data.fileSize || undefined);
      setFileFormat(data.fileFormat || undefined);
    }
  }, [productForm]);

  // Edit states
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Link import states
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState('');

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        throw new Error('Failed to retrieve products catalog');
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleVerifyPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    // Client-side local verification for staff passkey - prevents server-side connection errors completely!
    const correctPasskey = "adelakun";
    if (passkey === correctPasskey) {
      setIsAuthorized(true);
      setAuthError('');
      sessionStorage.setItem('gof_staff_token', correctPasskey);
    } else {
      setAuthError('Incorrect access key. Unauthorized.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email === 'pezzjoss@gmail.com') {
        setIsAuthorized(true);
        setAuthError('');
        sessionStorage.setItem('gof_staff_token', 'adelakun');
      } else {
        await signOut(auth);
        setAuthError('Unauthorized. Only the administrator account pezzjoss@gmail.com is allowed access.');
      }
    } catch (err: any) {
      console.error("Google Sign-In failed:", err);
      setAuthError(err.message || 'Google Sign-In failed.');
    }
  };

  // Check on mount if token is saved and valid or if logged in with Google
  useEffect(() => {
    const savedToken = sessionStorage.getItem('gof_staff_token');
    if (savedToken === 'adelakun') {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === 'pezzjoss@gmail.com') {
        setIsAuthorized(true);
        sessionStorage.setItem('gof_staff_token', 'adelakun');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchProducts();
    }
  }, [isAuthorized]);

  const handleCreateOrUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setSubmitError('Please provide an image URL for the showcase design.');
      return;
    }

    const finalTitle = title.trim() || 'Imported Design';

    // Format price cleanly
    let finalPrice = price.trim();
    if (finalPrice && !finalPrice.startsWith('₦') && !finalPrice.startsWith('$') && !finalPrice.startsWith('€')) {
      finalPrice = '₦' + finalPrice;
    }

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const productPayload = {
      title: finalTitle,
      price: finalPrice,
      category: category || 'Traditional & Classic Wear',
      postType: postType || 'Iro and Buba',
      image,
      description,
      referenceUrl: originalUrl || undefined,
      originalUrl: originalUrl || undefined,
      altText: altText || undefined,
      caption: caption || undefined,
      brand: brand || undefined,
      tags: parsedTags,
      currency: currency || undefined,
      width: imageWidth,
      height: imageHeight,
      fileSize: fileSize || undefined,
      fileFormat: fileFormat || undefined,
      author: author || undefined
    };

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const token = sessionStorage.getItem('gof_staff_token') || '';

      // 1. Direct write to Firestore if Google Admin
      const isGoogleAuth = auth.currentUser?.email === 'pezzjoss@gmail.com';
      let activeId = editingProductId;
      if (isGoogleAuth) {
        if (editingProductId) {
          await updateFirestoreProduct(editingProductId, productPayload);
        } else {
          activeId = await addFirestoreProduct(productPayload);
        }
      }

      // 2. Fallback / Synchronize to server local fallback JSON
      if (activeId) {
        const response = await fetch(`/api/products/${activeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(productPayload)
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to update style.');
        }
      } else {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify(productPayload)
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to submit style.');
        }
      }

      setSubmitSuccess(true);
      cancelEditProduct();
      await fetchProducts(); // reload admin products
      onProductAdded(); // Trigger reload of main catalog
    } catch (err: any) {
      console.error("Failed to save product:", err);
      setSubmitError(err.message || 'Failed to submit the style.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeImport = async (targetUrl: string) => {
    if (!targetUrl) {
      setImportError('Please enter a valid product or image link first.');
      return;
    }

    setIsImporting(true);
    setImportError('');
    setImportSuccess(false);

    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString();
    const attemptId = `imp-${Date.now()}`;

    try {
      const savedToken = sessionStorage.getItem('gof_staff_token') || '';
      let itemData: any = null;
      let isSuccess = false;
      let errorMessage = '';

      // Try server API first if available
      try {
        const response = await fetch('/api/import-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': savedToken
          },
          body: JSON.stringify({ url: targetUrl })
        });

        const contentType = response.headers.get('content-type') || '';
        if (response.ok && contentType.includes('application/json')) {
          const resJson = await response.json();
          if (resJson && resJson.success) {
            itemData = resJson.data;
            isSuccess = true;
          } else if (resJson && resJson.error) {
            errorMessage = resJson.error;
          }
        }
      } catch (e) {
        // Server fetch failed or not available (e.g. Netlify static SPA hosting)
      }

      // Fallback to client-side extraction if server API was unavailable or returned non-JSON
      if (!isSuccess) {
        try {
          const clientExtracted = await extractUrlMetadata(targetUrl);
          if (clientExtracted && (clientExtracted.image || clientExtracted.title)) {
            itemData = clientExtracted;
            isSuccess = true;
          }
        } catch (clientErr: any) {
          errorMessage = clientErr.message || 'Error extracting metadata from link.';
        }
      }

      if (isSuccess && itemData) {
        const item = itemData;

        // True source metadata - NO placeholder defaults!
        const importedTitle = item.title || '';
        const importedDesc = item.description || '';
        const importedImg = item.image || (isDirectImageUrl(targetUrl) ? targetUrl : '');
        const importedPrice = item.price || '';
        const importedOriginalUrl = item.originalUrl || targetUrl;
        const importedAltText = item.altText || '';
        const importedCaption = item.caption || '';
        const importedBrand = item.brand || '';
        const importedAuthor = item.author || '';
        const importedTags = Array.isArray(item.tags) ? item.tags : [];
        const importedCurrency = item.currency || '';
        const importedWidth = item.width;
        const importedHeight = item.height;
        const importedFileSize = item.fileSize;
        const importedFileFormat = item.fileFormat || '';

        // Directly populate form state fields with the extracted source metadata
        setTitle(importedTitle);
        setPrice(importedPrice);
        setImage(importedImg);
        setDescription(importedDesc);
        setOriginalUrl(importedOriginalUrl);
        setAltText(importedAltText);
        setCaption(importedCaption);
        setBrand(importedBrand);
        setAuthor(importedAuthor);
        setTagsInput(importedTags.join(', '));
        setCurrency(importedCurrency);
        setImageWidth(importedWidth);
        setImageHeight(importedHeight);
        setFileSize(importedFileSize);
        setFileFormat(importedFileFormat);
        if (item.category) {
          setCategory(item.category as Category);
        }

        // Populate dynamic preview component state for instant visual metadata display
        setFetchedPreview({
          title: importedTitle || 'Imported Design',
          description: importedDesc || 'No description provided by source page.',
          image: importedImg,
          price: importedPrice,
          brand: importedBrand,
          altText: importedAltText,
          caption: importedCaption,
          width: importedWidth,
          height: importedHeight,
          fileSize: importedFileSize,
          fileFormat: importedFileFormat,
          originalUrl: importedOriginalUrl,
          tags: importedTags,
          author: importedAuthor,
          currency: importedCurrency
        });

        setImportSuccess(true);
        setImportUrl('');

        // Record successful import attempt in history
        const newRecord: ImportHistoryItem = {
          id: attemptId,
          url: targetUrl,
          timestamp: timestampStr,
          status: 'success',
          title: importedTitle || 'Imported Design',
          image: importedImg
        };
        setImportHistory(prev => [newRecord, ...prev.filter(i => i.url !== targetUrl || i.status !== 'success')]);

        // Smoothly scroll the edit form into view so the user can immediately review/edit
        setTimeout(() => {
          const container = document.getElementById('product-form-container');
          if (container) {
            container.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        const errMessage = errorMessage || 'Failed to extract content from this URL. Please verify and try again.';
        setImportError(errMessage);

        const missingFields: string[] = [];
        if (errMessage.toLowerCase().includes('image')) missingFields.push('image');
        if (errMessage.toLowerCase().includes('title')) missingFields.push('title');
        if (errMessage.toLowerCase().includes('price')) missingFields.push('price');
        if (errMessage.toLowerCase().includes('category')) missingFields.push('category');
        if (missingFields.length === 0) missingFields.push('source metadata');

        // Record failed attempt in import history
        const newRecord: ImportHistoryItem = {
          id: attemptId,
          url: targetUrl,
          timestamp: timestampStr,
          status: 'failed',
          error: errMessage,
          missingFields
        };
        setImportHistory(prev => [newRecord, ...prev]);
      }
    } catch (err: any) {
      const errMessage = err.message || 'Error parsing product link.';
      setImportError(errMessage);

      const newRecord: ImportHistoryItem = {
        id: attemptId,
        url: targetUrl,
        timestamp: timestampStr,
        status: 'failed',
        error: errMessage,
        missingFields: ['network / connection']
      };
      setImportHistory(prev => [newRecord, ...prev]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeImport(importUrl);
  };

  const handleRetryImport = async (item: ImportHistoryItem) => {
    setImportUrl(item.url);
    const importerSection = document.getElementById('web-importer-section');
    if (importerSection) {
      importerSection.scrollIntoView({ behavior: 'smooth' });
    }
    await executeImport(item.url);
  };

  const startEditProduct = (prod: Product) => {
    // Populate form through our unified useEffect hook mapping
    setProductForm({
      id: prod.id,
      data: prod
    });

    // Scroll form into focus
    const container = document.getElementById('product-form-container');
    if (container) {
      container.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cancelEditProduct = () => {
    setProductForm(null);
    setEditingProductId(null);
    setTitle('');
    setPrice('');
    setCategory('Traditional & Classic Wear');
    setPostType('Iro and Buba');
    setImage('');
    setDescription('');
    setOriginalUrl('');
    setAltText('');
    setCaption('');
    setBrand('');
    setAuthor('');
    setTagsInput('');
    setCurrency('');
    setImageWidth(undefined);
    setImageHeight(undefined);
    setFileSize(undefined);
    setFileFormat(undefined);
    setFetchedPreview(null);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    // Open our sleek custom delete confirmation modal rather than relying on blocking window.confirm inside the iframe
    setDeleteConfirmId(id);
    setDeleteConfirmName(name);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmId) return;

    try {
      const token = sessionStorage.getItem('gof_staff_token') || '';

      const isGoogleAuth = auth.currentUser?.email === 'pezzjoss@gmail.com';
      if (isGoogleAuth) {
        await deleteFirestoreProduct(deleteConfirmId);
      }

      const response = await fetch(`/api/products/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete product via server API');
      }
      if (deleteConfirmId === editingProductId) {
        cancelEditProduct();
      }
      setDeleteConfirmId(null);
      setDeleteConfirmName('');
      await fetchProducts();
      onProductAdded();
    } catch (err) {
      setAdminAlertMessage('Failed to delete product.');
    }
  };

  const handleResetCatalog = () => {
    // Open our custom reset catalog confirmation modal
    setIsResetConfirmOpen(true);
  };

  const confirmResetCatalog = async () => {
    setIsResetConfirmOpen(false);
    try {
      const token = sessionStorage.getItem('gof_staff_token') || '';

      const isGoogleAuth = auth.currentUser?.email === 'pezzjoss@gmail.com';
      if (isGoogleAuth) {
        const currentProducts = await getFirestoreProducts();
        for (const prod of currentProducts) {
          await deleteFirestoreProduct(prod.id);
        }
        await seedDefaultProducts();
      }

      const response = await fetch('/api/products/reset', {
        method: 'POST',
        headers: {
          'Authorization': token
        }
      });
      if (!response.ok) {
        throw new Error('Failed to reset catalog via server API');
      }

      setResetSuccess(true);
      setEditingProductId(null);
      setProductForm(null);
      await fetchProducts();
      onProductAdded();
      setTimeout(() => setResetSuccess(false), 4000);
    } catch (err) {
      setAdminAlertMessage('Could not reset product catalog.');
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('gof_staff_token');
    setIsAuthorized(false);
    setPasskey('');
    await signOut(auth);
  };

  // Login View
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <button 
              type="button" 
              onClick={() => setShowSSO(!showSSO)}
              title="Staff Portal Security"
              aria-label="Staff Portal Security Toggle"
              className="w-14 h-14 rounded-none bg-[#D80064] p-0.5 flex items-center justify-center border border-white/20 shadow-lg cursor-pointer transition-transform hover:scale-105"
            >
              <div className="w-full h-full rounded-none bg-[#0A235C] flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            </button>
          </div>
          <h2 className="mt-6 text-center text-3xl font-serif font-black tracking-tight text-white">
            GO FASHION HOME
          </h2>
          <p className="mt-2 text-center text-xs font-mono uppercase tracking-widest text-[#D80064]">
            Private Staff Portal
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900 py-8 px-4 shadow-xl sm:rounded-none sm:px-10 border border-slate-800 space-y-6">
            <div className="text-center">
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                Enter your administrative staff key to access management portal
              </p>
            </div>

            {showSSO && (
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  aria-label="Sign in with Google account"
                  className="w-full flex justify-center items-center py-3 px-4 rounded-none text-xs font-bold uppercase tracking-wider text-white bg-[#0A235C] hover:bg-[#0A235C]/90 border border-white/10 transition-all cursor-pointer hover:scale-[1.01]"
                >
                  Sign in with Google
                </button>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleVerifyPasskey}>
              <div>
                <label htmlFor="passkey" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Enter Secure Access Key
                </label>
                <div className="relative">
                  <input
                    id="passkey"
                    name="passkey"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter Staff Passkey"
                    aria-label="Enter Staff Passkey"
                    className="appearance-none block w-full px-4 py-3 border border-slate-800 rounded-none bg-slate-950 placeholder-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-[#D80064] focus:border-transparent text-sm font-mono tracking-widest"
                  />
                </div>
              </div>

              {authError && (
                <div className="text-red-500 text-xs font-semibold bg-red-500/10 p-3 rounded-none border border-red-500/20">
                  {authError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  aria-label="Back to main website"
                  className="w-1/3 flex justify-center items-center py-3 px-4 border border-slate-800 rounded-none text-xs font-semibold uppercase text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                </button>
                <button
                  type="submit"
                  aria-label="Verify entrance passkey"
                  className="w-2/3 flex justify-center py-3 px-4 rounded-none text-xs font-bold uppercase tracking-wider text-white bg-[#D80064] hover:bg-[#D80064]/95 transition-all shadow-none hover:scale-102 cursor-pointer"
                >
                  Verify Entrance
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Portal View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-28 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 rounded-none border border-emerald-300 dark:border-emerald-800 flex items-center">
                <Unlock className="w-3 h-3 mr-1" /> Authorized Staff Session
              </span>
            </div>
            <h1 className="text-3xl font-serif font-black text-slate-950 dark:text-white tracking-tight mt-2 uppercase">
              Catalog Management Console
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add premium bespoke items, native designs, import items via web links, and manage your public showcase instantly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              aria-label="Sign out of staff portal"
              className="px-4 py-2 border border-slate-300 dark:border-slate-800 rounded-none text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={onNavigateHome}
              aria-label="Return to public website"
              className="px-4 py-2 bg-[#0A235C] text-white rounded-none text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
            >
              Return to Website
            </button>
          </div>
        </div>

        {/* TOP PANEL: IMPORT VIA LINK */}
        <div id="web-importer-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 mb-8 rounded-none shadow-none transition-colors duration-300">
          <div className="max-w-4xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A235C] dark:text-pink-500 mb-2 flex items-center font-mono">
              <Globe className="w-4 h-4 mr-2" /> Web Link Product Importer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Paste any product or portfolio URL (from Instagram, Shopify, Pinterest, Jumia, or other online directories). Our system will fetch and extract the Title, Description, Image URLs, and Pricing to populate the form below instantly. You can then edit details before publishing.
            </p>

            <form onSubmit={handleImportLink} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="url"
                  required
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="Paste product webpage URL (e.g. https://example-fashion.com/item)"
                  aria-label="Paste product webpage URL for import"
                  className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064] font-sans"
                />
              </div>
              <button
                type="submit"
                disabled={isImporting}
                aria-label="Import product from web link"
                className="px-6 py-3 bg-[#0A235C] text-white text-xs font-bold tracking-widest uppercase rounded-none hover:bg-[#0A235C]/90 transition-all cursor-pointer shrink-0 flex items-center justify-center min-w-[140px]"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <span>Import Link</span>
                )}
              </button>
            </form>

            {importError && (
              <div className="mt-3 text-red-600 bg-red-50 p-3 rounded-none border border-red-200 text-xs font-semibold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {importError}
              </div>
            )}

            {importSuccess && (
              <div className="mt-3 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-none border border-emerald-100 dark:border-emerald-800 text-xs font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                Success! Product details extracted and loaded into the editor below. Feel free to review and customize!
              </div>
            )}

            {/* Dynamic Fetched Image Metadata Preview Component */}
            {fetchedPreview && (
              <div className="mt-5 border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 p-5 rounded-none transition-all duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                      Extracted Source Metadata Preview
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFetchedPreview(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-none transition-colors cursor-pointer"
                    title="Dismiss preview"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {/* Thumbnail */}
                  {fetchedPreview.image ? (
                    <div className="w-full md:w-44 h-44 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 relative overflow-hidden group">
                      <img
                        src={fetchedPreview.image}
                        alt={fetchedPreview.altText || fetchedPreview.title || 'Fetched image preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {(fetchedPreview.width && fetchedPreview.height) ? (
                        <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[9px] font-mono font-semibold text-slate-200 px-1.5 py-0.5 text-center truncate">
                          {fetchedPreview.width} × {fetchedPreview.height} px
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="w-full md:w-44 h-44 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Details Column */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Title */}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">
                        Extracted Title
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {fetchedPreview.title || <span className="italic text-slate-400">No title extracted</span>}
                      </h4>
                    </div>

                    {/* Description */}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">
                        Extracted Description
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {fetchedPreview.description || <span className="italic text-slate-400">No description extracted</span>}
                      </p>
                    </div>

                    {/* Metadata Badges */}
                    <div className="pt-1 flex flex-wrap gap-1.5 text-[10px] font-mono font-semibold">
                      {fetchedPreview.price && (
                        <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 border border-emerald-300 dark:border-emerald-700">
                          Price: {fetchedPreview.price}
                        </span>
                      )}
                      {fetchedPreview.brand && (
                        <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                          Brand: {fetchedPreview.brand}
                        </span>
                      )}
                      {fetchedPreview.fileSize && (
                        <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                          Size: {fetchedPreview.fileSize}
                        </span>
                      )}
                      {fetchedPreview.fileFormat && (
                        <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                          Format: {fetchedPreview.fileFormat}
                        </span>
                      )}
                      {fetchedPreview.author && (
                        <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 border border-slate-200 dark:border-slate-800">
                          Credit: {fetchedPreview.author}
                        </span>
                      )}
                      {fetchedPreview.originalUrl && (
                        <a
                          href={fetchedPreview.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#0A235C] dark:text-pink-400 hover:underline bg-white dark:bg-slate-900 px-2 py-0.5 border border-slate-200 dark:border-slate-800"
                        >
                          <span>Source Link</span>
                          <ExternalLink className="w-2.5 h-2.5 ml-1" />
                        </a>
                      )}
                    </div>

                    {fetchedPreview.tags && fetchedPreview.tags.length > 0 && (
                      <div className="pt-0.5 flex flex-wrap gap-1">
                        {fetchedPreview.tags.slice(0, 8).map((tag, idx) => (
                          <span key={idx} className="text-[9px] font-mono bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 border border-slate-200 dark:border-slate-800">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DEDICATED IMPORT HISTORY & AUDIT LOG SECTION */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center">
                    <History className="w-4 h-4 mr-2 text-[#0A235C] dark:text-pink-500" />
                    Import Attempts & Audit History Log
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Review past URL import attempts, inspect missing fields or extraction errors, and retry failed extractions with one click.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {/* Filter Tabs */}
                  <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('all')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                        historyFilter === 'all'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      All ({importHistory.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('failed')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                        historyFilter === 'failed'
                          ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                    >
                      <span>Failed ({importHistory.filter(i => i.status === 'failed').length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('success')}
                      className={`px-2.5 py-1 text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                        historyFilter === 'success'
                          ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                    >
                      Success ({importHistory.filter(i => i.status === 'success').length})
                    </button>
                  </div>

                  {importHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setImportHistory([])}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Clear import log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* History Table */}
              {importHistory.filter(item => {
                if (historyFilter === 'failed') return item.status === 'failed';
                if (historyFilter === 'success') return item.status === 'success';
                return true;
              }).length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 p-5 text-center border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 font-mono">
                  No import records found for filter "{historyFilter}".
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Status</th>
                        <th className="p-3">Web Link / Source</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Encountered Errors & Missing Fields</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                      {importHistory
                        .filter(item => {
                          if (historyFilter === 'failed') return item.status === 'failed';
                          if (historyFilter === 'success') return item.status === 'success';
                          return true;
                        })
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                            {/* Status Badge */}
                            <td className="p-3 align-top whitespace-nowrap">
                              {item.status === 'success' ? (
                                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                                  Success
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
                                  <XCircle className="w-3 h-3 mr-1 text-red-600 dark:text-red-400" />
                                  Failed
                                </span>
                              )}
                            </td>

                            {/* Web Link */}
                            <td className="p-3 align-top max-w-[260px]">
                              <div className="truncate font-mono text-xs text-slate-800 dark:text-slate-200 font-medium" title={item.url}>
                                {item.url}
                              </div>
                              {item.title && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-sans">
                                  {item.title}
                                </div>
                              )}
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-[10px] text-[#0A235C] dark:text-pink-400 hover:underline mt-1 font-mono"
                              >
                                <span>Source Page</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-1" />
                              </a>
                            </td>

                            {/* Timestamp */}
                            <td className="p-3 align-top whitespace-nowrap text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              {item.timestamp}
                            </td>

                            {/* Error Details / Missing Fields */}
                            <td className="p-3 align-top">
                              {item.status === 'failed' ? (
                                <div className="space-y-1.5">
                                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 leading-snug">
                                    {item.error || 'Extraction failed'}
                                  </p>
                                  {item.missingFields && item.missingFields.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1">
                                      <span className="text-[10px] text-slate-400 font-mono">Missing:</span>
                                      {item.missingFields.map((field, idx) => (
                                        <span
                                          key={idx}
                                          className="text-[9px] font-mono bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 px-1.5 py-0.5 border border-red-200 dark:border-red-800 uppercase"
                                        >
                                          {field}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                                  Extracted successfully and loaded into form.
                                </span>
                              )}
                            </td>

                            {/* Retry Action */}
                            <td className="p-3 align-top text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleRetryImport(item)}
                                disabled={isImporting}
                                className="px-3 py-1.5 bg-[#0A235C] dark:bg-pink-600 text-white text-[10px] font-mono font-bold tracking-wider uppercase hover:bg-[#0A235C]/90 dark:hover:bg-pink-700 transition-all cursor-pointer inline-flex items-center space-x-1 border border-transparent disabled:opacity-50"
                                title="Retry extraction for this URL"
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                <span>Retry</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Main Upload / Edit Form */}
          <div id="product-form-container" className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-none border border-slate-200 dark:border-slate-800 shadow-none scroll-mt-24 transition-colors duration-300">
            <h2 className="text-xl font-serif font-black uppercase text-slate-950 dark:text-white mb-6 flex items-center">
              {editingProductId ? (
                <>
                  <Edit2 className="w-5 h-5 mr-2 text-[#D80064]" /> Modify Product Detail <span className="ml-2 text-xs font-mono font-normal lowercase text-slate-500 dark:text-slate-400">(Edit Mode)</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 mr-2 text-[#D80064]" /> Publish New Collection Item
                </>
              )}
            </h2>

            <form onSubmit={handleCreateOrUpdateProduct} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 font-mono">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Royal Emerald Agbada"
                    className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064]"
                  />
                </div>

                {/* Price (Naira sign is protected) */}
                <div>
                  <label htmlFor="price" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 font-mono">
                    Pricing *
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-4 bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold font-mono">
                      ₦
                    </span>
                    <input
                      type="text"
                      id="price"
                      required
                      value={price.replace(/^₦/, '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPrice('₦' + val);
                      }}
                      placeholder="145,000"
                      className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064]"
                    />
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 font-mono">
                    Main Category *
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as Category;
                      setCategory(newCat);
                      if (newCat !== 'All') {
                        const types = CATEGORY_MAP[newCat];
                        if (types && types.length > 0) {
                          setPostType(types[0]);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064]"
                  >
                    <option value="Traditional & Classic Wear">Traditional & Classic Wear</option>
                    <option value="Structured & Statement Dresses">Structured & Statement Dresses</option>
                    <option value="Casual & Easy Wear">Casual & Easy Wear</option>
                    <option value="Corporate & Office Wear">Corporate & Office Wear</option>
                  </select>
                </div>

                {/* Outfit Type / Post Type Selection */}
                <div>
                  <label htmlFor="postType" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 font-mono">
                    Post Type (Specific Outfit) *
                  </label>
                  <select
                    id="postType"
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064]"
                  >
                    {category !== 'All' && CATEGORY_MAP[category]?.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                {/* Image Input with Live Preview */}
                <div>
                  <label htmlFor="image" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 font-mono flex justify-between items-center">
                    <span>Image Link (URL) *</span>
                    {image && (
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 border border-emerald-200 dark:border-emerald-800">
                        Image Loaded
                      </span>
                    )}
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-grow">
                      <input
                        type="text"
                        id="image"
                        required
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Paste premium image URL or pick preset below"
                        className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064]"
                      />
                    </div>
                    {image && (
                      <div className="w-12 h-12 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden shrink-0 relative group">
                        <LazyImage 
                          src={image} 
                          alt="Live catalog preview" 
                          id="admin-form-live-preview"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 font-mono">
                  Detailed Item Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the materials, fabric counts, hand embroidery density, and customization timelines..."
                  className="w-full px-4 py-3 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0A235C] dark:focus:ring-[#D80064]"
                />
              </div>

              {/* Extended Source & Image Metadata Controls */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-[#D80064]" /> Source & Image Metadata
                  </h3>
                  {(imageWidth || imageHeight || fileSize || fileFormat || currency) && (
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                      {imageWidth && imageHeight && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700">
                          {imageWidth} × {imageHeight} px
                        </span>
                      )}
                      {fileSize && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700">
                          {fileSize}
                        </span>
                      )}
                      {fileFormat && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700">
                          {fileFormat}
                        </span>
                      )}
                      {currency && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700">
                          Currency: {currency}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Alt Text */}
                  <div>
                    <label htmlFor="altText" className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Alt Text (SEO & Accessibility)
                    </label>
                    <input
                      type="text"
                      id="altText"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      placeholder="Extracted image alt description"
                      className="w-full px-3 py-2 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0A235C]"
                    />
                  </div>

                  {/* Caption */}
                  <div>
                    <label htmlFor="caption" className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Image Caption / Credit
                    </label>
                    <input
                      type="text"
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Original image caption"
                      className="w-full px-3 py-2 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0A235C]"
                    />
                  </div>

                  {/* Brand / Designer */}
                  <div>
                    <label htmlFor="brand" className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Brand / Manufacturer / Designer
                    </label>
                    <input
                      type="text"
                      id="brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Brand or designer name"
                      className="w-full px-3 py-2 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0A235C]"
                    />
                  </div>

                  {/* Author / Photographer */}
                  <div>
                    <label htmlFor="author" className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Author / Photographer / Copyright
                    </label>
                    <input
                      type="text"
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Author or creator name"
                      className="w-full px-3 py-2 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0A235C]"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="tagsInput" className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Tags / Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      id="tagsInput"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="fashion, bespoke, silk, luxury"
                      className="w-full px-3 py-2 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0A235C]"
                    />
                  </div>

                  {/* Original Source Link */}
                  <div>
                    <label htmlFor="originalUrl" className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                      Original Source Link / Web URL
                    </label>
                    <input
                      type="url"
                      id="originalUrl"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      placeholder="https://true-source-domain.com/path"
                      className="w-full px-3 py-2 rounded-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0A235C]"
                    />
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="text-red-600 bg-red-50 p-4 rounded-none border border-red-200 text-xs font-semibold">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="text-emerald-700 bg-emerald-50 p-4 rounded-none border border-emerald-100 text-xs font-semibold flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-600 shrink-0" />
                  Item {editingProductId ? 'updated' : 'uploaded'} and broadcasted successfully to the public catalog.
                </div>
              )}

              <div className="flex gap-4">
                {editingProductId && (
                  <button
                    type="button"
                    onClick={cancelEditProduct}
                    aria-label="Cancel editing product"
                    className="px-6 py-3.5 bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-label={editingProductId ? 'Save and update item' : 'Publish to live catalog'}
                  className="flex-grow bg-[#D80064] text-white py-3.5 px-4 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-[#D80064]/90 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{editingProductId ? 'Saving Changes...' : 'Publishing Creation...'}</span>
                    </>
                  ) : (
                    <>
                      {editingProductId ? <Edit2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                      <span>{editingProductId ? 'Save & Update Item' : 'Publish to Live Catalog'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right column: presets and controls */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Quick Presets */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-none border border-slate-200 dark:border-slate-800 shadow-none transition-colors duration-300">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center font-mono">
                <ImageIcon className="w-4 h-4 mr-2 text-[#0A235C] dark:text-pink-500" /> Fashion Preset Assets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                Click any thumbnail preset to instantly populate the Image Link with high-definition Unsplash photography curated for "GO Fashion Home."
              </p>

              <div className="grid grid-cols-2 gap-3">
                {PRESET_IMAGES.map((preset) => {
                  const isSelected = image === preset.url;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => setImage(preset.url)}
                      type="button"
                      aria-label={`Select ${preset.name} image preset`}
                      className={`group relative aspect-video rounded-none overflow-hidden border transition-all text-left bg-slate-50 dark:bg-slate-950 cursor-pointer ${
                        isSelected 
                          ? 'border-[#D80064] ring-2 ring-[#D80064]/50 scale-[1.02]' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-[#D80064] dark:hover:border-[#D80064]'
                      }`}
                    >
                      <LazyImage 
                        src={preset.url} 
                        alt={preset.name} 
                        id={`admin-preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-2 z-10">
                        <div className="flex justify-end">
                          {isSelected && (
                            <span className="text-[8px] font-mono font-bold tracking-widest text-white bg-[#D80064] px-1.5 py-0.5 uppercase shadow-sm">
                              Selected
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-white truncate w-full">{preset.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog Control/Reset */}
            <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-none border border-rose-200 dark:border-rose-900/40 shadow-none text-left transition-colors duration-300">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-950 dark:text-rose-400 flex items-center mb-2 font-mono">
                <Trash2 className="w-4 h-4 mr-2 text-rose-700 dark:text-rose-500" /> Administrative Controls
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed mb-4">
                Need to wipe custom changes or restore the catalog back to the official pre-seeded collections? Click below to restore.
              </p>
              
              {resetSuccess && (
                <div className="text-emerald-700 bg-emerald-50 p-3 rounded-none text-xs font-semibold mb-3 border border-emerald-200">
                  Catalog reset completed successfully.
                </div>
              )}

              <button
                onClick={handleResetCatalog}
                aria-label="Reset product catalog to factory seed"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-none text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-none"
              >
                Reset Catalog to Factory Seed
              </button>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: INVENTORY AND PRODUCT EDITING LIST */}
        <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-none shadow-none transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-serif font-black uppercase text-slate-950 dark:text-white">
                Active Product Inventory ({products.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select any active catalog item below to edit its contents or remove it permanently from the public website.
              </p>
            </div>
            {isLoadingProducts && (
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Refreshed...
              </div>
            )}
          </div>

          {isLoadingProducts && products.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 font-mono">
              Loading inventory system...
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No products found. Use the form above or reset to default seeds.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Preview</th>
                    <th className="py-3 px-4 font-bold">Title</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Type</th>
                    <th className="py-3 px-4 font-bold">Price</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {products.map((prod) => (
                    <tr 
                      key={prod.id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors ${editingProductId === prod.id ? 'bg-[#D80064]/5 dark:bg-[#D80064]/10 font-semibold' : ''}`}
                    >
                      {/* Image Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden">
                          <LazyImage 
                            src={prod.image} 
                            alt={prod.title} 
                            id={`admin-inventory-thumb-${prod.id}`}
                          />
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-sans text-slate-900 dark:text-white max-w-xs">
                        <div className="font-bold">{prod.title}</div>
                        {prod.description && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">{prod.description}</div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                        {prod.category}
                      </td>

                      {/* Outfit Type */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {prod.postType || 'N/A'}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {prod.price}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`edit-prod-${prod.id}`}
                            onClick={() => startEditProduct(prod)}
                            aria-label={`Edit ${prod.title}`}
                            className="p-1.5 hover:bg-[#0A235C] hover:text-white border border-slate-200 dark:border-slate-800 hover:border-transparent text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`del-prod-${prod.id}`}
                            onClick={() => handleDeleteProduct(prod.id, prod.title)}
                            aria-label={`Delete ${prod.title}`}
                            className="p-1.5 hover:bg-rose-600 hover:text-white border border-slate-200 dark:border-slate-800 hover:border-transparent text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Sleek Custom Modals to bypass window.confirm and window.alert restrictions in iFrame */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left">
            <h3 className="text-base font-serif font-black uppercase text-slate-950 dark:text-white flex items-center mb-2">
              Confirm Delete Style
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteConfirmName}"</span> from the catalog? This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName('');
                }}
                aria-label="Cancel product deletion"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                aria-label="Confirm product deletion"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left">
            <h3 className="text-base font-serif font-black uppercase text-slate-950 dark:text-white flex items-center mb-2">
              Confirm Catalog Reset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Are you sure you want to reset the entire catalog back to the pre-seeded luxury collections? All custom-created items will be permanently archived.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                aria-label="Cancel catalog reset"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetCatalog}
                aria-label="Confirm catalog reset to seed data"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Yes, Restore Seeds
              </button>
            </div>
          </div>
        </div>
      )}

      {adminAlertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-left">
            <h3 className="text-base font-serif font-black uppercase text-rose-600 flex items-center mb-2">
              Staff Portal System Alert
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              {adminAlertMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setAdminAlertMessage(null)}
                aria-label="Close notification alert"
                className="px-5 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Notification
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
