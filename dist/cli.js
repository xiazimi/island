"use strict"; function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _chunkN5COHRQMjs = require('./chunk-N5COHRQM.js');


var _chunk3IVNSFRAjs = require('./chunk-3IVNSFRA.js');

// src/node/cli.ts
var _cac = require('cac'); var _cac2 = _interopRequireDefault(_cac);

// src/node/build.ts
var _vite = require('vite');
var _path = require('path'); var path = _interopRequireWildcard(_path);
var _fsextra = require('fs-extra'); var _fsextra2 = _interopRequireDefault(_fsextra);
async function bundle(root, config) {
  const resolveViteConfig = (isServer) => {
    return {
      mode: "production",
      root,
      plugins: _chunkN5COHRQMjs.createVitePlugins.call(void 0, config),
      ssr: {
        noExternal: ["react-router-dom"]
      },
      build: {
        ssr: isServer,
        outDir: isServer ? ".temp" : "build",
        rollupOptions: {
          input: isServer ? _chunkN5COHRQMjs.SERVER_ENTRY_PATH : _chunkN5COHRQMjs.CLINET_ENTRY_PATH,
          output: {
            format: isServer ? "cjs" : "esm"
          }
        }
      }
    };
  };
  const clientBuild = async () => {
    console.log("clientBuild");
    return _vite.build.call(void 0, resolveViteConfig(false));
  };
  const serverBuild = async () => {
    console.log("serverBuild");
    return _vite.build.call(void 0, resolveViteConfig(true));
  };
  try {
    const [clientBundle, serverBundle] = await Promise.all([
      clientBuild(),
      serverBuild()
    ]);
    return [clientBundle, serverBundle];
  } catch (error) {
    console.log(error);
  }
}
async function renderPage(render, root, clientBundle) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry
  );
  console.log("Rendering page in server side...");
  const appHtml = render();
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>title</title>
    <meta name="description" content="xxx">
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script type="module" src="/${_optionalChain([clientChunk, 'optionalAccess', _ => _.fileName])}"></script>
  </body> 
</html>`.trim();
  await _fsextra2.default.ensureDir(path.join(root, "build"));
  await _fsextra2.default.writeFile(path.join(root, "build/index.html"), html);
  await _fsextra2.default.remove(path.join(root, ".temp"));
}
async function build(root = process.cwd(), config) {
  const [clientBundle] = await bundle(root, config);
  const serverEntryPath = path.join(root, ".temp", "ssr-entry.js");
  console.log("111------000", serverEntryPath);
  const { render } = await Promise.resolve().then(() => _interopRequireWildcard(require(path.resolve(serverEntryPath))));
  await renderPage(render, root, clientBundle);
}

// src/node/cli.ts

var cli = _cac2.default.call(void 0, "island").version("0.0.1").help();
cli.command("dev [root]", "start dev server").action(async (root) => {
  const createServer = async () => {
    const { createDevServer } = await Promise.resolve().then(() => _interopRequireWildcard(require("./dev.js")));
    const server = await createDevServer(root, async () => {
      await server.close();
      await createServer();
    });
    await server.listen();
    server.printUrls();
  };
  await createServer();
});
cli.command("build [root]", "build in production").action(async (root) => {
  root = _path.resolve.call(void 0, root);
  console.log("root===", root);
  const config = await _chunk3IVNSFRAjs.resolveConfig.call(void 0, root, "build", "production");
  await build(root, config);
});
cli.parse();
