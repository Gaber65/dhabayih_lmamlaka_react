import React from 'react';

export const ChefKhroufy: React.FC<{ className?: string; mood?: 'happy' | 'chef' | 'celebrate' | 'waving' }> = ({
  className = 'w-32 h-32',
  mood = 'chef'
}) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sheepFur" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFF1F2" />
        </radialGradient>
        <filter id="popShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#9F1239" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#popShadow)">
        {/* Fluffy Wool Cloud Body */}
        <circle cx="100" cy="115" r="45" fill="url(#sheepFur)" stroke="#E11D48" strokeWidth="4" />
        <circle cx="70" cy="110" r="24" fill="url(#sheepFur)" stroke="#E11D48" strokeWidth="3" />
        <circle cx="130" cy="110" r="24" fill="url(#sheepFur)" stroke="#E11D48" strokeWidth="3" />
        <circle cx="85" cy="140" r="22" fill="url(#sheepFur)" stroke="#E11D48" strokeWidth="3" />
        <circle cx="115" cy="140" r="22" fill="url(#sheepFur)" stroke="#E11D48" strokeWidth="3" />

        {/* Little Trotters / Feet */}
        <ellipse cx="80" cy="162" rx="10" ry="7" fill="#BE123C" />
        <ellipse cx="120" cy="162" rx="10" ry="7" fill="#BE123C" />

        {/* Sheep Face */}
        <ellipse cx="100" cy="98" rx="26" ry="24" fill="#FFE4E6" stroke="#BE123C" strokeWidth="3.5" />

        {/* Rosy Cheeks */}
        <circle cx="84" cy="104" r="5" fill="#FDA4AF" />
        <circle cx="116" cy="104" r="5" fill="#FDA4AF" />

        {/* Cute Big Eyes */}
        <ellipse cx="88" cy="92" rx="5" ry="7" fill="#0F172A" />
        <circle cx="86" cy="89" r="2" fill="#FFFFFF" />
        <ellipse cx="112" cy="92" rx="5" ry="7" fill="#0F172A" />
        <circle cx="110" cy="89" r="2" fill="#FFFFFF" />

        {/* Cute Smile / Snout */}
        <ellipse cx="100" cy="104" rx="4" ry="3" fill="#BE123C" />
        <path d="M96 109 Q100 115 104 109" stroke="#BE123C" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Golden Curved Horns */}
        <path d="M72 82 C60 68, 48 88, 65 92" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M128 82 C140 68, 152 88, 135 92" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Fluffy Droopy Ears */}
        <path d="M72 96 C58 98, 54 110, 68 112 Z" fill="#FECDD3" stroke="#BE123C" strokeWidth="2.5" />
        <path d="M128 96 C142 98, 146 110, 132 112 Z" fill="#FECDD3" stroke="#BE123C" strokeWidth="2.5" />

        {/* Chef's Toque / White Tall Hat */}
        <path d="M82 78 C74 58, 86 42, 100 42 C114 42, 126 58, 118 78 Z" fill="#FFFFFF" stroke="#E11D48" strokeWidth="3" />
        <path d="M80 77 L120 77" stroke="#BE123C" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="52" r="14" fill="#FFFFFF" />
        <circle cx="86" cy="60" r="11" fill="#FFFFFF" />
        <circle cx="114" cy="60" r="11" fill="#FFFFFF" />

        {/* Golden Chef Star on Hat */}
        <path d="M100 62 L102 67 L107 68 L103 72 L104 77 L100 74 L96 77 L97 72 L93 68 L98 67 Z" fill="#F59E0B" />

        {/* Butcher Cleaver / Spatula */}
        {mood === 'chef' && (
          <g transform="translate(130, 95) rotate(15)">
            <rect x="0" y="20" width="6" height="20" rx="3" fill="#B45309" />
            <path d="M-6 0 H18 V18 H-6 Q-12 9 -6 0 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
            <circle cx="12" cy="5" r="2" fill="#0F172A" />
          </g>
        )}

        {/* Red Butcher Apron Ribbon */}
        <path d="M88 122 L100 134 L112 122" stroke="#E11D48" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

export const CartoonDeliveryVan: React.FC<{ className?: string }> = ({ className = 'w-32 h-32' }) => {
  return (
    <svg className={className} viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wheels */}
      <circle cx="60" cy="115" r="18" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
      <circle cx="60" cy="115" r="8" fill="#CBD5E1" />
      <circle cx="145" cy="115" r="18" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
      <circle cx="145" cy="115" r="8" fill="#CBD5E1" />

      {/* Main Van Body */}
      <path d="M30 45 Q30 35 42 35 H130 Q140 35 140 45 V105 H30 Z" fill="#E11D48" stroke="#9F1239" strokeWidth="4" />
      
      {/* Front Cabin */}
      <path d="M140 55 H165 Q178 55 182 72 L186 105 H140 Z" fill="#BE123C" stroke="#9F1239" strokeWidth="4" />
      <path d="M145 62 H165 L173 82 H145 Z" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" />

      {/* Refrigerator Snowflake & Meat Logo */}
      <circle cx="85" cy="70" r="22" fill="#FFF1F2" />
      <path d="M85 54 V86 M69 70 H101 M74 59 L96 81 M74 81 L96 59" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="85" cy="70" r="5" fill="#F59E0B" />

      {/* Headlight */}
      <rect x="180" y="88" width="8" height="12" rx="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />

      {/* Speed Trails */}
      <path d="M15 55 H5 M22 75 H2 M18 95 H8" stroke="#FDA4AF" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
};

export const CartoonEmptyCartLamb: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cart Basket */}
      <path d="M45 70 H155 L140 140 H60 Z" fill="#FFF1F2" stroke="#E11D48" strokeWidth="4" />
      <path d="M50 90 H150 M55 110 H145 M60 130 H140" stroke="#FECDD3" strokeWidth="3" />
      <circle cx="70" cy="160" r="12" fill="#E11D48" stroke="#9F1239" strokeWidth="3" />
      <circle cx="130" cy="160" r="12" fill="#E11D48" stroke="#9F1239" strokeWidth="3" />
      <path d="M45 70 L30 40 H15" stroke="#9F1239" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* Puzzled / Cute Lamb Peeking Out */}
      <circle cx="100" cy="65" r="30" fill="#FFFFFF" stroke="#E11D48" strokeWidth="3.5" />
      <ellipse cx="100" cy="70" rx="18" ry="16" fill="#FFE4E6" />
      <circle cx="92" cy="65" r="3.5" fill="#0F172A" />
      <circle cx="108" cy="65" r="3.5" fill="#0F172A" />
      <ellipse cx="100" cy="75" rx="3" ry="2" fill="#BE123C" />
      <path d="M96 80 Q100 77 104 80" stroke="#BE123C" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="74" cy="68" rx="8" ry="5" fill="#FECDD3" stroke="#BE123C" strokeWidth="2" />
      <ellipse cx="126" cy="68" rx="8" ry="5" fill="#FECDD3" stroke="#BE123C" strokeWidth="2" />
      
      {/* Question mark bubble */}
      <circle cx="140" cy="35" r="12" fill="#F59E0B" />
      <text x="136" y="41" fill="#FFFFFF" fontSize="16" fontWeight="bold" fontFamily="sans-serif">?</text>
    </svg>
  );
};

export const CartoonHalalBadge: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#ECFDF5" stroke="#10B981" strokeWidth="4" />
      <circle cx="50" cy="50" r="38" stroke="#34D399" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M50 20 L55 35 L70 38 L60 50 L62 65 L50 58 L38 65 L40 50 L30 38 L45 35 Z" fill="#10B981" />
      <text x="50" y="82" fill="#065F46" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="Cairo, sans-serif">حلال 100%</text>
    </svg>
  );
};

export const CartoonLoyaltyCoin: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#F59E0B" stroke="#B45309" strokeWidth="4" />
      <circle cx="50" cy="50" r="38" fill="#FDE047" stroke="#F59E0B" strokeWidth="3" />
      <circle cx="50" cy="50" r="30" fill="#FBBF24" />
      <path d="M50 28 L56 42 L70 44 L60 54 L62 68 L50 62 L38 68 L40 54 L30 44 L44 42 Z" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="6" fill="#B45309" />
    </svg>
  );
};