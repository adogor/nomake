const camelCase = require("camelcase");
const execSync = require("./exec-sync.js");
const execAsync = require("./exec-async.js");
const chalk = require("chalk");

module.exports = function(cmd) {
  return function(argString = "", returnStdout, asynchronous) {
    var executedCommand = `${cmd} ${argString}`;
    console.log(chalk.bgGreen(chalk.blue(`Executing ${executedCommand}`)));
    // if (asynchronous) {
    return execAsync(cmd, argString);
    // }
    // return execSync(executedCommand, returnStdout);
  };
};
