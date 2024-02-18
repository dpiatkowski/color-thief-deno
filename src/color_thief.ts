import { CanvasImage } from "./canvas_image.ts";
import { type Pixels } from "./colors.ts";
import { quantize } from "./modified_median_cut_quantization.ts";

function getPaletteFromPixels(
  canvasImage: CanvasImage,
  quality: number,
  colorCount: number,
) {
  const imageData = canvasImage.getImageData();
  const pixelCount = canvasImage.getPixelCount();

  // Store the RGB values in an array format suitable for quantize function
  const pixelArray: Pixels[] = [];

  for (let i = 0; i < pixelCount; i = i + quality) {
    const offset = i * 4;
    const r = imageData.data[offset + 0];
    const g = imageData.data[offset + 1];
    const b = imageData.data[offset + 2];
    const a = imageData.data[offset + 3];

    // If pixel is mostly opaque and not white
    if (typeof a === "undefined" || a >= 125) {
      if (!(r > 250 && g > 250 && b > 250)) {
        pixelArray.push([r, g, b]);
      }
    }
  }

  const colorMap = quantize(pixelArray, colorCount);
  return colorMap.palette();
}

/**
 * Use the median cut algorithm provided by quantize.js to cluster similar colors and return the base color from the largest cluster.
 * @param uri Image resource identifier. Can be url or file path
 * @param quality 0 is the highest quality settings. * 10 is the default. There is a trade-off between quality and speed.
 * The bigger the number, the faster a color will be returned but the greater the likelihood that it will not be the visually most dominant color.
 * @returns An array [r, g, b]
 */
async function getColor(uri: string, quality = 10) {
  const palette = await getPalette(uri, quality, 2);
  return palette.at(0);
}

/**
 * Use the median cut algorithm provided by quantize.js to cluster similar colors.
 * @param uri Image resource identifier. Can be url or file path
 * @param quality 0 is the highest quality settings. * 10 is the default. There is a trade-off between quality and speed.
 * The bigger the number, the faster a color will be returned but the greater the likelihood that it will not be the visually most dominant color.
 * @param colorCount Determines the size of the palette; the number of colors returned.
 * Function does not always return the requested amount of colors. It can be +/- 2.
 * @returns Array of arrays [r, g, b]
 */
async function getPalette(uri: string, quality = 10, colorCount = 10) {
  using image = await CanvasImage.load(uri);
  return getPaletteFromPixels(image, quality, colorCount);
}

export { getColor, getPalette };
