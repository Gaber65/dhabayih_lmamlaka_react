import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, AlertCircle } from 'lucide-react';
import { CartoonModal } from '../components/common/CartoonModal';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth, setGuest } = useAuthStore();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      await authApi.login(email.trim());
      setIsOtpModalOpen(true);
      addToast({
        type: 'info',
        title: t('otp_title', 'رمز التحقق'),
        message: `${t('otp_sent_to', 'تم إرسال رمز التحقق إلى')} ${email}`,
      });
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || '';
      let friendlyMsg = rawMsg;
      if (rawMsg.toLowerCase().includes('not verified')) {
        friendlyMsg = 'حسابك غير مفعّل بعد. يرجى إدخال رمز التحقق لتفعيل الحساب.';
      } else if (rawMsg.toLowerCase().includes('not found')) {
        friendlyMsg = 'لم يتم العثور على حساب بهذا البريد. اضغط على «إنشاء حساب جديد» بالأسفل.';
      } else if (rawMsg.toLowerCase().includes('failed to send')) {
        friendlyMsg = 'تعذر إرسال رمز التحقق حالياً، يرجى المحاولة مرة أخرى.';
      } else if (!friendlyMsg) {
        friendlyMsg = t('otp_send_failed', 'تعذر إرسال رمز التحقق، يرجى التأكد من البريد الإلكتروني');
      }

      setErrorMessage(friendlyMsg);
      addToast({
        type: 'error',
        title: t('error', 'تنبيه'),
        message: friendlyMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    try {
      const res = await authApi.verifyLoginOtp(email, otp.trim());
      setAuth(res.user, res.accessToken, res.refreshToken);
      setIsOtpModalOpen(false);
      addToast({
        type: 'success',
        title: t('welcome_back', 'مرحباً بك!'),
        message: t('login_success', 'تم تسجيل الدخول بنجاح'),
      });
      navigate('/home');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: err.response?.data?.message || t('otp_invalid', 'رمز التحقق غير صحيح أو منتهي الصلاحية'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setGuest(true);
    navigate('/home');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-center">
        <img
          src="/app_logo.png"
          alt="ذبائح المملكة"
          className="w-20 h-20 object-contain mx-auto drop-shadow-xs"
        />

        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('login_title', 'تسجيل الدخول')}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('login_desc', 'أدخل بريدك الإلكتروني لاستلام رمز التحقق لمرة واحدة')}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-start gap-2.5 text-start animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <p className="leading-relaxed">{errorMessage}</p>
              {errorMessage.includes('غير مفعّل') && (
                <button
                  type="button"
                  onClick={() => setIsOtpModalOpen(true)}
                  className="inline-block text-xs font-black text-brand-600 hover:text-brand-700 underline cursor-pointer"
                >
                  اضغط هنا لإدخال رمز التحقق وتفعيل الحساب الآن
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSendOtp} className="space-y-4 text-start">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('email_label', 'البريد الإلكتروني')}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl px-4 py-3 text-xs md:text-sm font-bold text-slate-900 outline-none ps-10 transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs md:text-sm rounded-xl transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loading ? t('sending', 'جاري الإرسال...') : t('send_otp', 'إرسال رمز التحقق')}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 space-y-3">
          <button
            onClick={handleContinueAsGuest}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer border border-slate-200"
          >
            {t('continue_as_guest', 'المتابعة كزائر')}
          </button>

          <p className="text-xs text-slate-500 font-medium">
            {t('dont_have_account', 'ليس لديك حساب؟')}{' '}
            <Link to="/register" className="text-brand-600 font-bold hover:underline">
              {t('sign_up', 'إنشاء حساب جديد')}
            </Link>
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <CartoonModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        title={t('verify_otp_title', 'أدخل رمز التحقق')}
        subtitle={t('verify_otp_desc', { email }) || `تم إرسال رمز التحقق إلى ${email}`}
      >
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('otp_label', 'رمز التحقق (OTP)')}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                className="w-full text-center tracking-widest text-2xl font-mono font-black bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl py-3 text-slate-900 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs md:text-sm rounded-xl transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loading ? t('verifying', 'جاري التحقق...') : t('verify_btn', 'تأكيد ودخول')}
          </button>
        </form>
      </CartoonModal>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    try {
      await authApi.register(email.trim());
      addToast({
        type: 'info',
        title: t('activation_link_sent', 'تم إرسال الرابط'),
        message: t('activation_code_sent_desc', 'تم إرسال رمز التفعيل إلى بريدك الإلكتروني'),
      });
      navigate('/login');
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || '';
      let friendlyMsg = rawMsg;
      if (rawMsg.toLowerCase().includes('already registered')) {
        friendlyMsg = 'هذا البريد مسجل بالفعل. يمكنك التوجه لتسجيل الدخول مباشرة.';
      } else if (rawMsg.toLowerCase().includes('failed to send')) {
        friendlyMsg = 'تعذر إرسال رمز التحقق حالياً، يرجى المحاولة مرة أخرى.';
      } else if (!friendlyMsg) {
        friendlyMsg = t('account_create_failed', 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً');
      }

      setErrorMessage(friendlyMsg);
      addToast({
        type: 'error',
        title: t('error', 'تنبيه'),
        message: friendlyMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 text-center">
        <img
          src="/app_logo.png"
          alt="ذبائح المملكة"
          className="w-20 h-20 object-contain mx-auto drop-shadow-xs"
        />

        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('sign_up', 'إنشاء حساب جديد')}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {t('register_desc', 'انضم إلى ذبائح المملكة واستمتع بالخصومات وتتبع طلباتك')}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-start gap-2.5 text-start animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <p className="flex-1 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-start">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('full_name', 'الاسم الكامل')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد السعيد"
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl px-4 py-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('email_label', 'البريد الإلكتروني')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl px-4 py-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs md:text-sm rounded-xl transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loading ? t('creating_account', 'جاري إنشاء الحساب...') : t('sign_up', 'إنشاء الحساب')}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            {t('already_have_account', 'لديك حساب بالفعل؟')}{' '}
            <Link to="/login" className="text-brand-600 font-bold hover:underline">
              {t('sign_in', 'تسجيل الدخول')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};