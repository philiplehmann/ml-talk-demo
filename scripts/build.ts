import { cp, mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dir, '..');
const distDir = resolve(rootDir, 'dist');

const htmlFiles = ['index.html', 'demo1.html', 'demo2.html', 'talk.html', 'homeserver.html'];
const entrypoints = ['demo1.ts', 'demo2.ts', 'reveal.ts'].map((file) => resolve(rootDir, 'src', file));
const htmlReplacements = new Map([
  ['/src/demo1.ts', '/src/demo1.js'],
  ['/src/demo2.ts', '/src/demo2.js'],
  ['/src/reveal.ts', '/src/reveal.js'],
]);

export async function buildSite() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(resolve(distDir, 'src'), { recursive: true });

  const buildResult = await Bun.build({
    entrypoints,
    outdir: resolve(distDir, 'src'),
    target: 'browser',
    format: 'esm',
    splitting: true,
    minify: true,
  });

  if (!buildResult.success) {
    throw new Error('Bun build failed.');
  }

  await Promise.all(
    htmlFiles.map(async (fileName) => {
      const sourcePath = resolve(rootDir, fileName);
      let content = await readFile(sourcePath, 'utf8');

      for (const [from, to] of htmlReplacements) {
        content = content.replaceAll(from, to);
      }

      await Bun.write(resolve(distDir, fileName), content);
    }),
  );

  await cp(resolve(rootDir, 'assets'), resolve(distDir, 'assets'), { recursive: true });
}

if (import.meta.main) {
  await buildSite();
}
