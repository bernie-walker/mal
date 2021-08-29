class MalVal {
  prStr(printReadably = false) {
    return 'default MalVal';
  }
}

const isMalVal = (val) => val instanceof MalVal;

const prStr = (val, printReadably) => {
  if (isMalVal(val)) {
    return val.prStr(printReadably);
  }

  if (val instanceof Function) {
    return '#<function>';
  }

  return val.toString();
};

const equals = (val1, val2) => {
  if (isMalVal(val1)) {
    return val1.equals(val2);
  }

  return val1 === val2;
};

const mkString = (malSeq, prepend, append, printReadably) => {
  const valuesToString = malSeq.map((el) => prStr(el, printReadably)).join(' ');
  return prepend + valuesToString + append;
};

class MalSeq extends MalVal {
  constructor(elements) {
    super();
    this.elements = elements;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  count() {
    return this.elements.length;
  }

  equals(that) {
    if (!(that instanceof MalSeq)) {
      return false;
    }

    return (
      this.elements.length === that.elements.length &&
      this.elements.every((el, ind) => equals(el, that.elements[ind]))
    );
  }
}

class List extends MalSeq {
  constructor(seq) {
    super(seq);
  }

  prStr(printReadably) {
    return mkString(this.elements, '(', ')', printReadably);
  }

  equals(that) {
    if (that instanceof List) {
      return super.equals(that);
    }
    return false;
  }
}

class Vector extends MalSeq {
  constructor(seq) {
    super(seq);
  }

  prStr(printReadably) {
    return mkString(this.elements, '[', ']', printReadably);
  }

  equals(that) {
    if (that instanceof Vector) {
      return super.equals(that);
    }
    return false;
  }
}

class MalNil extends MalVal {
  constructor() {
    super();
  }

  prStr(printReadably) {
    return 'nil';
  }

  equals(that) {
    return that instanceof MalNil;
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

  equals(that) {
    return that instanceof Keyword && this.keyword === that.keyword;
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

  equals(that) {
    return that instanceof Sym && this.symbol === that.symbol;
  }
}

class Str extends MalVal {
  constructor(string) {
    super();
    this.string = string;
  }

  prStr(printReadably) {
    let str = this.string;

    if (!printReadably) {
      return str;
    }

    const readableString = str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');

    return `"${readableString}"`;
  }

  equals(that) {
    return that instanceof Str && this.string === that.string;
  }
}

class HashMap extends MalVal {
  constructor(map) {
    super();
    this.map = map;
  }

  entries() {
    return Array.from(this.map.entries());
  }

  #pr = (k, v, readably) => `${prStr(k, readably)} ${prStr(v, readably)} `;

  prStr(printReadably) {
    const entriesToStr = this.entries().reduce(
      (str, [k, v]) => str + this.#pr(k, v, printReadably),
      ''
    );

    return `{${entriesToStr.slice(0, -1)}}`;
  }

  equals(that) {
    if (!(that instanceof HashMap)) {
      return false;
    }

    const otherEntries = that.entries();

    return this.entries().every(([key, val], ind) => {
      const [thatKey, thatVal] = otherEntries[ind];
      return equals(key, thatKey) && equals(val, thatVal);
    });
  }
}

class MalFunc extends MalVal {
  constructor(env, params, body) {
    super();
    this.env = env;
    this.params = params;
    this.body = body;
  }

  prStr(printReadably = false) {
    return '#<function>';
  }

  equals(that) {
    return this === that;
  }

  eval(args) {
    if (this.params.length != args.length) {
      throw 'Bindings do not match expressions';
    }

    return {
      fnEnv: this.env,
      binds: this.params,
      exprs: args,
      fnBody: this.body,
    };
  }
}

class VariadicFunc extends MalFunc {
  constructor(env, params, body) {
    super(env, params, body);
  }

  eval(args) {
    const varExpStart = this.params.length - 1;

    if (args.length < varExpStart) {
      throw 'Bindings do not match expressions';
    }

    const varExp = new List(args.slice(varExpStart));

    return super.eval(args.slice(0, varExpStart).concat(varExp));
  }
}

class None {
  toString() {
    return '';
  }
}

const NONE = new None();

class Atom extends MalVal {
  constructor(malVal) {
    super();
    this.value = malVal;
  }

  prStr(printReadably = false) {
    return `(atom ${prStr(this.value, printReadably)})`;
  }

  equals(that) {
    return equals(this.value, that.value);
  }
}

module.exports = {
  prStr,
  isEqual: equals,
  MalSeq,
  List,
  Vector,
  Nil,
  Keyword,
  Sym,
  Str,
  HashMap,
  MalFunc,
  VariadicFunc,
  NONE,
  Atom,
};
