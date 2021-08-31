const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { comp } = require('./utils');
const { readStr: read } = require('./reader');
const { prStr } = require('./printer');

const _eval = (ast) => ast;
const print = (val) => prStr(val, true);

const rep = comp(print, _eval, read);

const main = () => {
  readLine.question('user> ', (str) => {
    try {
      console.log(rep(str));
    } catch (error) {
      console.error(error);
    } finally {
      main();
    }
  });
};

main();
