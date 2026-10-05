import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parse as parseYaml } from 'yaml';
import { buildSkill, skillDirectory, skillName, validateSkillMetadata } from '../scripts/build-skill.mjs';
import { publicPaths, root, validateDocs } from '../scripts/validate-docs.mjs';

function fixture(context, copySource = false) {
  const directory = mkdtempSync(path.join(tmpdir(), 'workshop-skill-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  if (copySource) {
    for (const file of publicPaths(root)) {
      const destination = path.join(directory, file);
      mkdirSync(path.dirname(destination), { recursive: true });
      copyFileSync(path.join(root, file), destination);
    }
  }
  return directory;
}

function filesIn(directory, prefix = '') {
  return readdirSync(path.join(directory, prefix), { withFileTypes: true }).flatMap(entry => {
    const file = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? filesIn(directory, file) : [file];
  });
}

function template(name) {
  return readFileSync(path.join(root, skillDirectory, 'assets', name), 'utf8');
}

function render(source, values) {
  const result = source.replace(/\{\{([A-Z_]+)\}\}/g, (token, key) => {
    assert.ok(Object.hasOwn(values, key), `Missing value: ${key}`);
    return values[key];
  });
  assert.doesNotMatch(result, /\{\{[^}]+\}\}/);
  return result;
}

function metadata(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  assert.ok(match, 'Template must start with YAML frontmatter');
  return parseYaml(match[1]);
}

test('skill metadata matches the discovery name and rejects invalid descriptions', () => {
  const source = readFileSync(path.join(root, skillDirectory, 'SKILL.md'), 'utf8');
  assert.doesNotThrow(() => validateSkillMetadata(source));
  assert.throws(() => validateSkillMetadata('# No metadata'), /frontmatter/);
  assert.throws(() => validateSkillMetadata('---\nname: other\ndescription: test\n---\n'), /name/);
  for (const description of ['""', '[]', JSON.stringify('a'.repeat(1025))]) {
    assert.throws(() => validateSkillMetadata(`---\nname: ${skillName}\ndescription: ${description}\n---\n`), /description/);
  }
});

test('portable bundle has complete local links, deterministic hashes and no private files', context => {
  const directory = fixture(context, true);
  mkdirSync(path.join(directory, 'local-only'), { recursive: true });
  writeFileSync(path.join(directory, 'local-only', 'decision.md'), 'private decision');
  writeFileSync(path.join(directory, '.env'), 'PRIVATE=value');
  const output = buildSkill({ directory });
  const files = filesIn(output);
  assert.equal(files.length, 16);
  assert.ok(files.includes('assets/root-readme.md.tmpl'));
  assert.ok(files.includes('references/prompts/migration.md'));
  assert.ok(files.includes('references/template/rulesets/protect-main.json'));
  assert.ok(files.includes('LICENSE.md'));
  assert.ok(!files.some(file => file.includes('decision.md') || file.includes('.env') || file.includes('node_modules')));
  const skill = readFileSync(path.join(output, 'SKILL.md'), 'utf8');
  assert.doesNotMatch(skill, /\.\.\/\.\.\/\.\.\//);
  assert.match(skill, /\.\/references\/docs\/standards\.md/);
  const manifest = JSON.parse(readFileSync(path.join(output, 'manifest.json'), 'utf8'));
  assert.equal(manifest.standardStatus, 'draft');
  assert.equal(Object.keys(manifest.files).length, 15);
  for (const [file, hash] of Object.entries(manifest.files)) {
    assert.equal(createHash('sha256').update(readFileSync(path.join(output, file))).digest('hex'), hash, file);
  }
  const portable = fixture(context);
  for (const file of files) {
    const destination = path.join(portable, 'docs', 'bundle', file);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(path.join(output, file), destination);
  }
  assert.deepEqual(validateDocs(portable).errors, []);
  buildSkill({ directory });
  assert.deepEqual(JSON.parse(readFileSync(path.join(output, 'manifest.json'), 'utf8')), manifest);
});

test('bundle fails on missing source references before creating output', context => {
  const directory = fixture(context, true);
  rmSync(path.join(directory, 'prompts', 'migration.md'));
  assert.throws(() => buildSkill({ directory }), /Missing public target/);
  assert.equal(existsSync(path.join(directory, 'local-only', 'skill-dist', skillName)), false);
});

test('bundle refuses unknown output files and unmanaged directories without overwriting', context => {
  const directory = fixture(context, true);
  const output = buildSkill({ directory });
  const original = readFileSync(path.join(output, 'SKILL.md'), 'utf8');
  writeFileSync(path.join(output, 'private-notes.txt'), 'keep this file');
  assert.throws(() => buildSkill({ directory }), /Unexpected output file/);
  assert.equal(readFileSync(path.join(output, 'SKILL.md'), 'utf8'), original);
  assert.equal(readFileSync(path.join(output, 'private-notes.txt'), 'utf8'), 'keep this file');
  rmSync(path.join(output, 'manifest.json'));
  assert.throws(() => buildSkill({ directory }), /not created by this builder/);
});

for (const type of ['A', 'B', 'C']) {
  test(`type ${type} starter renders parseable metadata, real links and clean notebooks`, context => {
    const directory = fixture(context);
    const home = path.join(directory, 'docs', 'starter');
    const lab = path.join(home, '01-setup');
    mkdirSync(lab, { recursive: true });
    const title = 'Lab: "확인" \\ 환경';
    const values = {
      TITLE_YAML: JSON.stringify(title), DESCRIPTION_YAML: JSON.stringify('작성용 골격'),
      LEVEL_YAML: '"beginner"', AUTHORS_YAML: '["Author"]', CONTACTS_YAML: '["@author"]',
      DURATION_YAML: '', TAGS_YAML: '["workshop"]', EXECUTION_YAML: type === 'A' ? '["portal"]' : '["codespaces", "local"]',
      SOURCE_YAML: '"original"', TODAY: '2026-10-05', TITLE_TEXT: '워크샵 골격',
      LAB_LINKS: '- [준비](01-setup/README.md)', FIRST_LAB_PATH: '01-setup',
      LAB_TITLE_YAML: JSON.stringify(title), LAB_DURATION_YAML: '', LAB_TITLE_TEXT: '01. 준비',
      WORKSHOP_HOME_PATH: '..', NAVIGATION_LINKS: '',
    };
    const readme = render(template('root-readme.md.tmpl'), values);
    let labReadme = render(template('lab-readme.md.tmpl'), values);
    const frontmatter = metadata(readme);
    assert.equal(frontmatter.title, title);
    assert.equal(frontmatter.status, 'draft');
    assert.equal(frontmatter.validated_on, null);
    assert.equal(frontmatter.duration_minutes, null);
    assert.deepEqual(frontmatter.execution, type === 'A' ? ['portal'] : ['codespaces', 'local']);
    assert.deepEqual(Object.keys(metadata(labReadme)), ['title', 'duration_minutes', 'last_updated']);
    if (type !== 'A') {
      const notebook = template('notebook.ipynb.tmpl');
      const parsed = JSON.parse(notebook);
      assert.equal(parsed.nbformat, 4);
      assert.ok(parsed.cells.every(cell => cell.cell_type !== 'code' ||
        (cell.execution_count === null && cell.outputs.length === 0)));
      writeFileSync(path.join(lab, '01-exercise.ipynb'), notebook);
      labReadme += '\n[실행 자료](01-exercise.ipynb)\n';
      const environment = JSON.parse(render(template('devcontainer.json.tmpl'), {
        DEVCONTAINER_IMAGE_JSON: JSON.stringify('mcr.microsoft.com/devcontainers/python:3.12-bookworm'),
        EXTENSIONS_JSON: JSON.stringify(['ms-python.python']),
      }));
      assert.equal(environment.image, 'mcr.microsoft.com/devcontainers/python:3.12-bookworm');
      assert.deepEqual(environment.customizations.vscode.extensions, ['ms-python.python']);
      mkdirSync(path.join(home, '.devcontainer'));
      writeFileSync(path.join(home, '.devcontainer', 'devcontainer.json'), JSON.stringify(environment));
    }
    writeFileSync(path.join(home, 'README.md'), readme);
    writeFileSync(path.join(lab, 'README.md'), labReadme);
    assert.equal(existsSync(path.join(home, '.devcontainer')), type !== 'A');
    assert.deepEqual(validateDocs(directory).errors, []);
    assert.match(readme, /TODO/);
  });
}
