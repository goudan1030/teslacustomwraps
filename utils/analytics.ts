// Google Analytics utility

// Use environment variable if provided, otherwise use default GA ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-LJLJZMLN6G';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const initGA = () => {
  // GA script is already loaded in index.html, so we just ensure gtag function exists
  if (typeof window.gtag === 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };
  }

  // Track initial page view if GA is already configured
  // Note: GA is already initialized in index.html, so we just track the page view
  if (window.gtag && GA_MEASUREMENT_ID) {
    // Additional configuration if needed
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }

  // Track page views on route changes
  let lastPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== lastPath && window.gtag && GA_MEASUREMENT_ID) {
      lastPath = window.location.pathname;
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: lastPath,
        page_title: document.title,
      });
    }
  }, 100);
};

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
};
