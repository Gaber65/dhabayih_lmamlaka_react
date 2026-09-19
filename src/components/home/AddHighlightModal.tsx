import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Video, Image as ImageIcon, Sparkles, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { highlightsApi } from '../../api/highlights';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { HighlightStory } from '../../types/home.types';

interface AddHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHighlightCreated: (story: HighlightStory) => void;
}

export const AddHighlightModal: React.FC<AddHighlightModalProps> = ({
  isOpen,
  onClose,
  onHighlightCreated,
}) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const isRtl = i18n.language === 'ar';

  const [title, setTitle] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('video');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const isVid = file.type.startsWith('video/');
      setMediaType(isVid ? 'video' : 'image');

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast({
        type: 'error',
        title: t('missing_data', 'بيانات ناقصة'),
        message: t('enter_highlight_title', 'يرجى إدخال عنوان القصة أو الفيديو'),
      });
      return;
    }

    if (!selectedFile && !mediaUrl.trim()) {
      addToast({
        type: 'error',
        title: t('missing_media', 'الوسائط مطلوبة'),
        message: t('select_file_or_url', 'يرجى اختيار ملف فيديو/صورة أو إدخال رابط الوسائط'),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const finalMediaUrl = previewUrl || mediaUrl.trim();
      const created = await highlightsApi.createHighlight({
        name: title.trim(),
        mediaType,
        mediaUrl: finalMediaUrl,
        file: selectedFile || undefined,
      });

      addToast({
        type: 'success',
        title: t('highlight_added_title', 'تم نشر القصة بنجاح!'),
        message: t('highlight_added_msg', 'تمت إضافة الهايلايت الجديد لقائمة يوميات الذبائح'),
      });

      onHighlightCreated(created);
      onClose();
      // Reset
      setTitle('');
      setSelectedFile(null);
      setPreviewUrl('');
      setMediaUrl('');
    } catch {
      addToast({
        type: 'error',
        title: t('error', 'خطأ'),
        message: t('highlight_create_failed', 'تعذر نشر القصة، يرجى المحاولة مرة أخرى'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {t('add_new_highlight', 'إضافة قصة / فيديو هايلايت جديد')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t('add_highlight_subtitle', 'شارك لقطات الذبح والتجهيز اليومي للمتابعين')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('story_title_label', 'عنوان القصة / الهايلايت')} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('story_title_placeholder', 'مثال: وصول دفعة حري طازج، تجهيز طلبات المناسبات...')}
              className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-3 text-xs font-medium outline-none transition"
            />
          </div>

          {/* Media Type Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('media_type', 'نوع الوسائط')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                  mediaType === 'video'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>{t('video_story', 'فيديو (MP4 / WebM)')}</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                  mediaType === 'image'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{t('image_story', 'صورة عالية الجودة')}</span>
              </button>
            </div>
          </div>

          {/* File Upload or URL Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {t('upload_media_or_link', 'رفع الملف أو إرفاق الرابط')}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept={mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video flex items-center justify-center group">
                {mediaType === 'video' ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-3 end-3 p-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t('change', 'تغيير')}</span>
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/40 rounded-2xl p-6 text-center cursor-pointer transition space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {t('click_to_upload_media', 'انقر لرفع مقطع الفيديو أو الصورة من جهازك')}
                </div>
                <p className="text-[11px] text-slate-400">
                  {mediaType === 'video' ? 'MP4, MOV, WebM (حد أقصى 50MB)' : 'PNG, JPG, WebP (حد أقصى 10MB)'}
                </p>
              </div>
            )}

            {/* Direct URL Fallback */}
            <div className="mt-3">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  if (e.target.value) setPreviewUrl(e.target.value);
                }}
                placeholder={t('or_paste_media_url', 'أو الصق رابط الوسائط المباشر (Direct Media URL)...')}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-2.5 text-xs font-mono outline-none transition"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs md:text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>{t('publishing_story', 'جاري رفع ونشر القصة...')}</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('publish_highlight_btn', 'نشر الهايلايت الآن')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
