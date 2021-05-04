import {State} from './state'

export enum TokenEnum {
    EOFToken,
    CommentToken,
    CharacterToken
} 

export type Token = Tag | TokenEnum | CharacterToken

export enum TagKind {
    StartTag = 'StartTag',
    EndTag = 'EndTag'
}

export interface Attribute {
    [name: string]: string
}

export interface Tag {
    kind: TagKind,
    name: string,
    self_closing: boolean,
    attrs: Attribute[]
}

export interface CharacterToken {
    content: string;
}

export class Tokenizer {
    // static tokenizer(html:string, options = {}) {
    //     const tokenizer = new Tokenizer(options);
    //     return tokenizer.tokenizer(html);
    // }
    
    // static from(options) {

    // }
    state: State = State.Data
    at_eof: boolean
    pos: number = 0
    current_input_character: string
    current_tag_name: string
    current_tag: Tag
    shouldReconsume: boolean
    
    constructor() {
        this.state = State.Data
        this.at_eof = false
        this.shouldReconsume = false
        this.pos = 0,
        this.current_input_character = ''
        this.current_tag_name = ''
        this.current_tag = {
            kind: TagKind.StartTag,
            name: '',
            self_closing: false,
            attrs: []
        }
    }
    
    consume_next_char(html:string) {
        this.current_input_character = html[this.pos];
        this.pos += 1;
    }
    
    reconsume() {
        this.shouldReconsume = false;
    }
    
    *_tokenize(html:string): IterableIterator<Token> {
        while(this.pos < html.length) {
            if(this.state === State.Data) {
                this.consume_next_char(html);
                const isBracket = this.current_input_character === '<';
                // console.log('isBracket', isBracket);
                const isEof = this.pos >= html.length;
                if(isBracket && !isEof) {
                    this.state = State.TagOpen;
                      // yield TokenEnum.CharacterToken
                } else if(isEof) {
                    yield TokenEnum.EOFToken;
                } else {
                    yield {
                        content: this.current_input_character
                    }
                }
             } else if (this.state === State.TagOpen) {
                // console.log('state', this.state);
                this.consume_next_char(html);
                if(this.current_input_character === '/') {
                    this.state = State.EndTagOpen;
                } else {
                    this.current_tag = {
                        kind: TagKind.StartTag,
                        name: '',
                        self_closing: false,
                        attrs: [],
                    }
                    this.shouldReconsume = true;
                    this.state = State.TagName 
                }
             } else if(this.state === State.TagName) {
                // console.log('state', this.state);
                if (this.shouldReconsume) {
                    this.reconsume();
                } else {
                    this.consume_next_char(html);
                }

                if(this.current_input_character === ' ') {
                    this.state = State.BeforeAttributeName;
                } else if(this.current_input_character === '/') {
                    this.state = State.SelfClosingStartTag; 
                } else if (this.current_input_character === '>') {
                    this.state = State.Data;
                    yield this.current_tag;
                } else {
                    this.current_tag = {
                        ...this.current_tag,
                        name: this.current_tag.name + this.current_input_character
                    }
                }
             } else if (this.state === State.EndTagOpen) {
                // console.log('state', this.state);
                 this.consume_next_char(html);
                if(this.current_input_character === '>') {
                    this.state = State.Data;
                } else {
                    this.current_tag = {
                        kind: TagKind.EndTag,
                        name: '',
                        attrs: [],
                        self_closing: false
                    } 
                    
                    this.shouldReconsume = true;
                    this.state = State.TagName;
                }
             } else {
                 console.log('else state', this.state);
                 this.consume_next_char(html);
             } 
        }
    }
}

export const htmlTokenizer = () => {
    console.log('demo tokenizer start...');
    const demoHtml = '<div><p>demo de</p></div>';
    console.log('html is', demoHtml);
    const tokenizer = new Tokenizer();

    console.log([...tokenizer._tokenize(demoHtml)]);
}