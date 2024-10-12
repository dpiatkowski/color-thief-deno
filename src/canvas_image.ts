import {
  CanvasRenderingContext2D,
  createCanvas,
  EmulatedCanvas2D,
  Image,
  loadImage,
} from "@gfx/canvas-wasm";

class CanvasImage implements Disposable {
  #width: number;
  #height: number;
  #canvas: EmulatedCanvas2D;
  #context: CanvasRenderingContext2D;

  private constructor(img: Image) {
    this.#width = img.width();
    this.#height = img.height();
    this.#canvas = createCanvas(this.#width, this.#height);
    this.#context = this.#canvas.getContext("2d");
    this.#context.drawImage(img, 0, 0, this.#width, this.#height);
  }

  static async load(uri: string) {
    const image = await loadImage(uri);
    return new CanvasImage(image);
  }

  getPixelCount() {
    return this.#width * this.#height;
  }

  getImageData() {
    return this.#context.getImageData(0, 0, this.#width, this.#height);
  }

  [Symbol.dispose]() {
    this.#canvas.dispose();
  }
}

export { CanvasImage };
