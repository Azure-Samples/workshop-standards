# 신규 워크샵 생성 절차

## 제공 범위

이 skill의 템플릿은 작성 시작용 골격이다. 제품별로 검증된 실습, 완성된 배포 코드나 공개 승인 문안을 제공하는 것은 아니다. 신규 생성에는 기존 저장소 주소가 필수 입력이 아니며, 기존 이관의 삭제·스쿼시 절차를 그대로 적용하지 않는다.

| 파일 | 템플릿과 적용 조건 |
|---|---|
| 루트 README | [루트 템플릿](../assets/root-readme.md.tmpl), 모든 유형 |
| 랩 README | [랩 템플릿](../assets/lab-readme.md.tmpl), 랩마다 생성 |
| AGENTS.md | [에이전트 템플릿](../assets/agents.md.tmpl), 모든 유형 |
| Git 제외 규칙 | [제외 규칙 템플릿](../assets/gitignore.tmpl), 새 파일 생성 또는 승인한 병합 |
| 실행 노트북 | [노트북 골격](../assets/notebook.ipynb.tmpl), Python 기반 B·C형에서 필요한 랩만 |
| devcontainer | [환경 골격](../assets/devcontainer.json.tmpl), B·C형에서 확인한 이미지·확장 목록으로 생성 |

노트북 골격은 Python용이다. 다른 언어에는 그대로 적용하지 않고 언어에 맞는 자료를 별도로 준비한다. A형의 보조 노트북도 출력 제거 규칙은 동일하다.

## 생성 계획

최상위에 별도 실행 코드가 없다면 번호가 붙은 랩 폴더를 루트에 배치한다. `src`, `tests` 같은 별도 실행 코드가 있으면 `labs` 아래에 배치한다. 실제로 필요한 랩만 만들고, 분할형은 저자가 선택한 랩에만 적용한다.

```text
<workshop-folder>
  README.md
  AGENTS.md
  .gitignore
  01-setup/
    README.md
    assets/                  # 필요한 경우만 생성
  02-first-lab/
    README.md
    01-exercise.ipynb         # Python B·C형에서 필요한 경우
  .devcontainer/
    devcontainer.json        # B·C형만
```

위 구조는 예시다. 두 번째 랩을 생성하지 않았다면 탐색 링크도 만들지 않는다. 랩 전용 자산은 해당 랩의 `assets`, 여러 랩이 실제로 참조하는 자산만 `shared-assets`에 둔다.

## 템플릿 값 치환

`{{...}}`는 대상 파일을 만들 때 모두 치환한다. 미확정 값에 가짜 예시 이름·URL을 넣지 않는다.

- `_YAML` 토큰은 YAML 자료형에 맞게 직렬화한다. 문자열은 JSON 문자열 표기처럼 따옴표와 특수문자를 이스케이프하고, 목록은 실제 배열로 넣는다. 메타데이터에 사용자 문자열을 그대로 연결하지 않는다.
- `TITLE_TEXT`, `LAB_TITLE_TEXT`는 Markdown 제목용 텍스트다. 줄바꿈과 제목·링크 문법을 확인한다.
- `TODAY`는 실제 문서 생성·수정일이다. 검증일이 아니다.
- `DURATION_YAML`과 `LAB_DURATION_YAML`은 근거가 있는 정수만 사용한다. 모르면 빈 문자열로 치환해 YAML null로 남기고 본문 TODO를 유지한다.
- `FIRST_LAB_PATH`는 실제로 생성할 첫 랩의 상대 경로다. `WORKSHOP_HOME_PATH`는 랩에서 루트 README로 가는 상대 경로다.
- `LAB_LINKS`와 `NAVIGATION_LINKS`는 실제 생성한 문서의 링크다. 단일 랩은 홈 링크만 제공한다. B·C형은 생성한 노트북 링크와 역할도 랩에 추가한다.
- `DEVCONTAINER_IMAGE_JSON`은 사용자가 확인한 이미지 태그 또는 digest를 JSON 문자열로 넣는다. `EXTENSIONS_JSON`은 확인한 확장 ID 목록을 JSON 배열로 넣는다.

확정할 수 없는 필수 템플릿 값이 있으면 해당 파일의 생성을 보류하고 누락 항목을 보고한다. 치환 후 `{{...}}` 잔존, YAML·JSON 파싱, 상대 링크와 노트북 구조를 검사한다.

AGENTS.md의 하네스 TODO에는 skill에 연결된 AI 변환 지시문의 검사 명령 9종을 그대로 넣는다. 지시문 전체나 skill 설치 폴더를 워크샵 본문으로 복사하지 않는다. 설치 경로를 워크샵의 영구 실행 의존성으로 만들지 않는다.

## 공개 전 보완 항목

LICENSE(MIT), LICENSE-DOCS(CC BY-SA 4.0), SECURITY.md, CODE_OF_CONDUCT.md와 SUPPORT.md는 이 골격에 포함되어 있지 않다. 필요한 저작자 동의를 확인하고 조직이 승인한 문안이나 공식 원문을 사용한다. 임의의 연락처·정책·승인 문안을 만들지 않는다. 자료가 없으면 파일 추가를 보류하고 공개 준비 미완료로 표시한다.

Codespaces 배지는 실제 대상 저장소 주소가 확정된 뒤 추가한다. devcontainer 이미지만 지정했다고 의존성 설치와 워크샵 실행까지 검증된 것은 아니다. 실행 언어와 검증된 의존성 버전, Azure 배포·정리 절차를 저자와 확인해 보완한다.

실습 내용, 비용·시간, 검증 기준과 정리 절차의 TODO가 남아 있거나 검사·E2E·심사가 끝나지 않았다면 공개 준비 완료로 보고하지 않는다.
