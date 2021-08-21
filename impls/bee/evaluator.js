const { List, Sym, Vector, HashMap, prStr } = require('./types');
const Env = require('./env');

const evalAst = (ast, env) => {
  if (ast instanceof Sym) {
    return env.get(ast);
  }

  if (ast instanceof List) {
    return new List(ast.elements.map(el => evaluate(el, env)));
  }

  if (ast instanceof Vector) {
    return new Vector(ast.elements.map(el => evaluate(el, env)));
  }

  if (ast instanceof HashMap) {
    const evaluatedEntries = ast.entries().map(([k, v]) => [k, evaluate(v, env)]);
    return new HashMap(new Map(evaluatedEntries));
  }

  return ast;
};

const evaluate = (ast, env) => {
  if (!(ast instanceof List)) {
    return evalAst(ast, env);
  }

  if (ast.isEmpty()) {
    return ast;
  }

  const [firstEl] = ast.elements;

  if (firstEl.symbol === 'def!') {
    if (!(ast.elements.length === 3)) {
      throw 'Invalid number of arguments to def!';
    }

    const [, sym, val] = ast.elements;

    return env.set(sym, evaluate(val, env));
  }

  if (firstEl.symbol === 'let*') {
    if (!(ast.elements.length === 3)) {
      throw 'Invalid number of arguments to let*';
    }

    const [, bindings, sexp] = ast.elements;

    if (!(((bindings instanceof List) || (bindings instanceof Vector)) && ((bindings.elements.length % 2) === 0))) {
      throw 'Invalid bindings';
    }

    const newEnv = new Env(env);

    for (let i = 0; i < bindings.elements.length; i += 2) {
      const key = bindings.elements[i];
      const val = bindings.elements[i + 1];

      newEnv.set(key, evaluate(val, newEnv));
    }

    return evaluate(sexp, newEnv);
  }

  const [fn, ...args] = evalAst(ast, env).elements;

  if (!(fn instanceof Function)) {
    throw `${prStr(fn)} is not a function`
  }

  return fn.apply(null, args);
};

module.exports = { evaluate }