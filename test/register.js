register("npm");

target.default = async () => {
  await npm("--version", null, false);
  console.log("jj");
};
