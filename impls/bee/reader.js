const { comp } = require('./utils')
const { List, Vector } = require('./types')

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

  if (token === "true") {
    return true;
  }

  if (token === "false") {
    return false;
  }

  return token;
};

const readSeq = (reader, terminator) => {
  const seq = [];

  reader.next();
  while (reader.peek() !== terminator) {
    if (reader.peek() === undefined) {
      throw 'unbalanced';
    }

    seq.push(readForm(reader));
  }
  reader.next();

  return seq;
};

const readVector = (reader) => new Vector(readSeq(reader, "]"));

const readList = (reader) => new List(readSeq(reader, ")"));

const readForm = (reader) => {
  switch (reader.peek()) {
    case "(": return readList(reader);
    case "[": return readVector(reader);
    case ")": return "unbalanced )";
    case "]": return "unbalanced ]";
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