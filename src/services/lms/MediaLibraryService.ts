import { supabase } from '@/lib/supabase';
import { MediaLibraryItem } from '@/types/lms';
import { toast } from '@/utils/toast';

export class MediaLibraryService {
  // File upload to Supabase Storage
  async uploadFile(file: File, folder: string = 'general'): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('course-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  }

  // Create media library record
  async createMediaRecord(mediaData: {
    name: string;
    type: 'video' | 'image' | 'document' | 'audio';
    url: string;
    size: number;
    mimeType: string;
    description?: string;
    tags?: string[];
  }): Promise<MediaLibraryItem | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('media_library')
        .insert({
          ...mediaData,
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        type: data.type,
        url: data.url,
        size: data.size,
        mimeType: data.mime_type,
        uploadedBy: data.uploaded_by,
        uploadedAt: data.uploaded_at,
        tags: data.tags,
        description: data.description
      };
    } catch (error) {
      console.error('Error creating media record:', error);
      return null;
    }
  }

  // Get media library items
  async getMediaLibrary(filters?: {
    type?: string;
    tags?: string[];
    searchQuery?: string;
  }): Promise<MediaLibraryItem[]> {
    try {
      let query = supabase
        .from('media_library')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        url: item.url,
        size: item.size,
        mimeType: item.mime_type,
        uploadedBy: item.uploaded_by,
        uploadedAt: item.uploaded_at,
        tags: item.tags,
        description: item.description
      }));
    } catch (error) {
      console.error('Error fetching media library:', error);
      return [];
    }
  }

  // Delete media file and record
  async deleteMedia(mediaId: string, filePath: string): Promise<boolean> {
    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('course-media')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete record from database
      const { error: dbError } = await supabase
        .from('media_library')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      toast.success('Media deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media');
      return false;
    }
  }

  // Upload with progress tracking
  async uploadWithProgress(
    file: File, 
    folder: string = 'general',
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // For now, we'll simulate progress since Supabase doesn't provide native progress tracking
      if (onProgress) {
        const interval = setInterval(() => {
          onProgress(Math.min(Math.random() * 100, 90));
        }, 100);

        setTimeout(() => {
          clearInterval(interval);
          onProgress(100);
        }, 2000);
      }

      const { data, error } = await supabase.storage
        .from('course-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('course-media')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file with progress:', error);
      toast.error('Failed to upload file');
      return null;
    }
  }

  // Get file type from mime type
  getFileType(mimeType: string): 'video' | 'image' | 'document' | 'audio' {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // Validate file size and type
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/wav', 'audio/ogg',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 100MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }

  // Generate thumbnail for video files
  async generateVideoThumbnail(videoFile: File): Promise<string | null> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnail);
        } else {
          resolve(null);
        }
      };

      video.onerror = () => resolve(null);
      video.src = URL.createObjectURL(videoFile);
    });
  }
}

// Export singleton instance
export const mediaLibraryService = new MediaLibraryService();