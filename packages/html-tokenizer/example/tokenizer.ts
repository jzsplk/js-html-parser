import {Tokenizer,TokenSink,TokenSinkResult} from '../lib/index'
import {logDeep} from '../lib/utils'

console.log("demo tokenizer start...");

const demoHtml = `<div class="px4" id="main">
  <p class="flex" id="xxx"> demo content </p>
  </div>`;
  
console.log("html is", demoHtml);

const logTokenSink: TokenSink = {
  process_token: (token) => {
    logDeep(token)
    return TokenSinkResult.Continue
  },
  end: () => {}
}
const tokenizer = new Tokenizer(logTokenSink, demoHtml, {});

logDeep([...tokenizer.tokenize(demoHtml)]);
// const tokens = [...tokenizer.tokenize(demoHtml)];

// let count = 1;
// while(true) {
//   console.log('count', count);
//   count += 1;
//   if(count >= 10) {
//     break;
//   } 
// }
  