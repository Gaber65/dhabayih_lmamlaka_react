import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Smartphone, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { SaudiPhoneInput } from '../components/auth/SaudiPhoneInput';
import { OtpModal } from '../components/auth/OtpModal';
import { normalizeSaudiPhone, isValidSaudiPhone, isValidEmail } from '../utils/phoneUtils';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const navigate = useNavigate();
  const { setAuth, setGuest } = useAuthStore();
  const { addToast } = useUIStore();

  const [mode, setMode] = useState<'sms' | 'email'>('sms');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [activeIdentifier, setActiveIdentifier] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let identifierToSend = '';

    if (mode === 'sms') {
      if (!phone.trim()) {
        addToast({
          type: 'error',
          title: t('error', 'تنبيه'),
          message: isArabic ? 'يرجى إدخال رقم الجوال' : 'Please enter your phone number',
        });
        return;
      }

      const normalized = normalizeSaudiPhone(phone);
      if (!normalized || !isValidSaudiPhone(normalized)) {
        const errorText = isArabic
          ? 'يرجى إدخال رقم جوال سعودي صحيح (مثال: 05XXXXXXXX)'
          : 'Please enter a valid Saudi mobile number (e.g. 05XXXXXXXX)';
        setErrorMessage(errorText);
        addToast({
          type: 'error',
          title: t('error', 'تنبيه'),
          message: errorText,
        });
        return;
      }
      identifierToSend = normalized;
    } else {
      if (!email.trim() || !isValidEmail(email)) {
        const errorText = isArabic
          ? 'يرجى إدخال بريد إلكتروني صالح'
          : 'Please enter a valid email address';
        setErrorMessage(errorText);
        addToast({
          type: 'error',
          title: t('error', 'تنبيه'),
          message: errorText,
        });
        return;
      }
      identifierToSend = email.trim().toLowerCase();
    }

    setLoading(true);
    try {
      await authApi.login(identifierToSend, mode);
      setActiveIdentifier(identifierToSend);
      setIsOtpModalOpen(true);
      addToast({
        type: 'info',
        title: t('otp_title', 'رمز التحقق'),
        message: `${t('otp_sent_to', 'تم إرسال رمز التحقق إلى')} ${identifierToSend}`,
      });
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || '';
      let friendlyMsg = rawMsg;
      if (rawMsg.toLowerCase().includes('not verified')) {
        friendlyMsg = isArabic
          ? 'حسابك غير مفعّل بعد. يرجى إدخال رمز التحقق لتفعيل الحساب.'
          : 'Your account is pending verification. Please verify your OTP.';
      } else if (rawMsg.toLowerCase().includes('not found') || err.response?.status === 404) {
        friendlyMsg = isArabic
          ? 'لم يتم العثور على حساب بهذا المعرف. يرجى إنشاء حساب جديد أولاً.'
          : 'No account found with this identifier. Please create a new account.';
      } else if (rawMsg.toLowerCase().includes('failed to send')) {
        friendlyMsg = isArabic
          ? 'تعذر إرسال رمز التحقق حالياً، يرجى المحاولة مرة أخرى.'
          : 'Failed to send verification code. Please try again.';
      } else if (!friendlyMsg) {
        friendlyMsg = isArabic
          ? 'تعذر إرسال رمز التحقق، يرجى التأكد من البيانات والمحاولة لاحقاً'
          : 'Failed to send OTP. Please check your details and try again.';
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

  const handleVerifyOtp = async (otpCode: string) => {
    setLoading(true);
    try {
      const res = await authApi.verifyLoginOtp(activeIdentifier, otpCode);
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

  const handleResendOtp = async () => {
    if (!activeIdentifier) return;
    try {
      await authApi.login(activeIdentifier, mode);
      addToast({
        type: 'info',
        title: t('otp_title', 'رمز التحقق'),
        message: `${t('otp_sent_to', 'تمت إعادة إرسال رمز التحقق إلى')} ${activeIdentifier}`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: err.response?.data?.message || t('resend_failed', 'فشل إعادة إرسال رمز التحقق'),
      });
      throw err;
    }
  };

  const handleContinueAsGuest = () => {
    setGuest(true);
    navigate('/home');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-center">
        {/* App Logo */}
        <div className="relative inline-block mx-auto">
          <img
            src="/app_logo.png"
            alt="ذبائح المملكة"
            className="w-20 h-20 object-contain mx-auto drop-shadow-xs"
          />
          <div className="absolute -bottom-1 -end-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('login_title', 'تسجيل الدخول')}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isArabic
              ? 'اختر تسجيل الدخول برقم الجوال أو البريد الإلكتروني لاستلام رمز التحقق'
              : 'Sign in using your mobile number or email to receive a verification code'}
          </p>
        </div>

        {/* Mode Switcher Tabs (SMS / Email) */}
        <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('sms');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'sms'
                ? 'bg-white text-brand-600 shadow-xs scale-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isArabic ? 'رقم الجوال (SMS)' : 'Phone (SMS)'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('email');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'email'
                ? 'bg-white text-brand-600 shadow-xs scale-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{isArabic ? 'البريد الإلكتروني' : 'Email'}</span>
          </button>
        </div>

        {/* Error Alert */}
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
                  {isArabic ? 'اضغط هنا لإدخال رمز التحقق وتفعيل الحساب الآن' : 'Click here to enter OTP and activate account'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSendOtp} className="space-y-4 text-start">
          {mode === 'sms' ? (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {isArabic ? 'رقم الجوال السعودي' : 'Saudi Mobile Number'}
              </label>
              <SaudiPhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="05XXXXXXXX"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {isArabic ? 'أدخل رقم جوالك المكون من 9 أو 10 أرقام (مثال: 0588489998)' : 'Enter 9 or 10 digits starting with 05'}
              </p>
            </div>
          ) : (
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
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl px-4 py-3 text-xs md:text-sm font-bold text-slate-900 outline-none ps-10 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-3.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs md:text-sm rounded-xl transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{t('sending', 'جاري الإرسال...')}</span>
            ) : (
              <>
                <span>{t('send_otp', 'إرسال رمز التحقق')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Footer Actions */}
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

      {/* 6-Digit OTP Modal with 60s cooldown */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        identifier={activeIdentifier}
        channel={mode}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        loading={loading}
      />
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { addToast } = useUIStore();

  const [mode, setMode] = useState<'sms' | 'email'>('sms');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [activeIdentifier, setActiveIdentifier] = useState('');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let identifierToSend = '';

    if (mode === 'sms') {
      if (!phone.trim()) {
        addToast({
          type: 'error',
          title: t('error', 'تنبيه'),
          message: isArabic ? 'يرجى إدخال رقم الجوال' : 'Please enter your phone number',
        });
        return;
      }

      const normalized = normalizeSaudiPhone(phone);
      if (!normalized || !isValidSaudiPhone(normalized)) {
        const errorText = isArabic
          ? 'يرجى إدخال رقم جوال سعودي صحيح (مثال: 05XXXXXXXX)'
          : 'Please enter a valid Saudi mobile number (e.g. 05XXXXXXXX)';
        setErrorMessage(errorText);
        addToast({
          type: 'error',
          title: t('error', 'تنبيه'),
          message: errorText,
        });
        return;
      }
      identifierToSend = normalized;
    } else {
      if (!email.trim() || !isValidEmail(email)) {
        const errorText = isArabic
          ? 'يرجى إدخال بريد إلكتروني صالح'
          : 'Please enter a valid email address';
        setErrorMessage(errorText);
        addToast({
          type: 'error',
          title: t('error', 'تنبيه'),
          message: errorText,
        });
        return;
      }
      identifierToSend = email.trim().toLowerCase();
    }

    setLoading(true);
    try {
      await authApi.register(identifierToSend, mode);
      setActiveIdentifier(identifierToSend);
      setIsOtpModalOpen(true);
      addToast({
        type: 'info',
        title: t('otp_title', 'رمز التحقق'),
        message: `${t('otp_sent_to', 'تم إرسال رمز التحقق إلى')} ${identifierToSend}`,
      });
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || '';
      let friendlyMsg = rawMsg;
      if (rawMsg.toLowerCase().includes('already registered') || err.response?.status === 409) {
        friendlyMsg = isArabic
          ? 'هذا الرقم أو البريد مسجل بالفعل. يمكنك التوجه لتسجيل الدخول مباشرة.'
          : 'This identifier is already registered. Please login instead.';
      } else if (rawMsg.toLowerCase().includes('failed to send')) {
        friendlyMsg = isArabic
          ? 'تعذر إرسال رمز التحقق حالياً، يرجى المحاولة مرة أخرى.'
          : 'Failed to send verification code. Please try again.';
      } else if (!friendlyMsg) {
        friendlyMsg = isArabic
          ? 'تعذر إنشاء الحساب، يرجى المحاولة لاحقاً'
          : 'Failed to create account. Please try again later.';
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

  const handleVerifyRegisterOtp = async (otpCode: string) => {
    setLoading(true);
    try {
      const res = await authApi.verifyRegisterOtp(activeIdentifier, otpCode);
      setAuth(res.user, res.accessToken, res.refreshToken);
      setIsOtpModalOpen(false);
      addToast({
        type: 'success',
        title: t('welcome', 'أهلاً بك!'),
        message: t('register_success', 'تم تفعيل الحساب وتسجيل الدخول بنجاح'),
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

  const handleResendRegisterOtp = async () => {
    if (!activeIdentifier) return;
    try {
      await authApi.register(activeIdentifier, mode);
      addToast({
        type: 'info',
        title: t('otp_title', 'رمز التحقق'),
        message: `${t('otp_sent_to', 'تمت إعادة إرسال رمز التحقق إلى')} ${activeIdentifier}`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: err.response?.data?.message || t('resend_failed', 'فشل إعادة إرسال رمز التحقق'),
      });
      throw err;
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-center">
        {/* App Logo */}
        <div className="relative inline-block mx-auto">
          <img
            src="/app_logo.png"
            alt="ذبائح المملكة"
            className="w-20 h-20 object-contain mx-auto drop-shadow-xs"
          />
          <div className="absolute -bottom-1 -end-1 bg-brand-500 text-white p-1 rounded-full shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-slate-900">{t('sign_up', 'إنشاء حساب جديد')}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {isArabic
              ? 'انضم إلى ذبائح المملكة برقم الجوال أو البريد الإلكتروني لتجربة تسوق فاخرة'
              : 'Join Dhabayih Lmamlaka for a fresh luxury shopping experience'}
          </p>
        </div>

        {/* Mode Switcher Tabs (SMS / Email) */}
        <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setMode('sms');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'sms'
                ? 'bg-white text-brand-600 shadow-xs scale-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isArabic ? 'رقم الجوال (SMS)' : 'Phone (SMS)'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('email');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              mode === 'email'
                ? 'bg-white text-brand-600 shadow-xs scale-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{isArabic ? 'البريد الإلكتروني' : 'Email'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-600 flex items-start gap-2.5 text-start animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <p className="flex-1 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4 text-start">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {t('full_name', 'الاسم الكامل')} <span className="text-slate-400 font-normal">({isArabic ? 'اختياري' : 'Optional'})</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isArabic ? 'محمد السعيد' : 'Full Name'}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl px-4 py-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition"
            />
          </div>

          {mode === 'sms' ? (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {isArabic ? 'رقم الجوال السعودي' : 'Saudi Mobile Number'}
              </label>
              <SaudiPhoneInput
                value={phone}
                onChange={setPhone}
                placeholder="05XXXXXXXX"
                autoFocus
              />
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {isArabic ? 'أدخل رقم جوالك المكون من 9 أو 10 أرقام (مثال: 0588489998)' : 'Enter 9 or 10 digits starting with 05'}
              </p>
            </div>
          ) : (
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
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl px-4 py-3 text-xs md:text-sm font-bold text-slate-900 outline-none ps-10 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-3.5" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs md:text-sm rounded-xl transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{t('creating_account', 'جاري إنشاء الحساب...')}</span>
            ) : (
              <>
                <span>{t('sign_up', 'إنشاء الحساب')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            {t('already_have_account', 'لديك حساب بالفعل؟')}{' '}
            <Link to="/login" className="text-brand-600 font-bold hover:underline">
              {t('sign_in', 'تسجيل الدخول')}
            </Link>
          </p>
        </div>
      </div>

      {/* 6-Digit OTP Modal with 60s cooldown */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        identifier={activeIdentifier}
        channel={mode}
        onVerify={handleVerifyRegisterOtp}
        onResend={handleResendRegisterOtp}
        loading={loading}
      />
    </div>
  );
};