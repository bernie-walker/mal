const identity = (x) => x

const compose = (f1, f2) => (...args) => f1(f2.apply(null, args));

const comp = (...args) => args.reduce(compose, identity)

module.exports = { comp }