import { Product } from '../types/product.types';

const MEAT_IMAGES = {
  mincedBeef: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=800&q=80',
  beefSteak: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
  lambRibs: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  lambGeneral: '/images/onboarding/butchery.jpg',
  chickenBreast: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
  chickenGeneral: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
  camel: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
  goat: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
  defaultMeat: '/images/onboarding/butchery.jpg',
};

export function getProductImage(product?: Partial<Product> | null): string {
  if (product?.imageUrl && product.imageUrl.trim() !== '' && !product.imageUrl.endsWith('null')) {
    return product.imageUrl;
  }
  if (product?.mainImageUrl && product.mainImageUrl.trim() !== '' && !product.mainImageUrl.endsWith('null')) {
    return product.mainImageUrl;
  }

  const name = `${product?.name || ''} ${product?.nameAr || ''} ${product?.categoryName || ''}`.toLowerCase();

  if (name.includes('مفروم') || name.includes('mince') || (name.includes('بقر') && name.includes('مفروم'))) {
    return MEAT_IMAGES.mincedBeef;
  }
  if (name.includes('بقر') || name.includes('عجل') || name.includes('beef') || name.includes('steak')) {
    return MEAT_IMAGES.beefSteak;
  }
  if (name.includes('ريش') || name.includes('ضأن') || name.includes('خروف') || name.includes('نعيمي') || name.includes('حري') || name.includes('نجدي') || name.includes('lamb')) {
    return MEAT_IMAGES.lambRibs;
  }
  if (name.includes('صدور') || name.includes('دجاج') || name.includes('chicken') || name.includes('breast')) {
    return MEAT_IMAGES.chickenBreast;
  }
  if (name.includes('حاشي') || name.includes('قعود') || name.includes('جمل') || name.includes('camel')) {
    return MEAT_IMAGES.camel;
  }
  if (name.includes('تيس') || name.includes('عوارض') || name.includes('ماعز') || name.includes('goat')) {
    return MEAT_IMAGES.goat;
  }

  return MEAT_IMAGES.defaultMeat;
}
