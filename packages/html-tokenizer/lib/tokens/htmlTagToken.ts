import {Token} from './token'
import {TokenKind} from '../types'

export interface Attribute {
    [name: string]: any;
}

export enum TagTokenEnum {
    StartTag = 'StartTag',
    EndTag = 'EndTag'
}
 
export class HtmlTagToken extends Token {
    public name: string
    public type: TagTokenEnum
    public self_closing: boolean
    public attributes: Attribute[]

    public constructor(
        {input, begin, end, name, attributes = [], self_closing, type, file}: {
            input: string,
            begin: number,
            end: number,
            name: string,
            attributes: Attribute[],
            self_closing: boolean,
            type: TagTokenEnum,
            file?: string,
        }
    ) {
        super(TokenKind.HtmlTagToken, input, begin, end, file);
        this.name = name;
        this.self_closing = self_closing;
        this.attributes = attributes;
        this.type = type;
    }
    
    public appendName(char: string) {
        this.name += char;
    }
    
    public addAttribute(attr: Attribute) {
        this.attributes.push(attr);
    }
    
    public updateEndPos(pos: number) {
        this.end = pos;
    }
} 