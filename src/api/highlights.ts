import { apiClient } from './client';
import { ServerStrings } from './endpoints';
import { JabinHighlight, HighlightStory } from '../types/home.types';
import { normalizeImageUrl } from '../utils/imageUrl';

export interface CreateHighlightPayload {
  name: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  file?: File;
}

export const highlightsApi = {
  getHighlights: async (): Promise<JabinHighlight[]> => {
    try {
      const response = await apiClient.get(ServerStrings.highlights);
      const raw = response.data?.data || response.data || [];
      if (!Array.isArray(raw)) return [];

      return raw.map((j: any) => ({
        user: {
          id: j.user?.id || j.id || 0,
          name: j.user?.name || j.name || 'ذبائح المملكة',
          email: j.user?.email || '',
          avatarUrl: normalizeImageUrl(j.user?.avatar_url || j.avatar_url || j.avatar),
        },
        highlights: (j.highlights || j.stories || [j]).map((h: any) => ({
          id: h.id || Date.now(),
          name: h.name || h.title || 'يوميات الذبائح',
          mediaType: h.media_type || (h.media_url?.endsWith('.mp4') || h.media_url?.endsWith('.webm') ? 'video' : 'image'),
          mediaUrl: normalizeImageUrl(h.media_url || h.image_url || h.video_url || h.image),
        })),
      }));
    } catch {
      return [];
    }
  },

  createHighlight: async (payload: CreateHighlightPayload): Promise<HighlightStory> => {
    try {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('media_type', payload.mediaType);
      if (payload.file) {
        formData.append('file', payload.file);
      } else if (payload.mediaUrl) {
        formData.append('media_url', payload.mediaUrl);
      }

      const response = await apiClient.post(ServerStrings.highlights, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const res = response.data?.data || response.data || {};
      return {
        id: res.id || Date.now(),
        name: res.name || payload.name,
        mediaType: res.media_type || payload.mediaType,
        mediaUrl: normalizeImageUrl(res.media_url || payload.mediaUrl),
      };
    } catch {
      // Fallback for optimistic display
      return {
        id: Date.now(),
        name: payload.name,
        mediaType: payload.mediaType,
        mediaUrl: payload.mediaUrl,
      };
    }
  },
};
