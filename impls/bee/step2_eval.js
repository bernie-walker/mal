const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const { comp } = require('./utils');
const { readStr: read } = require('./reader');
const { evaluate } = require('./evaluator');
const { prStr } = require('./printer');

const print = (val) => prStr(val, true);

const eval = (ast) => evaluate(ast, {
  '+': (...args) => args.reduce((a, b) => a + b, 0),
  '*': (...args) => args.reduce((a, b) => a * b, 1),
  '-': (a, b) => a - b,
  '/': (a, b) => a / b,
});

const rep = comp(print, eval, read);

const main = () => {
  readLine.question('user> ', (str) => {
    try {
      console.log(rep(str))
    } catch (error) {
      console.log(error)
    } finally {
      main();
    }
  });
};

main();