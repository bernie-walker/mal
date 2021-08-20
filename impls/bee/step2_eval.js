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

const repl = (str) => {
  let output = "";

  try {
    output = rep(str);
  } catch (error) {
    output = error;
  }

  if (output.length > 0) {
    console.log(output);
  }

  main();
};

const main = () => readLine.question('user> ', repl);

main();