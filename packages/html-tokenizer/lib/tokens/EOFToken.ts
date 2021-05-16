import {Token} from './token'
import {TokenKind} from '../types'

export class EOFToken extends Token {
    public constructor(
        input: string,
        begin: number,
        end: number,
        file?: string,
     ) {
         super(TokenKind.EOFToken, input,begin,end, file);
     }
  
}