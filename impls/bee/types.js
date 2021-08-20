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

  prStr(printReadably) {
    let entries = "";

    for (const [key, val] of this.map.entries()) {
      entries += `${prStr(key, printReadably)} ${prStr(val, printReadably)} `
    }

    return `{${entries.slice(0, -1)}}`
  }
}

module.exports = { prStr, List, Vector, Nil, Keyword, Sym, Str, HashMap };