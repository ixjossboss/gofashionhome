import imageSize from 'image-size';

export interface ExtractedImageMetadata {
  originalUrl: string;
  title: string;
  description: string;
  image: string;
  altText: string;
  caption: string;
  brand: string;
  category: string;
  tags: string[];
  price: string;
  currency: string;
  width?: number;
  height?: number;
  fileSize?: string;
  fileFormat?: string;
  author: string;
}

/**
 * Helper to format raw byte count into human-readable string (e.g. "340 KB", "1.2 MB")
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Safely decodes standard HTML entities in strings.
 */
function decodeEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Robustly checks if a URL is a direct image asset.
 */
export function isDirectImageUrl(inputUrl: string): boolean {
  if (!inputUrl) return false;
  try {
    const parsed = new URL(inputUrl);
    const pathname = parsed.pathname.toLowerCase();
    const search = parsed.search.toLowerCase();
    const host = parsed.hostname.toLowerCase();

    if (/\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i.test(pathname)) return true;
    if (search.includes('image') || search.includes('img=') || search.includes('photo')) return true;
    if (host.startsWith('img.') || host.includes('images.') || host.includes('cdn.')) {
      if (pathname.length > 4 && !pathname.endsWith('.html') && !pathname.endsWith('.php') && !pathname.endsWith('.asp')) {
        return true;
      }
    }
  } catch (e) {
    if (/\.(jpe?g|png|webp|gif|avif|svg)/i.test(inputUrl)) return true;
  }
  return false;
}

/**
 * Extracts comprehensive product and image metadata from any external web page or direct image URL.
 */
export async function extractUrlMetadata(inputUrl: string): Promise<ExtractedImageMetadata> {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return {
      originalUrl: url,
      title: 'Fashion Import Design',
      description: 'Extracted fashion item from source URL.',
      image: url,
      altText: 'Fashion design',
      caption: '',
      brand: 'GO Fashion Home Atelier',
      category: 'Traditional & Classic Wear',
      tags: ['fashion', 'bespoke', 'luxury'],
      price: '',
      currency: '',
      author: ''
    };
  }

  // Result structure (initially blank - no fake placeholder values)
  const metadata: ExtractedImageMetadata = {
    originalUrl: parsedUrl.href,
    title: '',
    description: '',
    image: '',
    altText: '',
    caption: '',
    brand: '',
    category: '',
    tags: [],
    price: '',
    currency: '',
    width: undefined,
    height: undefined,
    fileSize: undefined,
    fileFormat: '',
    author: ''
  };

  const isDirectImage = isDirectImageUrl(parsedUrl.href);

  if (isDirectImage) {
    metadata.image = parsedUrl.href;
    
    // Derive clean title and alt text from filename if possible
    const filename = parsedUrl.pathname.split('/').pop() || '';
    const cleanFilename = decodeURIComponent(filename.replace(/\.(jpe?g|png|webp|gif|avif|svg).*/i, ''))
      .replace(/[-_]+/g, ' ')
      .trim();

    if (cleanFilename && cleanFilename.length > 2 && !/^[a-z0-9]+$/i.test(cleanFilename)) {
      const titleCandidate = cleanFilename
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      metadata.title = titleCandidate;
      metadata.altText = titleCandidate;
    } else {
      metadata.title = 'Custom Fashion Design Import';
      metadata.altText = 'Bespoke fashion attire';
    }

    metadata.description = 'Luxury bespoke fashion design imported from source link.';
    metadata.brand = 'GO Fashion Home Atelier';
    metadata.category = 'Traditional & Classic Wear';
    metadata.tags = ['fashion', 'bespoke', 'tailoring'];

    // Inspect image metadata in a browser/node safe manner
    await inspectImageMetadata(parsedUrl.href, metadata);
    return metadata;
  }

  // Fetch HTML webpage
  try {
    const response = await fetch(parsedUrl.href, {
      redirect: 'follow',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    // If server responded with an image content-type despite URL structure
    if (contentType.startsWith('image/')) {
      metadata.image = parsedUrl.href;
      metadata.title = 'Custom Fashion Design Import';
      metadata.altText = 'Bespoke fashion attire';
      metadata.description = 'Luxury bespoke fashion design imported from source link.';
      metadata.brand = 'GO Fashion Home Atelier';
      metadata.category = 'Traditional & Classic Wear';
      metadata.tags = ['fashion', 'bespoke', 'tailoring'];
      await inspectImageMetadata(parsedUrl.href, metadata);
      return metadata;
    }

    const html = await response.text();

    // Meta extraction helpers
    const getMeta = (property: string): string => {
      const regex = new RegExp(`<meta[^>]*(?:property|name|itemprop)=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
      const match = html.match(regex);
      if (match) return decodeEntities(match[1]);
      
      const revRegex = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${property}["']`, 'i');
      const revMatch = html.match(revRegex);
      return revMatch ? decodeEntities(revMatch[1]) : '';
    };

    // 1. JSON-LD Structured Data Parsing
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const rawJson = jsonLdMatch[1].trim();
        const data = JSON.parse(rawJson);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          if (!item) continue;
          const itemType = String(item['@type'] || '');

          if (itemType.includes('Product') || itemType.includes('ImageObject') || itemType.includes('Article') || itemType.includes('WebPage')) {
            if (!metadata.title && item.name) metadata.title = decodeEntities(String(item.name));
            if (!metadata.title && item.headline) metadata.title = decodeEntities(String(item.headline));
            if (!metadata.description && item.description) metadata.description = decodeEntities(String(item.description));
            
            if (!metadata.image) {
              if (typeof item.image === 'string') {
                metadata.image = item.image;
              } else if (Array.isArray(item.image) && item.image[0]) {
                const img = item.image[0];
                metadata.image = typeof img === 'string' ? img : img.url || '';
              } else if (typeof item.image === 'object' && item.image.url) {
                metadata.image = item.image.url;
              }
            }

            if (!metadata.brand) {
              if (typeof item.brand === 'string') metadata.brand = decodeEntities(item.brand);
              else if (item.brand?.name) metadata.brand = decodeEntities(String(item.brand.name));
            }

            if (!metadata.price && item.offers) {
              const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              if (offer) {
                if (offer.price !== undefined) metadata.price = String(offer.price);
                if (offer.priceCurrency) metadata.currency = String(offer.priceCurrency);
              }
            }
          }
        }
      } catch (e) {
        // Ignore JSON-LD parse errors
      }
    }

    // 2. OpenGraph & Meta Tag Fallbacks
    if (!metadata.title) {
      metadata.title = getMeta('og:title') || getMeta('twitter:title');
      if (!metadata.title) {
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch) metadata.title = decodeEntities(titleMatch[1]);
      }
    }

    if (!metadata.description) {
      metadata.description = getMeta('og:description') || getMeta('twitter:description') || getMeta('description');
    }

    if (!metadata.image) {
      metadata.image = getMeta('og:image') || getMeta('twitter:image') || getMeta('og:image:secure_url');
    }

    if (!metadata.altText) {
      metadata.altText = getMeta('og:image:alt') || getMeta('twitter:image:alt');
    }

    if (!metadata.brand) {
      metadata.brand = getMeta('product:brand') || getMeta('brand') || getMeta('og:brand');
    }

    if (!metadata.price) {
      const rawPrice = getMeta('product:price:amount') || getMeta('og:price:amount');
      if (rawPrice) metadata.price = rawPrice;
    }

    // Resolve relative image URL against origin
    if (metadata.image) {
      try {
        metadata.image = new URL(metadata.image, parsedUrl.href).href;
      } catch (e) {
        // Keep as is
      }
      await inspectImageMetadata(metadata.image, metadata);
    }

  } catch (err) {
    console.warn('Webpage fetch in client mode limited by CORS or network, using fallback metadata:', err);
    // If input URL is image-like or direct link, ensure image field is set
    if (!metadata.image) {
      metadata.image = parsedUrl.href;
    }
    if (!metadata.title) {
      metadata.title = 'Imported Fashion Item';
    }
    if (!metadata.description) {
      metadata.description = 'Custom fashion design imported from external link.';
    }
  }

  return metadata;
}

/**
 * Safely inspects image metadata in both Browser and Server environments without throwing exceptions.
 */
async function inspectImageMetadata(imageUrl: string, metadata: ExtractedImageMetadata): Promise<void> {
  if (typeof window !== 'undefined') {
    // Browser environment: Use Image object for dimension extraction
    try {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (!metadata.width) metadata.width = img.naturalWidth;
          if (!metadata.height) metadata.height = img.naturalHeight;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = imageUrl;
      });
    } catch (e) {
      // Non-blocking
    }
    return;
  }

  // Node environment
  try {
    const res = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Range': 'bytes=0-131072'
      }
    });

    if (res.ok || res.status === 206) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType && contentType.startsWith('image/')) {
        if (!metadata.fileFormat) {
          metadata.fileFormat = contentType.split(';')[0].trim();
        }
      }

      const contentLengthHeader = res.headers.get('content-length') || res.headers.get('content-range');
      if (contentLengthHeader && !metadata.fileSize) {
        const totalMatch = contentLengthHeader.match(/\/(\d+)/) || contentLengthHeader.match(/^(\d+)/);
        if (totalMatch) {
          const totalBytes = parseInt(totalMatch[1], 10);
          if (!isNaN(totalBytes) && totalBytes > 0) {
            metadata.fileSize = formatBytes(totalBytes);
          }
        }
      }
    }
  } catch (e) {
    // Non-blocking
  }
}

