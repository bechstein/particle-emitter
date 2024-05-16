import { Particle } from '../Particle';
import { BehaviorOrder, IEmitterBehavior } from './Behaviors';
import { BehaviorEditorConfig } from './editor/Types';
/**
 * create random seed to be used in other behaviours...
 */
export class RandomSeedBehavior implements IEmitterBehavior
{
    public static type = 'randomSeed';
    public static editorConfig: BehaviorEditorConfig | null = null;

    public order = BehaviorOrder.Spawn;
    private randomSeed: number;
    constructor()
    {
        this.randomSeed = Math.random();
    }
    initParticles(_first: Particle): void
    {
    // really just a no-op
    }
}
