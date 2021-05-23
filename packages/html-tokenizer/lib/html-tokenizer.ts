import util from 'util'
import {WHITE_SPACES} from './constants/charSet'
import { State } from "./state";
import {isAsciiLetter,fromCharSet,logDeep} from './utils'
import {TopLevelToken} from './tokens/tokens'
import {CharacterToken} from './tokens/CharacterToken'
import {HtmlTagToken,TagTokenEnum} from './tokens/htmlTagToken'
import {EOFToken} from './tokens/EOFToken' 
import {TokenKind,TokenSink,TokenSinkResult} from './types'


export interface Attribute {
  [name: string]: any;
}

export interface TokenizerOptions {}

export class Tokenizer {
  static tokenize(sink: TokenSink,html: string, options = {}) {
    const tokenizer = new Tokenizer(sink, html, options);
    return tokenizer.tokenize(html);
  }

  /**
   * Static factory to create a tokenizer.
   * @param opts Tokenizer options.
   */
  static from(sink: TokenSink, input: string, opts: TokenizerOptions) {
    return new Tokenizer(sink, input, opts);
  }

  input: string;
  state: State = State.Data;
  at_eof: boolean;
  pos: number = 0;
  text_begin_pos: number = 0;
  text_end_pos: number = 0;
  current_input_character: string;
  current_tag_name: string;
  current_attribute_name: string;
  current_attribute_value: string;
  current_tag: HtmlTagToken;
  shouldReconsume: boolean;
  sink;

  constructor(sink: TokenSink, input: string, opts: TokenizerOptions) {
    this.sink = sink;
    this.state = State.Data;
    this.at_eof = false;
    this.shouldReconsume = false;
    this.text_begin_pos = 0;
    this.text_end_pos = 0;

    (this.pos = 0), (this.current_input_character = "");
    this.current_tag_name = "";
    this.current_attribute_name = "";
    this.current_attribute_value = "";
    this.input = input;
    this.current_tag = new HtmlTagToken({
      name: '',
      attributes: [],
      begin: this.pos,
      end: this.pos,
      input: this.input,
      self_closing: false,
      type: TagTokenEnum.StartTag
    })
  }
  
  reset_current_tag() {
    this.current_tag = new HtmlTagToken({
      name: '',
      attributes: [],
      begin: this.pos - 2,
      end: this.pos,
      input: this.input,
      self_closing: false,
      type: TagTokenEnum.StartTag
    });
    this.current_attribute_name = '';
    this.current_attribute_value = '';
    this.current_tag_name = '';
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

  *tokenize(html: string): IterableIterator<TopLevelToken> {
    let currentText;
    for (const tkn of this._tokenize(html)) {
      if (tkn.kind === TokenKind.CharacterToken) {
        const text = (tkn as CharacterToken).data;
        if (currentText === undefined) {
          this.text_begin_pos = tkn.begin - 1;
          currentText = text;
        } else {
          currentText += text;
          this.text_end_pos = tkn.end;
        }
      } else {
        if (currentText) {
          yield new CharacterToken(this.input, this.text_begin_pos, this.text_end_pos, currentText);
          currentText = undefined;
        }
        yield tkn;
      }
    }
  }

  private *_tokenize(html: string): IterableIterator<TopLevelToken> {
    while (this.pos < html.length) {
      switch (this.state) {
        case State.Data:
          this.consume_next_char(html);
          this.reset_current_tag();
          const isBracket = this.current_input_character === "<";
          const isEof = this.pos >= html.length;
          if (isBracket && !isEof) {
            this.state = State.TagOpen;
          } else if (isEof) {
            this.sink.process_token(new EOFToken(
              this.input,
              this.pos,
              this.pos,
            ));
            yield new EOFToken(
              this.input,
              this.pos,
              this.pos,
            )
          } else {
            this.sink.process_token(new CharacterToken(this.input, this.pos, this.pos, this.current_input_character));
            yield new CharacterToken(this.input, this.pos, this.pos, this.current_input_character);
          }
          break;
        case State.TagOpen:
          this.consume_next_char(html);
          if (this.current_input_character === "/") {
            this.state = State.EndTagOpen;
          } else if(isAsciiLetter(this.current_input_character)) {
            this.reset_current_tag();
            this.reconsume();
            this.state = State.TagName;
          } else {
            this.reconsume();
            this.state = State.Data;
          }
          break;
        case State.TagName:
          this.consume_next_char(html);

          if (this.current_input_character === " ") {
            this.state = State.BeforeAttributeName;
          } else if (this.current_input_character === "/") {
            this.state = State.SelfClosingStartTag;
          } else if (this.current_input_character === ">") {
            this.state = State.Data;

            this.current_tag.updateEndPos(this.pos);
            this.sink.process_token(this.current_tag);
            yield this.current_tag;
          } else {
            this.current_tag.appendName(this.current_input_character);
          }
          break;

        case State.EndTagOpen:
          this.consume_next_char(html);
          if (this.current_input_character === ">") {
            this.state = State.Data;
          } else {
            this.current_tag = new HtmlTagToken({
              name: '',
              input: this.input,
              type: TagTokenEnum.EndTag,
              self_closing: false,
              attributes: [],
              begin: this.pos - 3,
              end: this.pos,
            })

            this.reconsume();
            this.state = State.TagName;
          }
          break;
        case State.BeforeAttributeName:
          if(this.current_attribute_name && this.current_attribute_value) {
            this.current_tag.attributes.push({
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

              this.current_tag.addAttribute(extraAttribute);
              this.current_tag.updateEndPos(this.pos);
              // emit tag token
              this.sink.process_token(this.current_tag);
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
