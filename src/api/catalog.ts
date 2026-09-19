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
      const response = await apiClient.get(ServerStrings.search(query));
      const list = extractList(response.data);
      if (list.length > 0) {
        return list.map(mapProduct);
      }
    } catch {}

    const prods = await catalogApi.getProducts();
    const q = query.toLowerCase().trim();
    return prods.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.nameAr?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  },
};