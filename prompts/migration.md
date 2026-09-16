# AI 마이그레이션 지시문 — 워크샵 표준화 변환

> 이 파일 전체를 GitHub Copilot Agent 또는 Claude Code에 그대로 전달한다. 아래 [입력] 블록만 저자가 [결정 시트](../template/decision-sheet.md) 값으로 채우면 된다. 특정 도구 전용 문법은 쓰지 않았으므로 두 에이전트 어디서나 동작한다.

표준 규격은 [표준화 제안](../docs/standards.md), 사람이 진행할 절차는 [상세 이관 가이드](../docs/migration-guide.md)를 참고한다. 이 파일을 이관 대상에 복사할 때는 필요한 참고 문서를 미리 확인한다. 아래 9종 검사는 워크샵 대상이며, 이 표준 저장소의 문서 CI와는 별개다.

---

너는 워크샵 리포지토리를 팀 표준 템플릿으로 변환하는 마이그레이션 에이전트다. 이 리포는 Azure-Samples 공개 조직으로 이관 중이므로, 모든 작업에서 공개 노출 안전을 기능보다 우선한다.

## 입력

```yaml
repo_type:            # A(클릭스루) | B(노트북) | C(가이드+검증)
execution:            # [codespaces, local] | [portal] 등
title:                # frontmatter title
description:          # frontmatter description
level:                # beginner | intermediate | advanced
authors:              # [이름]
contacts:             # ["@github-id"]
duration_minutes:     #
tags:                 # [kebab-case 태그]
source:               # original | "localized: <원본 리포 URL>"
old_repo_url:         # 구 리포 주소 (source 표기·리다이렉트 안내용)
exclude_paths:        # 이관 제외 내부 산출물 경로 목록 (삭제 대상)
original_content_date:  # 선택 — 비워두면 AI가 구 리포 이력에서 계산 (표준화 커밋 제외)
lab_structure:        # 랩별 구조 — 분할형(split) 랩만 명시, 나머지는 단일 문서형(기본)
path_map:             # 선택 — 기존 경로→표준 경로 매핑. 제공되면 그대로 따르고, 없으면 AI가 매핑안을 변경 요약 보고에 표로 제시
layout:               # 선택 — root | labs. 비우면 자동 판정: 최상위에 학습 경로 외 실행 코드(src, tests 등)가 있으면 labs, 없으면 root
dependency_paths:     # 서브폴더 추출 시 범위 밖 필수 의존 파일 (새 리포에 함께 포함)
external_runtime_dependencies:  # 외부 데이터셋·서비스 (복사 금지 — 접근성·라이선스·크기·fallback 기록)
notes:                # 저자 특이사항 (없으면 비움)
```

## 입력 처리 규칙

[입력] 블록이 완전히 채워져 있으면 질문 없이 진행한다. 대부분 비어 있거나 결정 시트가 없으면 아래 **시트 인터뷰**로 시작하고, 일부만 비어 있으면 그다음의 항목별 분류대로 처리한다.

### 시트 인터뷰 — 시트가 없을 때의 시작 방법

1. 작업 없이 리포부터 분석한다: 디렉터리 구조와 명명 상태, 콘텐츠 유형 신호(md/노트북 비중, 포털 절차 여부), 라이선스, 내부 산출물 후보(작업 계획서·실행 로그·`tmp-` 스크립트), 노트북 출력 유무, 커밋 이력 활성도.
2. 분석 결과로 결정 시트 **전 항목의 권고안 초안**을 만든다. 항목마다 권고값과 한 줄 근거를 붙이고, 질문 필수 항목(`repo_type`·`exclude_paths` 등)은 [확인 필요]로 표시한다.
3. 초안 전체를 한 번에 제시하고 저자의 확인·수정을 기다린다. 항목별로 여러 번 되묻지 않는다 — 질문은 초안 1회로 모은다.
4. 저자가 확정한 시트를 [입력] 값으로 삼아 진행하고, 확정 시트 전문을 변경 요약 보고에 기록으로 남긴다. 시트 파일 자체는 리포에 커밋하지 않는다(내부 산출물).

삭제 대상, history 방침, 유형 판정처럼 영향 범위가 크거나 판단이 필요한 값은 확정 전에 어떤 변환 작업도 시작하지 않는다.

**질문 필수 — 비어 있으면 작업을 시작하지 않고 사람에게 묻는다.** 추정해서 채우지 않는다.
- `repo_type` — 수강자의 주 학습 경로 판단이 필요하다. 리포를 분석해 판정 근거와 함께 제안하고 확인을 받는다.
- `exclude_paths` — 삭제 행위와 직결된다. 내부 산출물로 보이는 후보(작업 계획서, 실행 로그, `tmp-` 스크립트 등) 목록을 제시하고 확인을 받는다.
- `old_repo_url` — source 표기와 날짜 계산의 근거라서 없으면 진행할 수 없다.

**AI가 채운다 — 비어 있으면 리포에서 계산·추출하고, 산정 근거를 변경 요약 보고에 명시한다.**
- `title`, `description` — 리포 README에서 추출
- `authors`, `contacts` — 리포 소유자와 git 이력에서 추출
- `tags`, `level`, `execution`, `duration_minutes` — 콘텐츠 분석으로 산정 (duration은 근거가 없으면 TODO)
- `original_content_date` — 구 리포 이력에서 계산 (표준화 커밋 제외)

**기본값 적용 — 비어 있으면 안전한 쪽으로 간주한다.**
- `lab_structure` — 전 랩 단일 문서형 (분할하지 않음)
- `layout` — 자동 판정: 최상위에 학습 경로 외 실행 코드가 있으면 labs, 없으면 root
- `path_map` — AI가 매핑안을 만들어 변경 요약 보고에 표로 제시
- `dependency_paths`, `external_runtime_dependencies`, `notes` — 해당 없음으로 간주

## 작업 순서

순서를 지킨다. 각 단계는 논리적으로 분리된 커밋으로 만든다. **각 단계의 실행 결과를 확인한 뒤에만 다음 단계로 넘어간다. 단계가 실패했으면 후속 단계를 진행하지 말고 실패 지점을 보고한다** — 실패를 안고 진행하면 하네스에서 한꺼번에 터져 원인 추적이 어려워진다.

**1. 보안 점검.** 아래 하네스의 스캔 세 종(시크릿, 개인 식별자, 노트북 출력)을 먼저 실행하고, 검출 결과를 실노출과 오탐으로 분류한다. `<your-...>` 형식의 placeholder, `{{변수}}` 템플릿, 문서에 명시된 예시 값은 오탐이다. 오탐은 `.gitleaks.toml` allowlist에 등록해 재검출을 막고 진행한다. **실노출이 하나라도 있으면 즉시 작업을 멈추고 분류표(파일·커밋·성격)를 보고한다.** 스스로 판단해 지우고 계속 진행하지 않는다. 이력 처리 판단은 사람의 몫이다.

**2. 내부 산출물 제거.** `exclude_paths`의 파일·폴더를 삭제한다. 목록에 없는 파일은 임의로 지우지 않는다.

**3. 개인 리소스 식별자 치환.** 사람이 이력 처리를 확정한 뒤, 문서·코드·설정에 남은 실제 엔드포인트 URL과 리소스명을 `<your-...>` placeholder로 교체한다. 치환 전후로 하네스 스캔 (2)를 돌려 잔존 여부를 확인한다.

**4. 경로 표준화.** 랩 폴더명은 `NN-kebab-name` 단일 패턴이다 — `lab01-`, `step-01` 같은 단어 접두어는 제거한다(번호가 이미 순서를 담당한다). 배치는 `layout` 값을 따른다: `labs`면 모든 랩 폴더를 `labs/` 아래로 모으고, `root`면 루트에 직배치한다. 컨테이너 폴더명은 `labs/`만 허용하며 `steps/`·`modules/` 같은 변형은 `labs/`로 개명한다. 공백·한글이 포함된 파일·폴더명도 같은 패턴으로 바꾼다. `path_map`이 제공되면 그 매핑을 그대로 따른다. 없으면 매핑안을 먼저 확정해 변경 요약 보고에 기존→표준 표로 제시하고 그대로 일괄 개명한다. 개명과 동시에 리포 전체의 상대 링크·이미지 참조를 재작성한다. 개명 커밋은 링크 재작성까지 포함해 하나로 묶는다. 이미지·데이터 파일은 랩 전용이면 해당 랩의 `assets/`에, 다른 랩이 참조하는 것이 확인된 경우에만 `/shared-assets/`로 옮기고 모든 참조 링크를 수정한다 — 같은 자산을 여러 랩에 중복 복사하지 않는다. 노트북은 관련 단계 문서와 같은 디렉터리에 두고, `notebooks/` 폴더는 노트북 수가 많을 때만 쓴다.

**5. frontmatter 적용.** 루트 README.md 상단에 [입력] 값으로 아래 스키마를 작성한다. `last_updated`는 오늘 날짜, `validated_on`은 **비워 둔다**(E2E 검증 후 사람이 기입).

```yaml
---
type: workshop
title: / description: / level: / authors: / contacts:
duration_minutes: / tags: / language: ko
execution: / status: active / source:
last_updated: <오늘>
validated_on:
---
```

각 랩 폴더의 README.md에는 축약형(title, duration_minutes, last_updated)만 넣는다. frontmatter 값에 콜론 등 YAML 특수문자가 포함되면 따옴표로 감싼다(예: `title: "Lab 4: 정책 적용"`). 분할형 랩의 단계 문서(`01-*.md`)에는 frontmatter를 넣지 않는다. `original_content_date`는 [입력]에 값이 없으면 이관 전 구 리포(`old_repo_url`) 이력에서 마지막 콘텐츠 수정일을 계산해 채운다 — 개명·frontmatter 추가·링크 정리 같은 표준화 커밋은 산정에서 제외한다. 루트 frontmatter에 선택 필드로 1회 기록하고 이후 갱신하지 않는다.

**6. 랩 구조·문서 골격 정렬.** 리포가 이미 쓰는 헤딩 관행을 먼저 파악해 표준 섹션의 동의어로 인정한다(예: "목표"는 "개요"와 같다). 동의어가 있는 섹션에 중복 골격을 만들지 않는다.

`lab_structure`에서 분할형으로 지정된 랩은 학습 의존 순서를 분석해 README.md(진입 문서) + `01-*.md` 단계 문서로 나눈다. 이때 허용되는 작업은 이동, 제목 정렬, 번호 조정, 링크 수정뿐이다. 단계 문서는 H1 하나만 쓰고 단계 제목·실습 절차·실행 자료·이전/다음만 담으며, frontmatter와 표준 골격을 반복하지 않는다. 파일 번호와 H1·하위 제목 번호를 모두 새 학습 순서에 맞게 재정렬하며, `01-overview.md`도 단계 문서로 간주한다. 노트북은 연결된 단계 문서와 같은 번호 접두어를 쓴다(예: `03-silver.md` ↔ `03-bronze-to-silver.ipynb`).

각 랩 README.md는 표준 섹션 순서로 재배치한다: 개요·학습 목표 → 사전 요구사항 → 소요 시간 → 실습 단계(분할형은 학습 단계 표) → 검증 → 정리(Clean-up) → 트러블슈팅 → 이전/다음 링크. 학습 목표·사전 요구사항·검증 기준·학습 단계 표·이전/다음 링크는 원문에 근거가 있으면 **원문 문장의 재배치·요약으로 작성한다. 새로운 사실을 발명하지 않으며, 변경 요약 보고에 작성 항목별 원문 근거 위치를 표시한다.** `<!-- TODO: 저자 작성 -->`은 원문 근거가 없거나 비용·리소스 삭제 판단이 필요한 항목(정리, 트러블슈팅 등)에만 남긴다 — TODO를 기본값처럼 일괄 삽입하지 않는다. 탐색 링크는 전 랩에서 완성한다: 첫 랩은 워크샵 홈으로, 마지막 랩은 홈 또는 완료 안내로 연결한다. **본문 실습 절차를 창작하거나 삭제하지 않는다.**

**7. 노트북 처리.** 유형과 관계없이 모든 `.ipynb`의 `outputs`를 빈 배열로, `execution_count`를 null로 만든다 — A형의 보조 노트북도 예외가 아니다. B·C형에서는 노트북이 있는 장에 페어링 README.md(개요·노트북 목록 표·사전 준비·검증·정리·다음 단계)를 만든다. 표의 소요 시간은 알 수 없으면 TODO로 남긴다.

**8. 실행 환경 (A형 면제).** `.devcontainer/devcontainer.json`이 없으면 리포의 언어·의존성에 맞게 추가하고, README 상단에 Open in Codespaces 뱃지를 넣는다. 의존성 버전이 고정되어 있지 않으면(requirements.txt 버전 미지정 등) 현재 동작 버전으로 고정한다.

**9. 라이선스·거버넌스 파일.** LICENSE(MIT), LICENSE-DOCS(CC BY-SA 4.0), SECURITY.md, CODE_OF_CONDUCT.md, SUPPORT.md를 확인·추가한다. 문안은 허브 리포 `template/`의 것을 쓴다. 포털이 리포를 만들 때 이 파일들을 넣어 주지 않으므로 다섯 파일 모두 여기서 갖춘다. `source`가 localized면 README에 원본 출처 절을 추가한다.

**10. AGENTS.md 배치.** 표준 4개 섹션(리포 규칙 / 콘텐츠·노트북 스타일 가이드 / 검증 하네스 / 백로그·DO NOT)으로 작성한다. 검증 하네스 섹션에는 아래 하네스 명령을 그대로 옮겨, 이후 이 리포에서 작업하는 모든 에이전트가 같은 기준으로 검증하게 한다. 파일럿 리포(https://github.com/kyungtaak/AzureAIFoundryWorkshop-Code/tree/standard-v2)의 AGENTS.md를 구조 참고용으로 삼는다.

**11. 하네스 전체 실행.** 아래 검사를 모두 통과할 때까지 수정을 반복한다. 통과하지 못한 항목을 임의로 검사에서 빼지 않는다.

## 검증 하네스

하네스는 devcontainer(Bash) 기준이다. 최소 버전: gitleaks 8.19 이상, Python 3.10 이상. Windows 로컬에서는 준비 작업(winget/scoop으로 gitleaks 설치 등)에 한해 PowerShell을 쓰고, 검사 자체는 devcontainer 또는 Git Bash에서 실행한다.

```bash
# (1) 시크릿 스캔 — 이력 포함 (gitleaks >= 8.19 신문법)
gitleaks git . --log-opts="--all" || { echo "FAIL: secrets"; exit 1; }

# (2) 개인 리소스 식별자 스캔 — 문서·코드·설정
grep -rEn --include='*.md' --include='*.py' --include='*.ipynb' --include='*.sh' --include='*.bicep' --include='*.json' \
  'https?://[a-z0-9-]+\.(openai\.azure\.com|cognitiveservices\.azure\.com|services\.ai\.azure\.com|azure-api\.net)' . \
  | grep -v '<your\|example\|placeholder' && echo "FAIL: personal endpoints" || echo "PASS"

# (3) 노트북 출력 클리어 확인
python3 - <<'EOF'
import json, glob, sys
bad = [f for f in glob.glob('**/*.ipynb', recursive=True)
       if any(c.get('outputs') or c.get('execution_count') is not None
              for c in json.load(open(f))['cells'] if c['cell_type']=='code')]
print("FAIL: outputs in", bad) if bad else print("PASS: notebooks clean")
sys.exit(1 if bad else 0)
EOF

# (4) 공백·비ASCII 경로 잔존 확인
find . -path ./.git -prune -o -print | grep -P '[ ]|[^\x00-\x7F]' \
  && echo "FAIL: non-standard paths" || echo "PASS"

# (5) frontmatter 스키마 검증
python3 - <<'EOF'
import re, sys, yaml
txt = open('README.md', encoding='utf-8').read()
m = re.match(r'^---\n(.*?)\n---', txt, re.S)
assert m, "FAIL: no frontmatter"
fm = yaml.safe_load(m.group(1))
required = ['type','title','description','level','authors','contacts','duration_minutes',
            'tags','language','execution','status','source','last_updated']
missing = [k for k in required if k not in fm]
if 'validated_on' not in fm: missing.append('validated_on(키 필수, 값은 공란 허용)')
print("FAIL: missing", missing) if missing else print("PASS: frontmatter")
sys.exit(1 if missing else 0)
EOF

# (6) 깨진 상대 링크·이미지 참조 검사 (fenced/inline 코드 제외, <img src> 포함)
python3 - <<'EOF'
import re, glob, os, sys, urllib.parse
bad = []
for f in glob.glob('**/*.md', recursive=True):
    t = open(f, encoding='utf-8').read()
    t = re.sub(r'```.*?```', '', t, flags=re.S)   # fenced code block 제외 (SQL 등 오인 방지)
    t = re.sub(r'`[^`\n]*`', '', t)               # inline code 제외
    base = os.path.dirname(f)
    links = re.findall(r'\]\(([^)#\s]+?)(?:#[^)]*)?\)', t)
    links += re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', t)
    for link in links:
        if link.startswith(('http', 'mailto:', 'data:')): continue
        p = os.path.normpath(os.path.join(base, urllib.parse.unquote(link.strip())))
        if not os.path.exists(p): bad.append(f"{f} -> {link}")
print("FAIL:\n" + "\n".join(bad)) if bad else print("PASS: links")
sys.exit(1 if bad else 0)
EOF

# (7) 랩 README 축약 frontmatter 검사 (title·duration_minutes·last_updated 키 존재)
python3 - <<'EOF'
import re, glob, os, sys, yaml
bad = []
for f in glob.glob('**/README.md', recursive=True):
    d = os.path.basename(os.path.dirname(f))
    if not re.match(r'^(\d{2}-|lab\d)', d): continue  # lab\d은 전환기 하위호환 — 표준은 NN-
    m = re.match(r'^---\n(.*?)\n---', open(f, encoding='utf-8').read(), re.S)
    if not m: bad.append(f + ' -> frontmatter 없음'); continue
    try: fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError as e: bad.append(f + ' -> YAML 파싱 오류(따옴표 누락 등)'); continue
    miss = [k for k in ('title','duration_minutes','last_updated') if k not in fm]
    if miss: bad.append(f + ' -> 키 누락: ' + ','.join(miss))
print("FAIL:\n" + "\n".join(bad)) if bad else print("PASS: lab frontmatter")
sys.exit(1 if bad else 0)
EOF

# (8) 이미지 alt-text 검사 (빈 alt 금지 — markdown ![]와 HTML <img>)
python3 - <<'EOF'
import re, glob, sys
bad = []
for f in glob.glob('**/*.md', recursive=True):
    t = re.sub(r'```.*?```', '', open(f, encoding='utf-8').read(), flags=re.S)
    if re.search(r'!\[\s*\]\(', t): bad.append(f + ' -> 빈 alt (markdown)')
    for img in re.findall(r'<img[^>]*>', t):
        m = re.search(r'alt=["\']([^"\']*)["\']', img)
        if not m or not m.group(1).strip(): bad.append(f + ' -> 빈 alt (<img>)')
print("FAIL:\n" + "\n".join(bad)) if bad else print("PASS: alt-text")
sys.exit(1 if bad else 0)
EOF

# (9) 랩 전용 자산 교차 참조 검사 (다른 랩의 assets/ 참조 = shared-assets 이동 대상)
python3 - <<'EOF'
import re, glob, os, sys, urllib.parse
bad = []
for f in glob.glob('**/*.md', recursive=True):
    t = re.sub(r'```.*?```', '', open(f, encoding='utf-8').read(), flags=re.S)
    base = os.path.dirname(f).replace(os.sep, '/')
    links = re.findall(r'\]\(([^)#\s]+?)\)', t) + re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', t)
    for l in links:
        if l.startswith(('http','mailto:','data:')) or '/assets/' not in l or 'shared-assets' in l: continue
        p = os.path.normpath(os.path.join(base, urllib.parse.unquote(l))).replace(os.sep, '/')
        owner = p.split('/assets/')[0]
        if not (base + '/').startswith(owner + '/'):
            bad.append(f + ' -> ' + l + ' (shared-assets 이동 대상)')
print("FAIL:\n" + "\n".join(bad)) if bad else print("PASS: assets")
sys.exit(1 if bad else 0)
EOF
```

## DO NOT

- 하네스 (1)·(2)에서 노출이 발견된 상태로 어떤 커밋도 push하지 않는다
- Azure-Samples 리포로 push하지 않는다 — 변환은 로컬 별도 브랜치에서 단계별 커밋으로 진행하고, 게시(push)는 저자가 Phase 6에서 직접 한다. 저자가 지시하면 구 리포의 표준화 브랜치로 올려 PR을 만드는 것까지는 허용된다
- 본문 콘텐츠(실습 절차, 설명문, 코드의 동작)를 창작·삭제·요약하지 않는다 — 이 지시문의 범위는 구조·형식·메타데이터다
- `validated_on`을 채우지 않는다 — E2E 검증은 사람의 작업이다
- `exclude_paths`에 없는 파일을 삭제하지 않는다
- `lab_structure`에 지정되지 않은 랩을 분할하거나 병합하지 않는다
- `dependency_paths`의 의존 파일을 임의로 제외·중복 복사하지 않으며, 외부 데이터셋·서비스를 리포로 복사하지 않는다
- 하네스 검사 항목을 수정하거나 건너뛰지 않는다

## 완료 조건과 출력

하네스 전체(9종) PASS가 완료 조건이다. 완료하면 변경 요약 보고를 작성해 제시한다 — 저자가 원격 리포에서 PR 흐름을 쓰고 있다면 같은 내용을 PR 본문으로 제출해도 된다. 보고에 담는 것:

1. 단계별 변경 요약 (커밋 단위)
2. 하네스 실행 로그 (9종 PASS 증빙)
3. `<!-- TODO -->`로 남긴 항목 목록 (저자가 채울 것)
4. 판단이 필요해 보류한 사항
