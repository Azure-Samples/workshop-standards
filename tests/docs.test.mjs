import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { load } from 'cheerio';
import { parse as parseYaml } from 'yaml';
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

test('publishing requires approval and E2E without automatic visibility rollback claims', () => {
  const guide = readFileSync(path.join(root, 'docs', 'migration-guide.md'), 'utf8');
  assert.doesNotMatch(guide, /자동으로 private으로 되돌|포털이 되돌릴|승인 전에 눌렀다면/);
  assert.match(guide, /실행 검증을 마치고 워크아이템 승인을 확인한 뒤/);
  assert.doesNotMatch(guide, /git push azs origin\//);
  assert.doesNotMatch(guide, /git commit -m "Initial import"/);
  assert.match(guide, /현재 파일 검사·저자 검토 후 첫 커밋/);
  assert.match(guide, /카탈로그 PoC의 규약이며 이 표준 저장소에는 미구현/);
});

test('migration instructions keep every step and call the shared nine-check implementation', () => {
  const source = readFileSync(path.join(root, 'prompts', 'migration.md'), 'utf8').replaceAll('\r\n', '\n');
  for (let step = 1; step <= 11; step++) {
    assert.ok(source.includes(`**${step}. `), `Missing migration step ${step}`);
  }
  for (let check = 1; check <= 9; check++) {
    assert.ok(source.includes(`python3 local-only/workshop-checks/workshop_checks.py ${check}\n`), `Missing check ${check}`);
  }
  assert.match(source, /set -e/);
  assert.match(source, /검사 1~3의 기본 범위는 working tree와 로컬 전체 refs의 이력/);
  assert.match(source, /python3 -m pip install -r local-only\/workshop-checks\/requirements-workshop\.txt/);
  assert.match(source, /검사 도구 폴더로 이동해서 실행하지 않는다/);
  assert.match(source, /Git 제외를 검사 제외로 간주하지 않으며 검사 범위는 유지/);
  assert.match(source, /이미 추적 중이면 `.gitignore`로 해결된다고 간주하지 말고 별도 정리 승인을 받는다/);
  assert.doesNotMatch(source, /python3 scripts\/workshop_checks\.py/);
  assert.doesNotMatch(source, /grep -v '<your/);
});

test('standalone input carries decisions without implying plan approval', () => {
  const source = readFileSync(path.join(root, 'prompts', 'migration.md'), 'utf8');
  const sheet = readFileSync(path.join(root, 'template', 'decision-sheet.md'), 'utf8');
  const match = /## 입력\s+```yaml\r?\n([\s\S]*?)```/.exec(source);
  assert.ok(match, 'Missing standalone YAML input');
  const input = parseYaml(match[1]);
  for (const key of [
    'migration_scope', 'source_path', 'work_folder', 'history_policy', 'license_policy',
    'plan_approved', 'repo_type', 'exclude_paths', 'old_repo_url',
  ]) {
    assert.ok(Object.hasOwn(input, key), `Missing input: ${key}`);
    if (['migration_scope', 'source_path', 'work_folder', 'history_policy', 'license_policy', 'plan_approved'].includes(key)) {
      assert.ok(sheet.includes(key), `Missing sheet mapping: ${key}`);
    }
  }
  assert.equal(input.plan_approved, null);
  for (const key of ['current', 'code', 'docs', 'scope', 'consent', 'consent_basis']) {
    assert.ok(Object.hasOwn(input.license_policy, key), `Missing license decision: ${key}`);
    assert.equal(input.license_policy[key], null);
    assert.ok(sheet.includes(`license_policy.${key}`) || sheet.includes(`${key}:`), `Missing license mapping: ${key}`);
  }
  assert.doesNotMatch(source, /완전히 채워져 있으면 질문 없이 진행/);
  assert.match(source, /필수 결정값과 실제 계획 승인이 확인된 경우에만/);
  assert.match(source, /없거나 false이거나 저자의 실제 승인 근거가 없으면 읽기 전용 분석/);
  assert.match(source, /보안 점검에서 실노출이 발견되면 승인값이 있어도 즉시 중단/);
  assert.match(source, /계획 승인은 도구 설치·라이선스 전환·원격 게시·공개 전환을 자동으로 승인하지 않는다/);
  assert.match(source, /`exclude_paths: \[\]`는 저자가 제외 대상이 없다고 확정한 값/);
});

test('license example preserves README MIT notice and records actual consent requirements', () => {
  const sheet = readFileSync(path.join(root, 'template', 'decision-sheet.md'), 'utf8');
  const example = sheet.split('## 기입 예시')[1];
  assert.ok(example);
  assert.doesNotMatch(sheet, /MIT 외 라이선스는 전환 동의 필요|없음 → MIT \+ CC BY-SA|신규 추가로 해결/);
  assert.match(sheet, /기존 MIT 문서의 CC BY-SA 적용도 필요한 동의 확인/);
  assert.match(example, /current: README MIT 고지/);
  assert.match(example, /기존 고지와 코드·문서 적용 범위 확인·보존/);
  assert.match(example, /consent: completed/);
  assert.match(example, /문서 CC BY-SA 적용에 필요한 저자 동의 완료/);
  assert.match(example, /plan_approved: false/);
  assert.match(sheet, /파일 부재·1인 저작만으로 해당 없음으로 처리하지 않음/);
});

test('migration guide and decision sheet do not mandate separate license or notice files', () => {
  const guide = readFileSync(path.join(root, 'docs', 'migration-guide.md'), 'utf8');
  const sheet = readFileSync(path.join(root, 'template', 'decision-sheet.md'), 'utf8');
  const skillGuide = readFileSync(path.join(root, 'docs', 'skill-guide.md'), 'utf8');
  assert.match(guide, /\| License \|.*기존 고지로 충분하지 않을 때만 LICENSE-DOCS 추가/);
  assert.doesNotMatch(guide, /포털에 적지 않고 LICENSE-DOCS 파일로 넣음/);
  assert.match(guide, /LICENSE-DOCS나 외부 자료 고지 파일을 일괄 생성하지 않습니다/);
  for (const rule of [
    '필요 근거:', '적용 대상·범위:', '기존 문서에 통합할 수 없는 이유:',
    '문안·생성 승인:', '기존 고지로 충분하면 추가하지 않음',
    '전환 동의와 파일 생성 승인은 별개', '템플릿 목록 전체를 생성하는 작업은 아닙니다',
  ]) {
    assert.ok(sheet.includes(rule), `Missing license planning field: ${rule}`);
  }
  assert.doesNotMatch(sheet, /거버넌스 파일 6종\(LICENSE·LICENSE-DOCS/);
  assert.match(skillGuide, /ZIP 자체의 라이선스 보존과 대상 워크샵에 라이선스·고지 파일을 생성하는 작업은 별개/);
});

test('E2E timing and learner-facing metadata guidance agree across workflow documents', () => {
  const sheet = readFileSync(path.join(root, 'template', 'decision-sheet.md'), 'utf8');
  const guide = readFileSync(path.join(root, 'docs', 'migration-guide.md'), 'utf8');
  const standards = readFileSync(path.join(root, 'docs', 'standards.md'), 'utf8');
  assert.doesNotMatch(sheet, /Phase 5에서 기입/);
  assert.match(sheet, /E2E 검증 완료일.*Phase 6-4에서 기입/);
  assert.match(guide, /Phase 5는 자동 검사와 변경 리뷰 단계이며 E2E 검증일을 임의로 기록하지 않습니다/);
  assert.match(guide, /최종 콘텐츠와 선언한 환경·완주 범위/);
  assert.match(standards, /검증일 기록 시점은 상세 가이드 Phase 6-4/);
  const page = load(readFileSync(path.join(root, 'workshop-migration-howto.html'), 'utf8'));
  assert.match(page('#s2').text(), /입력값 기입만으로 승인이 되지는 않습니다/);
  assert.match(page('#s3').text(), /완주일은 Phase 6-4에서 사람이 제공합니다/);
  for (const file of [
    path.join(root, '.github', 'skills', 'workshop-standardization', 'SKILL.md'),
    path.join(root, '.github', 'skills', 'workshop-standardization', 'references', 'create.md'),
    path.join(root, 'prompts', 'migration.md'),
  ]) {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /`status`·`validated_on`의 상태·검증일 반복 설명/);
    assert.match(source, /제목·소요 시간·실행 환경처럼 수강자에게 필요한 안내/);
    assert.doesNotMatch(source, /frontmatter 값\(`status`, `validated_on` 등\)을 다시 서술하지/);
    assert.doesNotMatch(source, /frontmatter에 이미 있는 값\(`status`, `validated_on` 등\)을 다시 설명/);
  }
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