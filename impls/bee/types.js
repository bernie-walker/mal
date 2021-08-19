class MalVal {
  prStr() {
    return 'default MalVal';
  }
}

const prStr = (val) => {
  if (val instanceof MalVal) {
    return val.prStr();
  }

  return val.toString();
}

const mkString = (malSeq, prepend, append) => {
  const valuesToString = malSeq.map(prStr).join(" ");
  return prepend + valuesToString + append;
}

class List extends MalVal {
  constructor(seq) {
    super();
    this.elements = seq;
  }

  prStr() {
    return mkString(this.elements, "(", ")");
  }
}

class Vector extends MalVal {
  constructor(seq) {
    super();
    this.elements = seq;
  }

  prStr() {
    return mkString(this.elements, "[", "]");
  }
}

class MalNil extends MalVal {
  constructor() {
    super();
  }

  prStr() {
    return 'nil';
  }
}

const Nil = new MalNil();

class Keyword extends MalVal {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  prStr() {
    return ':' + this.keyword;
  }
}

class Sym extends MalVal {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  prStr() {
    return this.symbol;
  }
}

class Str extends MalVal {
  constructor(string) {
    super();
    this.string = string;
  }

  prStr() {
    return '"' + this.string + '"';
  }
}

class HashMap extends MalVal {
  constructor(map) {
    super();
    this.map = map;
  }

  prStr() {
    let entries = "";

    for (const [key, val] of this.map.entries()) {
      entries += `${prStr(key)} ${prStr(val)} `
    }

    return `{${entries.slice(0, -1)}}`
  }
}

module.exports = { prStr, List, Vector, Nil, Keyword, Sym, Str, HashMap };