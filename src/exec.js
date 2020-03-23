const cp = require("child_process");
const camelCase = require("camelcase");
const { parseArgsStringToArgv } = require("string-argv");
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
  const currentColorIndex = colorIndex;
  colorIndex = (colorIndex + 1) % colors.length;

  return new Promise((resolve, reject) => {
    const vargs = parseArgsStringToArgv(args);
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

      function logData(data) {
        const text = data.toString();
        const lines = text.split("\n");

        const paddedLines = lines.map(function(line, index) {
          let coloredLine = "";
          if (line) {
            coloredLine =
              chalk[colors[currentColorIndex]](processName) + line + "\n";
          }
          return coloredLine;
        });
        process.stdout.write(paddedLines.join(""));
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
      });

      child.on("close", code => {
        if (code > 0) {
          const message = `process ${cmd} ${vargs} exited with error`;
          console.log(chalk.bgRed(message));
          reject(new Error(message));
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
