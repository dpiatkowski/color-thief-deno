// Based on https://github.com/olivierlesnicki/quantize

import { getColorIndex, type Pixels, rshift, sigbits } from "./colors.ts";

class ColorSpaceBox {
  #volume: number | undefined;
  #count: number | undefined;
  #avg: Pixels | undefined;

  private constructor(
    public r1: number,
    public r2: number,
    public g1: number,
    public g2: number,
    public b1: number,
    public b2: number,
    public histogram: number[],
  ) {}

  static create(pixels: Pixels[], histogram: number[]) {
    let rmin = 1000000;
    let rmax = 0;
    let gmin = 1000000;
    let gmax = 0;
    let bmin = 1000000;
    let bmax = 0;

    for (const pixel of pixels) {
      const rval = pixel[0] >> rshift;
      const gval = pixel[1] >> rshift;
      const bval = pixel[2] >> rshift;

      if (rval < rmin) {
        rmin = rval;
      } else if (rval > rmax) {
        rmax = rval;
      }
      if (gval < gmin) {
        gmin = gval;
      } else if (gval > gmax) {
        gmax = gval;
      }
      if (bval < bmin) {
        bmin = bval;
      } else if (bval > bmax) {
        bmax = bval;
      }
    }

    return new ColorSpaceBox(rmin, rmax, gmin, gmax, bmin, bmax, histogram);
  }

  volume(): number {
    if (!this.#volume) {
      this.#volume = (this.r2 - this.r1 + 1) *
        (this.g2 - this.g1 + 1) *
        (this.b2 - this.b1 + 1);
    }
    return this.#volume;
  }

  count(): number {
    if (!this.#count) {
      let npix = 0;

      for (let i = this.r1; i <= this.r2; i++) {
        for (let j = this.g1; j <= this.g2; j++) {
          for (let k = this.b1; k <= this.b2; k++) {
            const index = getColorIndex(i, j, k);
            npix += this.histogram[index] || 0;
          }
        }
      }

      this.#count = npix;
    }
    return this.#count;
  }

  copy() {
    return new ColorSpaceBox(
      this.r1,
      this.r2,
      this.g1,
      this.g2,
      this.b1,
      this.b2,
      this.histogram,
    );
  }

  avg(): Pixels {
    if (!this.#avg) {
      const mult = 1 << (8 - sigbits);

      let ntot = 0,
        rsum = 0,
        gsum = 0,
        bsum = 0,
        hval = 0;

      for (let i = this.r1; i <= this.r2; i++) {
        for (let j = this.g1; j <= this.g2; j++) {
          for (let k = this.b1; k <= this.b2; k++) {
            const histoindex = getColorIndex(i, j, k);
            hval = this.histogram[histoindex] || 0;
            ntot += hval;
            rsum += hval * (i + 0.5) * mult;
            gsum += hval * (j + 0.5) * mult;
            bsum += hval * (k + 0.5) * mult;
          }
        }
      }

      if (ntot) {
        this.#avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
      } else {
        this.#avg = [
          ~~((mult * (this.r1 + this.r2 + 1)) / 2),
          ~~((mult * (this.g1 + this.g2 + 1)) / 2),
          ~~((mult * (this.b1 + this.b2 + 1)) / 2),
        ];
      }
    }

    return this.#avg;
  }

  contains(pixel: number[]) {
    const rval = pixel[0] >> rshift;
    const gval = pixel[1] >> rshift;
    const bval = pixel[2] >> rshift;

    return (
      rval >= this.r1 &&
      rval <= this.r2 &&
      gval >= this.g1 &&
      gval <= this.g2 &&
      bval >= this.b1 &&
      bval <= this.b2
    );
  }
}

export { ColorSpaceBox };
