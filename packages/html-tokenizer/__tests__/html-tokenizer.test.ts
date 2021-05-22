import { Tokenizer } from "../lib/html-tokenizer";

describe("html-tokenizer", () => {
  it("should return right open tag and end tag and char", () => {
    const demoHtml = "<html><div>mock content</div></html>";
    const tokenizer = Tokenizer.from(demoHtml, {});
    expect([...tokenizer.tokenize(demoHtml)]).toMatchInlineSnapshot(`
      Array [
        HtmlTagToken {
          "attributes": Array [],
          "begin": 0,
          "end": 6,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "HtmlTagToken",
          "name": "html",
          "self_closing": false,
          "type": "StartTag",
        },
        HtmlTagToken {
          "attributes": Array [],
          "begin": 6,
          "end": 11,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "HtmlTagToken",
          "name": "div",
          "self_closing": false,
          "type": "StartTag",
        },
        CharacterToken {
          "begin": 11,
          "data": "mock content",
          "end": 23,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "CharacterToken",
        },
        HtmlTagToken {
          "attributes": Array [],
          "begin": 23,
          "end": 29,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "HtmlTagToken",
          "name": "div",
          "self_closing": false,
          "type": "EndTag",
        },
        HtmlTagToken {
          "attributes": Array [],
          "begin": 29,
          "end": 36,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "HtmlTagToken",
          "name": "html",
          "self_closing": false,
          "type": "EndTag",
        },
      ]
    `);

    // expect([...tokenizer.tokenize(demoHtml)]).toEqual([
    //   {
    //     attrs: [],
    //     kind: "StartTag",
    //     name: "html",
    //     self_closing: false,
    //     type: "TagToken",
    //   },
    //   {
    //     attrs: [],
    //     kind: "StartTag",
    //     name: "div",
    //     self_closing: false,
    //     type: "TagToken",
    //   },
    //   {
    //     data: "mock content",
    //     type: "CharacterToken",
    //   },
    //   {
    //     attrs: [],
    //     kind: "EndTag",
    //     name: "div",
    //     self_closing: false,
    //     type: "TagToken",
    //   },
    //   {
    //     attrs: [],
    //     kind: "EndTag",
    //     name: "html",
    //     self_closing: false,
    //     type: "TagToken",
    //   },
    // ]);
  });

  it("should return right token with tokenize method", () => {
    const demoHtml = "<html><div>mock content</div></html>";
    expect([...Tokenizer.tokenize(demoHtml)]).toMatchInlineSnapshot(`
      Array [
        HtmlTagToken {
          "attributes": Array [],
          "begin": 0,
          "end": 6,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "HtmlTagToken",
          "name": "html",
          "self_closing": false,
          "type": "StartTag",
        },
        HtmlTagToken {
          "attributes": Array [],
          "begin": 6,
          "end": 11,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "HtmlTagToken",
          "name": "div",
          "self_closing": false,
          "type": "StartTag",
        },
        CharacterToken {
          "begin": 11,
          "data": "mock content",
          "end": 23,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "CharacterToken",
        },
        HtmlTagToken {
          "attributes": Array [],
          "begin": 23,
          "end": 29,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "HtmlTagToken",
          "name": "div",
          "self_closing": false,
          "type": "EndTag",
        },
        HtmlTagToken {
          "attributes": Array [],
          "begin": 29,
          "end": 36,
          "file": undefined,
          "input": "<html><div>mock content</div></html>",
          "kind": "HtmlTagToken",
          "name": "html",
          "self_closing": false,
          "type": "EndTag",
        },
      ]
    `);
  });
});
