class MalVal {
  prStr(printReadably = false) {
    return 'default MalVal';
  }
}

const prStr = (val, printReadably) => {
  if (val instanceof MalVal) {
    return val.prStr(printReadably);
  }

  return val.toString();
}

const mkString = (malSeq, prepend, append, printReadably) => {
  const valuesToString = malSeq.map(el => prStr(el, printReadably)).join(" ");
  return prepend + valuesToString + append;
}

class List extends MalVal {
  constructor(seq) {
    super();
    this.elements = seq;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  prStr(printReadably) {
    return mkString(this.elements, "(", ")", printReadably);
  }
}

class Vector extends MalVal {
  constructor(seq) {
    super();
    this.elements = seq;
  }

  prStr(printReadably) {
    return mkString(this.elements, "[", "]", printReadably);
  }
}

class MalNil extends MalVal {
  constructor() {
    super();
  }

  prStr(printReadably) {
    return 'nil';
  }
}

const Nil = new MalNil();

class Keyword extends MalVal {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  prStr(printReadably) {
    return ':' + this.keyword;
  }
}

class Sym extends MalVal {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  prStr(printReadably) {
    return this.symbol;
  }
}

class Str extends MalVal {
  constructor(string) {
    super();
    this.string = string;
  }

  prStr(printReadably) {
    let str = this.string;

    if (printReadably) {
      str = str.replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
    }

    return '"' + str + '"';
  }
}

class HashMap extends MalVal {
  constructor(map) {
    super();
    this.map = map;
  }

  entries() {
    return Array.from(this.map.entries())
  }

  #pr = (k, v, readably) => `${prStr(k, readably)} ${prStr(v, readably)} `

  prStr(printReadably) {
    const entriesToStr = this.entries().reduce((str, [k, v]) => str + this.#pr(k, v, printReadably), "");

    return `{${entriesToStr.slice(0, -1)}}`
  }
}

class None {
  toString() {
    return "";
  }
}

const NONE = new None();

module.exports = { prStr, List, Vector, Nil, Keyword, Sym, Str, HashMap, NONE };