import {TopLevelToken} from  './tokens/tokens'
/**
 * A map of entity names to their character values. Passed
 * to a parser or tokenizer on instantiation.
 */
 export interface Entities {
    [name: string]: string;
  }
  
export enum TokenKind {
  EOFToken = "EOFToken",
  CommentToken = "CommentToken",
  CharacterToken = "CharacterToken",
  HtmlTagToken = "HtmlTagToken",
}

export interface TokenSink {
  process_token(token: TopLevelToken): TokenSinkResult,
  end(): void 
}
  
export enum TokenSinkResult {
  Continue = "Continue",
  Script = "Script",
  Plaintext = "Plaintext",
  RawData = "RawData",
}