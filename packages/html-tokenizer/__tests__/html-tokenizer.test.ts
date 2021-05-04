import {Tokenizer} from '../lib/html-tokenizer'

describe('html-tokenizer', () => {
    it('should return right open tag and end tag and char', () => {
        const tokenizer = new Tokenizer();
        
        const demoHtml = '<html><div>mock content</div></html>'
        
        expect([...tokenizer._tokenize(demoHtml)]).toEqual([
                    {
                     "attrs": [],
                     "kind": "StartTag",
                     "name": "html",
                     "self_closing": false,
                   },
                    {
                     "attrs":  [],
                     "kind": "StartTag",
                     "name": "div",
                     "self_closing": false,
                   },
                    {
                     "content": "m",
                   },
                    {
                     "content": "o",
                   },
                    {
                     "content": "c",
                   },
                    {
                     "content": "k",
                   },
                    {
                     "content": " ",
                   },
                    {
                     "content": "c",
                   },
                    {
                     "content": "o",
                   },
                    {
                     "content": "n",
                   },
                    {
                     "content": "t",
                   },
                    {
                     "content": "e",
                   },
                    {
                     "content": "n",
                   },
                    {
                     "content": "t",
                   },
                    {
                     "attrs":  [],
                     "kind": "EndTag",
                     "name": "div",
                     "self_closing": false,
                   },
                    {
                     "attrs": [],
                     "kind": "EndTag",
                     "name": "html",
                     "self_closing": false,
                   },
                 
        ])
    });
});
