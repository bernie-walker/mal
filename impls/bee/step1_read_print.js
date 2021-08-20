const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const { comp } = require('./utils')
const { readStr: read } = require('./reader')
const { prStr } = require('./printer')


const eval = (ast) => ast;
const print = (val) => prStr(val, true);

const rep = comp(print, eval, read);

const main = () => {
  readLine.question('user> ', (str) => {
    console.log(rep(str));
    main();
  });
};

main();