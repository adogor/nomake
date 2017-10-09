register("docker");

target.test = async function() {
  await exec("ls", "-lrt");
  await docker("info");
  console.log("cououc");
};

target.execReturnStdout = async function() {
  const list = await exec("ls -lrt", true);
  console.log("list: ", list);
};

target.execNormal = async function() {
  console.log("list: ");
  await exec("ls -lrt");
};
