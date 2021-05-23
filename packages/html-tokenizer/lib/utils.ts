import util from "util";
import { TokenKind } from "./types";
import { TopLevelToken, CharacterToken, HtmlTagToken } from "./tokens/tokens";

export const isAsciiLetter = (str: string): boolean => {
  return str.length === 1 && Boolean(/[a-zA-Z]/i.exec(str));
};

export const fromCharSet = (charCodes: number[]): Set<string> => {
  const numberSet = new Set(charCodes);
  const charSet = new Set(
    [...numberSet].map((code) => String.fromCharCode(code))
  );

  return charSet;
};

export const logDeep = (target: any) => {
  console.log(util.inspect(target, false, null, true));
};

export const isCharacterToken = (
  token: TopLevelToken
): token is CharacterToken => {
  return "data" in token && token.kind === TokenKind.CharacterToken;
};

export const isHtmlTagToken = (token: TopLevelToken): token is HtmlTagToken => {
  return token.kind === TokenKind.HtmlTagToken;
};

export const matchTagToken = (token: TopLevelToken, tags: string[]): boolean => {
  if(!isHtmlTagToken(token)) {
    return false;
  }
  if(tags.join('').includes('/')) {
    return tags.includes(`</${token.name}>`);
  } else if(tags.join('').includes('<')) {
    return tags.includes(`<${token.name}>`)
  }

  return false;
}
