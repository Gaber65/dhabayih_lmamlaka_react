import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { ShieldAlert, Loader2, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, initAuth, logout } = useAuthStore();
  const { language, isRTL } = useLanguageStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isAr = language === 'ar';

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Check admin authorization strictly
  const isAdmin = Boolean(
    user && (
      user.role === 'admin' ||
      user.userType === 'admin' ||
      (user as any).isAdmin === true ||
      (user as any).is_admin === true
    )
  );

  // 1. While auth state is initializing from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-3" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
          {isAr ? 'جارٍ التحقق من صلاحيات الدخول...' : 'Verifying administrative permissions...'}
        </p>
      </div>
    );
  }

  // 2. Unauthenticated -> Redirect immediately to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. Authenticated but NOT an Admin -> Strictly Access Denied 403 Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-6 shadow-xl shadow-red-500/10 border border-red-200 dark:border-red-900">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          {isAr ? 'عذراً، الوصول غير مصرح به (403)' : 'Access Forbidden (403)'}
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed font-medium">
          {isAr
            ? `أنت مسجل الدخول حالياً بحساب "${user.name || user.email}"، ولكن حسابك لا يمتلك صلاحيات المشرف المطلوبة للوصول إلى لوحة الإدارة المركزية.`
            : `You are signed in as "${user.name || user.email}", but your account lacks administrative permissions required to access this portal.`}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <span>{isAr ? 'العودة للمتجر الرئيسي' : 'Return to Storefront'}</span>
            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>

          <button
            onClick={async () => {
              await logout();
              navigate('/login', { state: { from: location.pathname } });
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>{isAr ? 'تسجيل الخروج والدخول بحساب مسؤول' : 'Sign Out & Switch Account'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin
  return <>{children}</>;
};
