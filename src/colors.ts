// Based on https://github.com/olivierlesnicki/quantize

const sigbits = 5;

const rshift = 8 - sigbits;

type Pixels = [number, number, number];

// 1-d array, giving the number of pixels in each quantized region of color space
type Histogram = number[];

function getHistogram(pixels: Pixels[]): Histogram {
  const histosize = 1 << (3 * sigbits);
  const histo = new Array(histosize);

  for (const pixel of pixels) {
    const rval = pixel[0] >> rshift;
    const gval = pixel[1] >> rshift;
    const bval = pixel[2] >> rshift;
    const index = getColorIndex(rval, gval, bval);
    histo[index] = (histo[index] || 0) + 1;
  }

  return histo;
}

// get reduced-space color index for a pixel
function getColorIndex(r: number, g: number, b: number): number {
  return (r << (2 * sigbits)) + (g << sigbits) + b;
}

export {
  getColorIndex,
  getHistogram,
  type Histogram,
  type Pixels,
  rshift,
  sigbits,
};
