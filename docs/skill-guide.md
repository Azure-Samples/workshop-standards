# 워크샵 표준화 skill 사용

## 시작 요청문과의 차이

HTML 안내서의 시작 요청문은 파일을 바꾸지 않는 분석 요청입니다. 설치 없이 사용할 수 있지만, 실제 변환으로 넘어갈 때 저자가 AI 지시문과 참고 문서를 따로 제공해야 합니다.

[workshop-standardization skill](../.github/skills/workshop-standardization/SKILL.md)은 신규 생성·기존 표준화의 진행 지침, 작성용 템플릿과 참고 자료를 묶습니다. 설치 후 짧은 요청으로 시작하고, AI가 필요한 자료를 읽어 계획과 권고안을 제시합니다. 자동 발견만으로 매번 호출된다고 보장할 수는 없으므로 skill 이름을 명시하는 편이 확실합니다.

| 항목 | 시작 요청문 | skill |
|---|---|---|
| 사전 준비 | 요청문 복사 | skill 폴더 설치 |
| 시작 범위 | 기존 저장소의 분석 | 신규 생성 또는 기존 분석·표준화 |
| 후속 자료 | 저자가 지시문·규격을 제공 | 번들에 지시문·규격·양식 포함 |
| 템플릿 | 별도로 준비 | README·랩·AGENTS·노트북·환경 골격 포함 |
| 승인 | 이후 요청에서 확인 | 분석·계획 뒤 승인 대기 명시 |
| 완료 판정 | 분석 결과 수신 | 생성·변환·자동 검사·E2E·공개 상태 구분 |
| 갱신 | 최신 문서를 다시 전달 | 새 번들을 빌드해 설치본 교체 |

skill은 권한을 추가하거나 작업을 강제로 제한하는 실행 프로그램이 아니라 에이전트가 따르는 지침입니다. 사용자 승인과 도구의 권한 제어를 함께 사용해야 합니다. 클라우드 배포·유료 실행·원격 게시를 자동으로 허용하지 않으며, 실습 검증과 공개 승인은 사람의 작업입니다.

## 제공 파일

원본은 이 저장소의 `.github/skills/workshop-standardization`에 있습니다. 저장소 안에서는 기존 규격 문서를 상대 경로로 읽으며, 다른 저장소로 옮길 때는 참고 문서를 포함한 번들을 사용합니다. 원본 skill 폴더만 복사하면 외부 참조 문서가 빠집니다.

신규 생성 템플릿은 작성 시작용 골격입니다. 제품별 실습 내용, 완성된 배포 코드와 거버넌스 문안은 포함하지 않습니다. Python 노트북 템플릿과 일반 devcontainer 골격은 언어·버전을 확인한 뒤 적용합니다. 문서 TODO, 라이선스·거버넌스 파일과 실제 실행 검증은 별도로 완성해야 합니다.

## 번들 빌드

Node.js 22 이상과 이 저장소의 의존성이 필요합니다. 처음 준비할 때 저장소 루트에서 `npm ci`를 실행한 뒤 빌드합니다.

```powershell
npm run build:skill
```

생성 위치는 `local-only\skill-dist\workshop-standardization`입니다. 허용한 skill 자료, 표준 규격·이관 지시문·양식과 저장소 라이선스만 포함합니다. 실제 결정 시트, 로그, `.env`와 실행 대상 저장소는 포함하지 않습니다. `manifest.json`에는 포함 파일의 해시와 표준 초안 상태가 기록됩니다.

번들은 현재 작업 파일의 스냅샷입니다. 정식 표준 버전이나 공개 승인본이라는 의미는 아닙니다. 다시 빌드하면 알려진 파일만 갱신하며, 출력 폴더에 알 수 없는 파일이 있으면 덮어쓰지 않고 중단합니다.

## 설치

빌드한 폴더 전체를 설치합니다. SKILL.md와 함께 assets·references·LICENSE.md·manifest.json을 유지하세요. 대상 워크샵 폴더에서 원본 저장소의 문서를 따로 찾을 필요가 없습니다.

VS Code GitHub Copilot 개인 skill로 설치하는 PowerShell 예시입니다. 이 저장소 루트에서 실행하며, 기존 설치가 있으면 덮어쓰지 않고 멈춥니다.

```powershell
$bundle = Resolve-Path '.\local-only\skill-dist\workshop-standardization'
$skills = Join-Path $HOME '.copilot\skills'
$destination = Join-Path $skills 'workshop-standardization'
if (Test-Path $destination) { throw '기존 설치를 확인한 뒤 백업하거나 별도 승인 후 교체하세요.' }
New-Item -ItemType Directory -Force -Path $skills | Out-Null
Copy-Item -LiteralPath $bundle.Path -Destination $destination -Recurse
```

프로젝트 한 곳에서만 쓰려면 대상 워크샵의 `.github\skills\workshop-standardization`에 설치합니다. Claude Code는 개인용 `.claude\skills\workshop-standardization` 또는 프로젝트의 같은 경로를 사용합니다. 두 도구에서 같은 번들의 SKILL.md·assets·references를 사용할 수 있습니다.

설치 후 VS Code의 `/skills` 또는 Agent Customizations 화면에서 skill 이름을 확인합니다. 화면에서 보이지 않으면 설치 경로와 SKILL.md frontmatter를 확인하고 에이전트 세션을 새로 시작합니다. 도구별 검색 경로와 지원 기능은 [VS Code 공식 문서](https://code.visualstudio.com/docs/agent-customization/agent-skills), [Claude Code 공식 문서](https://code.claude.com/docs/en/skills)를 참고합니다.

## 요청 예시

skill이 설치된 상태에서 대상 워크샵 폴더를 열고 요청합니다.

```text
workshop-standardization skill을 사용해 새 Fabric 입문 워크샵을 만들어줘.
포털형으로 시작하고, 먼저 파일 생성 계획만 보여줘.
```

```text
workshop-standardization skill을 사용해 현재 워크샵을 표준화해줘.
먼저 분석과 결정 시트 초안을 보여주고, 파일은 수정하지 마.
```

계획 확인 후에는 승인할 범위를 명시합니다.

```text
확인한 계획대로 로컬 생성·변환을 진행해줘.
삭제·이력 변경·도구 설치가 추가로 필요하면 먼저 확인받아.
원격 push와 클라우드 배포는 하지 마.
```

Claude Code에서는 `/workshop-standardization` 뒤에 같은 요청을 붙일 수 있습니다. 호출 방식은 도구마다 다르며, skill 이름을 포함한 요청과 실제 로딩 여부를 확인하세요.

## 검증과 제한

이 저장소의 `npm test`와 `npm run validate`는 skill 메타데이터, 번들의 링크·경계, 템플릿 파싱과 문서 연결을 검사합니다. 테스트는 포털형, 노트북형과 가이드형 골격을 대상으로 하며 실제 Azure 실습·에이전트 호출·조직 심사를 대신하지 않습니다.

skill을 실제로 호출한 모델의 판단과 대화 흐름은 별도 시험이 필요합니다. 분석 단계에서 변경이 없는지, 승인 후 작업 범위를 지키는지, 보안 검출·도구 누락 시 멈추는지 확인하세요. 사용자 프로필에 자동 설치하거나 전역 설정을 바꾸지 않습니다.
