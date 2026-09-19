import { ProductOption } from './product.types';

export interface CartLine {
  id: number;
  productId: number;
  productName: string;
  productNameAr?: string;
  productNameEn?: string;
  productImageUrl?: string;
  product?: any;
  weightLabel?: string;
  quantity: number;
  priceUnit: number;
  discountPercent: number;
  lineTotal: number;
  cuttingOption?: ProductOption | null;
  cuttingOptionName?: string;
  packagingOptions?: ProductOption[];
  packagingNames?: string[];
  excludedParts?: ProductOption[];
  excludedNames?: string[];
  notes?: string;
}


export interface Cart {
  id: number;
  status: string;
  lines: CartLine[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  deliveryFee: number;
  vatAmount?: number;
  total: number;
  itemCount: number;
}

export interface AddToCartPayload {
  productId: number;
  quantity: number;
  weightOptionId?: number;
  weightLabel?: string;
  cuttingOptionId?: number;
  packagingIds?: number[];
  excludedPartIds?: number[];
  notes?: string;
}