import {TopLevelToken} from '../tokens/tokens'
import {TreeBuildState} from './state'
export class TreeBuilder {

    /// Insertion mode.
    state: TreeBuildState
    /// Stack of open elements, most recently added at end.
    open_elems: TopLevelToken[]

    constructor({}) {
        this.state = TreeBuildState.Initial
        this.open_elems = []
    }   
}