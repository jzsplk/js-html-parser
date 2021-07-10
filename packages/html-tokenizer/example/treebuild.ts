import { TreeBuilder } from "../lib/treebuilder/index";
import { Tokenizer } from "../lib/index";
import { RcDom, NodeType } from "../lib/dom/dom";
import {logDeep} from '../lib/utils'

const demoHtml = `
<html>
    <head>
        <title>I am title</title>
    </head>
    <body>
        <div class="out">123</div>
    </body>
</html>`;

// TODO: add mock tree sink
const dom = new RcDom();
const treeBuilder = new TreeBuilder({ sink: dom as any, tokens: [] });

const tokenizer = new Tokenizer(treeBuilder, demoHtml, {});


const tokens = [...tokenizer.tokenize(demoHtml)];
logDeep(treeBuilder);
