const cp = require("child_process");
const camelCase = require("camelcase");
const stringArgv = require("string-argv");
const chalk = require("chalk");

function execute(command, returnStdout, opts) {
  const executable = command.split(" ")[0];
  const argString = command.substr(executable.length).trim();

  console.log(chalk.bgGreen(chalk.blue(`Executing ${command}`)));
  if (!returnStdout) {
    return spawn(executable, argString, opts);
  } else {
    return exec(command, opts);
  }
}

function cmd(cmd) {
  return function(argString = "", returnStdout, opts) {
    var executedCommand = `${cmd} ${argString}`;
    console.log(chalk.bgGreen(chalk.blue(`Executing ${executedCommand}`)));
    if (!returnStdout) {
      return spawn(cmd, argString, opts);
    } else {
      return exec(executedCommand, opts);
    }
  };
}

function spawn(cmd, args, opts) {
  // const executable = cmd.substring(0, cmd.indexOf(' '));
  // const args = cmd.substr(cmd.indexOf(' ') + 1);
  return new Promise((resolve, reject) => {
    const vargs = stringArgv(args);
    try {
      const child = cp.spawn(cmd, vargs, {
        shell: true,
        stdio: "inherit",
        ...opts
      });

      child.on("error", err => {
        // console.log(err);
        console.log(chalk.bgRed("Failed to start ", cmd, vargs));
        reject();
        process.exit(1);
      });

      child.on("close", code => {
        if (code > 0) {
          console.log("process ", cmd, vargs, " exited with error");
          reject();
          process.exit(1);
        }
        resolve();
      });
    } catch (e) {
      console.log("erreur : ", e.message);
      throw e;
    }
  });
}

function register(...args) {
  args.forEach(cmdName => {
    var funcName = camelCase(cmdName);
    if (global[funcName]) {
      throw new Error("Command already exists");
    }
    global[funcName] = cmd(cmdName);
  });
}

function exec(cmd, opts) {
  return new Promise((resolve, reject) => {
    var child = cp.exec(
      cmd,
      {
        ...opts
      },
      (err, stdout, stderr) => {
        if (err) {
          reject({
            err,
            stderr: stderr.toString()
          });
        }
        resolve(stdout.toString());
      }
    );
  });
}

module.exports = {
  cmd,
  execute,
  spawn,
  exec,
  register
};
