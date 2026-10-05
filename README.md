# Azure 워크샵 콘텐츠 표준화

Azure 워크샵의 작성 규칙, 기존 콘텐츠 이관 절차, AI 변환 지시문과 재사용 양식을 관리합니다. 개별 워크샵의 실습 코드와 데이터는 각 워크샵 저장소에 두며, 이 저장소에는 복제하지 않습니다.

저장소는 [Azure-Samples/workshop-standards](https://github.com/Azure-Samples/workshop-standards)입니다. 기존 [MIT 라이선스](LICENSE.md)를 유지합니다.

현재 문서는 초안입니다. 표준화 제안의 권고안과 이미 이관 절차에 적용된 규칙을 구분하고, 차이가 있는 항목은 검토 후 확정합니다.

## 문서 읽는 순서

| 목적 | 문서 |
|---|---|
| 전체 이관 흐름과 빠른 시작 | [HTML 이관 안내서](https://azure-samples.github.io/workshop-standards/) · [HTML 원본](workshop-migration-howto.html) |
| 표준 규격과 제안 배경 검토 | [표준화 제안과 상세 규격](docs/standards.md) |
| 단계별 작업과 예외 조건 확인 | [상세 이관 가이드](docs/migration-guide.md) |
| 이관 전 판단 항목 기록 | [결정 시트 양식](template/decision-sheet.md) |
| AI에 변환 작업 위임 | [AI 마이그레이션 지시문](prompts/migration.md) |
| skill로 신규 생성·기존 표준화 | [skill 설치와 사용](docs/skill-guide.md) · [skill 원본](.github/skills/workshop-standardization/SKILL.md) |
| 브랜치 보호 설정 준비 | [ruleset 템플릿](template/rulesets/protect-main.json) |

HTML 안내서는 위 GitHub Pages 링크에서 읽을 수 있습니다. 처음 이관한다면 안내서의 분석 요청문을 복사해 기존 저장소를 연 AI 에이전트에 전달합니다. 첫 요청은 파일을 바꾸지 않는 분석이며, 권고안 확인 → 변환 결과 검토 → 실습 검증과 공개 순서로 진행합니다. 실제 변환 전에는 AI 지시문과 연결된 참고 문서를 에이전트가 읽을 수 있게 제공합니다.

HTML 원본은 로컬 브라우저에서 직접 열 수 있으며, GitHub 파일 화면에서는 소스가 표시됩니다. 게시와 갱신 절차는 아래 HTML 안내서 게시 항목을 참고합니다.

표준 규칙은 Markdown에서 검토·개정합니다. HTML은 전체 흐름과 빠른 시작을 안내하고, 상세 규칙과 명령은 Markdown으로 연결합니다. 규칙이 바뀌면 영향을 받는 가이드·지시문·양식을 같은 PR에서 수정합니다.

## 저장소 구성

```text
README.md
CONTRIBUTING.md
workshop-migration-howto.html
docs/
  standards.md
  migration-guide.md
prompts/
  migration.md
template/
  decision-sheet.md
  rulesets/protect-main.json
scripts/
tests/
.github/
  skills/workshop-standardization/
  workflows/
dry-run/                              # 로컬 전용, Git 제외
```

표준 제안서의 부록에 README·랩 문서·AGENTS.md 구성 예시가 있습니다. 결정 시트와 ruleset 외에 skill의 assets에 README·랩·AGENTS·노트북·devcontainer 작성용 골격을 제공합니다. 제품별 실습과 완성된 거버넌스·배포 문안은 포함하지 않습니다. 이 저장소 전체를 새 워크샵의 GitHub template repository로 사용하지 않습니다.

skill은 신규 생성과 기존 표준화를 지원합니다. `npm run build:skill`로 참고 문서를 포함한 번들을 만들고 대상 에이전트의 skill 경로에 설치합니다. 시작 요청문은 설치 없이 분석만 요청하는 경로로 유지합니다. [사용 가이드](docs/skill-guide.md)에 두 방식의 차이, 설치와 요청 예시가 있습니다.

## 로컬 작업과 검증

Node.js 22 이상과 Git이 필요합니다. 프로젝트 루트에서 실행합니다.

```bash
npm ci
npm test
npm run validate
```

검증 대상은 공유 문서·설정과 이 저장소의 검증 도구입니다. 문서의 상대 링크와 앵커, YAML·JSON 파싱, ruleset의 기본 구조, 로컬 전용 파일의 Git 추적 여부를 검사합니다. 외부 URL의 응답과 워크샵의 Azure E2E 실행은 검사하지 않습니다. 워크샵 자체의 9종 검사는 AI 지시문에 별도로 유지합니다.

`dry-run/`, `local-only/`, `.env` 파일과 배포 결과물은 Git에서 제외합니다. 실제 작성한 결정 시트, 보안 검사 결과와 실행 로그도 이 로컬 전용 경로에 보관합니다. 루트에 실행 기록을 두면 `.gitignore`가 자동으로 제외하지 않으며, 공유 경로 검사에서 차단됩니다.

`.gitignore`는 이미 추적하는 파일이나 과거 커밋을 지우지 않습니다. 첫 커밋 전에 `git status`와 추가할 파일 목록을 확인하고, 게시 전 시크릿 검사를 수행합니다. Git 초기화 전에는 추적 여부 검사만 건너뜁니다.

## GitHub 설정

저장소는 공개 상태이며 기본 브랜치는 `main`입니다. 다음 설정은 문서와 workflow 파일을 추가하는 것만으로 적용되지 않으므로 관리자가 별도로 확인합니다.

1. 이 저장소의 기존 MIT 라이선스를 유지합니다. 워크샵용 MIT·CC BY-SA 정책이 이 저장소의 라이선스를 자동으로 변경하지는 않습니다.
2. PR 검토와 필수 검사 `docs`를 설정합니다. CI가 한 번 실행된 뒤 해당 검사 이름을 선택할 수 있습니다.
3. 실제 검토 담당자를 정한 뒤 CODEOWNERS를 추가합니다. 역할이나 GitHub 계정은 임의로 지정하지 않습니다.
4. Pages를 사용할 때는 공개할 HTML과 연결된 Markdown의 내용을 검토합니다. 비공개 저장소여도 Pages 사이트가 자동으로 비공개인 것은 아닙니다. 조직 정책과 접근 제어를 별도로 확인합니다.

ruleset 템플릿은 첫 이관용으로 `disabled` 상태를 유지하며 필수 CI 검사는 포함하지 않습니다. 이 저장소에 적용할 때는 활성화하고 `docs` 검사를 추가해야 합니다.

## HTML 안내서 게시

GitHub Settings > Pages에서 Source를 **GitHub Actions**로 지정한 뒤, Actions의 **Publish Guide** workflow를 수동 실행합니다. 워크플로는 `main`에서만 실행되며 검증 후 HTML 안내서 한 파일만 배포합니다. 상세 문서 링크는 해당 배포 커밋의 GitHub 파일 화면으로 연결됩니다. `dry-run/`이나 실행 기록은 배포하지 않습니다.

안내서는 [GitHub Pages](https://azure-samples.github.io/workshop-standards/)에 게시되어 있습니다. 저장소 전체를 Pages artifact로 업로드하지 않습니다.

게시 전 로컬 빌드만 확인하려면 실제 저장소와 ref를 지정합니다.

```bash
npm run build:pages -- --repository Azure-Samples/workshop-standards --ref <commit-sha>
```

생성된 `_site/index.html`이 배포 대상입니다. 원본 HTML의 디자인과 목차를 유지하며, Pretendard와 Mermaid를 불러오려면 인터넷 연결이 필요합니다.

변경 제안과 검토 절차는 [기여 가이드](CONTRIBUTING.md)를 따릅니다.