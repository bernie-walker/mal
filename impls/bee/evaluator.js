const { List, Sym, Vector, HashMap } = require('./types');

const resolveSymbol = (symbol, env) => {
  const value = env[symbol];

  if (value === undefined) {
    throw `Symbol ${symbol} not defined`
  }

  return value;
};

const evalAst = (ast, env) => {
  if (ast instanceof Sym) {
    return resolveSymbol(ast.symbol, env);
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

  const [fn, ...args] = evalAst(ast, env).elements;

  if (!(fn instanceof Function)) {
    throw `${fn} is not a function`
  }

  return fn.apply(null, args);
};

module.exports = { evaluate }