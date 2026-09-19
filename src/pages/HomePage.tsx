import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BannersCarousel } from '../components/home/BannersCarousel';
import { HighlightStories } from '../components/home/HighlightStories';
import { TrustBadgesSection } from '../components/home/TrustBadgesSection';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { TabbedProductShowcase } from '../components/home/TabbedProductShowcase';
import { TrustQualityShowcase } from '../components/home/TrustQualityShowcase';
import { CustomerReviewsSection } from '../components/home/CustomerReviewsSection';
import { B2BSection } from '../components/home/B2BSection';
import { AppDownloadBanner } from '../components/home/AppDownloadBanner';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { CartoonLoadingState } from '../components/common/CartoonLoadingState';
import { homeApi } from '../api/home';
import { HomeData } from '../types/home.types';
import { Product } from '../types/product.types';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await homeApi.getHomeData();
        setData(res);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  if (loading) {
    return <CartoonLoadingState message="جاري تجهيز سوق الذبائح والمواشي الطازجة..." />;
  }

  const banners = data?.banners || [];
  const categories = data?.categories || [];
  const featured = data?.featuredProducts || [];
  const bestSellers = data?.bestSellers || [];
  const recommended = data?.recommendedProducts || [];
  const jabinHighlight = data?.jabinHighlight || [];

  return (
    <div className="space-y-4 pb-16 bg-slate-50/70 min-h-screen">
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* 1. Hero Promotional Banners Slider */}
      <BannersCarousel banners={banners} />

      {/* 2. Live Sacrifice Stories & Video Highlights (Facebook Web Format) */}
      <HighlightStories items={jabinHighlight} />

      {/* 3. Fast Assurance Guarantee Strip */}
      <TrustBadgesSection />

      {/* 4. Category Selector Grid */}
      {categories.length > 0 && <CategoryGrid categories={categories} />}

      {/* 5. Unified Tabbed Marketplace Products Showcase (No Endless Scroll) */}
      <TabbedProductShowcase
        featuredProducts={featured}
        bestSellers={bestSellers}
        recommendedProducts={recommended}
        onQuickView={(p) => setQuickViewProduct(p)}
      />

      {/* 6. Food Safety & Veterinary Quality Standards (G-Shop & H.Meat Inspired) */}
      <TrustQualityShowcase />

      {/* 7. Customer Verified Reviews */}
      <CustomerReviewsSection />

      {/* 8. B2B Corporate & Feast Catering */}
      <B2BSection />

      {/* 9. Mobile App Download Banner */}
      <AppDownloadBanner />
    </div>
  );
};