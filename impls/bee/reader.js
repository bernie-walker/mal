const { comp } = require('./utils')
const { List, Vector, Nil, Keyword, Sym, Str, HashMap } = require('./types')

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    if (this.position < this.tokens.length) {
      return this.tokens[this.position++];
    }
  }

  static create(tokens) {
    return new Reader(tokens);
  }
}

const readAtom = (reader) => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }

  if (token.match(/^-?[0-9]+\.[0-9]+$/)) {
    return parseFloat(token);
  }

  if (token === 'true') {
    return true;
  }

  if (token === 'false') {
    return false;
  }

  if (token === 'nill') {
    return Nil;
  }

  if (token.startsWith(':')) {
    return new Keyword(token.slice(1));
  }

  if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
    return new Str(token.slice(1, -1));
  }

  if (token.startsWith('"')) {
    throw 'unbalanced string';
  }

  return new Sym(token);
};

const readSeq = (reader, terminator) => {
  const seq = [];

  reader.next();
  while (reader.peek() !== terminator) {
    if (reader.peek() === undefined) {
      throw 'unbalanced Seq';
    }

    seq.push(readForm(reader));
  }
  reader.next();

  return seq;
};

const isValidKey = (key) => ((key instanceof Str) || (key instanceof Keyword));

const readHashMap = (reader) => {
  const seq = readSeq(reader, "}");

  if ((seq.length % 2) !== 0) {
    throw 'Odd number of hashmap arguments';
  }

  const map = new Map();

  for (let i = 0; i < seq.length; i += 2) {
    const key = seq[i];
    const value = seq[i + 1];

    if (!isValidKey(key)) {
      throw 'Invalid key';
    }

    map.set(key, value);
  }

  return new HashMap(map);
};

const readVector = (reader) => new Vector(readSeq(reader, "]"));

const readList = (reader) => new List(readSeq(reader, ")"));

const readForm = (reader) => {
  switch (reader.peek()) {
    case '(': return readList(reader);
    case '[': return readVector(reader);
    case '{': return readHashMap(reader);

    case ')': throw 'unexpected )';
    case ']': throw 'unexpected ]';
    case '}': throw 'unexpected }';

    default: return readAtom(reader);
  }
}

const tokenize = (str) => {
  const re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(re)].map(([, token,]) => token).slice(0, -1);
};

const parseStr = comp(readForm, Reader.create, tokenize);

const readStr = (str) => {
  try {
    return parseStr(str);
  } catch (e) {
    return e;
  }
}

module.exports = { readStr };