import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { unzipSync } from 'fflate';
import { parse as parseYaml } from 'yaml';
import { buildSkill, buildSkillArchive, skillDirectory, skillName, validateSkillMetadata } from '../scripts/build-skill.mjs';
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

test('notebook authoring TODOs are comments, not learner-facing prose', () => {
  const notebook = JSON.parse(template('notebook.ipynb.tmpl'));
  for (const cell of notebook.cells.filter(cell => cell.cell_type === 'markdown')) {
    const source = cell.source.join('');
    assert.match(source, /<!-- TODO:/);
    const prose = source.replace(/<!--[\s\S]*?-->/g, '');
    assert.doesNotMatch(prose, /TODO|실행 검증 전|저자 확인/);
  }
});

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
  assert.equal(files.length, 25);
  assert.ok(files.includes('assets/root-readme.md.tmpl'));
  assert.ok(files.includes('references/prompts/migration.md'));
  assert.ok(files.includes('references/scripts/workshop_checks.py'));
  assert.ok(files.includes('references/scripts/requirements-workshop.txt'));
  assert.ok(files.includes('references/template/rulesets/protect-main.json'));
  assert.ok(files.includes('LICENSE.md'));
  assert.ok(files.includes('references/governance.md'));
  for (const name of ['license-mit', 'license-docs', 'security', 'code-of-conduct', 'support', 'contributing']) {
    assert.ok(files.includes(`assets/${name}.md.tmpl`));
  }
  assert.ok(!files.some(file => file.includes('decision.md') || file.includes('.env') || file.includes('node_modules')));
  const skill = readFileSync(path.join(output, 'SKILL.md'), 'utf8');
  assert.doesNotMatch(skill, /\.\.\/\.\.\/\.\.\//);
  assert.match(skill, /\.\/references\/docs\/standards\.md/);
  for (const file of [
    'SKILL.md', 'references/governance.md', 'references/create.md',
    'references/prompts/migration.md', 'references/docs/standards.md',
    'references/docs/migration-guide.md', 'references/template/decision-sheet.md',
  ]) {
    const source = readFileSync(path.join(output, file), 'utf8');
    assert.match(source, /THIRD-PARTY-NOTICES/, file);
    assert.match(source, /LICENSE-DOCS/, file);
    assert.match(source, /기존 문서에 통합할 수 없는 이유/, file);
  }
  for (const file of [
    'SKILL.md', 'references/create.md', 'assets/agents.md.tmpl', 'assets/contributing.md.tmpl',
    'references/prompts/migration.md', 'references/docs/standards.md', 'references/docs/migration-guide.md',
  ]) {
    assert.match(readFileSync(path.join(output, file), 'utf8'), /local-only\/workshop-checks\//, file);
  }
  const manifest = JSON.parse(readFileSync(path.join(output, 'manifest.json'), 'utf8'));
  assert.equal(manifest.standardStatus, 'draft');
  assert.equal(Object.keys(manifest.files).length, 24);
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

test('install ZIP contains one skill folder with exactly the verified bundle bytes', context => {
  const directory = fixture(context, true);
  const archive = buildSkillArchive({ directory });
  const original = readFileSync(archive);
  const files = unzipSync(original);
  assert.equal(Object.keys(files).length, 25);
  const manifest = JSON.parse(Buffer.from(files[`${skillName}/manifest.json`]).toString('utf8'));
  assert.deepEqual(Object.keys(files).sort(), [...Object.keys(manifest.files), 'manifest.json']
    .map(file => `${skillName}/${file}`).sort());
  const portable = fixture(context);
  for (const [entry, contents] of Object.entries(files)) {
    assert.ok(entry.startsWith(`${skillName}/`) && !entry.includes('..') && !entry.includes('\\'), entry);
    const file = entry.slice(skillName.length + 1);
    const expected = readFileSync(path.join(path.dirname(archive), skillName, file));
    assert.deepEqual(Buffer.from(contents), expected, file);
    if (file !== 'manifest.json') {
      assert.equal(createHash('sha256').update(contents).digest('hex'), manifest.files[file], file);
    }
    const destination = path.join(portable, 'docs', entry);
    mkdirSync(path.dirname(destination), { recursive: true });
    writeFileSync(destination, contents);
  }
  assert.deepEqual(validateDocs(portable).errors, []);
  buildSkillArchive({ directory });
  assert.deepEqual(readFileSync(archive), original);
});

test('ZIP creation refuses an unexpected file in the bundle or a directory at the ZIP path', context => {
  const directory = fixture(context, true);
  const output = buildSkill({ directory });
  writeFileSync(path.join(output, 'private-notes.txt'), 'keep this file');
  assert.throws(() => buildSkillArchive({ directory }), /Unexpected output file/);
  const archive = path.join(path.dirname(output), `${skillName}.zip`);
  assert.equal(existsSync(archive), false);
  rmSync(path.join(output, 'private-notes.txt'));
  mkdirSync(archive);
  assert.throws(() => buildSkillArchive({ directory }), /regular file/);
  assert.ok(existsSync(archive));
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

test('governance templates reject unfilled render tokens and do not assume Microsoft copyright', () => {
  assert.throws(() => render(template('license-mit.md.tmpl'), {}), /Missing value: COPYRIGHT_NOTICE_TEXT/);
  assert.throws(() => render(template('support.md.tmpl'), {}), /Missing value: ISSUES_URL/);
  assert.throws(() => render(template('contributing.md.tmpl'), {}), /Missing value: WORKSHOP_TITLE_TEXT/);
  const mit = render(template('license-mit.md.tmpl'), {
    COPYRIGHT_NOTICE_TEXT: 'Copyright (c) 2026 Example Workshop Authors.',
  });
  assert.match(mit, /Copyright \(c\) 2026 Example Workshop Authors\./);
  assert.doesNotMatch(mit, /Microsoft Corporation/);
  assert.match(mit, /The above copyright notice and this permission notice shall be included/);
});

test('Microsoft security template uses the official V1 block without response-time promises', () => {
  const source = template('security.md.tmpl');
  assert.match(source, /BEGIN MICROSOFT SECURITY\.MD V1\.0\.0 BLOCK/);
  assert.match(source, /\[https:\/\/aka\.ms\/SECURITY\.md\]\(https:\/\/aka\.ms\/SECURITY\.md\)/);
  assert.doesNotMatch(source, /V0\.0\.9|24 hours|within|{{/);
});

test('governance workflow preserves existing files and gates policies and required values', () => {
  const source = readFileSync(path.join(root, skillDirectory, 'references', 'governance.md'), 'utf8');
  for (const rule of [
    '기존 파일은 보존', '누락 파일만 생성', '별도로 승인', 'Microsoft 소유 저장소',
    'CLA 적용과 봇 사용이 확인', '해당 파일을 보류', 'LICENSE.txt', 'LICENCE',
    '공개 준비 미완료', '영문을 기본', 'CSS 적용·응답 기한·지원 보장을 추정하지 않음',
  ]) {
    assert.ok(source.includes(rule), `Missing policy guard: ${rule}`);
  }
});

test('license policies distinguish dual licensing from required third-party notices', () => {
  for (const file of [
    `${skillDirectory}/SKILL.md`, `${skillDirectory}/references/governance.md`,
    'prompts/migration.md', 'docs/standards.md', 'docs/migration-guide.md',
  ]) {
    const source = readFileSync(path.join(root, file), 'utf8');
    for (const rule of [
      '원문과 기존 위치를 보존', '기존 라이선스 문서나 자료별 고지로 요구사항을 충족하면 별도 파일을 만들지',
      '포함된 제3자 자료의 라이선스나 조직 정책에서 저장소 단위 고지를 요구할 때만',
      '근거·적용 대상·범위·기존 문서에 통합할 수 없는 이유를 제시하고 별도로 승인',
      '이중 라이선스가 실제로 필요', '권리자·적용 범위·동의 근거',
      '별도 문서 라이선스가 확정되지 않았거나 기존 라이선스로 충분하면 생성하지',
    ]) {
      assert.ok(source.includes(rule), `Missing license guard in ${file}: ${rule}`);
    }
    assert.match(source, /제3자 자료 고지 파일이 (?:아니|아닙)/);
    assert.match(source, /관행이나 템플릿에 있다는 이유만으로/);
  }
  const governance = readFileSync(path.join(root, skillDirectory, 'references', 'governance.md'), 'utf8');
  assert.match(governance, /별도 고지가 필요한지 확인되지 않으면 생성을 보류/);
  assert.match(governance, /외부 자료를 언급하거나 링크했다는 사실만으로 고지 파일을 만들지 않는다/);
  assert.match(governance, /\| LICENSE-DOCS \|.*이중 라이선스가 실제로 필요.*파일 생성 승인이 확인된 경우에만 신규 생성/);
  const documentationLicense = template('license-docs.md.tmpl');
  assert.match(documentationLicense, /This notice does not relicense third-party material/);
  assert.match(documentationLicense, /its existing notices and licenses remain applicable/);
  assert.match(documentationLicense, /Preserve the original attribution and license notices/);
});

test('local workshop checker guidance preserves root execution, scan scope and existing files', () => {
  for (const file of [
    `${skillDirectory}/SKILL.md`, `${skillDirectory}/references/create.md`,
    `${skillDirectory}/assets/agents.md.tmpl`, 'prompts/migration.md',
  ]) {
    const source = readFileSync(path.join(root, file), 'utf8');
    assert.match(source, /local-only\/workshop-checks\//, file);
    assert.match(source, /저장소 루트(?:에서| 기준으로) 실행/, file);
    assert.match(source, /Git 제외 여부와 검사 도구의 미추적 상태/, file);
    assert.match(source, /Git 제외를 검사 제외로 간주하지/, file);
    assert.match(source, /새 clone/, file);
    assert.match(source, /기존 `scripts\/`의.*자동으로 이동·삭제하지/, file);
    assert.doesNotMatch(source, /대상의 `scripts\/`에/, file);
  }
  for (const file of ['agents.md.tmpl', 'contributing.md.tmpl']) {
    const source = template(file);
    assert.match(source, /local-only\/workshop-checks\/requirements-workshop\.txt/, file);
    assert.doesNotMatch(source, /`scripts\/requirements-workshop\.txt`/, file);
  }
  assert.match(template('gitignore.tmpl'), /^local-only\/\r?$/m);
});

for (const track of ['portal', 'notebook', 'markdown-code', 'upstream-fork']) {
  test(`English governance templates render real links for ${track}`, context => {
    const directory = fixture(context);
    const home = path.join(directory, 'docs', 'workshop');
    const existing = track === 'upstream-fork';
    const securityPath = existing ? '.github/SECURITY.md' : 'SECURITY.md';
    const conductPath = existing ? 'docs/CODE_OF_CONDUCT.md' : '.github/CODE_OF_CONDUCT.md';
    const repo = existing ? 'https://github.com/example/upstream' : 'https://github.com/example/workshop';
    const execution = track === 'portal'
      ? 'Run the workshop in Azure Portal and connect to the lab VM as documented. No devcontainer is required.'
      : track === 'notebook'
        ? 'Run the notebooks in the declared Codespaces or local devcontainer.'
        : 'Follow the Markdown guide and run the documented commands in the declared execution environment.';
    const values = {
      COPYRIGHT_NOTICE_TEXT: 'Copyright (c) 2026 Example Authors.',
      DOCUMENTATION_COPYRIGHT_TEXT: 'Copyright (c) 2026 Example Documentation Authors.',
      DOCUMENTATION_SCOPE_TEXT: 'The original documentation under `labs/` and its original diagrams',
      DOCUMENTATION_EXCEPTIONS_SECTION: '## Exceptions\n\nThird-party samples retain their original licenses.',
      WORKSHOP_TITLE_TEXT: 'Example Workshop',
      ISSUES_URL: `${repo}/issues`, PULLS_URL: `${repo}/pulls`, DEFAULT_BRANCH_TEXT: 'main',
      SECURITY_PATH: securityPath, CODE_OF_CONDUCT_PATH: conductPath,
      SUPPORT_PATH: 'SUPPORT.md', AGENTS_PATH: 'AGENTS.md',
      EXECUTION_SECTION: execution,
      CLA_SECTION: '<!-- TODO: Confirm CLA applicability and bot configuration with the maintainer. -->',
      HELP_SECTION: '<!-- TODO: Confirm the help channel with the maintainer. -->',
      SUPPORT_SCOPE_SECTION: '<!-- TODO: Confirm support scope and CSS enrollment, if applicable. -->',
    };
    const files = {
      'LICENSE.md': render(template('license-mit.md.tmpl'), values),
      'LICENSE-DOCS': render(template('license-docs.md.tmpl'), values),
      [securityPath]: template('security.md.tmpl'),
      [conductPath]: template('code-of-conduct.md.tmpl'),
      'SUPPORT.md': render(template('support.md.tmpl'), values),
      'CONTRIBUTING.md': render(template('contributing.md.tmpl'), values),
      'AGENTS.md': '# Validation\n',
    };
    for (const [file, source] of Object.entries(files)) {
      const destination = path.join(home, file);
      mkdirSync(path.dirname(destination), { recursive: true });
      writeFileSync(destination, source);
      assert.doesNotMatch(source, /\{\{[^}]+\}\}|[가-힣]/, file);
    }
    assert.deepEqual(validateDocs(directory).errors, []);
    const support = files['SUPPORT.md'];
    const contributing = files['CONTRIBUTING.md'];
    assert.match(support, new RegExp(`${repo}/issues`));
    assert.ok(contributing.includes(execution));
    assert.doesNotMatch(contributing, /CLA bot will|git push -f|git rebase/);
    assert.doesNotMatch(support.replace(/<!--[\s\S]*?-->/g, ''), /TODO|CSS|not confirmed|24 hours/);
  });
}

for (const [type, duration] of ['A', 'B', 'C'].flatMap(type => [null, 45].map(duration => [type, duration]))) {
  test(`type ${type} starter renders metadata, links and ${duration ?? 'unknown'} minute duration`, context => {
    const directory = fixture(context);
    const home = path.join(directory, 'docs', 'starter');
    const lab = path.join(home, '01-setup');
    mkdirSync(lab, { recursive: true });
    const title = 'Lab: "확인" \\ 환경';
    const values = {
      TITLE_YAML: JSON.stringify(title), DESCRIPTION_YAML: JSON.stringify('작성용 골격'),
      LEVEL_YAML: '"beginner"', AUTHORS_YAML: '["Author"]', CONTACTS_YAML: '["@author"]',
      DURATION_YAML: duration === null ? '' : String(duration),
      DURATION_TEXT: duration === null ? '<!-- TODO: 실제 실습 기준 소요 시간 확인 -->' : `${duration}분`,
      TAGS_YAML: '["workshop"]', EXECUTION_YAML: type === 'A' ? '["portal"]' : '["codespaces", "local"]',
      SOURCE_YAML: '"original"', TODAY: '2026-10-05', TITLE_TEXT: '워크샵 골격',
      LAB_LINKS: '- [준비](01-setup/README.md)', FIRST_LAB_PATH: '01-setup',
      LAB_TITLE_YAML: JSON.stringify(title), LAB_DURATION_YAML: duration === null ? '' : String(duration),
      LAB_DURATION_TEXT: duration === null ? '<!-- TODO: 실제 실습 기준 소요 시간 확인 -->' : `${duration}분`,
      LAB_TITLE_TEXT: '01. 준비',
      WORKSHOP_HOME_PATH: '..', NAVIGATION_LINKS: '',
    };
    const readme = render(template('root-readme.md.tmpl'), values);
    let labReadme = render(template('lab-readme.md.tmpl'), values);
    const frontmatter = metadata(readme);
    assert.equal(frontmatter.title, title);
    assert.equal(frontmatter.status, 'draft');
    assert.equal(frontmatter.validated_on, null);
    assert.equal(frontmatter.duration_minutes, duration);
    assert.equal(metadata(labReadme).duration_minutes, duration);
    for (const document of [readme, labReadme]) {
      const durationSection = /## 소요 시간\s+([\s\S]*?)(?=\n## )/.exec(document);
      assert.ok(durationSection);
      const body = durationSection[1].replace(/<!--[\s\S]*?-->/g, '').trim();
      assert.equal(body, duration === null ? '' : `${metadata(document).duration_minutes}분`);
      const prose = document.replace(/^---[\s\S]*?\r?\n---/, '').replace(/<!--[\s\S]*?-->/g, '');
      assert.doesNotMatch(prose, /status|validated_on|저자 확인 전|실행 검증 전/);
    }
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
