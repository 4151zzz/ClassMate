/**
 * ClassMate - Client-Side Image Compressor
 * Resizes and compresses heavy mobile/camera photos (5MB - 15MB)
 * down to ~50KB - 100KB using HTML5 Canvas before saving or syncing to cloud.
 * Prevents localStorage QuotaExceededError and KV Cloud 413 Payload Too Large.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.75)
  mimeType?: "image/jpeg" | "image/webp";
}

/**
 * Compress a single File or Blob to a compact Data URL string
 */
export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.75,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // If browser doesn't support canvas/FileReader, fallback to standard FileReader
    if (typeof window === "undefined" || !window.FileReader) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Scale down while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw with smooth bi-linear interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill white background for transparent PNGs converting to JPEG
        if (mimeType === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch (e) {
          // Fallback to original if toDataURL fails
          resolve(event.target?.result as string);
        }
      };

      img.onerror = () => {
        resolve(event.target?.result as string);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Batch compress multiple files with progress reporting
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < files.length; i++) {
    try {
      const compressed = await compressImage(files[i], options);
      results.push(compressed);
    } catch (err) {
      console.warn(`Failed to compress image ${files[i].name}:`, err);
    }
    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }
  return results;
}
