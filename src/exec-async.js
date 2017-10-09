const cp = require("child_process");
const stringArgv = require("string-argv");

module.exports = function(cmd, args) {
  // const executable = cmd.substring(0, cmd.indexOf(' '));
  // const args = cmd.substr(cmd.indexOf(' ') + 1);
  return new Promise((resolve, reject) => {
    const vargs = stringArgv(args);
    try {
      const child = cp.spawn(cmd, vargs, {
        shell: true,
        stdio: "inherit"
      });

      child.on("error", err => {
        console.log("Failed to start ", cmd, vargs);
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
};
