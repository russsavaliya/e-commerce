import { useEffect } from 'react';

/**
 * useSEO Hook — Dynamic per-page SEO for React SPA
 * 
 * Updates document <title>, <meta description>, <meta keywords>,
 * <link canonical>, and Open Graph / Twitter Card tags dynamically.
 * 
 * Usage:
 *   useSEO({
 *     title: 'Page Title | SIYARA',
 *     description: 'Page description here',
 *     keywords: 'keyword1, keyword2',
 *     canonicalUrl: 'https://siyara.online/page',
 *     ogTitle: 'OG Title',
 *     ogDescription: 'OG Description',
 *     ogImage: 'https://siyara.online/image.png',
 *     ogType: 'website',
 *     noindex: false,
 *   });
 */

const BASE_URL = 'https://siyara.online';
const DEFAULT_OG_IMAGE = `${BASE_URL}/logo.png`;
const DEFAULT_TITLE = 'SIYARA | Premium Ethnic Wear - Sarees, Kurtis & Lehengas';

function setMetaTag(attribute, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attribute}="${key}"]`);
  if (el) {
    el.setAttribute('content', content);
  } else {
    el = document.createElement('meta');
    el.setAttribute(attribute, key);
    el.setAttribute('content', content);
    document.head.appendChild(el);
  }
}

function setLinkTag(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (el) {
    el.setAttribute('href', href);
  } else {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    el.setAttribute('href', href);
    document.head.appendChild(el);
  }
}

function setRobotsTag(noindex) {
  const content = noindex ? 'noindex, nofollow' : 'index, follow';
  setMetaTag('name', 'robots', content);
}

export default function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  noindex = false,
} = {}) {
  useEffect(() => {
    // Title
    const prevTitle = document.title;
    document.title = title || DEFAULT_TITLE;

    // Meta description
    if (description) {
      setMetaTag('name', 'description', description);
    }

    // Meta keywords
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // Canonical URL
    if (canonicalUrl) {
      setLinkTag('canonical', canonicalUrl);
    }

    // Robots
    setRobotsTag(noindex);

    // Open Graph
    setMetaTag('property', 'og:title', ogTitle || title || DEFAULT_TITLE);
    setMetaTag('property', 'og:description', ogDescription || description || '');
    setMetaTag('property', 'og:image', ogImage || DEFAULT_OG_IMAGE);
    setMetaTag('property', 'og:url', canonicalUrl || BASE_URL);
    setMetaTag('property', 'og:type', ogType);

    // Twitter Card
    setMetaTag('name', 'twitter:title', ogTitle || title || DEFAULT_TITLE);
    setMetaTag('name', 'twitter:description', ogDescription || description || '');
    setMetaTag('name', 'twitter:image', ogImage || DEFAULT_OG_IMAGE);

    // Cleanup: restore previous title on unmount
    return () => {
      document.title = prevTitle;
    };
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, noindex]);
}
