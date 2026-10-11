# 거버넌스 파일 적용 절차

신규 생성과 기존 표준화에 같은 절차를 적용한다. 생성되는 거버넌스 문서는 영문을 기본으로 한다. 템플릿을 제공한다는 사실이 대상 저장소의 라이선스 전환, Microsoft 소유권, CLA 적용이나 지원 정책 승인을 뜻하지는 않는다.

## 템플릿과 적용 조건

| 생성 파일 | 템플릿 | 적용 조건 |
|---|---|---|
| LICENSE.md | [MIT](../assets/license-mit.md.tmpl) | MIT 적용과 저작권 고지의 권리자가 확인된 경우에만 신규 생성 |
| LICENSE-DOCS | [문서 라이선스 안내](../assets/license-docs.md.tmpl) | CC BY-SA 4.0 적용 범위·권리자·필요한 동의·제외 자료를 확인한 경우 |
| SECURITY.md | [Microsoft 보안 안내](../assets/security.md.tmpl) | Microsoft 소유 저장소에 적용 가능한 공식 정책임을 확인한 경우 |
| .github/CODE_OF_CONDUCT.md | [Microsoft 행동 강령](../assets/code-of-conduct.md.tmpl) | 대상 프로젝트의 행동 강령 채택을 확인한 경우 |
| SUPPORT.md | [지원 안내](../assets/support.md.tmpl) | 실제 Issues 경로와 보안 신고 문서 경로를 확인한 경우 |
| CONTRIBUTING.md | [워크샵 기여 안내](../assets/contributing.md.tmpl) | 실제 기여 대상·문서 경로·실행 환경을 확인한 경우 |

문서 라이선스 템플릿은 공식 legal code에 연결하는 적용 안내이며 legal code 전문을 번역하거나 대체하지 않는다. MIT 본문은 유지하고 확인한 저작권 고지만 채운다. 원저작자가 Microsoft라고 추정해서 고지를 만들지 않는다. 기존 MIT가 문서까지 포함하면 CC BY-SA 전환 동의를 먼저 확인하고 기존 파일을 임의로 바꾸지 않는다.

## 누락 검사와 승인

1. 대상 루트·`.github/`·`docs/`에서 기존 파일을 확인한다. 라이선스는 `LICENSE`, `LICENSE.md`, `LICENSE.txt`, `LICENCE` 계열과 문서용 별도 파일을 함께 확인한다. 대소문자·위치 차이를 누락으로 취급해 중복 생성하지 않는다. 조직의 기본 파일로 표시되는 것과 대상 저장소에 실제 있는 파일을 구분한다.
2. 파일별로 기존 경로·적용 정책·누락 여부·권고 추가 경로·확인 필요 값을 분석 초안에 기록한다. 기존 파일은 보존한다. 내용이 오래되었거나 정책이 다르더라도 유지가 기본이다. 업데이트·이동·병합은 별도로 승인받는다.
3. 삭제·라이선스 전환·공개 승인을 묶어서 추정하지 않는다. 추가할 파일과 사용할 문안·치환값을 생성 계획 또는 결정 시트로 제시하고 승인받는다.
4. 승인 후 누락 파일만 생성한다. 이관 중인 개인 fork에는 Microsoft 보안 정책이나 CLA를 자동 채택하지 않는다. 적용 대상·시점이 확인되지 않은 정책 문서는 보류한다. 이관용 작업본에 최종 Microsoft 저장소의 문안을 준비하는 경우에도 저자의 적용 승인을 확인한다.
5. 필수 값이나 연결 문서가 없으면 해당 파일을 보류하고 원인을 보고한다. Issues가 꺼져 있으면 확인한 upstream 또는 대체 경로를 사용하며, 없다면 Issues 기반 템플릿 생성을 보류한다. `SECURITY_PATH`, `SUPPORT_PATH`, `CODE_OF_CONDUCT_PATH`, `AGENTS_PATH`는 실제 기존 파일 또는 같은 승인 계획에서 생성할 파일만 가리킨다.
6. 파일이 생겼다고 정책 확인이 끝난 것은 아니다. 치환 토큰 잔존·링크·적용 범위와 TODO를 검사하고, 미확정 정책·동의가 남으면 공개 준비 미완료로 보고한다. 기존 파일을 보존했더라도 정책 충돌은 별도로 보고한다.

## 치환값과 미확정 항목

| 토큰 | 값 |
|---|---|
| `COPYRIGHT_NOTICE_TEXT` | 확인한 MIT 저작권 고지 전체. 기존 권리자 고지와 연도를 보존 |
| `DOCUMENTATION_COPYRIGHT_TEXT` | 문서의 확인한 저작권 고지 |
| `DOCUMENTATION_SCOPE_TEXT` | CC BY-SA 적용이 승인된 실제 문서·이미지 경로 범위. 코드와 제외 자료를 포함하지 않음 |
| `DOCUMENTATION_EXCEPTIONS_SECTION` | 확인한 제외 자료·원본 라이선스 안내. 제외 자료가 없다고 확인한 경우에만 공란 허용 |
| `WORKSHOP_TITLE_TEXT` | 대상 워크샵의 실제 제목 |
| `ISSUES_URL`, `PULLS_URL` | 확인한 대상 또는 upstream 저장소의 실제 Issues·PR URL. 서로 다른 대상이면 이유를 기록 |
| `DEFAULT_BRANCH_TEXT` | 기여 대상 저장소에서 확인한 기본 브랜치 |
| `SECURITY_PATH`, `SUPPORT_PATH`, `CODE_OF_CONDUCT_PATH`, `AGENTS_PATH` | 생성 문서 기준 실제 상대 경로 |
| `EXECUTION_SECTION` | 선언한 포털·Codespaces·로컬 실행 환경과 실제 검증 방법의 영문 설명 |
| `HELP_SECTION`, `SUPPORT_SCOPE_SECTION` | 저자가 확인한 도움 채널과 지원 범위의 영문 문장. CSS 적용·응답 기한·지원 보장을 추정하지 않음 |
| `CLA_SECTION` | 확인한 CLA 정책의 영문 문안. 적용 여부와 봇 설정을 확인하기 전에는 자동 봇 동작을 약속하지 않음 |

토큰의 사용자 문자열은 대상 Markdown 문맥에 맞게 처리한다. 제목·브랜치·저작권 고지에 줄바꿈이나 Markdown 제어 문자를 그대로 삽입하지 않는다. URL은 확인한 HTTP(S) 주소를 사용하고 공백·괄호 등 링크 문법을 인코딩한다. 상대 경로는 실제 파일을 기준으로 계산한다. 문단용 `*_SECTION`은 승인된 영문 Markdown만 사용한다.

지원 채널·범위·CLA가 미확정이면 해당 섹션의 제목은 유지하고 토큰을 영문 TODO 주석으로 치환할 수 있다. 예: `<!-- TODO: Maintainer confirmation required: help channel and support scope. -->`. 미확정 상태를 평문으로 반복하지 않으며 결과 보고에 보류를 기록한다. 필수 URL·라이선스 권리자·적용 범위를 TODO로 대체해 정책 파일을 생성하지 않는다. 확인되지 않은 정책을 "해당 없음"으로 바꾸지 않는다.

CLA 적용과 봇 사용이 확인된 Microsoft 저장소에는 다음 공식 문안을 사용할 수 있다.

```markdown
This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit
[Contributor License Agreements](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.
```

## 출처와 유지보수

2026-10-11에 [Microsoft repo-templates](https://github.com/microsoft/repo-templates/tree/e9c5e27ff1fa70dd4cff5690ad6da3c7b6472b81)의 커밋 `e9c5e27ff1fa70dd4cff5690ad6da3c7b6472b81`을 확인했다. 이 저장소의 MIT 라이선스와 Microsoft 저작권 고지를 유지한다.

| 자료 | 원문과 변경 범위 |
|---|---|
| MIT | [Azure-Samples LICENSE](https://github.com/microsoft/repo-templates/blob/e9c5e27ff1fa70dd4cff5690ad6da3c7b6472b81/projections/azure-samples/LICENSE.md). 들여쓰기 정리·저작권 고지 토큰화·마침표 보완 외 허가 조건을 변경하지 않음 |
| 보안 | [shared/SECURITY.md](https://github.com/microsoft/repo-templates/blob/e9c5e27ff1fa70dd4cff5690ad6da3c7b6472b81/shared/SECURITY.md)의 V1.0.0 블록을 그대로 사용. 참고 워크샵의 V0.0.9와 다르지만 기존 파일 자동 업데이트는 하지 않음 |
| 행동 강령 | [Azure-Samples CODE_OF_CONDUCT](https://github.com/microsoft/repo-templates/blob/e9c5e27ff1fa70dd4cff5690ad6da3c7b6472b81/projections/azure-samples/.github/CODE_OF_CONDUCT.md)을 그대로 사용 |
| 기여·지원 | [Azure-Samples CONTRIBUTING](https://github.com/microsoft/repo-templates/blob/e9c5e27ff1fa70dd4cff5690ad6da3c7b6472b81/projections/azure-samples/CONTRIBUTING.md)과 [MIT SUPPORT](https://github.com/microsoft/repo-templates/blob/e9c5e27ff1fa70dd4cff5690ad6da3c7b6472b81/projections/mit/SUPPORT.md), 저자가 지정한 AzureBasicWorkshop 로컬 참고본의 워크샵 안내를 바탕으로 재작성. 저장소 주소·환경을 토큰화하고 강제 push 권고·미확정 지원 보장을 제외 |
| CC BY-SA | [공식 CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)과 [legal code](https://creativecommons.org/licenses/by-sa/4.0/legalcode)를 확인. 템플릿은 적용 범위를 알리는 별도 안내 |

정책이 바뀌면 출처 버전과 관련 템플릿·테스트·번들을 함께 갱신한다. 공식 문안 확인일은 대상 저장소의 심사 승인일이나 정책 적용 확인일이 아니다.
