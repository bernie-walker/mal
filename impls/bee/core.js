const { readFileSync } = require('fs');

const { readStr } = require('./reader');
const { prStr, Nil, List, MalSeq, isEqual, Str, Atom } = require('./types');

const add = (...args) => args.reduce((a, b) => a + b, 0);

const mul = (...args) => args.reduce((a, b) => a * b, 1);

const sub = (a, b) => a - b;

const div = (a, b) => a / b;

const getString = (seq, printReadably, separator) =>
  new Str(seq.map((el) => prStr(el, printReadably)).join(separator));

const prString = (...args) => getString(args, true, ' ');

const str = (...args) => getString(args, false, '');

const logString = (str) => {
  console.log(str);
  return Nil;
};

const prn = (...args) => logString(prString.apply(null, args).string);

const println = (...args) => logString(getString(args, false, ' ').string);

const list = (...elements) => new List(elements);

const concat = (l1, l2) => checkSeq(l1) && checkSeq(l2) && l1.concat(l2);

const isList = (val) => val instanceof List;

const checkSeq = (val) => {
  if (!val instanceof MalSeq) {
    throw `${prStr(val, true)} is not a Seq`;
  }

  return true;
};

const isEmpty = (val) => checkSeq(val) && val.isEmpty();

const count = (val) => {
  if (val === Nil) {
    return 0;
  }

  return checkSeq(val) && val.count();
};

const lt = (n1, n2) => n1 < n2;

const lte = (n1, n2) => n1 <= n2;

const gt = (n1, n2) => n1 > n2;

const gte = (n1, n2) => n1 >= n2;

const not = (val) => {
  if (val === Nil || val === false) {
    return true;
  }

  return false;
};

const atom = (val) => new Atom(val);

const isAtom = (val) => val instanceof Atom;

const deref = (atom) => {
  if (!(atom instanceof Atom)) {
    throw `${prStr(atom)} is not an Atom`;
  }

  return atom.value;
};

const resetAtom = (atom, value) => {
  atom.value = value;
  return value;
};

const readString = (str) => readStr(str.string);

const slurp = (fileName) => {
  try {
    return new Str(readFileSync(fileName.string, 'utf-8'));
  } catch (error) {
    throw 'Error while reading file';
  }
};

const core = {
  '+': add,
  '*': mul,
  '-': sub,
  '/': div,
  'pr-str': prString,
  str,
  prn,
  println,
  list,
  concat,
  'list?': isList,
  'empty?': isEmpty,
  count,
  '=': isEqual,
  '<': lt,
  '<=': lte,
  '>': gt,
  '>=': gte,
  not,
  atom,
  'atom?': isAtom,
  deref,
  'reset!': resetAtom,
  'read-string': readString,
  slurp,
};

module.exports = core;
