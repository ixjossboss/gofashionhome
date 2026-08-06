export interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  postType?: string;
  image: string;
  description?: string;
  referenceUrl?: string;
  createdAt: string;

  // Comprehensive image and product source metadata
  originalUrl?: string;      // Original source web link or direct image URL
  altText?: string;          // Alt text for accessibility and SEO
  caption?: string;          // Image caption or credit summary
  brand?: string;            // Brand, designer, or manufacturer name
  tags?: string[];           // Product tags/keywords array
  currency?: string;         // Original price currency (e.g., NGN, USD, EUR)
  width?: number;            // Image intrinsic width in pixels
  height?: number;           // Image intrinsic height in pixels
  fileSize?: number | string; // File size in bytes or formatted string (e.g. "340 KB")
  fileFormat?: string;       // Image MIME type or file format (e.g. "image/jpeg", "image/png", "webp")
  author?: string;           // Original author, photographer, or copyright holder
}

export type Category = 'All' | 'Traditional & Classic Wear' | 'Structured & Statement Dresses' | 'Casual & Easy Wear' | 'Corporate & Office Wear';

// Register Google Maps Custom Web Components with TypeScript's JSX engine
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-api-loader': any;
      'gmpx-store-locator': any;
    }
  }
}
