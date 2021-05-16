import {Token} from './token'
import {TokenKind} from '../types'

export class CharacterToken extends Token {
    public data: string;
    
    public constructor(
       input: string,
       begin: number,
       end: number,
       data: string,
       file?: string,
    ) {
        super(TokenKind.CharacterToken, input,begin,end, file);
        this.data = data;
    }
    
    updateBegin(pos: number) {
        this.begin = pos;
    }
    
    updateEnd(pos: number) {
        this.end = pos;
    }
}