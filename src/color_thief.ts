import { CanvasImage } from "./canvas_image.ts";
import { type Pixels } from "./colors.ts";
import { quantize } from "./modified_median_cut_quantization.ts";

/*
 * getPaletteFromPixels(pixels, pixelCount, colorCount, quality)
 * returns array[ {r: num, g: num, b: num}, {r: num, g: num, b: num}, ...]
 *
 * Low-level function that takes pixels and computes color palette.
 * Used by getPalette() and getColor()
 */
function getPaletteFromPixels(
  canvasImage: CanvasImage,
  allowWhite: boolean,
  colorCount: number,
  quality: number,
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
    if (a >= 125) {
      if (
        (!(r > 250 && g > 250 && b > 250) && allowWhite !== true) ||
        (!(r > 255 && g > 255 && b > 255) && allowWhite === true)
      ) {
        pixelArray.push([r, g, b]);
      }
    }
  }

  const colorMap = quantize(pixelArray, colorCount);

  return colorMap.palette();
}

/*
 * getColor(sourceImage[, quality])
 * returns {r: num, g: num, b: num}
 *
 * Use the median cut algorithm provided by quantize.js to cluster similar
 * colors and return the base color from the largest cluster.
 *
 * Quality is an optional argument. It needs to be an integer. 0 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster a color will be returned but the greater the likelihood that it will not be the visually
 * most dominant color.
 */
async function getColor(uri: string, allowWhite: boolean, quality = 10) {
  const palette = await getPalette(uri, allowWhite, 5, quality);
  return palette.at(0);
}

/*
 * getPalette(sourceImage[, colorCount, quality])
 * returns array[ {r: num, g: num, b: num}, {r: num, g: num, b: num}, ...]
 *
 * Use the median cut algorithm provided by quantize.js to cluster similar colors.
 *
 * colorCount determines the size of the palette; the number of colors returned. If not set, it
 * defaults to 10.
 *
 * BUGGY: Function does not always return the requested amount of colors. It can be +/- 2.
 *
 * quality is an optional argument. It needs to be an integer. 0 is the highest quality settings.
 * 10 is the default. There is a trade-off between quality and speed. The bigger the number, the
 * faster the palette generation but the greater the likelihood that colors will be missed.
 */
async function getPalette(
  uri: string,
  allowWhite: boolean,
  colorCount = 10,
  quality = 10,
) {
  using image = await CanvasImage.load(uri);

  const palette = getPaletteFromPixels(image, allowWhite, colorCount, quality);

  return palette;
}

export { getColor, getPalette };
