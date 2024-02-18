// Based on https://github.com/olivierlesnicki/quantize

import { ColorSpaceBox } from "./color_space_box.ts";
import { Pixels } from "./colors.ts";
import { naturalOrder, PriorityQueue } from "./priority_queue.ts";

type ColorMapItem = {
  vbox: ColorSpaceBox;
  color: Pixels;
};

class ColorMap {
  #items = new PriorityQueue<ColorMapItem>((a, b) => {
    return naturalOrder(
      a.vbox.count() * a.vbox.volume(),
      b.vbox.count() * b.vbox.volume(),
    );
  });

  push(vbox: ColorSpaceBox) {
    this.#items.push({
      vbox: vbox,
      color: vbox.avg(),
    });
  }

  palette() {
    return this.#items.map((vb) => {
      return vb.color;
    });
  }

  nearest(color: Pixels) {
    let lowestDistance: number | undefined;
    let nearestColor: Pixels | undefined;

    for (let i = 0; i < this.#items.size(); i++) {
      const item = this.#items.peek(i);
      if (item) {
        const sumOfPowers = Math.pow(color[0] - item.color[0], 2) +
          Math.pow(color[1] - item.color[1], 2) +
          Math.pow(color[2] - item.color[2], 2);

        const distance = Math.sqrt(sumOfPowers);

        if (lowestDistance === undefined || distance < lowestDistance) {
          lowestDistance = distance;
          nearestColor = item.color;
        }
      }
    }
    return nearestColor;
  }

  map(color: Pixels) {
    for (let i = 0; i < this.#items.size(); i++) {
      const item = this.#items.peek(i);
      if (item && item.vbox.contains(color)) {
        return item.color;
      }
    }
    return this.nearest(color);
  }
}

export { ColorMap };
