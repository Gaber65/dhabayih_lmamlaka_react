import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { Category, Product } from '../types/product.types';
import { normalizeImageUrl } from '../utils/imageUrl';



const mapProduct = (item: any): Product => {
  const selling = Number(item.selling_price ?? item.price ?? 0);
  const offer = Number(item.offer_price ?? 0);
  const isOnOffer = Boolean(item.is_on_offer || item.is_offer || (offer > 0 && offer < selling));

  const categoryName = typeof item.category_id === 'object'
    ? item.category_id?.name
    : (item.category_name ?? item.categoryName ?? item.category?.name ?? undefined);

  let categoryId = typeof item.category_id === 'object'
    ? item.category_id?.id
    : (item.category_id ?? item.categoryId ?? item.category?.id ?? undefined);

  if (!categoryId && categoryName) {
    if (categoryName.includes('بقر')) categoryId = 1;
    else if (categoryName.includes('ضأن') || categoryName.includes('غنم')) categoryId = 2;
    else if (categoryName.includes('دجاج')) categoryId = 3;
  }

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
    sizes: Array.isArray(item.sizes)
      ? item.sizes.map((s: any) => ({
          id: Number(s.id),
          name: s.name || '',
          subTitle: s.sub_title || s.subTitle || '',
          sub_title: s.sub_title || s.subTitle || '',
          portionType: s.portion_type || s.portionType || 'full',
          portion_type: s.portion_type || s.portionType || 'full',
          weightRange: s.weight_range || s.weightRange || (s.min_weight && s.max_weight ? `${s.min_weight} - ${s.max_weight} كجم` : ''),
          weight_range: s.weight_range || s.weightRange || (s.min_weight && s.max_weight ? `${s.min_weight} - ${s.max_weight} كجم` : ''),
          minWeight: s.min_weight ? Number(s.min_weight) : undefined,
          min_weight: s.min_weight ? Number(s.min_weight) : undefined,
          maxWeight: s.max_weight ? Number(s.max_weight) : undefined,
          max_weight: s.max_weight ? Number(s.max_weight) : undefined,
          price: Number(s.price || 0),
          originalPrice: s.original_price ? Number(s.original_price) : undefined,
          offerPrice: s.offer_price ? Number(s.offer_price) : undefined,
          calories: s.calories ? Number(s.calories) : 243,
          loyaltyPoints: Number(s.loyalty_points || s.loyaltyPoints || 0),
          loyalty_points: Number(s.loyalty_points || s.loyaltyPoints || 0),
          pointsPrice: Number(s.points_price || s.pointsPrice || 0),
          points_price: Number(s.points_price || s.pointsPrice || 0),
          isDefault: Boolean(s.is_default || s.isDefault),
          is_default: Boolean(s.is_default || s.isDefault),
          sequence: Number(s.sequence || 10),
        }))
      : [],
    hasSizes: Boolean(item.has_sizes || item.hasSizes || (item.sizes && item.sizes.length > 0)),
    calories: item.calories ? Number(item.calories) : 243,
    isCarcass: Boolean(item.is_carcass ?? item.isCarcass ?? true),
    is_carcass: Boolean(item.is_carcass ?? item.isCarcass ?? true),
    portions: Array.isArray(item.portions)
      ? item.portions.map((p: any) => ({
          type: p.type || 'full',
          name: p.name || (p.type === 'half' ? 'نصف' : p.type === 'quarter' ? 'ربع' : 'كامل'),
          title: p.title || '',
          subtitle: p.subtitle || '',
          imageUrl: normalizeImageUrl(p.image_url || p.imageUrl || item.main_image_url || item.image_url),
          startingPrice: Number(p.starting_price || p.startingPrice || 0),
          sizeCount: Number(p.size_count || p.sizeCount || 0),
        }))
      : undefined,
  };
};

const extractList = (resData: any): any[] => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.data?.data)) return resData.data.data;
  if (Array.isArray(resData?.data)) return resData.data;
  if (Array.isArray(resData?.products)) return resData.products;
  if (Array.isArray(resData?.categories)) return resData.categories;
  return [];
};

export const catalogApi = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get(ServerStrings.catalogCategories);
      const list = extractList(response.data);
      if (list.length > 0) {
        return list.map((c: any) => ({
          id: c.id,
          name: c.name || '',
          nameAr: c.name_ar,
          nameEn: c.name_en,
          imageUrl: normalizeImageUrl(c.image_url || c.image),
        }));
      }
    } catch {}

    try {
      const resHome = await apiClient.get(ServerStrings.home);
      const cats = extractList(resHome.data?.data?.categories || resHome.data?.categories || resHome.data);
      return cats.map((c: any) => ({
        id: c.id,
        name: c.name || '',
        nameAr: c.name_ar,
        nameEn: c.name_en,
        imageUrl: normalizeImageUrl(c.image_url || c.image),
      }));
    } catch {
      return [];
    }
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get(ServerStrings.products);
    const list = extractList(response.data);
    return list.map(mapProduct);
  },

  getProductsByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await apiClient.get(ServerStrings.categoryProducts(categoryId));
    const list = extractList(response.data);
    return list.map(mapProduct);
  },

  getProductById: async (productId: number): Promise<Product> => {
    const response = await apiClient.get(ServerStrings.productById(productId));
    const data = response.data?.data?.data || response.data?.data || response.data;
    const productData = data?.product || data;
    return mapProduct(productData);
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const response = await apiClient.get(ServerStrings.products, { params: { search: query } });
      const list = extractList(response.data);
      if (list.length > 0) {
        return list.map(mapProduct);
      }
    } catch {}

    const prods = await catalogApi.getProducts();
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/).filter((w) => w.length > 1);
    return prods.filter((p) => {
      const name = `${p.name || ''} ${p.nameAr || ''} ${p.description || ''}`.toLowerCase();
      return words.length > 0 ? words.every((w) => name.includes(w)) : name.includes(q);
    });
  },
};