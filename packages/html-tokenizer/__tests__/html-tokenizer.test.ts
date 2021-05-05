import { Tokenizer } from "../lib/html-tokenizer";

describe("html-tokenizer", () => {
  it("should return right open tag and end tag and char", () => {
    const tokenizer = Tokenizer.from({});

    const demoHtml = "<html><div>mock content</div></html>";

    expect([...tokenizer.tokenize(demoHtml)]).toEqual([
      {
        attrs: [],
        kind: "StartTag",
        name: "html",
        self_closing: false,
        type: "TagToken",
      },
      {
        attrs: [],
        kind: "StartTag",
        name: "div",
        self_closing: false,
        type: "TagToken",
      },
      {
        data: "mock content",
        type: "CharacterToken",
      },
      {
        attrs: [],
        kind: "EndTag",
        name: "div",
        self_closing: false,
        type: "TagToken",
      },
      {
        attrs: [],
        kind: "EndTag",
        name: "html",
        self_closing: false,
        type: "TagToken",
      },
    ]);
  });

  it("should return right token with tokenize method", () => {
    const demoHtml = "<html><div>mock content</div></html>";

    expect([...Tokenizer.tokenize(demoHtml)]).toEqual([
      {
        attrs: [],
        kind: "StartTag",
        name: "html",
        self_closing: false,
        type: "TagToken",
      },
      {
        attrs: [],
        kind: "StartTag",
        name: "div",
        self_closing: false,
        type: "TagToken",
      },
      {
        data: "mock content",
        type: "CharacterToken",
      },
      {
        attrs: [],
        kind: "EndTag",
        name: "div",
        self_closing: false,
        type: "TagToken",
      },
      {
        attrs: [],
        kind: "EndTag",
        name: "html",
        self_closing: false,
        type: "TagToken",
      },
    ]);
  });
});
