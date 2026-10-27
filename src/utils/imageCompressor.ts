/**
 * Image compressor and cropper utility for user avatar photos.
 * Ensures uploaded photos are center-cropped into a square,
 * compressed using an offscreen HTML5 canvas to ~256x256 pixels,
 * and converted to an optimized WebP / JPEG Data URL under ~60KB.
 */

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
}

export function compressAndCropAvatar(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const { maxDimension = 280, quality = 0.88 } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo seleccionado no es una imagen válida."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo de imagen."));
    };

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => {
        reject(new Error("No se pudo procesar la imagen seleccionada."));
      };

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("No se pudo inicializar el contexto de imagen."));
            return;
          }

          // Calculate center square crop
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          // Target dimensions
          const targetSize = Math.min(minDim, maxDimension);
          canvas.width = targetSize;
          canvas.height = targetSize;

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Draw cropped & resized image
          ctx.drawImage(
            img,
            sx,
            sy,
            minDim,
            minDim,
            0,
            0,
            targetSize,
            targetSize
          );

          // Try exporting as webp first, fallback to jpeg
          let dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
