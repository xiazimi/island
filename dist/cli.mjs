import {
  CLINET_ENTRY_PATH,
  SERVER_ENTRY_PATH,
  createVitePlugins
} from "./chunk-W2YKH2VG.mjs";
import {
  resolveConfig
} from "./chunk-TMPRKMCD.mjs";

// src/node/cli.ts
import cac from "cac";

// src/node/build.ts
import { build as viteBuild } from "vite";
import * as path from "path";
import fs from "fs-extra";
async function bundle(root, config) {
  const resolveViteConfig = (isServer) => {
    return {
      mode: "production",
      root,
      plugins: createVitePlugins(config),
      ssr: {
        noExternal: ["react-router-dom"]
      },
      build: {
        ssr: isServer,
        outDir: isServer ? ".temp" : "build",
        rollupOptions: {
          input: isServer ? SERVER_ENTRY_PATH : CLINET_ENTRY_PATH,
          output: {
            format: isServer ? "cjs" : "esm"
          }
        }
      }
    };
  };
  const clientBuild = async () => {
    console.log("clientBuild");
    return viteBuild(resolveViteConfig(false));
  };
  const serverBuild = async () => {
    console.log("serverBuild");
    return viteBuild(resolveViteConfig(true));
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
    <script type="module" src="/${clientChunk?.fileName}"></script>
  </body> 
</html>`.trim();
  await fs.ensureDir(path.join(root, "build"));
  await fs.writeFile(path.join(root, "build/index.html"), html);
  await fs.remove(path.join(root, ".temp"));
}
async function build(root = process.cwd(), config) {
  const [clientBundle] = await bundle(root, config);
  const serverEntryPath = path.join(root, ".temp", "ssr-entry.js");
  console.log("111------000", serverEntryPath);
  const { render } = await import(path.resolve(serverEntryPath));
  await renderPage(render, root, clientBundle);
}

// src/node/cli.ts
import { resolve as resolve2 } from "path";
var cli = cac("island").version("0.0.1").help();
cli.command("dev [root]", "start dev server").action(async (root) => {
  const createServer = async () => {
    const { createDevServer } = await import("./dev.mjs");
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
  root = resolve2(root);
  console.log("root===", root);
  const config = await resolveConfig(root, "build", "production");
  await build(root, config);
});
cli.parse();
