export interface WebPConversionResult {
  originalFile: File;
  webpBlob: Blob;
  webpDataUrl: string;
  originalSizeKB: number;
  webpSizeKB: number;
  reductionPercentage: number;
  width: number;
  height: number;
}

/**
 * Converts any image File (JPEG, PNG, etc.) to high-quality WebP using browser Canvas
 */
export async function convertImageToWebP(
  file: File,
  quality: number = 0.85,
  maxWidth: number = 1600,
  maxHeight: number = 1600
): Promise<WebPConversionResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image'));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erreur lors du décodage de l\'image'));

      img.onload = () => {
        let { width, height } = img;

        // Proportional resize if exceeds max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible d\'initialiser le contexte Canvas'));
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la conversion en format WebP'));
              return;
            }

            const originalSizeKB = Math.round(file.size / 1024);
            const webpSizeKB = Math.round(blob.size / 1024);
            const reductionPercentage = originalSizeKB > 0
              ? Math.max(0, Math.round(((originalSizeKB - webpSizeKB) / originalSizeKB) * 100))
              : 0;

            const webpDataUrl = canvas.toDataURL('image/webp', quality);

            resolve({
              originalFile: file,
              webpBlob: blob,
              webpDataUrl,
              originalSizeKB,
              webpSizeKB,
              reductionPercentage,
              width,
              height,
            });
          },
          'image/webp',
          quality
        );
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
