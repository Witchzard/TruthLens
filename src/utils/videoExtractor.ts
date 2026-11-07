import { ExtractedFrame } from '../types';

/**
 * Extracts evenly spaced representative keyframes from a video File using HTML5 Video + Canvas.
 * This runs entirely client-side, enabling fast temporal sampling without sending massive video files.
 */
export async function extractVideoFrames(
  file: File,
  targetFrameCount = 5,
  onProgress?: (current: number, total: number) => void
): Promise<{ frames: ExtractedFrame[]; duration: number; resolution: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const fileUrl = URL.createObjectURL(file);
    video.src = fileUrl;

    const cleanup = () => {
      URL.revokeObjectURL(fileUrl);
      video.remove();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video file. Please check that the format is supported (MP4, WebM, MOV).'));
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 1;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 360;
        const resolution = `${width}x${height}`;

        // Calculate sample timestamps avoiding exact 0 and exact end
        const step = duration / (targetFrameCount + 1);
        const timestamps: number[] = [];
        for (let i = 1; i <= targetFrameCount; i++) {
          timestamps.push(Math.min(duration - 0.1, Math.max(0.1, i * step)));
        }

        const canvas = document.createElement('canvas');
        // Max width of 800 to keep frame payloads lightweight while preserving forensic detail
        const scale = Math.min(1, 800 / width);
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context unavailable for frame extraction.');
        }

        const frames: ExtractedFrame[] = [];

        for (let i = 0; i < timestamps.length; i++) {
          const time = timestamps[i];
          await seekToTime(video, time);

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

          const minutes = Math.floor(time / 60);
          const seconds = Math.floor(time % 60);
          const formattedTimestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

          frames.push({
            timestamp: formattedTimestamp,
            timestampSeconds: Math.round(time * 10) / 10,
            base64: dataUrl,
            mimeType: 'image/jpeg',
          });

          if (onProgress) {
            onProgress(i + 1, timestamps.length);
          }
        }

        cleanup();
        resolve({ frames, duration: Math.round(duration * 10) / 10, resolution });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };
  });
}

function seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}
