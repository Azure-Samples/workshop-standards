import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { parseDocument, root, validateDocs } from './validate-docs.mjs';

export const skillName = 'workshop-standardization';
export const skillDirectory = `.github/skills/${skillName}`;
const resources = [
  'SKILL.md', 'references/create.md', 'references/report.md',
  'assets/root-readme.md.tmpl', 'assets/lab-readme.md.tmpl', 'assets/agents.md.tmpl',
  'assets/gitignore.tmpl', 'assets/notebook.ipynb.tmpl', 'assets/devcontainer.json.tmpl',
];
const references = [
  'docs/standards.md', 'docs/migration-guide.md', 'prompts/migration.md',
  'template/decision-sheet.md', 'template/rulesets/protect-main.json',
];

export function validateSkillMetadata(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error('Skill must start with YAML frontmatter.');
  const metadata = parseYaml(match[1]);
  if (metadata?.name !== skillName) throw new Error(`Skill name must be ${skillName}.`);
  if (typeof metadata.description !== 'string' || !metadata.description.trim() || metadata.description.length > 1024) {
    throw new Error('Skill description must contain 1-1024 characters.');
  }
}

function outputFiles(directory, prefix = '') {
  return readdirSync(path.join(directory, prefix), { withFileTypes: true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Refusing output symlink: ${relative}`);
    return entry.isDirectory() ? outputFiles(directory, relative) : [relative];
  });
}

function validateBundle(files) {
  const documents = new Map();
  for (const [file, source] of files) {
    const extension = path.posix.extname(file);
    if (extension === '.md') documents.set(file, parseDocument(source, extension));
    if (extension === '.json') JSON.parse(source);
  }
  for (const [file, parsed] of documents) {
    for (const href of parsed.links) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)) continue;
      const [target, fragment] = href.split('#', 2);
      const pathname = decodeURIComponent(target.split('?', 1)[0]);
      const resolved = pathname ? path.posix.join(path.posix.dirname(file), pathname) : file;
      if (pathname.startsWith('/') || !files.has(resolved)) {
        throw new Error(`${file}: Missing bundled target: ${href}`);
      }
      if (fragment && documents.has(resolved) && !documents.get(resolved).anchors.has(decodeURIComponent(fragment))) {
        throw new Error(`${file}: Missing bundled anchor: ${href}`);
      }
    }
  }
}

export function buildSkill({ directory = root } = {}) {
  const validation = validateDocs(directory);
  if (validation.errors.length) throw new Error(validation.errors.join('\n'));
  const files = new Map();
  const sources = [
    ...resources.map(file => [`${skillDirectory}/${file}`, file]),
    ...references.map(file => [file, `references/${file}`]),
    ['LICENSE.md', 'LICENSE.md'],
  ];
  for (const [sourcePath, destination] of sources) {
    const filename = path.join(directory, sourcePath);
    if (!lstatSync(filename).isFile()) throw new Error(`Not a regular source file: ${sourcePath}`);
    let source = readFileSync(filename, 'utf8');
    if (destination === 'SKILL.md') {
      validateSkillMetadata(source);
      for (const reference of references) {
        source = source.replaceAll(`](../../../${reference})`, `](./references/${reference})`);
      }
    }
    if (destination === 'references/docs/standards.md') {
      source = source.replaceAll('](../README.md)', '](https://github.com/Azure-Samples/workshop-standards)');
    }
    if (destination === 'references/docs/migration-guide.md') {
      source = source.replaceAll('](../workshop-migration-howto.html)', '](https://azure-samples.github.io/workshop-standards/)');
    }
    files.set(destination, source);
  }
  validateBundle(files);
  files.set('manifest.json', `${JSON.stringify({
    generator: 'workshop-standards/build-skill',
    name: skillName,
    standardStatus: 'draft',
    files: Object.fromEntries([...files].map(([file, source]) => [
      file, createHash('sha256').update(source).digest('hex'),
    ])),
  }, null, 2)}\n`);
  for (const relative of ['local-only', 'local-only/skill-dist']) {
    const ancestor = path.join(directory, relative);
    if (existsSync(ancestor) && (!lstatSync(ancestor).isDirectory() || lstatSync(ancestor).isSymbolicLink())) {
      throw new Error(`Skill output parent must be a regular directory: ${relative}`);
    }
  }
  const output = path.join(directory, 'local-only', 'skill-dist', skillName);
  if (existsSync(output)) {
    if (!lstatSync(output).isDirectory() || lstatSync(output).isSymbolicLink()) {
      throw new Error('Skill output must be a regular directory.');
    }
    const manifestPath = path.join(output, 'manifest.json');
    if (!existsSync(manifestPath) || lstatSync(manifestPath).isSymbolicLink() ||
        JSON.parse(readFileSync(manifestPath, 'utf8')).generator !== 'workshop-standards/build-skill') {
      throw new Error('Refusing to overwrite a skill directory not created by this builder.');
    }
    for (const file of outputFiles(output)) {
      if (!files.has(file)) throw new Error(`Unexpected output file; refusing to overwrite bundle: ${file}`);
    }
  }
  for (const [file, source] of files) {
    const destination = path.join(output, file);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, source);
  }
  return output;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(`PASS: portable skill at ${buildSkill()}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
