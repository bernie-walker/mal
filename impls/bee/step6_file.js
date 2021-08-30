const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { readStr: read } = require('./reader');
const { evaluate } = require('./evaluator');
const { prStr } = require('./printer');
const Env = require('./env');
const core = require('./core');
const { Sym } = require('./types');
const { comp } = require('./utils');

const loadSym = (env, sym, val) => env.set(new Sym(sym), val);

const replEnv = new Env(null);
Object.entries(core).forEach(([sym, val]) => loadSym(replEnv, sym, val));

const print = (val) => prStr(val, true);

const _eval = (ast) => evaluate(ast, replEnv);
loadSym(replEnv, 'eval', _eval);

const rep = comp(print, _eval, read);

rep(
  `(def! load-file
      (fn* (f)
        (eval (read-string
          (str "(do " (slurp f) "\nnil)")))))`
);

rep(
  `(def! swap!
      (fn* [at func & args]
        (reset! at
          (eval
            (concat (list func (deref at)) args)))))`
);

const execute = (str) => {
  try {
    const output = rep(str);
    if (output.length > 0) {
      console.log(output);
    }
  } catch (error) {
    console.error(error);
  }
};

const repl = (str) => {
  execute(str);
  main();
};

const main = () => {
  const [, , program] = process.argv;

  if (program !== undefined) {
    execute(`(load-file "${program}")`);
    readLine.close();
    return;
  }

  readLine.question('user> ', repl);
};

main();
