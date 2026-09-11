import { resolve } from 'node:path';

const distDir = resolve(import.meta.dir, '..', 'dist');
const port = Number(Bun.env.PORT ?? 5000);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
]);

function getContentType(filePath: string): string {
  const extension = filePath.slice(filePath.lastIndexOf('.'));
  return contentTypes.get(extension) ?? 'application/octet-stream';
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    const rawPath = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
    const filePath = resolve(distDir, rawPath);

    if (!filePath.startsWith(distDir)) {
      return new Response('Forbidden', { status: 403 });
    }

    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response('Not Found', { status: 404 });
    }

    return new Response(file, {
      headers: {
        'content-type': getContentType(filePath),
      },
    });
  },
});

console.log(`Serving dist on http://localhost:${port}`);
