const cp = require('child_process');

// cp.spawnSync('bower', ['init'], {
//   stdio: 'inherit'
// })
cp.execSync('bower init', {
  stdio: 'inherit'
});
