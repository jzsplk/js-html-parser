# `js-html-parser`

## Usage

```
import {Tokenizer} from 'js-html-parser'

const tokenizer = new Tokenizer();

const demoHtml = '<div><p>demo text</p></div>';

console.log([...tokenizer._tokenize(demoHtml)]);

```

## Dev

1. install

```
yarn install
```

2. test

```
yarn test
```