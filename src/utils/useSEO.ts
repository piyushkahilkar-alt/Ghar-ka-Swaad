import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  schema?: Record<string, any> | Record<string, any>[];
  canonicalUrl?: string;
}

export function useSEO({ title, description, keywords, schema, canonicalUrl }: SEOProps) {
  useEffect(() => {
    // 1. Update Title dynamically
    document.title = title;
    
    // 2. Update Meta Description dynamically
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }

    // 3. Update Meta Keywords if provided
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        metaKeywords.setAttribute('content', keywords);
        document.head.appendChild(metaKeywords);
      }
    }

    // 4. Update Canonical URL dynamically
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.setAttribute('href', canonicalUrl);
      } else {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        canonical.setAttribute('href', canonicalUrl);
        document.head.appendChild(canonical);
      }
    }

    // 5. Update Open Graph dynamic tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);

    // 6. Handle Schema Injection for AI Search/Recommendations
    const scriptId = 'dynamic-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement;

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Optional: Cleanup specific dynamic schemas on unmount
      if (scriptTag) scriptTag.remove();
    };
  }, [title, description, keywords, schema, canonicalUrl]);
}
