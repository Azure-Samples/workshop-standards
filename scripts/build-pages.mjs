import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { load } from 'cheerio';
import { guidePath, resolveLink, root, validateDocs, validateTrackedPaths } from './validate-docs.mjs';

export function buildPages({ directory = root, repository, ref, server = 'https://github.com' }) {
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9_.-]+$/.test(repository ?? '')) {
    throw new Error('Specify --repository owner/repository or GITHUB_REPOSITORY.');
  }
  if (!ref || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref)) {
    throw new Error('Specify --ref commit-sha or GITHUB_SHA.');
  }
  const host = new URL(server);
  if (host.protocol !== 'https:' || host.username || host.password || host.pathname !== '/') {
    throw new Error('GitHub server must be an HTTPS origin without credentials.');
  }
  const errors = [...validateDocs(directory).errors, ...validateTrackedPaths(directory).errors];
  if (errors.length) throw new Error(errors.join('\n'));
  const page = load(readFileSync(path.join(directory, guidePath), 'utf8'));
  page('a[href]').each((index, element) => {
    const href = page(element).attr('href');
    if (href.startsWith('#')) return;
    const target = resolveLink(guidePath, href);
    if (!target) return;
    const encoded = target.file.split('/').map(encodeURIComponent).join('/');
    const fragment = target.anchor ? `#${encodeURIComponent(target.anchor)}` : '';
    page(element).attr('href', `${host.origin}/${repository}/blob/${encodeURIComponent(ref)}/${encoded}${fragment}`);
  });
  const output = path.join(directory, '_site');
  rmSync(output, { recursive: true, force: true });
  mkdirSync(output);
  const destination = path.join(output, 'index.html');
  writeFileSync(destination, page.html());
  return destination;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { values } = parseArgs({
      options: { repository: { type: 'string' }, ref: { type: 'string' } },
    });
    const destination = buildPages({
      repository: values.repository ?? process.env.GITHUB_REPOSITORY,
      ref: values.ref ?? process.env.GITHUB_SHA,
      server: process.env.GITHUB_SERVER_URL ?? 'https://github.com',
    });
    console.log(`PASS: guide-only Pages artifact at ${destination}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}