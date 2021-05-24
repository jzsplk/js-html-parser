import {TreeBuilder} from '../lib/treebuilder/index'
import {Tokenizer} from '../lib/index' 

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
const treeBuilder = new TreeBuilder({sink: {} as any,tokens: []});

const tokenizer = new Tokenizer(treeBuilder, demoHtml, {});

console.log('tree builder', treeBuilder);

const tokens = [...tokenizer.tokenize(demoHtml)];
