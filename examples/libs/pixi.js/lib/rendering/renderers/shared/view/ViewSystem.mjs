import { DOMAdapter } from '../../../../environment/adapter.mjs';
import { ExtensionType } from '../../../../extensions/Extensions.mjs';
import { Rectangle } from '../../../../maths/shapes/Rectangle.mjs';
import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation.mjs';
import { RenderTarget } from '../renderTarget/RenderTarget.mjs';
import { getCanvasTexture } from '../texture/utils/getCanvasTexture.mjs';

"use strict";
const _ViewSystem = class _ViewSystem {
  /** The resolution / device pixel ratio of the renderer. */
  get resolution() {
    return this.texture.source._resolution;
  }
  set resolution(value) {
    this.texture.source.resize(
      this.texture.source.width,
      this.texture.source.height,
      value
    );
  }
  /**
   * initiates the view system
   * @param options - the options for the view
   */
  init(options) {
    options = {
      ..._ViewSystem.defaultOptions,
      ...options
    };
    if (options.view) {
      deprecation(v8_0_0, "ViewSystem.view has been renamed to ViewSystem.canvas");
      options.canvas = options.view;
    }
    this.screen = new Rectangle(0, 0, options.width, options.height);
    this.canvas = options.canvas || DOMAdapter.get().createCanvas();
    this.antialias = !!options.antialias;
    this.texture = getCanvasTexture(this.canvas, options);
    this.renderTarget = new RenderTarget({
      colorTextures: [this.texture],
      depth: !!options.depth,
      isRoot: true
    });
    this.texture.source.transparent = options.backgroundAlpha < 1;
    this.multiView = !!options.multiView;
    if (this.autoDensity) {
      this.canvas.style.width = `${this.texture.width}px`;
      this.canvas.style.height = `${this.texture.height}px`;
    }
    this.resolution = options.resolution;
  }
  /**
   * Resizes the screen and canvas to the specified dimensions.
   * @param desiredScreenWidth - The new width of the screen.
   * @param desiredScreenHeight - The new height of the screen.
   * @param resolution
   */
  resize(desiredScreenWidth, desiredScreenHeight, resolution) {
    this.texture.source.resize(desiredScreenWidth, desiredScreenHeight, resolution);
    this.screen.width = this.texture.frame.width;
    this.screen.height = this.texture.frame.height;
    if (this.autoDensity) {
      this.canvas.style.width = `${desiredScreenWidth}px`;
      this.canvas.style.height = `${desiredScreenHeight}px`;
    }
  }
  /**
   * Destroys this System and optionally removes the canvas from the dom.
   * @param {options | false} options - The options for destroying the view, or "false".
   * @param options.removeView - Whether to remove the view element from the DOM. Defaults to `false`.
   */
  destroy(options = false) {
    const removeView = typeof options === "boolean" ? options : !!options?.removeView;
    if (removeView && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
};
/** @ignore */
_ViewSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem,
    ExtensionType.CanvasSystem
  ],
  name: "view",
  priority: 0
};
/** The default options for the view system. */
_ViewSystem.defaultOptions = {
  /**
   * {@link WebGLOptions.width}
   * @default 800
   */
  width: 800,
  /**
   * {@link WebGLOptions.height}
   * @default 600
   */
  height: 600,
  /**
   * {@link WebGLOptions.autoDensity}
   * @default false
   */
  autoDensity: false,
  /**
   * {@link WebGLOptions.antialias}
   * @default false
   */
  antialias: false
};
let ViewSystem = _ViewSystem;

export { ViewSystem };
//# sourceMappingURL=ViewSystem.mjs.map