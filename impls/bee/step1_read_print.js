const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const { comp } = require('./utils')
const { readStr: read } = require('./reader')
const { prStr: print } = require('./printer')


const eval = (ast) => ast;

const rep = comp(print, eval, read);

const main = () => {
  readLine.question('user> ', (str) => {
    console.log(rep(str));
    main();
  });
};

main();