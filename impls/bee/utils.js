const init = (seq) => seq.slice(0, -1);

const last = (seq) => seq[seq.length - 1];

const identity = (x) => x;

const compose =
  (f1, f2) =>
  (...args) =>
    f1(f2.apply(null, args));

const comp = (...args) => args.reduce(compose, identity);

module.exports = { comp, init, last };
