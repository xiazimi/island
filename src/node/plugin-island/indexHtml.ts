import { Plugin } from 'vite';
import { readFile } from 'fs/promises';
import { CLINET_ENTRY_PATH, DEFAULT_TEMPLATE_PATH } from '../constants';

export function pluginIndexHtml(): Plugin {
  return {
    name: 'island:index-html',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: {
              type: 'module',
              src: `/@fs/${CLINET_ENTRY_PATH}`
            },
            injectTo: 'body'
          }
        ]
      };
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res) => {
          // 1. 读取templatehtml
          let content = await readFile(DEFAULT_TEMPLATE_PATH, 'utf-8');

          content = await server.transformIndexHtml(
            req.url,
            content,
            req.originalUrl
          );
          // 2. 响应 HTML 浏览器
          res.setHeader('content-type', 'text/html');
          res.end(content);
        });
      };
    }
  };
}
