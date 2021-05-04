import { State } from './state'

export enum TokenEnum {
    EOFToken = "EOFToken",
    CommentToken = "CommentToken",
    CharacterToken = "CharacterToken",
    TagToken = "TagToken"
}

export type Token = Tag | EOFToken | CharacterToken

export enum TagKind {
    StartTag = 'StartTag',
    EndTag = 'EndTag'
}

export interface Attribute {
    [name: string]: string
}

export interface Tag {
    type: TokenEnum.TagToken,
    kind: TagKind,
    name: string,
    self_closing: boolean,
    attrs: Attribute[]
}

export interface CharacterToken {
    type: TokenEnum.CharacterToken,
    content: string;
}

export interface EOFToken {
    type: TokenEnum.EOFToken
}

export class Tokenizer {
    static tokenize(html: string, options = {}) {
        const tokenizer = new Tokenizer();
        return [...tokenizer._tokenize(html)];
    }

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
            type: TokenEnum.TagToken,
            kind: TagKind.StartTag,
            name: '',
            self_closing: false,
            attrs: []
        }
    }

    consume_next_char(html: string) {
        this.current_input_character = html[this.pos];
        this.pos += 1;
    }

    reconsume() {
        this.shouldReconsume = false;
    }

    *tokenize(html: string): IterableIterator<Token> {
        let currentText;
        for (const tkn of this._tokenize(html)) {
            if (tkn.type === TokenEnum.CharacterToken) {
                const text = tkn.content;
                if(currentText === undefined) {
                    currentText = text;
                } else {
                    currentText += text;
                }
            } else {
                if(currentText) {
                    yield {
                        type: TokenEnum.CharacterToken,
                        content: currentText
                    }
                    currentText = undefined;
                }
                yield tkn;
            }
        }
    }

    private *_tokenize(html: string): IterableIterator<Token> {
        while (this.pos < html.length) {
            switch (this.state) {
                case State.Data:
                    this.consume_next_char(html);
                    const isBracket = this.current_input_character === '<';
                    // console.log('isBracket', isBracket);
                    const isEof = this.pos >= html.length;
                    if (isBracket && !isEof) {
                        this.state = State.TagOpen;
                        // yield TokenEnum.CharacterToken
                    } else if (isEof) {
                        yield {type: TokenEnum.EOFToken};
                    } else {
                        yield {
                            type: TokenEnum.CharacterToken,
                            content: this.current_input_character
                        }
                    }
                    break;
                case State.TagOpen:
                    // console.log('state', this.state);
                    this.consume_next_char(html);
                    if (this.current_input_character === '/') {
                        this.state = State.EndTagOpen;
                    } else {
                        this.current_tag = {
                            type: TokenEnum.TagToken,
                            kind: TagKind.StartTag,
                            name: '',
                            self_closing: false,
                            attrs: [],
                        }
                        this.shouldReconsume = true;
                        this.state = State.TagName
                    }
                    break;
                case State.TagName:
                    // console.log('state', this.state);
                    if (this.shouldReconsume) {
                        this.reconsume();
                    } else {
                        this.consume_next_char(html);
                    }

                    if (this.current_input_character === ' ') {
                        this.state = State.BeforeAttributeName;
                    } else if (this.current_input_character === '/') {
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
                    break;

                case State.EndTagOpen:
                    // console.log('state', this.state);
                    this.consume_next_char(html);
                    if (this.current_input_character === '>') {
                        this.state = State.Data;
                    } else {
                        this.current_tag = {
                            type: TokenEnum.TagToken,
                            kind: TagKind.EndTag,
                            name: '',
                            attrs: [],
                            self_closing: false
                        }

                        this.shouldReconsume = true;
                        this.state = State.TagName;
                    }
                    break;
                default:
                    console.log('else state', this.state);
                    this.consume_next_char(html);
                    break;
            }
        }
    }
}

export const htmlTokenizer = () => {
    console.log('demo tokenizer start...');
    const demoHtml = '<div><p>demo de</p></div>';
    console.log('html is', demoHtml);
    const tokenizer = new Tokenizer();

    console.log([...tokenizer.tokenize(demoHtml)]);
}