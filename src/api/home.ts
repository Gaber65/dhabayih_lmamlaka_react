import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { HomeData } from '../types/home.types';
import { Product } from '../types/product.types';
import { normalizeImageUrl } from '../utils/imageUrl';



const mapProduct = (item: any): Product => {
  const selling = Number(item.selling_price ?? item.price ?? 0);
  const offer = Number(item.offer_price ?? 0);
  const isOnOffer = Boolean(item.is_on_offer || item.is_offer || (offer > 0 && offer < selling));

  const categoryId = typeof item.category_id === 'object'
    ? item.category_id?.id
    : (item.category_id ?? item.categoryId ?? item.category?.id ?? undefined);

  const categoryName = typeof item.category_id === 'object'
    ? item.category_id?.name
    : (item.category_name ?? item.categoryName ?? item.category?.name ?? undefined);

  return {
    id: item.id,
    name: item.name || item.title || '',
    nameAr: item.name_ar,
    nameEn: item.name_en,
    description: item.description || '',
    categoryId: categoryId ? Number(categoryId) : undefined,
    categoryName,
    weight: item.weight ? String(item.weight) : '',
    price: isOnOffer && offer > 0 ? offer : selling,
    sellingPrice: selling,
    offerPrice: offer > 0 ? offer : undefined,
    originalPrice: isOnOffer && selling > 0 ? selling : undefined,
    isOnOffer,
    imageUrl: normalizeImageUrl(item.main_image_url || item.image_url || item.image),
    mainImageUrl: normalizeImageUrl(item.main_image_url || item.image_url),
    discountTag: item.discount_tag,
    isOffer: isOnOffer,
    isBestSeller: Boolean(item.is_best_seller),
    isAvailable: item.is_available !== false,
    stockQuantity: item.stock_quantity ? Number(item.stock_quantity) : undefined,
    loyaltyPoints: item.loyalty_points ? Number(item.loyalty_points) : undefined,
    cuttingOptions: Array.isArray(item.cutting_options) ? item.cutting_options : [],
    packagingOptions: Array.isArray(item.packaging_options) ? item.packaging_options : [],
    excludedParts: Array.isArray(item.excluded_parts) ? item.excluded_parts : [],
  };
};


export const homeApi = {
  getHomeData: async (): Promise<HomeData> => {
    const response = await apiClient.get(ServerStrings.home);
    const data = response.data?.data || response.data || {};

    return {
      deliveryLocation: data.delivery_location || '',
      userHighlight: data.user_highlight ? {
        id: data.user_highlight.id,
        name: data.user_highlight.name,
        email: data.user_highlight.email,
        avatarUrl: normalizeImageUrl(data.user_highlight.avatar_url),
        balance: Number(data.user_highlight.balance || 0),
        activeCart: data.user_highlight.active_cart,
      } : undefined,
      banners: (data.banners || []).map((b: any) => ({
        id: b.id,
        name: b.name || '',
        imageUrl: normalizeImageUrl(b.image_url || b.image),
      })),
      categories: (data.categories || []).map((c: any) => ({
        id: c.id,
        name: c.name || '',
        nameAr: c.name_ar,
        nameEn: c.name_en,
        imageUrl: normalizeImageUrl(c.image_url || c.image),
      })),
      featuredProducts: (data.featured_products || []).map(mapProduct),
      bestSellers: (data.best_sellers || []).map(mapProduct),
      recommendedProducts: (data.recommended_products || []).map(mapProduct),
      jabinHighlight: (data.jabin_highlight || []).map((j: any) => ({
        user: {
          id: j.user?.id || 0,
          name: j.user?.name || '',
          email: j.user?.email || '',
          avatarUrl: normalizeImageUrl(j.user?.avatar_url),
        },
        highlights: (j.highlights || []).map((h: any) => ({
          id: h.id,
          name: h.name || '',
          mediaType: h.media_type || 'image',
          mediaUrl: normalizeImageUrl(h.media_url || h.image_url),
        })),
      })),
    };
  },
};