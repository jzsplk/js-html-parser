import util from 'util'
import {WHITE_SPACES} from './constants/charSet'
import { State } from "./state";
import {isAsciiLetter,fromCharSet} from './utils'

export enum TokenEnum {
  EOFToken = "EOFToken",
  CommentToken = "CommentToken",
  CharacterToken = "CharacterToken",
  TagToken = "TagToken",
}

export type Token = Tag | EOFToken | CharacterToken;

export enum TagKind {
  StartTag = "StartTag",
  EndTag = "EndTag",
}

export interface Attribute {
  [name: string]: any;
}

export interface Tag {
  type: TokenEnum.TagToken;
  kind: TagKind;
  name: string;
  self_closing: boolean;
  attrs: Attribute[];
}

export interface CharacterToken {
  type: TokenEnum.CharacterToken;
  data: string;
}

export interface EOFToken {
  type: TokenEnum.EOFToken;
}

export interface TokenizerOptions {}

export class Tokenizer {
  static tokenize(html: string, options = {}) {
    const tokenizer = new Tokenizer(options);
    return tokenizer.tokenize(html);
  }

  /**
   * Static factory to create a tokenizer.
   * @param opts Tokenizer options.
   */
  static from(opts: TokenizerOptions) {
    return new Tokenizer(opts);
  }

  state: State = State.Data;
  at_eof: boolean;
  pos: number = 0;
  current_input_character: string;
  current_tag_name: string;
  current_attribute_name: string;
  current_attribute_value: string;
  current_tag: Tag;
  shouldReconsume: boolean;

  constructor(opts: TokenizerOptions) {
    this.state = State.Data;
    this.at_eof = false;
    this.shouldReconsume = false;
    (this.pos = 0), (this.current_input_character = "");
    this.current_tag_name = "";
    this.current_attribute_name = "";
    this.current_attribute_value = "";
    this.current_tag = {
      type: TokenEnum.TagToken,
      kind: TagKind.StartTag,
      name: "",
      self_closing: false,
      attrs: [],
    };
  }

  consume_next_char(html: string) {
    if(this.shouldReconsume) {
      this.shouldReconsume = false;
    } else {
      this.current_input_character = html[this.pos];
      this.pos += 1;
    }
  }

  reconsume() {
    this.shouldReconsume = true;
  }
  
  ignore_char() {
    this.pos += 1;
  }

  *tokenize(html: string): IterableIterator<Token> {
    let currentText;
    for (const tkn of this._tokenize(html)) {
      if (tkn.type === TokenEnum.CharacterToken) {
        const text = tkn.data;
        if (currentText === undefined) {
          currentText = text;
        } else {
          currentText += text;
        }
      } else {
        if (currentText) {
          yield {
            type: TokenEnum.CharacterToken,
            data: currentText,
          };
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
          const isBracket = this.current_input_character === "<";
          // console.log('isBracket', isBracket);
          const isEof = this.pos >= html.length;
          if (isBracket && !isEof) {
            this.state = State.TagOpen;
            // yield TokenEnum.CharacterToken
          } else if (isEof) {
            yield { type: TokenEnum.EOFToken };
          } else {
            yield {
              type: TokenEnum.CharacterToken,
              data: this.current_input_character,
            };
          }
          break;
        case State.TagOpen:
          // console.log('state', this.state);
          this.consume_next_char(html);
          if (this.current_input_character === "/") {
            this.state = State.EndTagOpen;
          } else if(isAsciiLetter(this.current_input_character)) {
            this.current_tag = {
              type: TokenEnum.TagToken,
              kind: TagKind.StartTag,
              name: "",
              self_closing: false,
              attrs: [],
            };
            this.reconsume();
            this.state = State.TagName;
          } else {
            this.reconsume();
            this.state = State.Data;
          }
          break;
        case State.TagName:
          // console.log('state', this.state);
          this.consume_next_char(html);

          if (this.current_input_character === " ") {
            this.state = State.BeforeAttributeName;
          } else if (this.current_input_character === "/") {
            this.state = State.SelfClosingStartTag;
          } else if (this.current_input_character === ">") {
            this.state = State.Data;
            yield this.current_tag;
          } else {
            this.current_tag = {
              ...this.current_tag,
              name: this.current_tag.name + this.current_input_character,
            };
          }
          break;

        case State.EndTagOpen:
          // console.log('state', this.state);
          this.consume_next_char(html);
          if (this.current_input_character === ">") {
            this.state = State.Data;
          } else {
            this.current_tag = {
              type: TokenEnum.TagToken,
              kind: TagKind.EndTag,
              name: "",
              attrs: [],
              self_closing: false,
            };

            this.reconsume();
            this.state = State.TagName;
          }
          break;
        case State.BeforeAttributeName:
          if(this.current_attribute_name && this.current_attribute_value) {
            this.current_tag.attrs.push({
              [this.current_attribute_name]: this.current_attribute_value
            })
          }
          this.current_attribute_name = '';
          this.current_attribute_value = '';

          this.consume_next_char(html);
          // tab LF FF space
          const ignoreChars = WHITE_SPACES;
          // / > 
          const afterNameChars = [0x002f, 0x003e];
          if([...fromCharSet(ignoreChars)].includes(this.current_input_character)) {
            // ignore
          } else if([...fromCharSet(afterNameChars)].includes(this.current_input_character)) {
            this.state = State.AfterAttributeName;
            this.reconsume()
          } else {
            this.state = State.AttributeName;
            this.reconsume();
          }
          break;  
        case State.AttributeName:
          this.consume_next_char(html);
          // tab, LF, FF, SPACE, (/), (>)
          const goToAfterAttributeStateCharSet = [0x0009, 0x000A, 0x000C, 0x0020, 0x002F, 0x003E];
          // =
          const goToBeforeAttributeCharSet = [0x003D];
          
          // (") (') (<)
          const inAttributeNameErrorCharSet = [0x0022, 0x0027, 0x003C];
          if([...fromCharSet(goToAfterAttributeStateCharSet)].includes(this.current_input_character)) {
            this.state = State.AfterAttributeName;
            this.reconsume();
          } else if([...fromCharSet(goToBeforeAttributeCharSet)].includes(this.current_input_character)) {
            this.state = State.BeforeAttributeValue; 
          } else if (isAsciiLetter(this.current_input_character)) {
              this.current_attribute_name += this.current_input_character.toLowerCase();
          } else if([...fromCharSet([0x0000])].includes(this.current_input_character)) {
            // This is an unexpected-null-character parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's name.
            this.current_attribute_name += String.fromCharCode(0xFFFD);
          } else if([...fromCharSet(inAttributeNameErrorCharSet)].includes(this.current_input_character)) {
            this.current_attribute_name += this.current_input_character;
          } else {
            this.current_attribute_name += this.current_input_character;
          }
            
          break;
          
        case State.BeforeAttributeValue:
          this.consume_next_char(html);
        
          if([...fromCharSet(WHITE_SPACES)].includes(this.current_input_character)) {
            // ignore
          } else if ([...fromCharSet([0x0022])].includes(this.current_input_character)) {
            this.state = State.AttributeValueDoubleQuotedState;
          } else if([...fromCharSet([0x0027])].includes(this.current_input_character)) {
            this.state = State.AttributeValueSingleQuotedState;
          } // This is a missing-attribute-value parse error. Switch to the data state. Emit the current tag token.
            else if([...fromCharSet([0x003E])].includes(this.current_input_character)) {
            console.error('missing attribute value parse error');
          } else {
            this.state = State.AttributeValueUnquotedState;
            this.reconsume();
          }
          break;
          
        case State.AttributeValueDoubleQuotedState:
          this.consume_next_char(html);
          // TODO
          // (")
          if([...fromCharSet([0x0022])].includes(this.current_input_character)) {
            this.state = State.AfterAttributeValueQuotedState;
          } else if ([...fromCharSet([0x0026])].includes(this.current_input_character)) {
            // TODO
            // Set the return state to the attribute value (double-quoted) state. Switch to the character reference state.     }
          } else if([...fromCharSet([0x0000])].includes(this.current_input_character)) {
            // TODO
            // This is an unexpected-null-character parse error. Append a U+FFFD REPLACEMENT CHARACTER character to the current attribute's value.
            this.current_attribute_value += String.fromCharCode(0xFFFD);
          } else {
            this.current_attribute_value += this.current_input_character;
          }
          break;
          
        case State.AfterAttributeValueQuotedState:
          this.consume_next_char(html);
          if([...fromCharSet(WHITE_SPACES)].includes(this.current_input_character)) {
            this.state = State.BeforeAttributeName;
          } // (/)
            else if([...fromCharSet([0x002F])].includes(this.current_input_character)) {
            this.state = State.SelfClosingStartTag;
          } // (>)
            else if([...fromCharSet([0x003E])].includes(this.current_input_character)) {
              this.state = State.Data;
              const extraAttribute = {
                [this.current_attribute_name]: this.current_attribute_value,
              }

              this.current_tag = {
                ...this.current_tag,
                attrs: [...this.current_tag.attrs, extraAttribute],
              }
              yield this.current_tag; 
          }
          break;
        
        default:
          console.log("else state", this.state);
          this.consume_next_char(html);
          break;
      }
    }
  }
}

export const htmlTokenizer = () => {
  console.log("demo tokenizer start...");
  const demoHtml = `<div>
    <p class="tt" color="red">demo content</p>
    </div>`;
  console.log("html is", demoHtml);
  const tokenizer = new Tokenizer({});

  console.log(util.inspect([...tokenizer.tokenize(demoHtml)], false, null, true /* enable colors */))
};
