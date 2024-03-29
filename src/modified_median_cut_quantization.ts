// Based on https://github.com/olivierlesnicki/quantize

import { maxBy } from "@std/collections";
import { ColorMap } from "./color_map.ts";
import { ColorSpaceBox } from "./color_space_box.ts";
import { getColorIndex, getHistogram, Histogram, Pixels } from "./colors.ts";
import { naturalOrder, PriorityQueue } from "./priority_queue.ts";

function medianCutApply(
  histo: Histogram,
  vbox: ColorSpaceBox,
): ColorSpaceBox[] {
  if (!vbox.count()) {
    return [];
  }

  // only one pixel, no split
  if (vbox.count() == 1) {
    return [vbox.copy()];
  }

  const rw = vbox.r2 - vbox.r1 + 1;
  const gw = vbox.g2 - vbox.g1 + 1;
  const bw = vbox.b2 - vbox.b1 + 1;
  const maxw = maxBy([rw, gw, bw], (x) => x);

  /* Find the partial sum arrays along the selected axis. */
  let total = 0;
  const partialsum: number[] = [];
  const lookaheadsum: number[] = [];

  if (maxw == rw) {
    for (let i = vbox.r1; i <= vbox.r2; i++) {
      let sum = 0;
      for (let j = vbox.g1; j <= vbox.g2; j++) {
        for (let k = vbox.b1; k <= vbox.b2; k++) {
          const index = getColorIndex(i, j, k);
          sum += histo[index] || 0;
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  } else if (maxw == gw) {
    for (let i = vbox.g1; i <= vbox.g2; i++) {
      let sum = 0;
      for (let j = vbox.r1; j <= vbox.r2; j++) {
        for (let k = vbox.b1; k <= vbox.b2; k++) {
          const index = getColorIndex(j, i, k);
          sum += histo[index] || 0;
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  } else {
    /* maxw == bw */
    for (let i = vbox.b1; i <= vbox.b2; i++) {
      let sum = 0;
      for (let j = vbox.r1; j <= vbox.r2; j++) {
        for (let k = vbox.g1; k <= vbox.g2; k++) {
          const index = getColorIndex(j, k, i);
          sum += histo[index] || 0;
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  }

  partialsum.forEach(function (d, i) {
    lookaheadsum[i] = total - d;
  });

  type ColorSign = "r" | "g" | "b";
  type VirtualBoxColorProp = `${ColorSign}${1 | 2}`;

  function doCut(color: ColorSign) {
    const dim1 = (color + "1") as VirtualBoxColorProp;
    const dim2 = (color + "2") as VirtualBoxColorProp;

    for (let i = vbox[dim1]; i <= vbox[dim2]; i++) {
      if (partialsum[i] > total / 2) {
        const vbox1 = vbox.copy();
        const vbox2 = vbox.copy();

        const left = i - vbox[dim1];
        const right = vbox[dim2] - i;

        let d2 = 0;

        if (left <= right) {
          d2 = Math.min(vbox[dim2] - 1, ~~(i + right / 2));
        } else {
          d2 = Math.max(vbox[dim1], ~~(i - 1 - left / 2));
        }
        // avoid 0-count boxes
        while (!partialsum[d2]) {
          d2++;
        }

        let count2 = lookaheadsum[d2];
        while (!count2 && partialsum[d2 - 1]) {
          count2 = lookaheadsum[--d2];
        }
        // set dimensions
        vbox1[dim2] = d2;
        vbox2[dim1] = vbox1[dim2] + 1;
        return [vbox1, vbox2];
      }
    }

    return [];
  }
  // determine the cut planes
  return maxw == rw ? doCut("r") : maxw == gw ? doCut("g") : doCut("b");
}

function quantize(pixels: Pixels[], colorCount: number): ColorMap {
  if (!pixels.length) {
    throw new Error("pixels array cannot be empty.");
  }

  if (colorCount < 2 || colorCount > 256) {
    throw new Error("colorCout should be in range [2, 256].");
  }

  const maxIterations = 1000;
  const fractByPopulations = 0.75;

  // TODO: check color content and convert to grayscale if insufficient
  const histo = getHistogram(pixels);

  // check that we aren't below maxcolors already
  if (histo.length <= colorCount) {
    // TODO: generate the new colors from the histo and return
  }

  // get the beginning vbox from the colors
  const vbox = ColorSpaceBox.create(pixels, histo);

  const pq = new PriorityQueue<ColorSpaceBox>(function (a, b) {
    return naturalOrder(a.count(), b.count());
  });

  pq.push(vbox);

  // inner function to do the iteration
  function iter(lh: PriorityQueue<ColorSpaceBox>, target: number) {
    let ncolors = 1;
    let niters = 0;

    while (niters < maxIterations) {
      const vbox = lh.pop();

      if (!vbox) {
        return;
      }

      if (vbox.count() === 0) {
        /* just put it back */
        lh.push(vbox);
        niters++;
        continue;
      }

      // do the cut
      const vboxes = medianCutApply(histo, vbox);
      const vbox1 = vboxes.at(0);
      const vbox2 = vboxes.at(1);

      if (!vbox1) {
        // vbox1 not defined; shouldn't happen!
        return;
      }

      lh.push(vbox1);

      if (vbox2) {
        /* vbox2 can be null */
        lh.push(vbox2);
        ncolors++;
      }

      if (ncolors >= target) {
        return;
      }

      if (niters++ > maxIterations) {
        // infinite loop; perhaps too few pixels!
        return;
      }
    }
  }

  // first set of colors, sorted by population
  iter(pq, fractByPopulations * colorCount);

  // Re-sort by the product of pixel occupancy times the size in color space.
  const pq2 = new PriorityQueue<ColorSpaceBox>((a, b) => {
    return naturalOrder(a.count() * a.volume(), b.count() * b.volume());
  });

  while (pq.size()) {
    const popped = pq.pop();
    if (popped) {
      pq2.push(popped);
    }
  }

  // next set - generate the median cuts using the (npix * vol) sorting.
  iter(pq2, colorCount - pq2.size());

  // calculate the actual colors
  const cmap = new ColorMap();
  while (pq2.size()) {
    const popped = pq2.pop();
    if (popped) {
      cmap.push(popped);
    }
  }

  return cmap;
}

export { quantize };
