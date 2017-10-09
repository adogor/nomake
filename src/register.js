const camelCase = require('camelcase');
const cmd = require('./cmd.js');

module.exports = function(...args) {
  args.forEach((cmdName) => {
    var funcName = camelCase(cmdName);
    if (global[funcName]) {
      throw new Error('Command already exists');
    }
    global[funcName] = cmd(cmdName);
  //console.log('registered : ', funcName);
  })
}
