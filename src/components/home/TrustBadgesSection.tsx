import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Truck, Award, Scissors } from 'lucide-react';

export const TrustBadgesSection: React.FC = () => {
  const { t } = useTranslation();

  const badges = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      title: t('trust_badge_1_title', 'ذبح حلال 100%'),
      desc: t('trust_badge_1_desc', 'ذبح يومي طازج بإشراف بيطري'),
    },
    {
      icon: <Truck className="w-5 h-5 text-brand-500" />,
      title: t('trust_badge_2_title', 'توصيل مبرد 4°C'),
      desc: t('trust_badge_2_desc', 'سيارات مجهزة بأعلى درجات السلامة'),
    },
    {
      icon: <Award className="w-5 h-5 text-amber-600" />,
      title: t('trust_badge_3_title', 'مواشي بلدية مختارة'),
      desc: t('trust_badge_3_desc', 'نعيمي، حري، تيوس بأعلى جودة'),
    },
    {
      icon: <Scissors className="w-5 h-5 text-slate-700" />,
      title: t('trust_badge_4_title', 'تقطيع وتغليف مخصص'),
      desc: t('trust_badge_4_desc', 'سحب هواء أو أكياس حسب طلبك'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        {badges.map((b, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              {b.icon}
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">{b.title}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};