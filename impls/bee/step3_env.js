const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const { comp } = require('./utils');
const { readStr: read } = require('./reader');
const { evaluate } = require('./evaluator');
const { prStr } = require('./printer');
const Env = require('./env');
const { Sym } = require('./types');

const print = (val) => prStr(val, true);

const env = new Env(null);
env.set(new Sym('+'), (...args) => args.reduce((a, b) => a + b, 0));
env.set(new Sym('*'), (...args) => args.reduce((a, b) => a * b, 1));
env.set(new Sym('-'), (a, b) => a - b);
env.set(new Sym('/'), (a, b) => a / b);

const eval = (ast) => evaluate(ast, env);

const rep = comp(print, eval, read);

const repl = (str) => {
  let output = "";

  try {
    output = rep(str);
  } catch (error) {
    output = error.toString();
  }

  if (output.length > 0) {
    console.log(output);
  }

  main();
};

const main = () => readLine.question('user> ', repl);

main();