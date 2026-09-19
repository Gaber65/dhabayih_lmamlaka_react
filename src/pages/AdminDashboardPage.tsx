import React from 'react';
import { ShieldCheck, Flame, ArrowRight, ArrowLeft } from 'lucide-react';
import { CartoonButton } from '../components/common/CartoonButton';
import { useNavigate } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-luxury max-w-lg mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-900 to-brand-950 flex items-center justify-center text-gold-400 border border-gold-500/40 mx-auto shadow-sm">
          <Flame className="w-8 h-8 fill-gold-400/20" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-charcoal-900">لوحة إدارة ذبائح المملكة</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            لوحة الإدارة والتحكم لطلبات القصابين ومتابعة التوصيل المبرد والمبيعات
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <CartoonButton variant="primary" size="lg" className="w-full" onClick={() => navigate('/home')}>
            العودة للمتجر الرئيسي
          </CartoonButton>
        </div>
      </div>
    </div>
  );
};