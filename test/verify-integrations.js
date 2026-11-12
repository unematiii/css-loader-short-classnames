const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const fixtureDir = path.join(__dirname, "fixtures/css-modules");

const compile = (configPath) =>
  new Promise((resolve, reject) => {
    webpack(require(configPath), (error, stats) => {
      if (error) return reject(error);
      if (stats.hasErrors()) return reject(new Error(stats.toString("errors-only")));
      resolve(stats);
    });
  });

const verify = async () => {
  for (const [configFile, outputDir, cssFile] of [
    ["webpack.native.config.js", "native", "bundle.css"],
    ["webpack.loader.config.js", "loader", null],
  ]) {
    await compile(path.join(fixtureDir, configFile));
    const bundle = fs.readFileSync(
      path.join(fixtureDir, `.output/${outputDir}/bundle.js`),
      "utf8"
    );
    const css = cssFile
      ? fs.readFileSync(path.join(fixtureDir, `.output/${outputDir}/${cssFile}`), "utf8")
      : bundle;

    for (const declaration of ["color: red", "background-color: blue"]) {
      if (!css.includes(declaration)) {
        throw new Error(`${configFile} output lost CSS declaration: ${declaration}`);
      }
    }
    if (!/\.a\s*\{/.test(css) || !/\.b\s*\{/.test(css)) {
      throw new Error(`${configFile} output did not contain the expected short selectors`);
    }
    for (const [local, generated] of [["root", "a"], ["label", "b"]]) {
      const objectEntry =
        bundle.includes(`"${local}": "${generated}"`) ||
        bundle.includes(`"${local}": \`${generated}\``);
      const variableExport = bundle.includes(`var ${local} = \`${generated}\``);
      if (!objectEntry && !variableExport) {
        throw new Error(`${configFile} bundle did not export ${local} as ${generated}`);
      }
    }
    console.log(`Verified ${configFile}: short class names and CSS declarations are present.`);
  }
};

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
