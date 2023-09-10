const bcryptjs = require("bcryptjs");

let hash = bcryptjs.hashSync("12345678", 10);
console.log(hash);

console.log(bcryptjs.compareSync("12345678", hash));
console.log(bcryptjs.compareSync("1234567", hash));
