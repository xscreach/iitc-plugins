const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const childProcess = require("child_process");

const { ConcatSource } = require("webpack-sources");
const Compilation = require("webpack/lib/Compilation");
const ESLintWebpackPlugin = require("eslint-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

// eslint-disable-next-line no-extend-native
String.prototype.interpolate = function (params) {
  const names = Object.keys(params);
  const vals = Object.values(params);
  // eslint-disable-next-line no-new-func
  return new Function(...names, `return \`${this}\`;`)(...vals);
};

const wrapPrefix = `
function wrapper(plugin_info) {
  if (typeof window.plugin !== "function") {
    window.plugin = function () {};
  }

  window.plugin.\${pluginCode} = window.plugin.\${pluginCode} = {};
  window.plugin.\${pluginCode}.info = plugin_info.script;

  // Code injection
  function setup () {
`;
const wrapSuffix = `
    window.plugin.\${pluginCode}.init();
  }

  setup.info = plugin_info; //add the script info data to the function as a property
  if (!window.bootPlugins) {
    window.bootPlugins = [];
  }
  window.bootPlugins.push(setup);
  // if IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === "function") {
    setup();
  }
}

var script = document.createElement("script");
var info = {};
if (typeof GM_info !== "undefined" && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description,
  };
}

script.appendChild(
  document.createTextNode("(" + wrapper + ")(" + JSON.stringify(info) + ");")
);
(document.body || document.head || document.documentElement).appendChild(
  script
);
`;

class IITCScript extends ESLintWebpackPlugin {
  constructor(options) {
    super();
    this.options = options || {};
    this.header = "";
    this.header += "// ==UserScript==\n";
    const keys = ["id", "name", "namespace", "version", "updateURL", "downloadURL", "description", "author", "match", "category", "grant"];
    const meta = {
      match: ["https://intel.ingress.com/*", "https://intel-x.ingress.com/*"],
      grant: "none",
      version: "",
    };
    Object.assign(meta, this.options.meta);
    meta.version = meta.version.replace(
      "BUILDDATE",
      new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14)
    );
    keys.forEach((key) => {
      Array.prototype.concat.apply([], meta[key] && [meta[key]]).forEach((value) => {
        if (value) this.header += `// @${key.padEnd(13)} ${value.interpolate(this.options.config)}\n`;
      });
    });
    this.header += "// ==/UserScript==\n\n";
  }

  apply(compiler) {
    compiler.hooks.compilation.tap("Userscript", (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: "Userscript",
          stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
        },
        () => {
          compilation.chunks.forEach((chunk) => {
            chunk.files.forEach((file) => {
              compilation.updateAsset(
                file,
                new ConcatSource(this.header, wrapPrefix.interpolate(this.options.config), compilation.assets[file], wrapSuffix.interpolate(this.options.config))
              );
            });
          });
          if (this.options.withMeta) {
            compilation.chunks.forEach((chunk) => {
              chunk.files.forEach((file) => {
                if (file.match(/user.js$/)) compilation.emitAsset(file.replace(/user.js$/, "meta.js"), new ConcatSource(this.header), { minimized: true });
              });
            });
          }
        }
      );
    });
  }
}

function getCommitShort() {
  try {
    return childProcess.execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return null;
  }
}

module.exports = (env, argv) => {
  const pluginConfig = require("./plugin.config.json");

  const commonMeta = pluginConfig.headers.common;
  const build = env.build;

  if (build in pluginConfig.headers) {
    Object.assign(commonMeta, pluginConfig.headers[build]);
  }
  const dev = build !== "prod";
  const commonConfig = {
    mode: dev ? "development" : "production",
    devtool: dev ? "eval" : "nosources-source-map",
    resolve: {
      modules: ["node_modules"],
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.svg$/,
          loader: "raw-loader",
          options: { esModule: false },
        },
        {
          test: /\.scss$/,
          use: [
            // "to-string-loader",
            "style-loader",
            {
              loader: "css-loader",
              options: { esModule: false, url: false },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: [
                    [
                      "postcss-url",
                      {
                        url: "inline",
                      },
                    ],
                    ["cssnano", { preset: "default" }],
                  ],
                },
              },
            },
            "sass-loader",
          ],
        },
      ],
    },
    plugins: [
      new ESLintPlugin({ fix: true }),
      new TerserPlugin({
        terserOptions: {
          compress: !dev,
        },
      }),
    ].concat(dev ? [] : [new MiniCssExtractPlugin()]),
  };

  if (dev) {
    commonConfig.devtool = "eval-source-map";
  }

  const commit = getCommitShort();

  const configs = [];
  pluginConfig.plugins.forEach((pluginCfg) => {
    const config = Object.assign({}, commonConfig, {
      name: pluginCfg.pluginName,
      entry: {
        init: `./src/code/${pluginCfg.pluginCode}.ts`,
      },
      output: {
        filename: `${pluginCfg.pluginCode}.user.js`,
        path: path.join(__dirname, pluginConfig.releaseFolder[build]),
      },
    });

    const meta = Object.assign({}, commonMeta, pluginCfg.headers);
    if (commit) meta.version += `-${commit}`;

    config.plugins.push(new IITCScript({ config: pluginCfg, meta: meta, withMeta: true }));

    configs.push(config);
  });

  return configs;
};
