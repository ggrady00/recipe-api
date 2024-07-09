const seed = require("./seed")
const db = require("../connection")
const data = require("../data/test-data/index")

console.log(data)

const runSeed = () => {
    return seed(data).then(() => db.end());
  };

runSeed()