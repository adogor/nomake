const cp = require('child_process');

module.exports = function(cmd, returnStdout) {
  try {
    var res = cp.execSync(cmd, {
      stdio: returnStdout ? 'pipe' : 'inherit'
    });
    if (res) {
      console.log(res.toString());
      return res.toString();
    }
  } catch (e) {
    console.error(e.message);
    throw e;
  }
}
