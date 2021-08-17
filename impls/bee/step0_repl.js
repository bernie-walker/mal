const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const read = (str) => str;
const eval = (str) => str;
const print = (str) => str;

const rep = (str) => print(eval(read(str)));

const main = () => {
  readLine.question('user> ', (str) => {
    console.log(rep(str));
    main();
  });
};

main();