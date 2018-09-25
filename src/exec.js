const cp = require("child_process");
const camelCase = require("camelcase");
const stringArgv = require("string-argv");
const chalk = require("chalk");
// const kill = require("tree-kill");
// const treeKill = require("./TreeKill");

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

// const childList = [];

// function killChildren() {
//   for (child of childList) {
//     // console.log(`Killing process ${child.pid}`);
//     treeKill(child.pid, "SIGTERM");
//   }
// }

let colorIndex = 0;

const colors = [
  "bgGreen",
  "bgYellow",
  "bgBlue",
  "bgMagenta",
  "bgCyan",
  "bgWhite",
  "bgBlackBright",
  "bgGreenBright",
  "bgYellowBright",
  "bgBlueBright",
  "bgMagentaBright",
  "bgCyanBright",
  "bgWhiteBright"
];

function spawn(cmd, args, opts) {
  // const executable = cmd.substring(0, cmd.indexOf(' '));
  // const args = cmd.substr(cmd.indexOf(' ') + 1);
  const currentColorIndex = colorIndex;
  colorIndex = (colorIndex + 1) % colors.length;

  return new Promise((resolve, reject) => {
    const vargs = stringArgv(args);
    let processName = cmd + " " + vargs;
    if (opts && opts.cwd) {
      processName = opts.cwd + " " + processName;
    }
    processName = `[${processName}]`;
    try {
      const child = cp.spawn(cmd, vargs, {
        shell: false,
        stdio: "pipe",
        detached: false,
        ...opts
      });
      // console.log(child.pid);

      // childList.push(child);

      function logData(data) {
        const text = data.toString();
        const lines = text.split("\n");

        const paddedLines = lines.map(function(line, index) {
          let coloredLine = "";
          if (line) {
            // console.log(colors[currentColorIndex]);
            coloredLine =
              chalk[colors[currentColorIndex]](processName) + line + "\n";
          }
          return coloredLine;
        });
        process.stdout.write(paddedLines.join(""));
        // console.log(`stdout: ${data}`);
      }

      child.stdout.on("data", data => {
        logData(data);
      });

      child.stderr.on("data", data => {
        logData(data);
      });

      child.on("error", err => {
        const message = `process ${cmd} ${vargs} Failed to start`;
        console.log(chalk.bgRed(message));
        reject(new Error(message));
        // childList.splice(childList.indexOf(child), 1);
      });

      child.on("close", code => {
        if (code > 0) {
          const message = `process ${cmd} ${vargs} exited with error`;
          console.log(chalk.bgRed(message));
          reject(new Error(message));
        }
        // childList.splice(childList.indexOf(child), 1);
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
