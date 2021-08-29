const { Sym, prStr } = require('./types');

class Env {
  constructor(outer = null) {
    this.outer = outer;
    this.data = new Map();
  }

  set(sym, value) {
    if (!(sym instanceof Sym)) {
      throw `${prStr(sym, true)} is not a Symbol`;
    }

    this.data.set(sym.symbol, value);

    return value;
  }

  find(sym) {
    if (!(sym instanceof Sym)) {
      return null;
    }

    if (this.data.has(sym.symbol)) {
      return this;
    }

    return this.outer !== null ? this.outer.find(sym) : null;
  }

  get(sym) {
    const env = this.find(sym);

    if (env === null) {
      throw `${prStr(sym, true)} not found`;
    }

    return env.data.get(sym.symbol);
  }

  static create(outer, binds, exprs) {
    const newEnv = new Env(outer);

    binds.forEach((element, ind) => {
      newEnv.set(element, exprs[ind]);
    });

    return newEnv;
  }
}

module.exports = Env;
