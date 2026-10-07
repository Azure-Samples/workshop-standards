import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { load } from 'cheerio';
import { buildPages } from '../scripts/build-pages.mjs';
import { isPublicPath, root, validateDocs, validateTrackedPaths } from '../scripts/validate-docs.mjs';

function fixture(context, files) {
  const directory = mkdtempSync(path.join(tmpdir(), 'workshop-docs-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    writeFileSync(path.join(directory, file), content);
  }
  return directory;
}

test('public paths exclude local data and path traversal', () => {
  for (const file of ['dry-run/repo/README.md', 'local-only/log.md', 'runbook-first-push-2026-09-15.md', '_site/index.html', 'docs/../../secret.md', 'docs/.env.local']) {
    assert.equal(isPublicPath(file), false, file);
  }
  assert.equal(isPublicPath('template/rulesets/protect-main.json'), true);
  assert.equal(isPublicPath('LICENSE.md'), true);
});

test('gitignore excludes local files without hiding shared documents', context => {
  const directory = fixture(context, {});
  execFileSync('git', ['init', '--quiet', directory]);
  for (const [file, expected] of [
    ['dry-run/repo/.git/config', 0], ['dry-run/report.json', 0], ['local-only/log.md', 0],
    ['_site/index.html', 0], ['.env.local', 0],
    ['README.md', 1], ['LICENSE.md', 1], ['template/rulesets/protect-main.json', 1], ['.env.example', 1],
  ]) {
    const result = spawnSync('git', ['-c', `core.excludesFile=${path.join(root, '.gitignore')}`, 'check-ignore', '--quiet', '--no-index', '--', file], { cwd: directory });
    assert.equal(result.status, expected, file);
  }
});

test('valid Markdown, Korean anchors and HTML anchors pass; code examples are ignored', context => {
  const directory = fixture(context, {
    'README.md': '# Home\n[guide](docs/guide.md#준비)\n```md\n[example](missing.md)\n```\n',
    'docs/guide.md': '---\ntitle: Guide\n---\n# 준비\n[home](../README.md#home)\n<a id="extra"></a>\n[extra](#extra)\n',
    'dry-run/broken.md': '[broken](missing.md)',
  });
  assert.deepEqual(validateDocs(directory).errors, []);
});

test('missing files, missing anchors and private links fail', context => {
  const directory = fixture(context, {
    'README.md': '# Home\n[missing](docs/missing.md)\n[anchor](#missing)\n[private](dry-run/README.md)\n',
  });
  assert.equal(validateDocs(directory).errors.length, 3);
});

test('invalid frontmatter and YAML fail', context => {
  const directory = fixture(context, {
    'README.md': '---\ntitle: [broken\n---\n# Home\n',
    '.github/workflows/validate.yml': 'jobs: [broken',
  });
  assert.equal(validateDocs(directory).errors.length, 2);
});

test('tracked local files fail even if an ignore rule would hide new files', context => {
  const directory = fixture(context, { 'dry-run/report.json': '{}' });
  execFileSync('git', ['init', '--quiet', directory]);
  execFileSync('git', ['add', '-f', 'dry-run/report.json'], { cwd: directory });
  assert.equal(validateTrackedPaths(directory).errors.length, 1);
});

test('guide starts with skill installation instead of a standalone analysis prompt', () => {
  const source = readFileSync(path.join(root, 'workshop-migration-howto.html'), 'utf8');
  const page = load(source);
  assert.equal(page('#s1 h2').text(), '시작 · skill 설치');
  assert.equal(page('#toc a[href="#s1"]').text(), page('#s1 h2').text());
  assert.equal(page('#s1 .action').attr('href'), 'docs/skill-guide.md');
  assert.equal(page('#s1 .action').text(), 'skill 설치와 사용');
  assert.equal(page('#s1 .step').length, 3);
  assert.match(page('#s1').text(), /workshop-standardization/);
  assert.match(page('#s1').text(), /첫 작업은 분석만 진행/);
  assert.equal(page('#s1 pre, #s1 button').length, 0);
  assert.doesNotMatch(source, /start-prompt|copy-prompt|copy-status|navigator\.clipboard|분석 요청문|설치 없이/);
});

test('Pages builds only the guide and pins document links to the specified revision', context => {
  const directory = fixture(context, {
    'README.md': '# Home\n',
    'docs/standards.md': '# Standard\n',
    'workshop-migration-howto.html': '<!doctype html><html><body><h1 id="top">Guide</h1><a href="#top">Top</a><a href="docs/standards.md#standard">Standard</a><a href="https://example.com">External</a></body></html>',
    'dry-run/report.json': '{"private":true}',
    '_site/old-report.json': '{"private":true}',
  });
  const output = buildPages({ directory, repository: 'example/workshop-standards-kr', ref: 'abc123' });
  assert.deepEqual(readdirSync(path.dirname(output)), ['index.html']);
  const page = load(readFileSync(output, 'utf8'));
  assert.deepEqual(page('a').toArray().map(element => page(element).attr('href')), [
    '#top',
    'https://github.com/example/workshop-standards-kr/blob/abc123/docs/standards.md#standard',
    'https://example.com',
  ]);
});

test('Pages refuses missing metadata and links to local-only material', context => {
  const directory = fixture(context, {
    'workshop-migration-howto.html': '<a href="dry-run/report.json">Private</a>',
    'dry-run/report.json': '{}',
  });
  assert.throws(() => buildPages({ directory }), /repository/);
  assert.throws(() => buildPages({ directory, repository: 'example/repo' }), /ref/);
  assert.throws(() => buildPages({ directory, repository: 'example/repo', ref: 'abc123' }), /outside public/);
  assert.equal(existsSync(path.join(directory, '_site')), false);
});