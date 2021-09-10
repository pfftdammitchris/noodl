var __require = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../../node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "../../node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs = require("fs");
    var path = require("path");
    var os = require("os");
    function log(message) {
      console.log(`[dotenv][DEBUG] ${message}`);
    }
    var NEWLINE = "\n";
    var RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/;
    var RE_NEWLINES = /\\n/g;
    var NEWLINES_MATCH = /\r\n|\n|\r/;
    function parse(src, options) {
      const debug = Boolean(options && options.debug);
      const obj = {};
      src.toString().split(NEWLINES_MATCH).forEach(function(line, idx) {
        const keyValueArr = line.match(RE_INI_KEY_VAL);
        if (keyValueArr != null) {
          const key = keyValueArr[1];
          let val = keyValueArr[2] || "";
          const end = val.length - 1;
          const isDoubleQuoted = val[0] === '"' && val[end] === '"';
          const isSingleQuoted = val[0] === "'" && val[end] === "'";
          if (isSingleQuoted || isDoubleQuoted) {
            val = val.substring(1, end);
            if (isDoubleQuoted) {
              val = val.replace(RE_NEWLINES, NEWLINE);
            }
          } else {
            val = val.trim();
          }
          obj[key] = val;
        } else if (debug) {
          log(`did not match key and value when parsing line ${idx + 1}: ${line}`);
        }
      });
      return obj;
    }
    function resolveHome(envPath) {
      return envPath[0] === "~" ? path.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function config2(options) {
      let dotenvPath = path.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      let debug = false;
      if (options) {
        if (options.path != null) {
          dotenvPath = resolveHome(options.path);
        }
        if (options.encoding != null) {
          encoding = options.encoding;
        }
        if (options.debug != null) {
          debug = true;
        }
      }
      try {
        const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug });
        Object.keys(parsed).forEach(function(key) {
          if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
            process.env[key] = parsed[key];
          } else if (debug) {
            log(`"${key}" is already defined in \`process.env\` and will not be overwritten`);
          }
        });
        return { parsed };
      } catch (e) {
        return { error: e };
      }
    }
    module2.exports.config = config2;
    module2.exports.parse = parse;
  }
});

// node_modules/webpack-node-externals/utils.js
var require_utils = __commonJS({
  "node_modules/webpack-node-externals/utils.js"(exports2) {
    var fs = require("fs");
    var path = require("path");
    exports2.contains = function contains(arr, val) {
      return arr && arr.indexOf(val) !== -1;
    };
    var atPrefix = new RegExp("^@", "g");
    exports2.readDir = function readDir(dirName) {
      if (!fs.existsSync(dirName)) {
        return [];
      }
      try {
        return fs.readdirSync(dirName).map(function(module3) {
          if (atPrefix.test(module3)) {
            atPrefix.lastIndex = 0;
            try {
              return fs.readdirSync(path.join(dirName, module3)).map(function(scopedMod) {
                return module3 + "/" + scopedMod;
              });
            } catch (e) {
              return [module3];
            }
          }
          return module3;
        }).reduce(function(prev, next) {
          return prev.concat(next);
        }, []);
      } catch (e) {
        return [];
      }
    };
    exports2.readFromPackageJson = function readFromPackageJson(options) {
      if (typeof options !== "object") {
        options = {};
      }
      const includeInBundle = options.exclude || options.includeInBundle;
      const excludeFromBundle = options.include || options.excludeFromBundle;
      let packageJson;
      try {
        const fileName = options.fileName || "package.json";
        const packageJsonString = fs.readFileSync(path.resolve(process.cwd(), fileName), "utf8");
        packageJson = JSON.parse(packageJsonString);
      } catch (e) {
        return [];
      }
      let sections = [
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies"
      ];
      if (excludeFromBundle) {
        sections = [].concat(excludeFromBundle);
      }
      if (includeInBundle) {
        sections = sections.filter(function(section) {
          return [].concat(includeInBundle).indexOf(section) === -1;
        });
      }
      const deps = {};
      sections.forEach(function(section) {
        Object.keys(packageJson[section] || {}).forEach(function(dep) {
          deps[dep] = true;
        });
      });
      return Object.keys(deps);
    };
    exports2.containsPattern = function containsPattern(arr, val) {
      return arr && arr.some(function(pattern) {
        if (pattern instanceof RegExp) {
          return pattern.test(val);
        } else if (typeof pattern === "function") {
          return pattern(val);
        } else {
          return pattern == val;
        }
      });
    };
    exports2.validateOptions = function(options) {
      options = options || {};
      const results = [];
      const mistakes = {
        allowlist: ["allowslist", "whitelist", "allow"],
        importType: ["import", "importype", "importtype"],
        modulesDir: ["moduledir", "moduledirs"],
        modulesFromFile: ["modulesfile"],
        includeAbsolutePaths: ["includeAbsolutesPaths"],
        additionalModuleDirs: ["additionalModulesDirs", "additionalModulesDir"]
      };
      const optionsKeys = Object.keys(options);
      const optionsKeysLower = optionsKeys.map(function(optionName) {
        return optionName && optionName.toLowerCase();
      });
      Object.keys(mistakes).forEach(function(correctTerm) {
        if (!options.hasOwnProperty(correctTerm)) {
          mistakes[correctTerm].concat(correctTerm.toLowerCase()).forEach(function(mistake) {
            const ind = optionsKeysLower.indexOf(mistake.toLowerCase());
            if (ind > -1) {
              results.push({
                message: `Option '${optionsKeys[ind]}' is not supported. Did you mean '${correctTerm}'?`,
                wrongTerm: optionsKeys[ind],
                correctTerm
              });
            }
          });
        }
      });
      return results;
    };
    exports2.log = function(message) {
      console.log(`[webpack-node-externals] : ${message}`);
    };
    exports2.error = function(errors) {
      throw new Error(errors.map(function(error) {
        return `[webpack-node-externals] : ${error}`;
      }).join("\r\n"));
    };
  }
});

// node_modules/webpack-node-externals/index.js
var require_webpack_node_externals = __commonJS({
  "node_modules/webpack-node-externals/index.js"(exports2, module2) {
    var utils = require_utils();
    var scopedModuleRegex = new RegExp("@[a-zA-Z0-9][\\w-.]+/[a-zA-Z0-9][\\w-.]+([a-zA-Z0-9./]+)?", "g");
    function getModuleName(request, includeAbsolutePaths) {
      let req = request;
      const delimiter = "/";
      if (includeAbsolutePaths) {
        req = req.replace(/^.*?\/node_modules\//, "");
      }
      if (scopedModuleRegex.test(req)) {
        scopedModuleRegex.lastIndex = 0;
        return req.split(delimiter, 2).join(delimiter);
      }
      return req.split(delimiter)[0];
    }
    module2.exports = function nodeExternals2(options) {
      options = options || {};
      const mistakes = utils.validateOptions(options) || [];
      if (mistakes.length) {
        mistakes.forEach((mistake) => {
          utils.error(mistakes.map((mistake2) => mistake2.message));
          utils.log(mistake.message);
        });
      }
      const webpackInternalAllowlist = [/^webpack\/container\/reference\//];
      const allowlist = [].concat(webpackInternalAllowlist).concat(options.allowlist || []);
      const binaryDirs = [].concat(options.binaryDirs || [".bin"]);
      const importType = options.importType || "commonjs";
      const modulesDir = options.modulesDir || "node_modules";
      const modulesFromFile = !!options.modulesFromFile;
      const includeAbsolutePaths = !!options.includeAbsolutePaths;
      const additionalModuleDirs = options.additionalModuleDirs || [];
      function isNotBinary(x) {
        return !utils.contains(binaryDirs, x);
      }
      let nodeModules = modulesFromFile ? utils.readFromPackageJson(options.modulesFromFile) : utils.readDir(modulesDir).filter(isNotBinary);
      additionalModuleDirs.forEach(function(additionalDirectory) {
        nodeModules = nodeModules.concat(utils.readDir(additionalDirectory).filter(isNotBinary));
      });
      return function(...args) {
        const [arg1, arg2, arg3] = args;
        let request = arg2;
        let callback = arg3;
        if (arg1 && arg1.context && arg1.request) {
          request = arg1.request;
          callback = arg2;
        }
        const moduleName = getModuleName(request, includeAbsolutePaths);
        if (utils.contains(nodeModules, moduleName) && !utils.containsPattern(allowlist, request)) {
          if (typeof importType === "function") {
            return callback(null, importType(request));
          }
          return callback(null, importType + " " + request);
        }
        callback();
      };
    };
  }
});

// webpack.functions.js
require_main().config();
var nodeExternals = require_webpack_node_externals();
console.log("HELLOASFSAFAS");
var config = {
  entry: "./src/metadata.ts",
  externals: [nodeExternals()],
  mode: "development",
  optimization: { minimize: false },
  devServer: {
    proxy: {
      "/.netlify": {
        target: "http://127.0.0.1:3001",
        pathRewrite: { "^/.netlify/functions": "" }
      }
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "esbuild-loader",
        options: {
          loader: "ts",
          target: "es2020"
        }
      }
    ]
  }
};
module.exports = config;
