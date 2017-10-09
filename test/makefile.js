register("docker");

target.test = async function() {
  await exec("ls", "-lrt");
  await docker("info");
  console.log("cououc");
};
