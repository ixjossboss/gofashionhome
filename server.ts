import express from "express";
import path from "path";
import fs from "fs";
import compression from "compression";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { extractUrlMetadata } from "./src/lib/metadataExtractor";

// Initialize Firebase Web SDK for server-side public reads
let db: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    console.log("Firebase Web SDK initialized successfully on server for public reads.");
  } else {
    console.warn("firebase-applet-config.json not found. Falling back to local data.");
  }
} catch (err) {
  console.warn("Could not initialize Firebase Web SDK on server. Falling back to local data:", err);
}

interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  postType?: string;
  image: string;
  description?: string;
  referenceUrl?: string;
  createdAt: string;

  // Comprehensive metadata properties
  originalUrl?: string;
  altText?: string;
  caption?: string;
  brand?: string;
  tags?: string[];
  currency?: string;
  width?: number;
  height?: number;
  fileSize?: string;
  fileFormat?: string;
  author?: string;
}

const DEFAULT_PRODUCTS: Product[] = [
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

const PRODUCTS_FILE = path.join(process.cwd(), "data", "products.json");

// Ensure data directory and products file exist
function initProductsFile() {
  const dir = path.dirname(PRODUCTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), "utf-8");
  }
}

function readProducts(): Product[] {
  try {
    initProductsFile();
    const content = fs.readFileSync(PRODUCTS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading products:", err);
    return DEFAULT_PRODUCTS;
  }
}

function writeProducts(products: Product[]) {
  try {
    initProductsFile();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving products:", err);
  }
}

async function getProductsFromFirestoreOrLocal(): Promise<Product[]> {
  if (db) {
    try {
      const productsRef = collection(db, "products");
      const q = query(productsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const products: Product[] = [];
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          const createdAtVal = data.createdAt;
          let createdAtStr = new Date().toISOString();
          if (createdAtVal) {
            if (typeof createdAtVal.toDate === 'function') {
              createdAtStr = createdAtVal.toDate().toISOString();
            } else if (createdAtVal.seconds) {
              createdAtStr = new Date(createdAtVal.seconds * 1000).toISOString();
            } else {
              createdAtStr = new Date(createdAtVal).toISOString();
            }
          }
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
            createdAt: createdAtStr,
          });
        });
        return products;
      }
    } catch (err) {
      console.warn("Firestore Web SDK read failed, falling back to local file:", err);
    }
  }
  return readProducts();
}

async function saveProductToFirestoreOrLocal(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const id = `prod-${Date.now()}`;
  const slug = productData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const referenceUrl = `https://gofashionhome.com/products/${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
  const createdAt = new Date().toISOString();

  const newProduct: Product = {
    id,
    ...productData,
    referenceUrl,
    createdAt
  };

  const localProducts = readProducts();
  localProducts.push(newProduct);
  writeProducts(localProducts);

  return newProduct;
}

async function updateProductInFirestoreOrLocal(id: string, productData: Partial<Product>): Promise<Product> {
  const localProducts = readProducts();
  const idx = localProducts.findIndex(p => p.id === id);

  if (idx !== -1) {
    localProducts[idx] = {
      ...localProducts[idx],
      ...productData
    };
    writeProducts(localProducts);
    return localProducts[idx];
  } else {
    // Upsert: Create entry in local storage if missing (e.g. product created or updated in Firestore)
    const slug = (productData.title || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const referenceUrl = `https://gofashionhome.com/products/${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProduct: Product = {
      id,
      title: productData.title || "",
      price: productData.price || "",
      category: productData.category || "Traditional & Classic Wear",
      postType: productData.postType || "",
      image: productData.image || "",
      description: productData.description || "",
      referenceUrl,
      createdAt: new Date().toISOString(),
      ...productData
    };
    localProducts.push(newProduct);
    writeProducts(localProducts);
    return newProduct;
  }
}

async function deleteProductFromFirestoreOrLocal(id: string): Promise<boolean> {
  const localProducts = readProducts();
  const filtered = localProducts.filter(p => p.id !== id);
  if (localProducts.length !== filtered.length) {
    writeProducts(filtered);
  }
  return true;
}

async function resetProductsInFirestoreOrLocal(): Promise<void> {
  writeProducts(DEFAULT_PRODUCTS);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Compression middleware for high throughput and reduced network payload size
  app.use(compression());

  // Middleware
  app.use(express.json({ limit: "10mb" }));

  // API - Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await getProductsFromFirestoreOrLocal();
      res.json(products);
    } catch (err) {
      console.error("Error getting products:", err);
      res.status(500).json({ error: "Could not retrieve products catalog" });
    }
  });

  // API - Verify administrative passkey (hides secret passkey from public code)
  app.post("/api/verify-passkey", (req, res) => {
    const { passkey } = req.body;
    const correctPasskey = "adelakun";
    if (passkey === correctPasskey) {
      return res.json({ success: true, token: correctPasskey });
    }
    return res.status(401).json({ error: "Incorrect access key. Unauthorized." });
  });

  // API - Add a product
  app.post("/api/products", async (req, res) => {
    const authHeader = req.headers.authorization;
    const passkey = "adelakun";

    if (!authHeader || authHeader !== passkey) {
      return res.status(401).json({ error: "Unauthorized access key. Please verify credentials." });
    }

    const { 
      title, price, category, postType, image, description, referenceUrl,
      originalUrl, altText, caption, brand, tags, currency, width, height,
      fileSize, fileFormat, author 
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Missing required product image." });
    }

    try {
      const newProduct = await saveProductToFirestoreOrLocal({
        title: title || "Imported Fashion Design",
        price: price || "",
        category: category || "Traditional & Classic Wear",
        postType: postType || "Iro and Buba",
        image,
        description: description || "",
        referenceUrl: referenceUrl || "",
        originalUrl: originalUrl || "",
        altText: altText || "",
        caption: caption || "",
        brand: brand || "",
        tags: Array.isArray(tags) ? tags : [],
        currency: currency || "",
        width: typeof width === "number" ? width : undefined,
        height: typeof height === "number" ? height : undefined,
        fileSize: fileSize || undefined,
        fileFormat: fileFormat || "",
        author: author || ""
      });
      res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
      console.error("Error creating product:", err);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // API - Edit a product
  app.put("/api/products/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    const passkey = "adelakun";

    if (!authHeader || authHeader !== passkey) {
      return res.status(401).json({ error: "Unauthorized access key. Please verify credentials." });
    }

    const { id } = req.params;
    const { 
      title, price, category, postType, image, description, referenceUrl,
      originalUrl, altText, caption, brand, tags, currency, width, height,
      fileSize, fileFormat, author 
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Missing required product image." });
    }

    try {
      const updated = await updateProductInFirestoreOrLocal(id, {
        title: title || "Imported Fashion Design",
        price: price || "",
        category: category || "Traditional & Classic Wear",
        postType: postType || "Iro and Buba",
        image,
        description: description || "",
        referenceUrl: referenceUrl || "",
        originalUrl: originalUrl || "",
        altText: altText || "",
        caption: caption || "",
        brand: brand || "",
        tags: Array.isArray(tags) ? tags : [],
        currency: currency || "",
        width: typeof width === "number" ? width : undefined,
        height: typeof height === "number" ? height : undefined,
        fileSize: fileSize || undefined,
        fileFormat: fileFormat || "",
        author: author || ""
      });
      res.json({ success: true, product: updated });
    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // API - Delete a product
  app.delete("/api/products/:id", async (req, res) => {
    const authHeader = req.headers.authorization;
    const passkey = "adelakun";

    if (!authHeader || authHeader !== passkey) {
      return res.status(401).json({ error: "Unauthorized access key. Please verify credentials." });
    }

    const { id } = req.params;
    try {
      const deleted = await deleteProductFromFirestoreOrLocal(id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found." });
      }
      res.json({ success: true, message: "Product deleted successfully." });
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // API - Import product details from external link
  app.post("/api/import-link", async (req, res) => {
    const authHeader = req.headers.authorization;
    const passkey = "adelakun";

    if (!authHeader || authHeader !== passkey) {
      return res.status(401).json({ error: "Unauthorized access key. Please verify credentials." });
    }

    let { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing URL to import." });
    }

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return res.status(400).json({ error: "Invalid protocol. Only HTTP and HTTPS URLs are allowed." });
      }
      const hostname = parsedUrl.hostname.toLowerCase();
      
      // Prevent SSRF to localhost, private/local IPs, loopbacks, or cloud metadata services
      const isInternal = 
        hostname === "localhost" || 
        hostname === "127.0.0.1" || 
        hostname === "0.0.0.0" || 
        hostname === "[::1]" ||
        hostname.startsWith("169.254.") || 
        hostname.startsWith("10.") || 
        hostname.startsWith("192.168.") ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

      if (isInternal) {
        return res.status(400).json({ error: "Access to internal network or metadata services is strictly forbidden." });
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid URL format." });
    }

    try {
      const extractedMetadata = await extractUrlMetadata(parsedUrl.href);
      res.json({
        success: true,
        data: extractedMetadata
      });
    } catch (err: any) {
      console.error("Error importing product link:", err);
      res.status(500).json({ error: `Could not parse product details: ${err.message}` });
    }
  });

  // Reset API for staff portal convenience
  app.post("/api/products/reset", async (req, res) => {
    const authHeader = req.headers.authorization;
    const passkey = "adelakun";

    if (!authHeader || authHeader !== passkey) {
      return res.status(401).json({ error: "Unauthorized access key." });
    }

    try {
      await resetProductsInFirestoreOrLocal();
      res.json({ success: true, message: "Products reset to default luxury set." });
    } catch (err: any) {
      console.error("Error resetting catalog:", err);
      res.status(500).json({ error: "Failed to reset product catalog" });
    }
  });

  // API - Get sitemap.xml dynamically
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const products = await getProductsFromFirestoreOrLocal();
      const currentDate = new Date().toISOString().split("T")[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

      // 1. Core Pages/Sections
      const mainUrls = [
        { loc: "https://gofashionhome.com/", changefreq: "daily", priority: "1.0" },
        { loc: "https://gofashionhome.com/#catalog", changefreq: "daily", priority: "0.9" },
        { loc: "https://gofashionhome.com/#guides", changefreq: "weekly", priority: "0.8" },
        { loc: "https://gofashionhome.com/#locator", changefreq: "monthly", priority: "0.7" },
      ];

      mainUrls.forEach(url => {
        xml += `  <url>\n`;
        xml += `    <loc>${url.loc}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
        xml += `    <priority>${url.priority}</priority>\n`;
        xml += `  </url>\n`;
      });

      // 2. Tailoring Guides
      const guides = [
        "fabric-body-type",
        "caring-traditional-attire"
      ];

      guides.forEach(guideId => {
        xml += `  <url>\n`;
        xml += `    <loc>https://gofashionhome.com/guides/${guideId}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      // 3. Dynamic Products
      products.forEach(prod => {
        const loc = prod.referenceUrl || `https://gofashionhome.com/products/prod-${prod.id}`;
        // Escape special XML characters in URL
        const cleanLoc = loc
          .replace(/&/g, "&amp;")
          .replace(/'/g, "&apos;")
          .replace(/"/g, "&quot;")
          .replace(/>/g, "&gt;")
          .replace(/</g, "&lt;");
        xml += `  <url>\n`;
        xml += `    <loc>${cleanLoc}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>`;

      res.header("Content-Type", "application/xml");
      res.status(200).send(xml);
    } catch (error) {
      console.error("Error generating dynamic sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      maxAge: "1d",
      etag: true,
      lastModified: true
    }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GO Fashion Home server active on port ${PORT}`);
  });
}

startServer();
