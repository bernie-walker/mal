const {
  List,
  Sym,
  Vector,
  HashMap,
  prStr,
  Nil,
  MalSeq,
  MalFunc,
  VariadicFunc,
} = require('./types');
const Env = require('./env');
const { init, last, tail, head } = require('./utils');

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

const isAmpersand = (val) => val instanceof Sym && val.symbol === '&';

const prepareBinds = (params) => {
  const ampPosition = params.findIndex(isAmpersand);

  if (ampPosition === -1) {
    return { variadic: false, binds: params };
  }

  if (ampPosition !== params.length - 2) {
    throw 'Invalid parameters';
  }

  params = params.slice(0, ampPosition).concat(params.slice(ampPosition + 1));

  return { variadic: true, binds: params };
};

const defMalFunc = (list, env, isMacro) => {
  if (list.length !== 3) {
    throw 'Invalid number of args to fn*';
  }

  const [, params, fnBody] = list;

  const { variadic, binds } = prepareBinds(params.elements);

  const definition = function (...exprs) {
    const fnScope = Env.create(env, binds, exprs);
    return evaluate(fnBody, fnScope);
  };

  if (variadic) {
    return new VariadicFunc(env, binds, fnBody, definition, isMacro);
  }

  return new MalFunc(env, binds, fnBody, definition, isMacro);
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

const createSexp = (op, ...args) => new List([new Sym(op), ...args]);

const checkForSym = (ast, symName) =>
  ast instanceof Sym && ast.symbol === symName;

const isSpliceUnquote = (elt) =>
  elt instanceof List && checkForSym(head(elt.elements), 'splice-unquote');

const quoteList = (astElements, quotedAst) => {
  if (astElements.length === 0) {
    return quotedAst;
  }

  const lastEl = last(astElements);

  let sexp;

  if (isSpliceUnquote(lastEl)) {
    sexp = createSexp('concat', lastEl.elements[1], quotedAst);
  } else {
    sexp = createSexp('cons', quasiquote(lastEl), quotedAst);
  }

  return quoteList(init(astElements), sexp);
};

const quasiquote = (ast) => {
  if (!(ast instanceof List)) return createSexp('quote', ast);

  const [firstEl] = ast.elements;

  if (checkForSym(firstEl, 'unquote')) return ast.elements[1];

  const quotedAst = quoteList(ast.elements, List.empty());

  return quotedAst;
};

const isMacroCall = (ast, env) => {
  if (!(ast instanceof List && head(ast.elements) instanceof Sym)) {
    return false;
  }

  const symbol = head(ast.elements);
  const fn = env.find(symbol) && env.get(symbol);

  return fn instanceof MalFunc && fn.isMacro;
};

const macroExpand = (ast, env) => {
  while (isMacroCall(ast, env)) {
    const [fnName, ...args] = ast.elements;
    ast = env.get(fnName).apply(args);
  }

  return ast;
};

const evaluate = (ast, env, isMacro = false) => {
  ast = macroExpand(ast, env);

  while (true) {
    if (!(ast instanceof List)) return evalAst(ast, env);

    if (ast.isEmpty()) return ast;

    const [firstEl] = ast.elements;

    if (firstEl.symbol === 'quote') {
      if (ast.elements.length !== 2) {
        throw 'Invalid number of arguments to quote';
      }

      return ast.elements[1];
    }

    if (firstEl.symbol === 'quasiquote') {
      if (ast.elements.length !== 2) {
        throw 'Invalid number of arguments to quote';
      }

      ast = quasiquote(ast.elements[1], env);
      continue;
    }

    if (firstEl.symbol === 'quasiquoteexpand')
      return quasiquote(ast.elements[1], env);

    if (firstEl.symbol === 'def!' || firstEl.symbol === 'defmacro!') {
      if (ast.elements.length !== 3) {
        throw 'Invalid number of arguments to def!';
      }

      const [, sym, val] = ast.elements;

      return env.set(sym, evaluate(val, env, firstEl.symbol === 'defmacro!'));
    }

    if (firstEl.symbol === 'macroexpand')
      return macroExpand(ast.elements[1], env);

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

    if (firstEl.symbol === 'fn*') return defMalFunc(ast.elements, env, isMacro);

    const [fn, ...args] = evalAst(ast, env).elements;

    if (fn instanceof MalFunc) {
      const { fnEnv, binds, exprs, fnBody } = fn.eval(args);

      env = Env.create(fnEnv, binds, exprs);
      ast = fnBody;

      continue;
    }

    if (fn instanceof Function) return fn(...args);

    throw `${prStr(fn)} is not a function`;
  }
};

module.exports = { evaluate };
