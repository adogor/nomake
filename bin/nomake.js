#!/usr/bin/env node
const path = require("path");
const program = require("commander");
const chalk = require("chalk");
const camelCase = require("camelcase");
const decamelize = require("decamelize");
const prettyjson = require("prettyjson");
const fse = require("fs-extra");
const { execute, register, cmd, killChildren } = require("../src/exec");

let ok = false;

global.target = {};

global.exec = execute;
global.cmd = cmd;
global.register = register;

global.prettyjson = prettyjson.render;

for (fseFunctionName in fse) {
  global[fseFunctionName] = fse[fseFunctionName];
}

async function exists(filePath) {
  try {
    const val = await fse.access(filePath, fse.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function makeRed(txt) {
  return chalk.red(txt); // display the help text in red on the console
}

async function loadMakeFile() {
  const scriptName = program.file || "makefile.js";
  if (!await exists(scriptName)) {
    console.log("ShellJS: script not found (" + scriptName + ")");
    process.exit(1);
  }
  require(require.resolve(path.resolve(process.cwd(), scriptName)));
  // Wrap targets to prevent duplicate execution
  for (t in global.target) {
    (function(t, oldTarget) {
      // Wrap it
      global.target[t] = async function() {
        if (!oldTarget.done) {
          oldTarget.done = true;
          oldTarget.result = await oldTarget.apply(oldTarget, arguments);
        }
        return oldTarget.result;
      };
    })(t, global.target[t]);
  }
}

program.option("-f, --file <makefile.js>", "Makefile");

program.arguments("<cmd> [args...]").action(function(cmd, args) {
  //console.log(cmd, args)
  ok = true;
  // console.log(cmds);
  // process.exit();
  return loadMakeFile()
    .then(async () => {
      var camelCmd = camelCase(cmd);
      if (camelCmd in global.target) {
        await global.target[camelCmd].apply(global.target, args);
      } else {
        console.log(chalk.red("no such target: " + camelCmd));
      }
    })
    .catch(e => {
      killChildren();
      console.log("killed children");
    });
});

program.on("--help", function() {
  return loadMakeFile().then(() => {
    // program.outputHelp(make_red);
    console.log("Available targets:");
    for (t in global.target) {
      console.log("  " + decamelize(t, "-"));
    }
    return;
  });
});

var dashesLoc = process.argv.indexOf("--");
var targetArgs = [],
  processArgs = process.argv;

if (dashesLoc > -1) {
  targetArgs = process.argv.slice(dashesLoc + 1, process.argv.length);
  processArgs = process.argv.slice(0, dashesLoc);
}

program.parse(processArgs);

if (!program.args.length) {
  loadMakeFile()
    .then(async () => {
      if ("default" in global.target) {
        await global.target.default();
      } else {
        program.outputHelp(makeRed);
      }
    })
    .catch(e => {
      killChildren();
      console.log("killed children");
    });
}
