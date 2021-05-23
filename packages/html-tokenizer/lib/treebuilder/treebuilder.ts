import { TopLevelToken } from "../tokens/tokens";
import { TreeBuildState } from "./state";
import { TokenSinkResult,TokenKind, TokenSink } from "../types";
import {ProcessResult  } from "./types"; 

export class TreeBuilder implements TokenSink {
  sink: any;

  // Tokens
  tokens: TopLevelToken[];
  /// Insertion mode.
  mode: TreeBuildState;

  orig_mode: TreeBuildState | null;
  /// Stack of open elements, most recently added at end.
  open_elems: any[];

  constructor({ sink, tokens }: { sink: any; tokens: TopLevelToken[] }) {
    this.sink = sink;
    this.mode = TreeBuildState.Initial;
    this.open_elems = [];
    this.tokens = tokens;
    this.orig_mode = null;
  }
  
  // TODO
  insert_element() {
      
  }
  
  // TODO
  insert_element_for() {

  }        
  
  reprocess(mode: TreeBuildState, token: TopLevelToken) {
    this.mode = mode;

  }

  process_token(token: TopLevelToken): TokenSinkResult {
    return this.process_token_to_complete(token);
  }

  end() {}
  
  process_token_to_complete(token: TopLevelToken): TokenSinkResult {
      // while(true) {
    let res = this.setp(this.mode, token);        
      // }
    return TokenSinkResult.Continue;
  }
  
  setp(mode: TreeBuildState, token: TopLevelToken): ProcessResult {
      switch (mode) {
          case TreeBuildState.Initial:
              console.log('step token', token);
             if(token.kind === TokenKind.CharacterToken) {
                // TODO: do this logic later
             } else {
                this.reprocess(TreeBuildState.BeforeHtml, token);
             } 
            break;
      
          default:
              console.log('step token', token);
              break;
      }
      return ProcessResult.Done;
  }
}
