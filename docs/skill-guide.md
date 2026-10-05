# 워크샵 표준화 skill 설치와 사용

새 워크샵의 문서·랩 골격을 만들거나 기존 워크샵을 표준에 맞게 정리할 때 사용합니다. 먼저 분석과 계획을 제시하고, 사용자 확인 후 생성·변환을 진행합니다.

**ZIP 다운로드 → 압축 해제 → 폴더 복사**로 설치합니다. 설치를 위해 Git, Node.js나 npm을 준비하거나 저장소를 내려받을 필요는 없습니다. 아래는 Windows에서 VS Code GitHub Copilot에 개인용으로 설치하는 방법입니다.

## 1. ZIP 다운로드

[설치용 ZIP 다운로드](https://github.com/Azure-Samples/workshop-standards/releases/download/workshop-skill-v0.1.0-preview.1/workshop-standardization.zip)를 선택해 `workshop-standardization.zip`을 저장합니다.

다운로드가 되지 않으면 [배포 페이지](https://github.com/Azure-Samples/workshop-standards/releases/tag/workshop-skill-v0.1.0-preview.1)를 열고 **Assets → workshop-standardization.zip**을 선택하세요. `Source code (zip)`은 저장소 전체 소스이므로 설치용 파일이 아닙니다.

현재 배포는 미리 보기 버전이며, 표준 승인본이나 완성된 실습을 뜻하지 않습니다.

## 2. 압축 해제

다운로드한 ZIP을 마우스 오른쪽 버튼으로 선택하고 **모두 압축 풀기**를 실행합니다. 압축을 푼 위치에서 다음 구조를 확인하세요.

```text
workshop-standardization
  SKILL.md
  assets
  references
  LICENSE.md
  manifest.json
```

복사할 대상은 **바로 안에 SKILL.md가 있는 `workshop-standardization` 폴더**입니다. Windows가 같은 이름의 바깥 폴더를 만들었다면 한 단계 더 들어가 안쪽 폴더를 복사하세요. ZIP을 열어 내용만 보는 대신 실제로 압축을 풀어야 합니다.

## 3. Copilot 폴더에 복사

1. 2단계에서 찾은 `workshop-standardization` 폴더를 복사합니다.
2. 새 파일 탐색기 창을 열고 주소 표시줄에 `%USERPROFILE%\.copilot\skills`를 입력합니다.
3. 경로가 없다면 `%USERPROFILE%` 폴더에서 `.copilot` 폴더를 만들고, 그 안에 `skills` 폴더를 만듭니다. `.copilot`이 이미 있다면 그 안에 `skills`만 만듭니다.
4. `skills` 폴더에 복사한 `workshop-standardization` 폴더를 붙여넣습니다.

설치한 파일은 아래 위치에 있어야 합니다. `<사용자명>`은 자신의 Windows 사용자 폴더 이름입니다.

```text
C:\Users\<사용자명>\.copilot\skills\workshop-standardization\SKILL.md
```

SKILL.md 하나만 옮기지 말고 `assets`와 `references`가 들어 있는 폴더 전체를 복사하세요. `workshop-standardization` 폴더가 두 번 중첩되면 안 됩니다.

같은 이름의 폴더가 이미 있다면 덮어쓰지 말고 아래의 업데이트 방법을 확인합니다.

## 4. 설치 확인

VS Code에서 GitHub Copilot에 로그인하고, 채팅에 `/skills`를 입력해 `workshop-standardization`이 보이는지 확인합니다. 명령 팔레트의 **Chat: Open Customizations**에서 Skills 목록을 확인할 수도 있습니다. 명령 팔레트는 `Ctrl+Shift+P`로 엽니다.

보이지 않으면 새 채팅을 열거나 VS Code를 다시 실행하세요. 메뉴와 호출 방식은 VS Code 버전에 따라 다를 수 있습니다. 사용 중인 버전이 Agent Skills를 지원하는지도 확인합니다.

skill 이름이 목록에 보이면 설치 확인이 끝납니다. 실제 워크샵 생성이나 변환은 아직 시작하지 않은 상태입니다.

## 5. 워크샵 폴더에서 사용

VS Code에서 작업할 워크샵 폴더를 열고 Copilot 채팅을 에이전트 모드로 전환합니다. 아래 요청 중 하나를 입력하세요. 자동 호출에만 의존하지 않도록 skill 이름을 함께 적습니다.

### 새 워크샵 생성

새 워크샵을 보관할 빈 폴더를 열고 요청합니다.

```text
workshop-standardization skill을 사용해 새 Fabric 입문 워크샵을 만들어줘.
포털형으로 시작하고, 먼저 파일 생성 계획만 보여줘.
```

### 기존 워크샵 표준화

기존 워크샵 저장소를 로컬에 준비하고 해당 폴더를 연 뒤 요청합니다.

```text
workshop-standardization skill을 사용해 현재 워크샵을 표준화해줘.
먼저 분석과 결정 시트 초안을 보여주고, 파일은 수정하지 마.
```

첫 결과는 생성 계획 또는 분석 초안이어야 합니다. 파일 수정·삭제나 게시가 먼저 시작된다면 작업을 멈추고 분석만 요청한 범위를 다시 확인하세요.

계획과 결정값을 검토한 뒤 진행할 범위를 명시합니다.

```text
확인한 계획대로 로컬 생성·변환을 진행해줘.
삭제·이력 변경·도구 설치가 추가로 필요하면 먼저 확인받아.
원격 push와 클라우드 배포는 하지 마.
```

워크샵 검사에 필요한 Git, gitleaks와 Python 등은 실제 작업 단계에서 별도로 확인합니다. skill 설치 완료가 검사 환경까지 준비됐다는 뜻은 아닙니다.

## 다른 도구와 프로젝트용 설치

위의 개인용 설치를 했다면 Copilot에 추가 설치할 필요는 없습니다. 프로젝트에서 공유하거나 Claude Code를 사용할 때는 같은 ZIP의 폴더를 다음 위치로 복사할 수 있습니다.

| 사용할 도구와 범위 | 설치할 폴더 |
|---|---|
| VS Code Copilot, 개인용 | `%USERPROFILE%\.copilot\skills\workshop-standardization` |
| VS Code Copilot, 프로젝트용 | `<워크샵 폴더>\.github\skills\workshop-standardization` |
| Claude Code, 개인용 | `%USERPROFILE%\.claude\skills\workshop-standardization` |
| Claude Code, 프로젝트용 | `<워크샵 폴더>\.claude\skills\workshop-standardization` |

같은 도구에 같은 이름의 skill을 여러 위치로 중복 설치하지 않는 편이 관리하기 쉽습니다. 프로젝트용은 워크샵 저장소에 포함되어 팀과 공유될 수 있으므로 추가할 파일을 검토하세요.

Claude Code에서는 워크샵 폴더에서 새 세션을 시작한 뒤 `/workshop-standardization`과 작업 요청을 입력할 수 있습니다. 검색 경로와 호출 방식은 [VS Code 공식 문서](https://code.visualstudio.com/docs/agent-customization/agent-skills), [Claude Code 공식 문서](https://code.claude.com/docs/en/skills)를 참고합니다.

## 설치 문제 해결

| 증상 | 확인과 조치 |
|---|---|
| ZIP 다운로드가 되지 않음 | 배포 페이지의 Assets에서 설치용 ZIP 선택 |
| 파일이 너무 많고 설치 폴더를 찾기 어려움 | `Source code (zip)`이 아니라 `workshop-standardization.zip`을 받았는지 확인 |
| skill 목록에 보이지 않음 | 설치 경로와 폴더 중첩 확인, SKILL.md 존재 확인 후 새 세션 시작 |
| 참고 문서를 찾지 못함 | ZIP 안의 `references`와 `assets`까지 폴더 전체를 복사했는지 확인 |
| 같은 이름의 skill이 이미 있음 | 아래 업데이트 절차에 따라 기존 설치를 백업하고 교체 |

도움이 필요하면 실패한 단계와 민감한 값을 제거한 오류 메시지를 공유하세요. 토큰·키·원본 보안 로그는 공유하지 않습니다.

## 업데이트

[배포 목록](https://github.com/Azure-Samples/workshop-standards/releases)에서 새 skill 버전의 설치용 ZIP을 내려받고 압축을 풉니다.

에이전트 작업을 끝낸 뒤 현재 설치 폴더를 skill 검색 경로 밖의 별도 백업 폴더로 옮깁니다. 새 폴더를 3단계의 위치에 복사하고 새 채팅에서 인식 여부를 확인하세요. 이전 설치본과 새 파일을 섞지 않도록 폴더 단위로 교체합니다.

## 제공 범위와 주의사항

신규 생성 템플릿은 작성 시작용 골격입니다. 제품별 실습 내용, 완성된 배포 코드와 거버넌스 문안은 포함하지 않습니다. Python 노트북과 devcontainer 골격은 언어·버전을 확인한 뒤 적용하며, TODO·라이선스·실행 검증은 별도로 완성해야 합니다.

ZIP에는 skill 지침, 참고 문서·템플릿과 라이선스가 들어 있습니다. `manifest.json`에 포함 파일의 해시와 초안 상태를 기록하며, 실제 결정 시트·로그·`.env`는 포함하지 않습니다.

skill은 에이전트가 따르는 지침이며 권한 제어나 실행 결과를 보장하는 프로그램은 아닙니다. 사용자 승인과 도구의 권한 제어를 함께 사용하세요. 자동 검사 통과와 사람의 실습 완주·공개 승인은 별개입니다.

ZIP을 직접 만들거나 배포할 담당자는 [skill ZIP 빌드와 배포](skill-release.md)를 참고합니다. 일반 사용자는 이 절차를 진행할 필요가 없습니다.
