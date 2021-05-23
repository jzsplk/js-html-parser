import {HtmlTagToken} from './htmlTagToken'
import {CharacterToken} from './CharacterToken'
import {Token} from './token'

export type TopLevelToken =  HtmlTagToken | CharacterToken | Token;
export {HtmlTagToken, CharacterToken, Token};