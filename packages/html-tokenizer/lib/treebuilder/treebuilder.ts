import { TopLevelToken } from "../tokens/tokens";
import { TreeBuildMode } from "./state";
import { TokenSinkResult, TokenKind, TokenSink } from "../types";
import { ProcessResult, TreeSink } from "./types";
import { fromCharSet, isCharacterToken,isHtmlTagToken,matchTagToken } from "../utils";
import {Attribute} from './types' 

interface ProcessData {
  processResult: ProcessResult;
  mode: TreeBuildMode;
  token: TopLevelToken;
}

export class TreeBuilder<Handle, Sink extends TreeSink<Handle, any>> implements TokenSink {
  sink: Sink;

  // Tokens
  tokens: TopLevelToken[];
  /// Insertion mode.
  mode: TreeBuildMode;

  orig_mode: TreeBuildMode | null;
  /// Stack of open elements, most recently added at end.
  open_elems: Handle[];

  constructor({ sink, tokens }: { sink: Sink; tokens: TopLevelToken[] }) {
    this.sink = sink;
    this.mode = TreeBuildMode.Initial;
    this.open_elems = [];
    this.tokens = tokens;
    this.orig_mode = null;
  }

  // TODO
  insert_element() {}

  push(el: any) {
    this.open_elems.push(el);
  }

  // TODO
  insert_element_for() {}
  
  create_root(attrs: Attribute[]) {
    const elem = this.sink.create_element('html', attrs); 
    this.push(elem);
    // this.sink.append(doc_hanlde, elem);
  }

  // reprocess(mode: TreeBuildState, token: TopLevelToken) {
  //   this.mode = mode;
  // }

  process_token(token: TopLevelToken): TokenSinkResult {
    return this.process_token_to_complete(token);
  }

  end() {}

  process_token_to_complete(token: TopLevelToken): TokenSinkResult {
    let res: ProcessData | null;
    while (true) {
      res = this.setp(this.mode, token);
      // console.log('process res', res);
      if (res.processResult === ProcessResult.Done) {
        break;
      } else if (res.processResult === ProcessResult.Reprocess) {
        console.log("reprocess with token:", token.getText());
        this.mode = res.mode;
        token = res.token;
      }
    }
    return TokenSinkResult.Continue;
  }

  setp(mode: TreeBuildMode, token: TopLevelToken): ProcessData {
    switch (mode) {
      case TreeBuildMode.Initial:
        console.log("step token in initial", token);
        if (isCharacterToken(token)) {
          // TODO: do this logic later
          return { processResult: ProcessResult.Done, mode: this.mode, token };
        } else {
          return {
            processResult: ProcessResult.Reprocess,
            token,
            mode: TreeBuildMode.BeforeHtml,
          };
        }
        break;

      case TreeBuildMode.BeforeHtml:
        // A character token that is one of U+0009 CHARACTER TABULATION, U+000A LINE FEED (LF), U+000C FORM FEED (FF), U+000D CARRIAGE RETURN (CR), or U+0020 SPACE
        // Ignore the token
        if (
          isCharacterToken(token) &&
          [...fromCharSet([0x0009, 0x000a, 0x000c, 0x000d, 0x0020])].includes(
            token.data
          )
        ) {
          // ignore
          return {processResult: ProcessResult.Done, token, mode: this.mode};
        } else if(matchTagToken(token, ['<html>'])) {
          console.log('match <html>', mode, token.getText());
          this.create_root(token.attributes);
          this.mode = TreeBuildMode.BeforeHead;
          return {processResult: ProcessResult.Done, token, mode: this.mode};
        } else if(matchTagToken(token, ['</head>', '</body>', '</html>', '</br>'])) {
          console.log('match tag', mode, token.getText());
          return { processResult: ProcessResult.Done, token, mode: this.mode };
        } else {
          console.log('else reprocess', token.getText());
          return { processResult: ProcessResult.Reprocess, mode: TreeBuildMode.BeforeHead, token };
        }
        break;
      case TreeBuildMode.BeforeHead:
          return {processResult: ProcessResult.Done, mode: this.mode, token};
        break;

      default:
        console.log('step in default', this.mode);
        return { processResult: ProcessResult.Done, token, mode: this.mode };
        break;
    }
  }
}
