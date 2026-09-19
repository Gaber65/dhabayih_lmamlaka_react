import React, { useState } from 'react';
import { ZoomIn, Sparkles } from 'lucide-react';
import { getProductImage } from '../../utils/productImages';

interface ProductGalleryProps {
  images?: string[];
  productName: string;
  isOnOffer?: boolean;
  discountTag?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName,
  isOnOffer,
  discountTag,
}) => {
  const fallbackImg = getProductImage({ name: productName });
  const validImages = images.filter((img) => img && img.trim() !== '' && !img.endsWith('null'));
  const defaultList = validImages.length > 0 ? validImages : [fallbackImg];

  const [activeImage, setActiveImage] = useState(defaultList[0]);


  return (
    <div className="space-y-3">
      {/* Main Image Stage */}
      <div className="relative w-full aspect-[4/3] rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-3 group">
        <img
          src={activeImage}
          alt={productName}
          className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              '/images/onboarding/butchery.jpg';
          }}
        />

        {/* Promo tag */}
        {isOnOffer && (
          <div className="absolute top-4 start-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-md shadow-sm">
            {discountTag || 'عرض خاص'}
          </div>
        )}

        {/* Fresh inspection stamp */}
        <div className="absolute bottom-4 start-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/20">
          فحص بيطري معتمد • ذبح اليوم
        </div>
      </div>

      {/* Thumbnails row */}
      {defaultList.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {defaultList.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer flex-shrink-0 ${
                activeImage === img ? 'border-brand-900 shadow-sm' : 'border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
