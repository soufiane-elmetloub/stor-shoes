'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analyticsApi } from '@/lib/api';

// Generate session ID if not exists
const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('storshoes_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('storshoes_session_id', sessionId);
  }
  return sessionId;
};

// Get UTM params from URL
const getUtmParams = () => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || undefined,
    utmMedium: params.get('utm_medium') || undefined,
    utmCampaign: params.get('utm_campaign') || undefined,
  };
};

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page visit
    const trackVisit = async () => {
      try {
        const utmParams = getUtmParams();
        const referrer = document.referrer || undefined;
        
        await analyticsApi.trackVisit({
          page: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
          ...utmParams,
          referrer,
        });
      } catch (error) {
        // Silently fail - don't break user experience
        console.debug('Analytics tracking failed:', error);
      }
    };

    // Only track on client side
    if (typeof window !== 'undefined') {
      trackVisit();
    }
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}

// Track product view
export const trackProductView = async (productId: string) => {
  try {
    const utmParams = getUtmParams();
    await analyticsApi.trackVisit({
      page: `/product/${productId}`,
      productId,
      ...utmParams,
    });
  } catch (error) {
    console.debug('Product tracking failed:', error);
  }
};

// Track conversion (order completed)
export const trackConversion = async (orderId: string, value: number) => {
  try {
    const utmParams = getUtmParams();
    await analyticsApi.trackConversion({
      orderId,
      value,
      utmSource: utmParams.utmSource,
    });
  } catch (error) {
    console.debug('Conversion tracking failed:', error);
  }
};
