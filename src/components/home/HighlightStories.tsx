import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { JabinHighlight, HighlightStory } from '../../types/home.types';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { AddHighlightModal } from './AddHighlightModal';

interface HighlightStoriesProps {
  items?: JabinHighlight[];
}

export const HighlightStories: React.FC<HighlightStoriesProps> = ({ items: initialItems = [] }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { openStory, addToast } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();

  const [items, setItems] = useState<JabinHighlight[]>(initialItems);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isRtl = i18n.language === 'ar';

  React.useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const handleOpenAddModal = () => {
    if (!isAuthenticated) {
      addToast({
        type: 'info',
        title: t('login_required_title', 'تسجيل الدخول مطلوب'),
        message: t('login_to_add_highlight', 'يرجى تسجيل الدخول أولاً لإضافة ونشر قصة أو فيديو هايلايت'),
      });
      navigate('/login');
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleHighlightCreated = (newStory: HighlightStory) => {
    const userStoryGroup: JabinHighlight = {
      user: {
        id: user?.id || 1,
        name: user?.name || 'قصتي',
        email: user?.email || '',
        avatarUrl: user?.avatarUrl || '/app_logo.png',
      },
      highlights: [newStory],
    };

    setItems((prev) => [userStoryGroup, ...prev]);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-4 bg-white border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <h3 className="text-xs md:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>{t('stories_highlights', 'يوميات وفيديوهات الذبائح')}</span>
              <span className="text-[10px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full font-bold">
                {t('live_stories', 'مباشر')}
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(isRtl ? 'right' : 'left')}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(isRtl ? 'left' : 'right')}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Facebook-Style Stories Horizontal Slider */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-none pt-1 scroll-smooth"
        >
          {/* 1. Facebook-Style "Create Story" Card */}
          <div
            onClick={handleOpenAddModal}
            className="w-28 sm:w-32 md:w-36 h-48 sm:h-52 md:h-58 rounded-2xl overflow-hidden relative cursor-pointer group shadow-xs hover:shadow-md border border-slate-200 flex flex-col bg-white flex-shrink-0 transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Top 72% Preview Thumbnail */}
            <div className="h-[72%] w-full overflow-hidden bg-slate-100 flex items-center justify-center relative p-3">
              <img
                src={user?.avatarUrl || '/app_logo.png'}
                alt=""
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-xs"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/app_logo.png';
                }}
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Bottom 28% with Central Overlapping Plus Badge and Clear Label */}
            <div className="h-[28%] w-full bg-white relative flex flex-col items-center justify-end pb-2.5 px-1 z-10 border-t border-slate-100">
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-brand-500 group-hover:bg-brand-600 text-white flex items-center justify-center border-2 border-white shadow-xs transition-colors">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] sm:text-xs font-black text-slate-800 text-center leading-tight whitespace-nowrap">
                {t('create_story', 'إنشاء قصة')}
              </span>
            </div>
          </div>

          {/* 2. Story Cards (Facebook Web Format) */}
          {items.map((item, idx) => {
            const hasVideo = item.highlights?.some((h) => h.mediaType === 'video');
            const latestThumb = item.highlights?.[0]?.mediaUrl || item.user.avatarUrl;
            const storyTitle = item.highlights?.[0]?.name || 'يوميات الذبائح';

            return (
              <div
                key={idx}
                onClick={() => openStory(item, 0)}
                className="w-28 sm:w-32 md:w-36 h-48 sm:h-52 md:h-58 rounded-2xl overflow-hidden relative cursor-pointer group shadow-xs hover:shadow-md border border-slate-200/80 bg-slate-900 flex-shrink-0 transition-all duration-300 transform hover:-translate-y-1 select-none"
              >
                {/* Full Background Media */}
                <img
                  src={latestThumb || '/app_logo.png'}
                  alt={item.user.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/app_logo.png';
                  }}
                />

                {/* Dark Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 group-hover:to-black/95 transition-colors" />

                {/* Floating Top-Start User Avatar */}
                <div className="absolute top-2.5 start-2.5 w-8 h-8 md:w-9 md:h-9 rounded-full border-2 border-brand-500 overflow-hidden bg-white shadow-xs z-10 p-0.5">
                  <img
                    src={item.user.avatarUrl || '/app_logo.png'}
                    alt={item.user.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/app_logo.png';
                    }}
                  />
                </div>

                {/* Video Play Pill Badge */}
                {hasVideo && (
                  <div className="absolute top-2.5 end-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-1 border border-white/20 z-10">
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>{t('video', 'فيديو')}</span>
                  </div>
                )}

                {/* Bottom Story Name and User Label */}
                <div className="absolute bottom-0 inset-x-0 pt-8 pb-2.5 px-2.5 text-white z-10 space-y-0.5">
                  <div className="text-[11px] md:text-xs font-black truncate drop-shadow-xs">
                    {item.user.name || 'ذبائح المملكة'}
                  </div>
                  <div className="text-[10px] text-white/85 font-medium truncate leading-tight">
                    {storyTitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Highlight Modal */}
      <AddHighlightModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onHighlightCreated={handleHighlightCreated}
      />
    </section>
  );
};