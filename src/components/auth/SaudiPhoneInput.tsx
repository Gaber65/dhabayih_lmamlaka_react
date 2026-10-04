import React from 'react';
import { formatSaudiPhoneInput } from '../../utils/phoneUtils';

interface SaudiPhoneInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

export const SaudiPhoneInput: React.FC<SaudiPhoneInputProps> = ({
  value,
  onChange,
  placeholder = '05XXXXXXXX',
  disabled = false,
  required = true,
  autoFocus = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSaudiPhoneInput(e.target.value);
    onChange(formatted);
  };

  return (
    <div className="relative flex items-center">
      {/* Saudi Flag & Prefix Badge */}
      <div
        dir="ltr"
        className="shrink-0 flex items-center gap-1.5 px-3.5 py-3 bg-slate-100 border border-slate-200 border-e-0 rounded-s-xl text-slate-800 font-mono font-bold text-xs select-none"
      >
        <span className="text-base leading-none">🇸🇦</span>
        <span>+966</span>
      </div>

      {/* Local Phone Input */}
      <input
        dir="ltr"
        type="tel"
        inputMode="numeric"
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-e-xl px-4 py-3 text-sm font-mono font-bold text-slate-900 outline-none transition disabled:opacity-50"
      />
    </div>
  );
};
