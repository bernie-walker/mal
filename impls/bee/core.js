const { prStr, Nil, List, MalSeq, isEqual } = require("./types");

const add = (...args) => args.reduce((a, b) => a + b, 0);

const mul = (...args) => args.reduce((a, b) => a * b, 1);

const sub = (a, b) => a - b;

const div = (a, b) => a / b;

const prn = (val) => {
  if (val === undefined) {
    val = "";
  }
  console.log(prStr(val, true));
  return Nil;
}

const list = (...elements) => new List(elements);

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
}

const lt = (n1, n2) => n1 < n2;

const lte = (n1, n2) => n1 <= n2;

const gt = (n1, n2) => n1 > n2;

const gte = (n1, n2) => n1 >= n2;

const not = (val) => {
  if ((val === Nil) || (val === false)) {
    return true;
  }

  return false;
};

const core = {
  '+': add,
  '*': mul,
  '-': sub,
  '/': div,
  'prn': prn,
  'list': list,
  'list?': isList,
  'empty?': isEmpty,
  'count': count,
  '=': isEqual,
  '<': lt,
  '<=': lte,
  '>': gt,
  '>=': gte,
  'not': not
};

module.exports = core;