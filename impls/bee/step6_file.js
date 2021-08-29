const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const { readStr: read } = require('./reader');
const { evaluate } = require('./evaluator');
const { prStr } = require('./printer');
const Env = require('./env');
const core = require('./core');
const { Sym } = require('./types');
const { comp } = require('./utils');

const replEnv = new Env(null);
Object.entries(core).forEach(([sym, val]) => replEnv.set(new Sym(sym), val))

replEnv.set(new Sym('eval'), (ast) => evaluate(ast, replEnv))

const print = (val) => prStr(val, true);

const eval = (ast) => evaluate(ast, replEnv);

const rep = comp(print, eval, read);

rep('(def! load-file (fn* (f) (eval (read-string (str \"(do \" (slurp f) \"\nnil)\")))))')

const repl = (str) => {
  try {
    const output = rep(str);
    if (output.length > 0) {
      console.log(output);
    }
  } catch (error) {
    console.error(error);
  } finally {
    main();
  }
};

const main = () => readLine.question('user> ', repl);

main();