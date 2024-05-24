import { ExtensionType } from '../../../../extensions/Extensions';
import type { UniformGroup } from '../../shared/shader/UniformGroup';
import type { System } from '../../shared/system/System';
import type { GlRenderingContext } from '../context/GlRenderingContext';
import type { WebGLRenderer } from '../WebGLRenderer';
import type { GlProgram } from './GlProgram';
/**
 * System plugin to the renderer to manage shaders.
 * @memberof rendering
 */
export declare class GlUniformGroupSystem implements System {
    /** @ignore */
    static extension: {
        readonly type: readonly [ExtensionType.WebGLSystem];
        readonly name: "uniformGroup";
    };
    /**
     * The current WebGL rendering context.
     * @member {WebGLRenderingContext}
     */
    protected gl: GlRenderingContext;
    /** Cache to holds the generated functions. Stored against UniformObjects unique signature. */
    private _cache;
    private _renderer;
    private _uniformGroupSyncHash;
    /** @param renderer - The renderer this System works for. */
    constructor(renderer: WebGLRenderer);
    protected contextChange(gl: GlRenderingContext): void;
    /**
     * Uploads the uniforms values to the currently bound shader.
     * @param group - the uniforms values that be applied to the current shader
     * @param program
     * @param syncData
     * @param syncData.textureCount
     */
    updateUniformGroup(group: UniformGroup, program: GlProgram, syncData: {
        textureCount: number;
    }): void;
    /**
     * Overrideable by the pixi.js/unsafe-eval package to use static syncUniforms instead.
     * @param group
     * @param program
     */
    private _getUniformSyncFunction;
    private _createUniformSyncFunction;
    private _generateUniformsSync;
    /**
     * Takes a uniform group and data and generates a unique signature for them.
     * @param group - The uniform group to get signature of
     * @param group.uniforms
     * @param uniformData - Uniform information generated by the shader
     * @param preFix
     * @returns Unique signature of the uniform group
     */
    private _getSignature;
    /** Destroys this System and removes all its textures. */
    destroy(): void;
}
