const {
  List,
  Sym,
  Vector,
  HashMap,
  prStr,
  Nil,
  MalSeq,
  MalFunc,
} = require('./types');
const Env = require('./env');
const { init, last, tail } = require('./utils');

const evalAst = (ast, env) => {
  if (ast instanceof Sym) {
    return env.get(ast);
  }

  if (ast instanceof List) {
    return new List(ast.elements.map((el) => evaluate(el, env)));
  }

  if (ast instanceof Vector) {
    return new Vector(ast.elements.map((el) => evaluate(el, env)));
  }

  if (ast instanceof HashMap) {
    const evaluatedEntries = ast
      .entries()
      .map(([k, v]) => [k, evaluate(v, env)]);
    return new HashMap(new Map(evaluatedEntries));
  }

  if (ast === undefined) {
    return Nil;
  }

  return ast;
};

const evalIf = (list, env) => {
  if (list.length < 3) {
    throw 'Too less arguments to if';
  }

  if (list.length > 4) {
    throw 'Too many arguments to if';
  }

  const [, cond, form1, form2] = list;
  const bool = evaluate(cond, env);

  if (bool === false || bool === Nil) {
    return form2;
  }

  return form1;
};

const evalLet = (list, env) => {
  if (list.length !== 3) {
    throw 'Invalid number of arguments to let*';
  }

  const [, bindings, form] = list;

  if (!(bindings instanceof MalSeq && bindings.elements.length % 2 === 0)) {
    throw 'Invalid bindings';
  }

  const newEnv = new Env(env);

  for (let i = 0; i < bindings.elements.length; i += 2) {
    const key = bindings.elements[i];
    const val = bindings.elements[i + 1];

    newEnv.set(key, evaluate(val, newEnv));
  }

  return [newEnv, form];
};

const evaluate = (ast, env) => {
  while (true) {
    if (!(ast instanceof List)) {
      return evalAst(ast, env);
    }

    if (ast.isEmpty()) {
      return ast;
    }

    const [firstEl] = ast.elements;

    if (firstEl.symbol === 'def!') {
      if (ast.elements.length !== 3) {
        throw 'Invalid number of arguments to def!';
      }

      const [, sym, val] = ast.elements;

      return env.set(sym, evaluate(val, env));
    }

    if (firstEl.symbol === 'let*') {
      const [newEnv, form] = evalLet(ast.elements, env);

      env = newEnv;
      ast = form;

      continue;
    }

    if (firstEl.symbol === 'do') {
      const forms = tail(ast.elements);

      evalAst(new List(init(forms)), env);

      ast = last(forms);

      continue;
    }

    if (firstEl.symbol === 'if') {
      ast = evalIf(ast.elements, env);
      continue;
    }

    if (firstEl.symbol === 'fn*') {
      if (ast.elements.length !== 3) {
        throw 'Invalid number of args to fn*';
      }

      const [, params, fnBody] = ast.elements;

      return new MalFunc(env, params.elements, fnBody);
    }

    const [fn, ...args] = evalAst(ast, env).elements;

    if (fn instanceof MalFunc) {
      const { env: defEnv, params, body } = fn;

      env = Env.create(defEnv, params, args);
      ast = body;

      continue;
    }

    if (fn instanceof Function) {
      return fn.apply(null, args);
    }

    throw `${prStr(fn)} is not a function`;
  }
};

module.exports = { evaluate };
// step5_tco
