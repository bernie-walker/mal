class MalVal { }

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


module.exports = { prStr, List, Vector };