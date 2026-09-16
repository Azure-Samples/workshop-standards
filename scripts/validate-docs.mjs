import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import GithubSlugger from 'github-slugger';
import MarkdownIt from 'markdown-it';
import { parse as parseYaml } from 'yaml';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const guidePath = 'workshop-migration-howto.html';
const markdown = new MarkdownIt({ html: true });
const publicFiles = new Set([
  'README.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'LICENSE', 'LICENSE.md', 'LICENSE-DOCS',
  '.gitignore', 'package.json', 'package-lock.json', guidePath,
]);
const publicDirectories = new Set(['docs', 'prompts', 'template', 'scripts', 'tests', '.github']);

export function isPublicPath(file) {
  const normalized = file.replaceAll('\\', '/');
  const segments = normalized.split('/');
  if (segments.some(segment => ['..', '.', '.git', 'node_modules'].includes(segment))) return false;
  if (segments.some(segment => segment === '.env' || segment.startsWith('.env.'))) return false;
  return publicFiles.has(normalized) || publicDirectories.has(segments[0]);
}

export function publicPaths(directory = root, prefix = '') {
  return readdirSync(path.join(directory, prefix), { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (!isPublicPath(relative) || entry.isSymbolicLink()) return [];
    return entry.isDirectory() ? publicPaths(directory, relative) : [relative];
  });
}

function document(source, extension) {
  let body = source.replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');
  if (extension === '.md' && body.startsWith('---\n')) {
    const end = body.indexOf('\n---\n', 4);
    if (end === -1) throw new Error('Unclosed frontmatter');
    const metadata = parseYaml(body.slice(4, end));
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new Error('Frontmatter must be a mapping');
    }
    body = body.slice(end + 5);
  }
  const page = load(extension === '.md' ? markdown.render(body) : body);
  const anchors = new Set(page('[id]').toArray().map(element => page(element).attr('id')));
  if (extension === '.md') {
    const slugger = new GithubSlugger();
    page('h1, h2, h3, h4, h5, h6').each((index, element) => {
      anchors.add(slugger.slug(page(element).text()));
    });
  }
  const links = page('[href], [src]').toArray().flatMap(element => {
    if (page(element).closest('pre, code').length) return [];
    return [page(element).attr('href'), page(element).attr('src')].filter(Boolean);
  });
  return { anchors, links };
}

export function resolveLink(file, href) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) return null;
  const [target, fragment] = href.split('#', 2);
  const pathname = decodeURIComponent(target.split('?', 1)[0]);
  const resolved = pathname.startsWith('/')
    ? path.posix.normalize(pathname.slice(1))
    : pathname ? path.posix.join(path.posix.dirname(file), pathname) : file;
  if (!isPublicPath(resolved)) throw new Error(`Link outside public files: ${href}`);
  return { file: resolved, anchor: fragment ? decodeURIComponent(fragment) : '' };
}

export function validateDocs(directory = root) {
  const errors = [];
  const files = publicPaths(directory);
  const included = new Set(files);
  const documents = new Map();
  for (const file of files) {
    try {
      const extension = path.extname(file);
      const source = readFileSync(path.join(directory, file), 'utf8');
      if (['.md', '.html'].includes(extension)) documents.set(file, document(source, extension));
      if (['.yml', '.yaml'].includes(extension)) parseYaml(source);
      if (extension === '.json') JSON.parse(source);
    } catch (error) {
      errors.push(`${file}: ${error.message}`);
    }
  }
  for (const [file, parsed] of documents) {
    for (const href of parsed.links) {
      try {
        const target = resolveLink(file, href);
        if (!target) continue;
        if (!included.has(target.file)) throw new Error(`Missing public target: ${href}`);
        if (target.anchor && documents.has(target.file) && !documents.get(target.file).anchors.has(target.anchor)) {
          throw new Error(`Missing anchor: ${href}`);
        }
      } catch (error) {
        errors.push(`${file}: ${error.message}`);
      }
    }
  }
  const rulesetPath = path.join(directory, 'template/rulesets/protect-main.json');
  if (existsSync(rulesetPath)) {
    try {
      const ruleset = JSON.parse(readFileSync(rulesetPath, 'utf8'));
      if (ruleset.target !== 'branch' || ruleset.enforcement !== 'disabled') {
        throw new Error('Import template must target branches and remain disabled');
      }
      for (const type of ['deletion', 'non_fast_forward', 'pull_request']) {
        if (!ruleset.rules?.some(rule => rule.type === type)) throw new Error(`Missing rule: ${type}`);
      }
    } catch (error) {
      errors.push(`template/rulesets/protect-main.json: ${error.message}`);
    }
  }
  return { errors, documents: documents.size, files: files.length };
}

export function validateTrackedPaths(directory = root) {
  if (!existsSync(path.join(directory, '.git'))) return { skipped: true, errors: [] };
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: directory, encoding: 'utf8' })
    .split('\0').filter(Boolean);
  return {
    skipped: false,
    errors: tracked.filter(file => !isPublicPath(file)).map(file => `Unexpected tracked path: ${file}`),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateDocs();
  const tracked = validateTrackedPaths();
  const errors = [...result.errors, ...tracked.errors];
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${result.documents} documents; ${result.files} public files; links, anchors, YAML and JSON valid.`);
    console.log(tracked.skipped ? 'SKIP: tracked-file check (no Git repository at project root).' : 'PASS: tracked-file boundary.');
  }
}