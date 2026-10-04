import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, RotateCcw, Smartphone, Mail, ArrowRight } from 'lucide-react';
import { CartoonModal } from '../common/CartoonModal';
import { normalizeDigits } from '../../utils/phoneUtils';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  identifier: string;
  channel: 'sms' | 'email';
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  loading: boolean;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  identifier,
  channel,
  onVerify,
  onResend,
  loading,
}) => {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState<number>(60);
  const [resending, setResending] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state and start 60s cooldown when modal opens
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setCooldown(60);
      // Auto-focus first input box after animation
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Active 60s countdown timer
  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    const normalized = normalizeDigits(value).replace(/\D/g, '');

    // Handle multi-character paste or input
    if (normalized.length > 1) {
      handlePasteString(normalized, index);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = normalized;
    setDigits(newDigits);

    // Auto-advance to next input
    if (normalized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits filled
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      onVerify(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move back and clear previous digit
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasteString = (pasted: string, startIndex = 0) => {
    const cleaned = normalizeDigits(pasted).replace(/\D/g, '').slice(0, 6);
    if (!cleaned) return;

    const newDigits = [...digits];
    for (let i = 0; i < cleaned.length; i++) {
      const targetIdx = startIndex + i;
      if (targetIdx < 6) {
        newDigits[targetIdx] = cleaned[i];
      }
    }
    setDigits(newDigits);

    // Focus last filled or next input
    const nextIdx = Math.min(5, startIndex + cleaned.length);
    inputRefs.current[nextIdx]?.focus();

    if (newDigits.join('').length === 6) {
      onVerify(newDigits.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    handlePasteString(pasted, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResend();
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  const isComplete = digits.join('').length === 6;

  return (
    <CartoonModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('verify_otp_title', 'أدخل رمز التحقق')}
      maxWidth="sm"
    >
      <div className="space-y-6 text-center">
        {/* Destination badge */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200/80 text-brand-600 flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {channel === 'sms'
              ? t('otp_sent_to_phone', 'تم إرسال رمز التحقق المكون من 6 أرقام عبر SMS إلى:')
              : t('otp_sent_to_email', 'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني:')}
          </p>
          <div
            dir="ltr"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-800"
          >
            {channel === 'sms' ? <Smartphone className="w-3.5 h-3.5 text-brand-600" /> : <Mail className="w-3.5 h-3.5 text-brand-600" />}
            <span>{identifier}</span>
          </div>
        </div>

        {/* 6 Digit Input Boxes */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div dir="ltr" className="flex justify-center items-center gap-2 sm:gap-2.5">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoComplete="one-time-code"
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border-2 transition-all outline-none shadow-xs ${
                  digit
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900 scale-102'
                    : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-brand-500 focus:bg-white'
                }`}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isComplete || loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-2xl transition shadow-xs cursor-pointer active:scale-98 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{t('verifying', 'جاري التحقق...')}</span>
            ) : (
              <>
                <span>{t('verify_btn', 'تأكيد ودخول')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </form>

        {/* Resend Cooldown Section */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
          {cooldown > 0 ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <RotateCcw className="w-3.5 h-3.5 animate-spin-reverse text-slate-400" />
              <span>
                {t('resend_in', 'إعادة الإرسال بعد')}{' '}
                <strong className="text-brand-600 font-mono font-bold">{cooldown}</strong> ثانية
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResendClick}
              disabled={resending}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 underline cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resending ? t('resending', 'جاري إعادة الإرسال...') : t('resend_now', 'إعادة إرسال الرمز')}</span>
            </button>
          )}
        </div>
      </div>
    </CartoonModal>
  );
};
