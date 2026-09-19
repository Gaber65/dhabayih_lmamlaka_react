import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const StoryViewerModal: React.FC = () => {
  const { activeStoryUser, activeStoryIndex, closeStory, openStory } = useUIStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stories = activeStoryUser?.highlights || [];
  const currentIndex = activeStoryIndex !== null ? activeStoryIndex : 0;
  const currentStory = stories[currentIndex] || stories[0];
  const isVideo = currentStory?.mediaType === 'video' || currentStory?.mediaUrl?.endsWith('.mp4') || currentStory?.mediaUrl?.endsWith('.webm');

  // Handle auto-advance for images and timer tracking
  useEffect(() => {
    if (!activeStoryUser || activeStoryIndex === null) return;

    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isVideo) {
      const duration = 5000; // 5 seconds per photo
      const interval = 50;
      let elapsed = 0;

      timerRef.current = setInterval(() => {
        if (!isPaused) {
          elapsed += interval;
          setProgress((elapsed / duration) * 100);

          if (elapsed >= duration) {
            clearInterval(timerRef.current!);
            handleNext();
          }
        }
      }, interval);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [activeStoryUser, activeStoryIndex, isVideo, isPaused]);

  if (!activeStoryUser || activeStoryIndex === null) return null;

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      openStory(activeStoryUser, currentIndex + 1);
    } else {
      closeStory();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      openStory(activeStoryUser, currentIndex - 1);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4">
        {/* Close Button */}
        <button
          onClick={closeStory}
          className="absolute top-4 end-4 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Story Card Container */}
        <div
          className="relative max-w-sm w-full aspect-[9/16] max-h-[85vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between select-none"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Top Bars: Progress & User Info */}
          <div className="relative z-30 p-4 space-y-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            {/* Story Progress Indicators */}
            <div className="flex gap-1.5">
              {stories.map((_: any, idx: number) => {
                let fillPercent = 0;
                if (idx < currentIndex) fillPercent = 100;
                else if (idx === currentIndex) fillPercent = progress;

                return (
                  <div key={idx} className="h-1 flex-1 rounded-full bg-white/25 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full border-2 border-amber-400 overflow-hidden bg-slate-800 flex-shrink-0">
                  <img
                    src={activeStoryUser.avatarUrl || '/app_logo.png'}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/app_logo.png';
                    }}
                  />
                </div>
                <div>
                  <div className="text-white text-xs font-black flex items-center gap-1">
                    <span>{activeStoryUser.name || 'ذبائح المملكة'}</span>
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-white/80 text-[11px] font-medium truncate max-w-[180px]">
                    {currentStory?.name || 'يوميات وفيديوهات الذبائح'}
                  </div>
                </div>
              </div>

              {/* Sound toggle for videos */}
              {isVideo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Media Content */}
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            {isVideo ? (
              <video
                ref={videoRef}
                src={currentStory?.mediaUrl}
                autoPlay
                playsInline
                muted={isMuted}
                onTimeUpdate={handleVideoTimeUpdate}
                onEnded={handleNext}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={currentStory?.mediaUrl || '/app_logo.png'}
                alt=""
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Tap Zones for Navigation */}
          <div className="absolute inset-0 flex z-20 pointer-events-auto">
            <div
              className="w-1/3 h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            <div
              className="w-1/3 h-full"
              onClick={() => setIsPaused(!isPaused)}
            />
            <div
              className="w-1/3 h-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </div>

          {/* Bottom Overlay Gradient & Caption */}
          <div className="relative z-30 p-4 pt-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <div className="text-white text-xs font-bold bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 inline-block">
              {currentStory?.name || 'ذبائح بلدية طازجة'}
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};