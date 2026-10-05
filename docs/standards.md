---
title: 워크샵 콘텐츠 표준화 제안과 상세 규격
status: draft
last_updated: 2026-09-16
---

# 워크샵 콘텐츠 표준화 제안과 상세 규격

팀 워크샵 리포 6개의 비교분석(2026-07-21)과 MOAW·MicrosoftLearning의 저작 관행을 바탕으로, 표현 방식·실행 환경·템플릿·카탈로그·최신성 관리의 권고안을 정리합니다.

원문 작성일은 2026-07-22, 마지막 갱신일은 2026-08-20입니다. 2026-09-16에 HTML 제안서를 Markdown으로 전환했습니다. 아래 실측 수치, 파일럿과 PoC 진행 상태는 원문 작성 당시의 기록이며, 이번 문서 정리에서 다시 검증한 결과가 아닙니다.

## 문서 상태와 적용 범위

이 문서는 표준을 검토·개정하는 기준 문서이지만, 기존 권고안을 모두 승인된 표준으로 변경한 것은 아닙니다. 이미 이관 작업에 사용하는 절차는 [상세 이관 가이드](migration-guide.md), 실행 지시는 [AI 지시문](../prompts/migration.md)을 함께 확인합니다.

원문과 2026-09-16 이관 문서 사이의 차이는 다음과 같습니다. 아래 항목을 검토할 때 규격·가이드·지시문을 함께 수정합니다.

| 항목 | 기존 제안 | 현재 이관 문서 | 검토 사항 |
|---|---|---|---|
| 랩 frontmatter | `title`, `duration_minutes`, `last_updated`, `validated_on` | 앞의 세 필드만 필수, 루트에 `validated_on` 유지 | 랩별 검증일을 추가할지 결정합니다. |
| 문서 섹션과 H1 | 워크샵 제목만 H1, 나머지는 H2·H3 | 분할형 랩의 각 단계 문서도 H1 하나 사용 | 단일 문서형과 다중 파일형의 적용 범위를 구분합니다. |
| 표준 템플릿 | Foundry형 우선, 이후 Fabric형 스캐폴드 | 결정 시트·ruleset과 skill의 공통 작성용 골격 제공 | 제품별 완성형과 거버넌스 문안은 별도 검토가 필요합니다. |
| 카탈로그 기능 | URL 등록, 자동 수집·렌더링·stale 표시 | 별도 PoC의 설명이며 이 저장소에는 미구현 | 표준 저장소와 카탈로그 서비스의 역할을 분리합니다. |

## 개요와 결정 요청 사항

원문 분석 대상 6개 리포는 클릭스루 Markdown, 노트북, Markdown 가이드와 검증 노트북 분리형으로 나뉘었습니다. 실행 방식은 Codespaces, 로컬 수동 설치, 포털로 달랐고, 공통 메타데이터·태그·문서 사이트·CI 기준은 없었습니다. 대부분 한 사람이 유지보수했습니다. 공통된 최신성 관리는 없었으며, 한 리포의 수기 날짜 표기는 아래 최신성 관리 절에서 다룹니다.

| 안건 | 권고안 |
|---|---|
| 표현 방식 | Markdown을 안내 문서로 두고 실행 랩에는 노트북을 연결합니다. 메타데이터는 Markdown frontmatter에 모읍니다. |
| 실행 방식 | devcontainer 하나로 Codespaces와 로컬 VS Code를 지원합니다. 포털형은 별도 트랙을 유지합니다. |
| 템플릿 | 실행 환경이 갖춰진 `ms-four-iq-workshop` 기반 Foundry형을 먼저 검증하고 Fabric형으로 확대합니다. |
| 카탈로그와 최신성 | 콘텐츠는 각 저장소에 두고, 중앙 카탈로그에서 태그·수정일·검증일을 수집합니다. |

원문에서는 Astro 기반 `workshop-viewer-poc`에 6개 리포를 등록하고 태그 필터와 stale 배지 동작을 확인했다고 기록했습니다.

## 1. 표현 방식

원문은 포털 클릭스루형 `fabric-camp`(스크린샷 270장), 노트북 실행형 `ms-four-iq`·`maf`·`ignite25`, Markdown 가이드와 검증 노트북 분리형 `AI-Gateway-KR`을 비교했습니다. 제품 특성에 따라 학습 방식이 다르므로, 모든 콘텐츠를 같은 포맷으로 바꾸기보다 공통 규약과 유형별 규칙을 함께 적용합니다.

아래 표의 옵션은 표현 방식의 비교안입니다. 이관 가이드의 콘텐츠 유형 A·B·C와는 별개입니다.

| 옵션 | 장점 | 한계 |
|---|---|---|
| 단일 Markdown 문서 | 메타데이터와 본문을 함께 관리하고 사이트에서 렌더링하기 쉽습니다. | 노트북 실행을 중심으로 하는 워크샵에는 맞지 않습니다. |
| Notebook 중심 | 설명과 실행을 함께 제공해 코드 실습을 재현하기 좋습니다. | frontmatter·카탈로그 수집 기준이 없고, GitHub 렌더링·diff·용량 관리가 어렵습니다. |
| Markdown 안내서와 notebook 연결 (권고) | 랩마다 README에 개요와 메타데이터를 두므로 카탈로그 수집과 AI 유지보수에 활용할 수 있습니다. | 이중 관리가 생기므로 안내서는 개요·사전조건·검증·정리에 집중합니다. |

### 공통 규약 제안

- 파일·폴더는 `01-lab-name`처럼 번호 접두어와 영문 kebab-case로 작성합니다. 원문에서는 3개 리포의 공백·한글 경로로 URL 인코딩과 스크립트 처리 문제가 발생했다고 기록했습니다.
- 스크린샷은 포털 UI 설명에 필요한 단계로 한정하고 alt-text를 작성합니다. 구조·흐름은 가능한 경우 Mermaid로 표현합니다.
- 노트북 출력은 지운 상태로 커밋합니다. 원문에서는 `maf`는 출력을 포함하고 `FoundryWorkshop-Code`는 제거하는 차이가 있었습니다.
- 콜아웃과 일관된 제목 구조를 사용하고, 소요 시간은 frontmatter와 본문에 함께 표시합니다. 예시는 부록 B에 있습니다.

## 2. 실행 방식

원문 분석에서는 Codespaces를 쓰는 리포가 3개(`ms-four-iq`·`maf`·`ignite25`), 로컬 수동 설치가 2개(`FoundryWorkshop-Code`·`AI-Gateway-KR`), 브라우저 SaaS가 1개(`fabric-camp`)였습니다. VM 방식은 없었습니다. devcontainer와 Open in Codespaces 배지를 공통 실행 환경의 출발점으로 제안했습니다.

| 옵션 | 장점 | 한계와 적용 조건 |
|---|---|---|
| Codespaces 기본 + VS Code 보조 (권고) | 같은 devcontainer로 클라우드와 로컬 실행 환경을 구성합니다. 분석 대상 3개 리포가 이미 사용했습니다. | 계정·플랜별 사용량 제한이 있습니다. 원문에는 개인 계정 월 60시간으로 기재되어 있으나, 현재 한도·머신 유형·과금 조건은 실행 전에 확인해야 합니다. |
| 로컬 수동 설치 | 별도 클라우드 개발 환경이 필요하지 않습니다. | 환경 차이와 설치 실패에 대응할 문서가 필요합니다. |
| VM / Skillable | 강사 주도 행사에서 환경을 미리 준비할 수 있습니다. | 공통 기본값에서는 제외하고 필요할 때 행사별 트랙으로 운영합니다. |

원문은 `build-your-first-agent` 워크샵의 강사 주도·자율 클라우드·자율 로컬 3개 트랙을 비교 사례로 들었습니다.

Fabric처럼 브라우저가 주 학습 환경인 제품은 포털형을 유지합니다. Capacity·SQL DB 등 사전 리소스 준비는 가능한 범위에서 스크립트나 IaC로 제공합니다.

Azure 리소스 준비에는 azd·Bicep과 정리 절차를 함께 제공하는 방안을 제안했습니다. 원문의 기준 사례는 `ms-four-iq`의 `azd up`과 postprovision 훅이며, `maf-workshop`의 수동 리소스 준비를 보완 대상으로 기록했습니다. 실행 트랙은 `execution: [codespaces, local]` 또는 `execution: [portal]`로 선언합니다.

## 3. 표준 템플릿

| 후보 | 원문에서 확인한 근거 | 보완 사항 |
|---|---|---|
| Foundry형 우선 (권고) | `ms-four-iq-workshop`에 devcontainer, `azd up`, postprovision 자동화, prerequisites·troubleshooting 문서, `restore.ipynb`, 일관된 노트북 단계, MIT·CC BY-SA 라이선스가 있었습니다. | frontmatter, 랩별 Markdown 안내서, 이전·다음 탐색, CONTRIBUTING을 보완합니다. |
| Fabric형 후속 적용 | `fabric-camp`는 한국어 클릭스루 문서가 있고, 원문에서 10개월간 101커밋의 유지보수와 준비 비용 없는 운영을 기록했습니다. | 랩 문서·목차·탐색, frontmatter, 경로, 스크린샷 갱신과 라이선스 전환 가능성을 검토합니다. |

Foundry형에 공통 규칙을 먼저 적용하고 검증한 뒤 Fabric형으로 확대하는 순서입니다. 기존 리포를 정비하는 과정에서 이관 가이드를 검증하고, 최종적으로 유형별 스캐폴드를 별도 `workshop-template` 저장소로 추출하는 안을 제안했습니다.

Fabric형 원문의 GPL에서 MIT·CC BY-SA로의 전환은 파일 교체만으로 처리할 수 없습니다. 현재 이관 가이드처럼 저작권자·외부 기여분과 라이선스 조건을 확인해야 합니다. 이번 Markdown 전환은 라이선스 전환을 승인하거나 실행하지 않습니다.

## 4. 분산 저장소와 중앙 카탈로그

콘텐츠는 저자의 저장소에 두고 중앙에서 메타데이터와 링크를 관리하는 구조를 권고합니다. 원문은 외부 리포의 Markdown을 수집·렌더링하는 FabCon RTI Workshop 등을 비교 사례로 들었습니다.

| 옵션 | 장점 | 한계 |
|---|---|---|
| 콘텐츠를 중앙 리포로 이관 | 한 곳에서 일괄 관리할 수 있습니다. | 이관과 리뷰 절차가 기여 부담이 되고, 저자의 기존 작업 방식이 바뀝니다. |
| 분산 리포 + 중앙 카탈로그 (권고) | 저자는 자기 리포를 갱신하고 중앙은 URL·frontmatter로 목록·태그·최신성을 수집합니다. | 메타데이터 형식과 수집·검증 자동화가 필요합니다. |

원문의 단계별 진행 기록은 다음과 같습니다. 이 저장소에서 구현하거나 재검증한 기능은 아닙니다.

1. `workshop-viewer-poc`에 6개 리포를 등록하고 카드 목록·태그 필터·stale 배지를 확인했습니다. 외부 표준과 호환되는 entry 스키마를 사용했습니다.
2. 외부 리포의 Markdown을 뷰어에서 직접 렌더링하는 작업을 백로그로 기록했습니다.
3. GitHub Pages 게시와 필요 시 `moaw.dev` 등 외부 공개 카탈로그 등재를 후속 단계로 제안했습니다.

## 5. 수정일과 검증일 관리

문서를 수정한 날짜와 워크샵을 끝까지 실행한 날짜는 다릅니다. 원문 분석에서 날짜를 직접 표기한 사례는 `fabric-camp`의 2025-09-08 수기 서명이었으며, 기계가 수집할 수 있는 공통 필드는 없었습니다.

| 옵션 | 장점 | 한계 |
|---|---|---|
| 본문의 수기 날짜 | 별도 도구 없이 도입할 수 있습니다. | 갱신을 놓치기 쉽고 카탈로그 수집 기준이 없습니다. |
| frontmatter 이원화 + stale 검사 (권고) | `last_updated`와 `validated_on`을 구분해 문서 수정과 실행 검증 상태를 따로 표시합니다. | 실제 검증일 기록과 정기 실행은 저자가 담당해야 합니다. |

`last_updated`는 Git 이력으로 자동 갱신하는 방안을 제안했습니다. `validated_on`은 실제 E2E 완주일을 기록하며, 원문은 90일 초과 시 stale 배지를 표시하고 분기별 검증을 진행하는 운영안을 제시했습니다.

원문 PoC에서는 `AI-Gateway-KR`의 문서 수정일은 최근이지만 검증일이 3월이라 stale 배지를 표시했다고 기록했습니다. Fabric IQ Ontology·Work IQ·MAF 등 preview 기능에 의존하는 콘텐츠는 SDK와 서비스 변경도 함께 점검해야 합니다.

## 실행 로드맵

다음은 기존 제안의 실행 순서이며, 완료 상태를 새로 확정한 목록은 아닙니다.

1. frontmatter·랩 템플릿·명명·라이선스 정책을 검토하고 표준을 확정합니다.
2. `ms-four-iq-workshop`에 규칙을 적용해 Foundry형 예시를 검증하고 별도 템플릿 추출을 검토합니다.
3. 기존 6개 리포의 라이선스(원문에서 3개 부재·불일치), frontmatter, 링크와 devcontainer(원문에서 2개 미보유)를 정비합니다.
4. 카탈로그 PoC의 콘텐츠 렌더링과 Pages 게시를 진행하고 외부 등재 여부를 검토합니다.
5. frontmatter·링크·stale 검사와 AGENTS.md를 적용합니다. `ai-agents-for-beginners` 사례를 참고한 자동 번역은 검토 과제로 남깁니다.

## 부록 A. Frontmatter 스키마

워크샵 루트 README 상단에 메타데이터를 둡니다. 원문은 외부 카탈로그와의 호환을 고려해 다음 예시를 제시했습니다.

```yaml
---
type: workshop
title: Azure AI Gateway 핸즈온
description: APIM을 AI Gateway로 활용하는 11개 랩
level: intermediate
authors: [ChangJu Ahn]
contacts: ["@ChangJu-Ahn"]
duration_minutes: 300
tags: [apim, ai-gateway, azure-openai]
language: ko
execution: [codespaces, local]
status: active
source: original
last_updated: 2026-07-21
validated_on: 2026-07-14
---
```

| 필드 | 값 또는 작성 기준 |
|---|---|
| `level` | `beginner`, `intermediate`, `advanced` |
| `authors`, `contacts` | 저자와 연락 계정의 수를 맞춥니다. |
| `tags` | kebab-case로 작성하고 기존 태그를 우선 재사용합니다. |
| `language` | `ko` 같은 ISO 2자리 코드 |
| `execution` | `codespaces`, `local`, `portal` 중 해당하는 값 |
| `status` | `active`, `draft`, `archived` |
| `source` | `original` 또는 `"localized: <원본 리포>"` |
| `last_updated` | 문서 수정일 |
| `validated_on` | 실제 E2E 검증일. 현재 이관 절차에서는 키를 유지하고 실행 전에는 비워 둡니다. |

선택 필드로 `banner_url`(1280 x 640px), `video_url`, `audience`, `published`를 제안했습니다. 현재 이관 문서의 `original_content_date`는 원본 콘텐츠 수정일을 한 번 기록하는 추가 선택 필드입니다.

랩 README의 필수 필드는 현재 이관 절차 기준 `title`, `duration_minutes`, `last_updated`입니다. 원문 제안에는 `validated_on`도 있었으므로, 추가 여부는 문서 첫머리의 검토 항목으로 남깁니다.

## 부록 B. 랩 문서와 저작 문법

랩 안내서는 다음 순서를 사용합니다. 현재 이관 절차에서는 분할형 랩의 README에 공통 안내를 두고, 각 단계 문서에는 해당 실습과 이전·다음 링크를 둡니다.

```text
개요와 학습 목표 -> 사전 요구사항 -> 소요 시간
-> 번호가 있는 실습 단계 -> 검증
-> 정리(Clean-up) -> 트러블슈팅 -> 이전/다음 링크
```

### Markdown과 notebook 연결 예시

원문은 `AzureAIFoundryWorkshop-Code` 파일럿의 구조를 다음처럼 제시했습니다. 번호 03은 이 예시에서 생략되어 있습니다.

```text
my-workshop/
  README.md
  AGENTS.md
  CHANGELOG.md
  LICENSE
  LICENSE-DOCS
  .devcontainer/devcontainer.json
  requirements.txt
  01-setup/
    README.md
  02-foundry-project/
    README.md
  04-chat-completion/
    README.md
    01-basic-chat.ipynb
    02-embeddings.ipynb
    03-basic-rag.ipynb
```

루트 README에는 전체 frontmatter와 학습 경로를, 랩 README에는 개요·사전조건·검증·정리를 둡니다. 노트북은 실행 자료이며 첫 코드 셀에서 환경 변수와 클라이언트를 준비합니다. 의존성 버전은 고정하고 노트북 출력은 지웁니다.

다음은 원문의 랩 README 예시입니다. 생략된 준비·정리 절차는 실제 워크샵 저자가 구체적으로 작성해야 하며, 이 예시 자체가 완성된 실습 가이드는 아닙니다.

````markdown
---
title: 04. Chat Completion · Embeddings · RAG
duration_minutes: 90
last_updated: 2026-08-12
---
# 04. Chat Completion · Embeddings · RAG

## 개요와 학습 목표
openai SDK와 Foundry 프로젝트로 Chat, 임베딩, RAG를 실습합니다.

| 노트북 | 내용 | 소요 시간 |
|---|---|---|
| [01-basic-chat.ipynb](01-basic-chat.ipynb) | Chat Completions 기본 | 25분 |
| [02-embeddings.ipynb](02-embeddings.ipynb) | 텍스트 임베딩 | 20분 |
| [03-basic-rag.ipynb](03-basic-rag.ipynb) | 벡터 검색과 RAG | 45분 |

## 사전 준비 (노트북 03 실행 전)
Azure AI Search 리소스 생성 절차와 .env 설정을 작성합니다.

## 검증
세 노트북을 순서대로 실행해 마지막 셀까지 오류 없이 완료되면 성공입니다.

## 정리 (Clean-up)
이 실습에서 생성한 AI Search 리소스의 삭제 절차를 작성합니다.

## 다음 단계
[05. Agent Service](../05-agent-service/README.md)
````

환경 구성처럼 실행 노트북이 없는 장은 Markdown만 사용합니다. 포털 클릭스루형은 모든 장이 Markdown만으로 구성될 수 있습니다. 노트북이 본문인 B형과 검증 자료인 C형의 역할 차이는 유지합니다.

### 저작 문법 제안

- 단일 `workshop.md`를 쓰는 뷰어는 `---`로 섹션을 나누고 H2·H3로 본문을 구성하는 방식을 제안했습니다. 뷰어의 페이지 분할·탐색 지원 여부는 별도 확인해야 하며, GitHub 자체가 이 기능을 제공하는 것은 아닙니다.
- 콜아웃은 `> **Note**:` 같은 인용문을 사용할 수 있습니다. 원문에서 제안한 `<div class="info|tip|warning|important|task" data-title="...">` 문법은 대상 렌더러에서 호환성을 확인합니다.
- 이미지와 파일은 해당 랩의 `assets/`에 두고 상대 경로로 연결합니다. 현재 이관 절차에서는 여러 랩이 사용하는 파일만 `shared-assets/`로 구분합니다.
- 대안 경로나 심화 내용은 `<details><summary>`로 접을 수 있습니다. 원문은 `ms-four-iq`의 로컬 설치 안내를 사례로 들었습니다.

## 부록 C. 신규 워크샵 등록 체크리스트

- [ ] frontmatter를 작성하고 실제 문서 수정일과 실행 검증일을 구분했습니다.
- [ ] 카탈로그 entry의 `branch`·`content_path`가 실제 경로와 대소문자까지 일치합니다. 이 두 값은 위 워크샵 frontmatter 예시의 필수 필드가 아닙니다.
- [ ] devcontainer와 Open in Codespaces 배지를 준비했습니다. 포털 전용 워크샵은 면제합니다.
- [ ] Azure 리소스를 사용하면 배포와 정리 절차를 함께 제공합니다. azd·Bicep 적용 범위는 워크샵 특성에 맞게 검토합니다.
- [ ] 라이선스와 외부 기여분을 확인했습니다. 코드 MIT·문서 CC BY-SA 4.0 적용은 필요한 동의를 받은 뒤 진행합니다.
- [ ] 현지화 콘텐츠의 원본 출처를 `source`와 README에 명시했습니다.
- [ ] 실제 운영하는 카탈로그에 entry를 추가하고 메타데이터 검사, 목록과 상세 표시를 확인했습니다.

## 부록 D. AGENTS.md 구성

표준 워크샵의 루트에 AGENTS.md를 두어 AI 유지보수의 작업 범위와 검증 절차를 안내합니다. 도구별 자동 로딩 여부와 추가 설정은 해당 에이전트 환경에서 확인합니다.

원문은 `ms-four-iq-workshop`의 보안 규칙과 노트북 셀 구성을 바탕으로 다음 네 섹션을 제안했습니다.

| 섹션 | 기록할 내용 |
|---|---|
| 리포 규칙 | 시크릿 커밋 금지, 수정 제한 파일, 대용량 바이너리 제한, 노트북 출력 제거 |
| 콘텐츠·노트북 스타일 | 한국어 설명·영어 코드 등 언어 정책, 제목·시나리오·미션 목록, 번호 단계, 마지막 완료 확인 셀 |
| 검증 하네스 | 노트북 유효성·출력·frontmatter·링크 검사를 실제 실행 가능한 명령으로 제공 |
| 백로그와 DO NOT | E2E 후 검증일 기입, retired SDK 재도입 금지, main 직접 커밋 제한, 남은 작업 |

원문 파일럿에서는 AGENTS.md의 검증 지시를 사용해 Copilot Agent가 openai 버전 고정 오류와 임베딩 endpoint 라우팅 문제를 수정하고 검사를 다시 통과했다고 기록했습니다. 이는 당시 사례이며 모든 작업의 자동 해결을 보장하지 않습니다.

## 참고 자료

- [microsoft/moaw](https://github.com/microsoft/moaw): CONTRIBUTING, workshop 템플릿, create-workshop 튜토리얼
- [MicrosoftLearning/mslearn-fabric](https://github.com/MicrosoftLearning/mslearn-fabric)
- [Azure-Samples/AI-Gateway](https://github.com/Azure-Samples/AI-Gateway)
- [microsoft/FabConRTIWorkshop](https://github.com/microsoft/FabConRTIWorkshop)
- [표준 적용 파일럿](https://github.com/kyungtaak/AzureAIFoundryWorkshop-Code/tree/standard-v2)
- 팀 리포 6개 실측 분석(2026-07-21). 원문이 인용한 비교분석 보고서는 이 저장소에 포함되어 있지 않습니다.

[저장소 안내로 돌아가기](../README.md)