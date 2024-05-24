'use strict';

var Extensions = require('../../../extensions/Extensions.js');
var BatchGeometry = require('../../../rendering/batcher/gpu/BatchGeometry.js');
var getTextureBatchBindGroup = require('../../../rendering/batcher/gpu/getTextureBatchBindGroup.js');
var Batcher = require('../../../rendering/batcher/shared/Batcher.js');
var InstructionSet = require('../../../rendering/renderers/shared/instructions/InstructionSet.js');
var PoolGroup = require('../../../utils/pool/PoolGroup.js');
var buildContextBatches = require('./utils/buildContextBatches.js');

"use strict";
class GpuGraphicsContext {
  constructor() {
    this.batches = [];
    this.geometryData = {
      vertices: [],
      uvs: [],
      indices: []
    };
  }
}
class GraphicsContextRenderData {
  constructor() {
    this.geometry = new BatchGeometry.BatchGeometry();
    this.instructions = new InstructionSet.InstructionSet();
  }
  init() {
    this.instructions.reset();
  }
}
const _GraphicsContextSystem = class _GraphicsContextSystem {
  constructor() {
    // the root context batches, used to either make a batch or geometry
    // all graphics use this as a base
    this._activeBatchers = [];
    this._gpuContextHash = {};
    // used for non-batchable graphics
    this._graphicsDataContextHash = /* @__PURE__ */ Object.create(null);
    this._needsContextNeedsRebuild = [];
  }
  /**
   * Runner init called, update the default options
   * @ignore
   */
  init(options) {
    _GraphicsContextSystem.defaultOptions.bezierSmoothness = options?.bezierSmoothness ?? _GraphicsContextSystem.defaultOptions.bezierSmoothness;
  }
  prerender() {
    this._returnActiveBatchers();
  }
  getContextRenderData(context) {
    return this._graphicsDataContextHash[context.uid] || this._initContextRenderData(context);
  }
  // Context management functions
  updateGpuContext(context) {
    let gpuContext = this._gpuContextHash[context.uid] || this._initContext(context);
    if (context.dirty) {
      if (gpuContext) {
        this._cleanGraphicsContextData(context);
      } else {
        gpuContext = this._initContext(context);
      }
      buildContextBatches.buildContextBatches(context, gpuContext);
      const batchMode = context.batchMode;
      if (context.customShader || batchMode === "no-batch") {
        gpuContext.isBatchable = false;
      } else if (batchMode === "auto") {
        gpuContext.isBatchable = gpuContext.geometryData.vertices.length < 400;
      }
      context.dirty = false;
    }
    return gpuContext;
  }
  getGpuContext(context) {
    return this._gpuContextHash[context.uid] || this._initContext(context);
  }
  _returnActiveBatchers() {
    for (let i = 0; i < this._activeBatchers.length; i++) {
      PoolGroup.BigPool.return(this._activeBatchers[i]);
    }
    this._activeBatchers.length = 0;
  }
  _initContextRenderData(context) {
    const graphicsData = PoolGroup.BigPool.get(GraphicsContextRenderData);
    const { batches, geometryData } = this._gpuContextHash[context.uid];
    const vertexSize = geometryData.vertices.length;
    const indexSize = geometryData.indices.length;
    for (let i = 0; i < batches.length; i++) {
      batches[i].applyTransform = false;
    }
    const batcher = PoolGroup.BigPool.get(Batcher.Batcher);
    this._activeBatchers.push(batcher);
    batcher.ensureAttributeBuffer(vertexSize);
    batcher.ensureIndexBuffer(indexSize);
    batcher.begin();
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      batcher.add(batch);
    }
    batcher.finish(graphicsData.instructions);
    const geometry = graphicsData.geometry;
    geometry.indexBuffer.setDataWithSize(batcher.indexBuffer, batcher.indexSize, true);
    geometry.buffers[0].setDataWithSize(batcher.attributeBuffer.float32View, batcher.attributeSize, true);
    const drawBatches = batcher.batches;
    for (let i = 0; i < drawBatches.length; i++) {
      const batch = drawBatches[i];
      batch.bindGroup = getTextureBatchBindGroup.getTextureBatchBindGroup(batch.textures.textures, batch.textures.count);
    }
    this._graphicsDataContextHash[context.uid] = graphicsData;
    return graphicsData;
  }
  _initContext(context) {
    const gpuContext = new GpuGraphicsContext();
    this._gpuContextHash[context.uid] = gpuContext;
    context.on("update", this.onGraphicsContextUpdate, this);
    context.on("destroy", this.onGraphicsContextDestroy, this);
    return this._gpuContextHash[context.uid];
  }
  onGraphicsContextUpdate(context) {
    this._needsContextNeedsRebuild.push(context);
  }
  onGraphicsContextDestroy(context) {
    this._cleanGraphicsContextData(context);
    context.off("update", this.onGraphicsContextUpdate, this);
    context.off("destroy", this.onGraphicsContextDestroy, this);
    this._gpuContextHash[context.uid] = null;
  }
  _cleanGraphicsContextData(context) {
    const gpuContext = this._gpuContextHash[context.uid];
    if (!gpuContext.isBatchable) {
      if (this._graphicsDataContextHash[context.uid]) {
        PoolGroup.BigPool.return(this.getContextRenderData(context));
        this._graphicsDataContextHash[context.uid] = null;
      }
    }
    if (gpuContext.batches) {
      gpuContext.batches.forEach((batch) => {
        PoolGroup.BigPool.return(batch);
      });
    }
  }
  destroy() {
    for (const context of this._needsContextNeedsRebuild) {
      if (this._gpuContextHash[context.uid]) {
        this.onGraphicsContextDestroy(context);
      }
    }
    this._needsContextNeedsRebuild.length = 0;
  }
};
/** @ignore */
_GraphicsContextSystem.extension = {
  type: [
    Extensions.ExtensionType.WebGLSystem,
    Extensions.ExtensionType.WebGPUSystem,
    Extensions.ExtensionType.CanvasSystem
  ],
  name: "graphicsContext"
};
/** The default options for the GraphicsContextSystem. */
_GraphicsContextSystem.defaultOptions = {
  /**
   * A value from 0 to 1 that controls the smoothness of bezier curves (the higher the smoother)
   * @default 0.5
   */
  bezierSmoothness: 0.5
};
let GraphicsContextSystem = _GraphicsContextSystem;

exports.GpuGraphicsContext = GpuGraphicsContext;
exports.GraphicsContextRenderData = GraphicsContextRenderData;
exports.GraphicsContextSystem = GraphicsContextSystem;
//# sourceMappingURL=GraphicsContextSystem.js.map
