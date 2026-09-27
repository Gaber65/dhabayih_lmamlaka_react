import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { settingsApi } from '../../api/settings';

export const FloatingWhatsAppButton: React.FC = () => {
  const [whatsappInfo, setWhatsappInfo] = useState<{
    enabled: boolean;
    number: string;
    default_message?: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    settingsApi.getPublicSettings().then((settings) => {
      if (isMounted && settings?.whatsapp) {
        setWhatsappInfo({
          enabled: settings.whatsapp.enabled,
          number: settings.whatsapp.number || settings.whatsapp.phone,
          default_message: settings.whatsapp.default_message,
        });
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  if (!whatsappInfo || !whatsappInfo.enabled || !whatsappInfo.number) {
    return null;
  }

  // Clean phone number (remove +, spaces, leading zeros if internationalized)
  const cleanNumber = whatsappInfo.number.replace(/\D/g, '');
  const finalNumber = cleanNumber.startsWith('05') ? `966${cleanNumber.slice(1)}` : cleanNumber;
  const message = encodeURIComponent(whatsappInfo.default_message || 'مرحباً، أود الاستفسار عن ذبائح المملكة');
  const whatsappUrl = `https://wa.me/${finalNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-20 md:bottom-8 start-5 z-40 group flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 text-white p-3 md:px-4 md:py-3 rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
    >
      <div className="relative">
        <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
        <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
        <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-emerald-300 rounded-full" />
      </div>
      <span className="hidden md:inline text-xs font-bold whitespace-nowrap">
        تواصل عبر واتساب
      </span>
    </a>
  );
};
