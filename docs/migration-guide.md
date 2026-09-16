---
title: 워크샵 리포 Azure-Samples 이관·표준화 가이드
description: 개인 리포의 워크샵을 Azure-Samples 조직으로 옮기면서 팀 표준 템플릿을 적용하는 절차
authors: [Jayden]
status: draft
last_updated: 2026-09-16
---

# 워크샵 리포 Azure-Samples 이관·표준화 가이드

개인 GitHub 리포에서 운영하던 워크샵을 Azure-Samples 조직으로 옮기면서, 팀 표준 템플릿을 함께 적용하는 절차를 정리한 문서입니다. 워크샵 저자가 직접 따라 하는 것을 전제로 썼습니다.

이 가이드는 세 문서가 한 세트입니다.

| 문서 | 용도 | 읽는 사람 |
|---|---|---|
| 상세 이관 가이드 (이 문서) | 전체 절차와 판단 기준 | 저자 |
| [결정 시트](../template/decision-sheet.md) | 이관 전에 저자가 정할 것들의 기록 양식 | 저자 |
| [AI 지시문](../prompts/migration.md) | 반복 변환 작업을 AI 에이전트에 위임하는 지시문 | Copilot Agent / Claude Code |

표준의 근거는 [워크샵 콘텐츠 표준화 제안](standards.md)의 부록 A(frontmatter 스키마), B(랩 문서 템플릿), C(등록 체크리스트), D(AGENTS.md 표준)입니다. 제안과 현재 이관 절차 사이에 차이가 있는 항목은 기준 문서 첫머리에 정리했습니다. 전체 흐름은 [HTML 안내서](../workshop-migration-howto.html), 실제 구조는 [표준 적용 파일럿](https://github.com/kyungtaak/AzureAIFoundryWorkshop-Code/tree/standard-v2)을 참고하십시오.

본문은 md 가이드가 본문인 C형 리포를 기준으로 썼습니다. 노트북 중심 리포(B형)와 포털 클릭스루 리포(A형)에서 달라지는 부분은 부록 1에 따로 모았습니다.

## 전체 흐름

절차는 일곱 단계(Phase 0~6)입니다. 변환과 검증을 전부 로컬에서 끝낸 뒤 마지막에 Azure-Samples로 게시하는 순서라서, 표준화가 끝나지 않은 콘텐츠가 공개 조직에 올라가는 일이 없습니다. 저자가 직접 하는 일은 결정 확정(0~1), 보안 판정(2), 변경 리뷰(5), 게시와 실행 검증(6)이고 나머지는 AI가 수행합니다.

1. **Phase 0** — 사전 결정 (선택 — 건너뛰면 Phase 1 인터뷰로 대체)
2. **Phase 1** — AI 실행 준비와 결정 확정
3. **Phase 2** — 보안 점검 (필수 게이트)
4. **Phase 3** — 콘텐츠 이관 준비 (로컬)
5. **Phase 4** — 표준 적용 (AI 수행)
6. **Phase 5** — 검증과 리뷰
7. **Phase 6** — Azure-Samples 게시와 등재 (리포 생성·설정·push·공개 전환·등재, 구 리포 정리)

---

## Phase 0 — 사전 결정 (선택)

결정 시트를 채우는 단계지만, 건너뛰어도 됩니다. 시트 없이 Phase 1로 넘어가면 에이전트가 리포를 분석해 전 항목의 권고안을 만들어 오고, 저자는 확인·수정만 하면 됩니다(시트 인터뷰). 정해둘 것이 많은 리포라면 미리 채우는 편이 빠르고, 아니라면 인터뷰로 시작하십시오. 어느 쪽이든 아래 항목의 최종 확정은 저자가 합니다.

결정 항목과 판단 기준은 다음과 같습니다.

**이관 범위.** 리포 전체를 옮길지, 특정 서브폴더만 새 리포로 추출할지 정합니다. 리포 하나에 성격이 다른 콘텐츠가 여러 개 섞여 있다면 워크샵 단위로 추출하는 편이 표준 적용에 유리합니다.

**추출 의존성.** 서브폴더 추출을 택했다면 범위 밖 참조를 먼저 조사합니다. 실행과 이해에 필요한 저장소 내 파일은 `dependency_paths`로 기록해 새 리포에 함께 포함하고, 외부 데이터셋·서비스는 `external_runtime_dependencies`로 기록만 합니다 — 외부 자원은 복사하지 않고 접근 가능성, 라이선스, 크기, fallback 필요 여부를 남깁니다.

**새 리포 이름.** `<product>-<topic>-workshop-kr` 형식, 전부 소문자 kebab-case입니다. `<product>`는 `foundry`, `fabric`, `apim`, `agent-framework` 중 하나이고, `<topic>`은 같은 제품에 워크샵이 둘 이상일 때만 넣습니다. 포털 클릭스루 버전과 코드 버전이 따로 있으면 `portal` / `sdk`로 구분합니다. 이벤트명, 개인명, 대문자, 버전 번호, `azure-` 접두어는 쓰지 않습니다. 워크샵마다 별도 리포를 만들며, 팀이 발급받은 조직 리포(허브 리포)는 콘텐츠를 담지 않고 카탈로그·템플릿·규약만 둡니다. 자세한 규약은 Phase 6-1-1에 있습니다.

**콘텐츠 유형 판정.** 표준화 제안의 세 유형 중 어디에 해당하는지 정합니다. 포털 클릭만으로 진행하면 A(클릭스루형), 노트북이 본문이면 B(노트북 실행형), md 가이드가 본문이고 노트북은 검증용이면 C(가이드+검증 분리형)입니다. 유형에 따라 Phase 4에서 적용할 템플릿 요소가 달라집니다. 유형은 파일 존재 여부가 아니라 수강자의 주 학습 경로로 판정합니다 — 포털 실습에 보조 노트북이 있어도 A형일 수 있습니다.

**랩 단위와 챕터 구조.** 폴더 하나가 랩인지, 문서 각각이 독립 랩인지 랩 단위를 먼저 정의하고, 배치 레이아웃도 함께 정합니다. 리포 최상위에 학습 경로 외 실행 코드(src, tests 등)가 있으면 랩들을 `labs/` 컨테이너 폴더 아래에, 없으면 루트에 직배치합니다 — 컨테이너 폴더명은 `labs/` 하나로 통일하며 `steps/` 같은 변형은 쓰지 않습니다. 이어서, 랩마다 단일 문서형(README.md 하나로 학습 진행)과 분할형(README.md는 진입 문서, `01-*.md`가 순차 학습 문서) 중 하나를 선택합니다. 서로 의존하는 학습 단계가 여럿이거나, 문서가 길어 탐색이 어렵거나, 단계별 실행 자료가 있거나, 순차 결과물(Bronze → Silver → Gold 류)이 있으면 분할형을 고려합니다. 이 선택은 저자가 하고 AI는 실행만 합니다 — AI가 랩을 임의로 분할·병합하는 일은 없습니다.

**execution 트랙.** frontmatter의 `execution` 필드 값입니다. `codespaces`, `local`, `portal` 중 해당하는 것을 모두 적습니다. 포털 전용(A형)이 아니라면 codespaces를 기본으로 둡니다.

**라이선스.** 표준은 코드 MIT + 문서 CC BY-SA 4.0 이원화입니다. 현재 리포가 다른 라이선스를 쓰고 있다면 전환에 저작자 동의가 필요합니다. 1인 저작 리포는 본인 동의로 충분하지만, 외부 기여자의 커밋이 섞여 있다면 해당 기여분의 처리를 먼저 확인해야 합니다.

**history 방침.** 커밋 이력을 보존할지(mirror), 새로 시작할지(스쿼시) 저자가 선택합니다. 단, 예외 규칙이 하나 있습니다. **Phase 2 보안 점검에서 시크릿이나 개인 리소스 식별자가 이력에서 발견되면 선택권 없이 스쿼시가 강제됩니다.** 공개 조직으로 이력을 그대로 옮기는 순간 과거 커밋의 노출 정보까지 함께 공개되기 때문입니다.

**내부 산출물 처리.** 작업 계획서, 스펙 초안, 실험 결과 파일, 실행 테스트 로그, 임시 스크립트(`tmp-` 접두어 류)처럼 수강자에게 필요 없는 파일을 가져갈지 정합니다. 실행 로그는 응답 헤더의 요청 ID·리소스명까지 담고 있는 경우가 많아 보안 점검에서도 자주 걸리는 부류입니다. 기본 권고는 이관 대상에서 제외하는 것입니다. 제외할 경로를 결정 시트에 명시해 두면 AI 지시문이 해당 경로만 정리합니다.

**사전 재검증 필요 여부.** 마지막 커밋이 오래됐거나 preview SDK에 의존하는 리포는 이관 전에 처음부터 끝까지 한 번 돌려봐야 합니다. 깨진 상태로 조직 리포에 올라가는 것을 막기 위한 장치입니다. 수개월간 커밋이 멈춘 preview SDK 워크샵이 대표적인 대상입니다.

---

## Phase 1 — AI 실행 준비와 결정 확정

구 리포를 로컬에 클론하고 에이전트를 실행합니다. [AI 지시문](../prompts/migration.md)을 작업 폴더에 복사하고, 시트를 채웠다면 [입력] 블록에 값을 옮긴 뒤 "이 파일을 읽고 그대로 수행하라"고 지시합니다. Claude Code는 터미널에서, Copilot은 VS Code 에이전트 모드에서 같은 방식으로 동작합니다. 하네스 실행에 gitleaks 8.19 이상과 Python 3.10 이상이 필요하므로 devcontainer에서 작업하면 환경 문제를 피할 수 있습니다.

시트를 건너뛰었다면 에이전트가 먼저 시트 인터뷰를 시작합니다. 리포 분석 결과로 전 항목의 권고안 초안(권고값과 근거, 판단 항목은 [확인 필요] 표시)을 한 번에 제시하므로, 저자는 확인·수정으로 결정을 확정합니다. 삭제 대상·history 방침·유형 판정이 확정되기 전에는 어떤 변환 작업도 시작되지 않습니다.

---

## Phase 2 — 보안 점검 (필수)

공개 조직으로 옮기기 전에 시크릿과 개인 정보를 반드시 스캔합니다. 이 단계는 생략할 수 없으며, working tree뿐 아니라 **커밋 이력 전체**가 대상입니다. 검사 명령 전체는 [AI 지시문](../prompts/migration.md)의 검증 하네스에 포함되어 있으므로 AI에 맡겨도 되고, 아래 요령으로 직접 돌려도 됩니다.

점검은 세 가지입니다.

첫째, **시크릿 스캔**입니다. gitleaks 같은 도구로 이력 전체에서 API 키·연결 문자열·토큰을 찾습니다.

```bash
gitleaks git . --log-opts="--all"
```

둘째, **개인 리소스 식별자 스캔**입니다. 시크릿 도구가 잡지 못하는 항목으로, 저자 개인 구독의 리소스 이름이 박힌 엔드포인트 URL(`https://<개인리소스>.openai.azure.com` 류), 구독 ID, 테넌트 ID가 대상입니다. 문서와 코드의 예시는 `<your-resource>` 같은 placeholder로 바꿉니다.

셋째, **노트북 출력 스캔**입니다. 실행 결과가 커밋된 노트북은 출력 셀에 엔드포인트·리소스 이름·응답 데이터가 그대로 남습니다. 팀 리포 사전 점검에서 실제로, 커밋된 노트북 출력에 저자 개인 리소스의 엔드포인트가 남아 있던 사례가 확인되었습니다. 코드 셀에는 없고 출력에만 있어서 육안 리뷰로는 놓치기 쉬운 유형입니다.

판정 규칙은 하나입니다. **세 스캔 중 하나라도 이력에서 노출을 발견하면 history 방침은 스쿼시로 강제**됩니다. HEAD에서 지워도 이력에는 남기 때문입니다. working tree에서만 발견됐고 이력이 깨끗하다면, 해당 파일을 정리한 뒤 저자가 정한 방침대로 진행합니다.

---

## Phase 3 — 콘텐츠 이관 준비 (로컬)

Phase 0~2의 결정과 판정에 따라 세 경로 중 하나로 로컬에서 새 리포의 뼈대를 만듭니다. **원격 push는 여기서 하지 않고 Phase 6으로 미룹니다** — 식별자 치환(Phase 4) 전의 콘텐츠가 공개 조직에 올라가는 것을 막기 위해서입니다.

**경로 (a) — 이력 보존.** 리포 전체를 이력째 옮기는 경우로, 로컬 클론을 그대로 작업 본으로 씁니다. Phase 4의 표준화 변경은 구 리포의 표준화 브랜치(`standard-v2` 류)에 올려 두고, 게시 시점에 그 브랜치를 새 리포 `main`으로 지정해 push합니다(6-3). 구 리포 `main`에 머지할지는 6-5 정리 때 정합니다.

**경로 (b) — 새로 시작 (스쿼시).** working tree만 복사해 첫 커밋으로 만듭니다. Phase 2에서 노출이 발견된 리포는 반드시 이 경로입니다.

```bash
git clone --depth 1 <구리포 URL> work
cd work && rm -rf .git
git init && git add . && git commit -m "Initial import"
```

원본의 존재는 frontmatter의 `source` 필드와 README의 출처 표기로 남깁니다. 이력을 잃는 대신 노출 위험이 원천 차단됩니다.

**경로 (c) — 서브폴더 추출.** 리포의 일부만 새 리포로 만드는 경우입니다. 이력까지 보존하려면 git-filter-repo를 씁니다.

```bash
pip install git-filter-repo
git clone <구리포 URL> work
cd work
git filter-repo --subdirectory-filter <서브폴더명>
```

filter-repo는 지정 폴더 밖의 이력을 전부 제거하지만, 해당 폴더 안에서 발생한 노출은 그대로 남으므로 추출 결과물에 Phase 2 스캔을 다시 돌립니다. 이력이 필요 없다면 경로 (b)에서 서브폴더만 복사하는 편이 간단합니다.

어느 쪽이든 추출 전에 범위 밖 참조를 조사해 `dependency_paths`의 파일을 함께 가져옵니다.

---

## Phase 4 — 표준 템플릿 적용 (AI 위임 구간)

여기부터가 [AI 지시문](../prompts/migration.md)의 담당 구간입니다. 확정된 결정값으로 에이전트가 아래 작업을 로컬 별도 브랜치에 단계별 커밋으로 수행하고, 끝나면 변경 요약 보고(단계별 커밋 내역, 하네스 통과 로그, 저자가 채울 TODO 목록)를 제시합니다. 원격 push는 이 단계에서도 하지 않습니다.

에이전트가 수행하는 작업은 다음과 같습니다. 직접 하고 싶은 저자를 위해 목록으로 남겨 둡니다.

- 파일·폴더 개명: 랩 폴더는 `01-lab-name` 형식(번호 접두어 + kebab-case 영문) 단일 패턴으로 — `lab`·`step` 같은 단어 접두어는 쓰지 않습니다(번호가 이미 순서를 말합니다). 공백·한글 경로를 이 형식으로 바꾸고, 본문·목차의 상대 링크를 전부 재작성. 재현 가능한 개명이 필요하면 결정 시트의 선택 항목 `path_map`으로 기존→표준 경로를 명시(미기입 시 AI가 매핑안을 만들어 PR에 표로 제시)
- 개인 리소스 식별자 치환: 문서·코드·설정에 남은 실제 엔드포인트 URL·리소스명을 `<your-...>` placeholder로 교체
- 랩 구조 적용: 분할형으로 지정된 랩을 진입 README + 단계 문서로 재구성(이동·제목 정렬·번호 조정·링크 수정만), 탐색 링크(이전/다음, 첫 랩↔워크샵 홈, 마지막 랩→완료 안내) 완성. 분할 시 파일 번호·H1 번호·하위 제목 번호를 새 학습 순서에 맞게 함께 재정렬하고, 노트북은 연결된 단계 문서와 같은 번호 접두어를 사용
- 자산 정리: 랩 전용 파일은 `<lab>/assets/`, 다른 랩이 참조하는 것이 확인된 파일만 `/shared-assets/`로 이동(참조 링크 함께 수정), 노트북은 관련 단계 문서와 같은 디렉터리 — 같은 자산의 중복 복사 금지
- 루트 README.md에 표준 frontmatter(부록 A 전체 스키마) 추가, 각 랩 폴더 README.md에 축약형 frontmatter 추가. 원본 콘텐츠의 최종 수정일은 선택 필드 `original_content_date`로 1회 기록하고, 분할형 랩의 단계 문서에는 frontmatter를 넣지 않음
- 랩 문서를 표준 섹션 골격(개요 → 사전 요구사항 → 소요 시간 → 실습 → 검증 → 정리 → 트러블슈팅 → 이전/다음 링크)에 맞게 재배치 — 학습 목표·사전 요구사항·검증 기준·이전/다음처럼 원문에 근거가 있는 항목은 원문 재배치·요약으로 채우고, 근거가 없거나 비용·리소스 삭제 판단이 필요한 항목만 TODO로 남김
- 노트북 출력·execution_count 제거: 유형과 관계없이 모든 ipynb에 적용. md 안내서 페어링 구조 생성은 B·C형에만 적용
- `.devcontainer` 추가와 "Open in Codespaces" 뱃지 (A형 포털 전용 리포는 면제)
- AGENTS.md 배치 (부록 D 표준 4개 섹션: 리포 규칙, 스타일 가이드, 검증 하네스, 백로그·DO NOT)
- 거버넌스 파일 추가: LICENSE(MIT) 확인, LICENSE-DOCS(CC BY-SA 4.0)·SECURITY.md·CODE_OF_CONDUCT.md·SUPPORT.md를 허브 리포 템플릿 문안으로 추가 — 포털이 리포를 만들 때 넣어 주지 않으므로 여기서 전부 갖춤
- 이미지 에셋을 `assets/` 하위로 정리하고 alt-text 없는 이미지에 alt-text 추가
- 내부 산출물(결정 시트에서 제외로 정한 경로) 삭제

리포마다 표준과의 격차가 다릅니다. 명명 규약을 이미 지키고 있는 리포라면 실제 작업이 frontmatter·devcontainer·AGENTS.md·거버넌스 파일 추가와 출력 클리어 정도로 좁혀지고, 파일명 개편이 필요한 리포는 링크 재작성까지 작업량이 커집니다. 에이전트에 위임하기 전 결정 시트로 현재 상태를 정리해 두면 PR 리뷰가 쉬워집니다.

---

## Phase 5 — 검증과 리뷰

두 겹으로 확인합니다. 하네스 9종은 에이전트가 보고 전에 스스로 통과시키므로 저자는 통과 로그만 확인하면 됩니다. 그다음 변경 요약 보고를 보며 로컬 diff를 리뷰합니다 — 본문 의미가 바뀐 곳이 없는지, 원문 기반으로 작성된 항목의 근거가 타당한지 확인하고, TODO(소요 시간, 정리 절차 등)를 채웁니다. 여기까지 끝나면 게시할 준비가 된 것입니다.

---

## Phase 6 — Azure-Samples 게시와 등재

2026-09-14 첫 이관(`foundry-agent-sdk-workshop-kr`)에서 포털 화면을 하나씩 따라가며 실측한 절차입니다. `[확인]`으로 남은 항목은 push·심사 승인·공개 전환 시점에 채웁니다.

Phase 0~5에서 변환과 검증을 로컬에서 끝냈다는 전제로 시작합니다. 저자가 직접 하는 일은 리포 생성, 설정, push, 공개 전환, 등재이고 AI가 개입하는 단계는 없습니다.

### 6-1. 리포 생성

리포는 GitHub가 아니라 Microsoft Open Source Management 포털(repos.opensource.microsoft.com)에서 만듭니다. 회사 계정에 GitHub 계정이 연결돼 있어야 하고, 연결 여부는 포털 우측 상단 프로필에서 확인할 수 있습니다.

진입 경로는 포털 상단 **Release** 메뉴 → Create a new resource → **Azure-Samples** 버튼 → Destination engineering system에서 **GitHub for Open Source**입니다. microsoft org는 정식 제품용이라 심사가 무겁고, EMU와 Azure Repos는 사내 전용이므로 워크샵은 Azure-Samples가 맞습니다.

Azure-Samples 화면 상단에는 "중앙 관리 주체가 없고, 유지보수되지 않는 리포는 더 적극적으로 archive될 수 있다"는 안내가 있습니다. 표준의 `validated_on` 필드와 분기별 검증 캠페인은 이 정책에 대응하는 장치입니다.

#### 6-1-1. 이름 규약

`<product>-<topic>-workshop-kr` 형식, 전부 소문자 kebab-case입니다.

- `<product>`는 `foundry`, `fabric`, `apim`, `agent-framework` 중 하나를 씁니다. 새 제품이 생기면 카탈로그 `tags` 어휘와 맞춰 추가합니다.
- `<topic>`은 같은 제품에 워크샵이 둘 이상일 때만 넣습니다. 포털 클릭스루 버전과 코드 버전이 따로 있으면 `portal` / `sdk`로 구분합니다. 예: `foundry-agent-sdk-workshop-kr`, `foundry-agent-portal-workshop-kr`
- 이벤트명(build26, ignite25), 개인명, 대문자, 버전 번호, `azure-` 접두어(org 이름과 중복)는 쓰지 않습니다. 이벤트 출처는 frontmatter `source`에 적습니다.

#### 6-1-2. 입력값

생성 폼은 한 페이지에서 아래로 이어집니다. "공통"이라고 적힌 값은 모든 워크샵 리포에 동일하게 적용하므로 고민 없이 그대로 고릅니다.

| 항목 | 값 | 비고 |
|---|---|---|
| Repository name | `<product>-<topic>-workshop-kr` | 6-1-1 |
| Description | `Korean hands-on workshop for <제품> — <핵심 주제>` | 반드시 `Korean`으로 시작. 이름의 `-kr`만으로는 언어가 안 읽힘 |
| Visibility | **Private** | 공통. 검증이 끝난 뒤 공개로 전환 |
| Classify the repository | **Non-Production** | 공통. 워크샵은 프로덕션 배포 산출물이 아님 |
| Service Tree | **No Service** (opt-out) | 공통. 이후 오는 리마인더 메일은 무시 |
| Direct Owners | 저자 본인 + 팀 워크샵 카탈로그 담당자(현재: Kichul Kim) | 개인 2명 필수. security group은 여기 못 넣음 |
| Fallback security group | 팀 security group | `[확인: 그룹 이름]` — 없으면 비워두고 생성 후 Change owners에서 추가 |
| Open source release approval | **Yes, creating an open source-licensed project** | 공통. 아래 설명 참조 |
| What type of open source project | **Sample code** | 공통 |
| License | **MIT** | 공통. 문서용 CC BY-SA 4.0은 포털에 적지 않고 LICENSE-DOCS 파일로 넣음 |
| Did your team write all the code and assets? | 자체 제작 = Yes / 현지화·재작성 = No | 결정 시트의 `source` 값과 같음 |
| Contains 3rd-party embedded code? | **No** | 공통. 외부 데이터셋·폰트·이미지를 리포에 넣지 않는 것이 규약 |
| Contains Microsoft code owned by another team? | 자체 제작 = No / 현지화·재작성 = Yes + Details | Details 문안은 6-1-3 |
| Telemetry | **No** | 공통. 수강자가 자기 구독의 Azure 서비스를 호출하는 것은 해당하지 않음 |
| Cryptography | **No** | 공통. 수출 규제 심사용 질문 |
| Administrator permissions | **Yes, use just-in-time elevation** | 공통 |
| Maintainer / Write permissions | 비움 | 공통. 콘텐츠 변경은 PR로만 |
| Read-only teams | `azure-samples-members` 체크 | 공통. 공개 전까지 동료가 열람하기 위한 설정 |
| Repository template | 체크 (License: MIT + Copyright: Microsoft) | 실제로 생성되는 파일은 `.gitignore` 하나뿐 |
| Add .gitignore | 아무 템플릿 | Phase 4에서 표준 `.gitignore`로 대체됨 |

Open source release approval에서 "Private repository"를 고르면 안 됩니다. 그쪽을 고르면 "InnerSource / Team project / Personal project" 같은 사내 프로젝트 분류를 요구하고, 사내 분류가 붙은 리포는 EMU 이관 대상으로 잡힐 수 있습니다. "Yes"를 골라도 리포는 위에서 정한 대로 Private으로 만들어지며, 달라지는 것은 릴리스 심사가 리포 생성과 함께 시작된다는 점뿐입니다. 심사가 며칠 걸릴 수 있으므로 push 준비와 병렬로 진행되는 편이 이득입니다.

"Did your team write all the code" 이하 세 질문은 한 세트로 답이 맞아야 합니다.

| 리포 성격 | 자체 제작? | 3rd-party 포함? | MS 타팀 코드 포함? |
|---|---|---|---|
| 자체 제작 (`source: original`) | Yes | No | No |
| 현지화·재작성 (`source: localized`) | No | No | Yes + Details |

#### 6-1-3. 심사 문안 템플릿

심사자는 여기 적힌 텍스트만 보고 판단하므로 분량을 줄이지 않습니다. `<>` 부분만 바꿔 씁니다. 고객사 이름은 어디에도 적지 않습니다.

**Details** (MS 타팀 코드 포함 = Yes일 때)

```
Content adapted from the public <원본 리포 URL> (<라이선스>, owned by the <원본 팀>).
Rewritten and localized to Korean for hands-on workshops; no confidential or internal code included.
```

**Product / Project Review Details**

- Project name: `<워크샵 제목> (Korean)`
- Project version: `1.0`
- Project description:

```
A Korean-language hands-on workshop that teaches <대상> how to <학습 내용> on <제품>.
It consists of Jupyter notebooks, step-by-step markdown guides, a dev container for
GitHub Codespaces, and Bicep templates that provision the required Azure resources in
the learner's own subscription. <원본이 있으면: Content is adapted from the public <원본 리포> (MIT) and localized for Korean audiences.>
```

- Business goals:

```
This workshop is delivered by the Microsoft Korea Solution Engineering team to enterprise
customers and partners during hands-on labs, technical enablement sessions, and events, to
accelerate adoption of <제품>. Publishing it in Azure-Samples lets customers access the
material before and after sessions, lets field teams reuse a maintained, standardized version
instead of ad-hoc copies, and makes the content discoverable alongside other Korea SE team
workshops. This repository is part of the team's workshop content standardization initiative
(standard template, Codespaces-first execution, shared catalog). The content contains only
sample code and learner-facing documentation; no customer data, internal roadmaps, or
confidential information is included.
```

- Will this be used in a Microsoft product or service?: `No. Customer enablement content only; not shipped in any Microsoft product or service.`

#### 6-1-4. 생성

**Start business review + create repository**를 누르면 리포가 즉시 생성되고 릴리스 심사가 시작됩니다. 결과 화면에 Azure Boards 워크아이템 링크(`https://dev.azure.com/ossmsft/Reviews/_workitems/edit/<번호>`)가 나오는데, 심사 상태와 대기 중인 팀을 확인하는 유일한 창구이므로 저장해 둡니다. 같은 링크는 포털 Compliance 탭의 Release Review 섹션에서도 볼 수 있습니다.

워크아이템은 생성 즉시 State **Business Review**(Reason: Submitted)로 들어가며, **Business review → Legal review → OSS Attorney review** 세 단계를 차례로 거칩니다. 단계마다 검토자 한 명이 자동 배정되고, Discussion 탭에 코멘트를 남길 수 있습니다. 승인 여부는 이 워크아이템의 State로만 알 수 있고 포털 Compliance 탭에는 표시되지 않습니다. 심사 소요 시간 `[확인]`.

### 6-2. 생성 직후 점검

포털 Overview에서 Direct Owners 2명, Service Tree "No Service", Classification "Non-Production"이 입력한 대로 기록됐는지 봅니다. Highlights의 Least privilege access와 Immutable OIDC subject는 신규 리포 기본값이 초록이라 조치가 필요 없습니다. 우측에 "Going public? Do not make this repository public yet" 경고가 떠 있는 것이 정상 상태입니다. 심사 승인 전에 Publicize를 누르면 자동으로 private으로 되돌아갑니다.

Compliance 탭은 생성 시점에 경고가 없습니다. 이 탭은 파일 유무가 아니라 시크릿 노출·CodeQL 경고·권한 정책 위반을 알리는 용도입니다. LICENSE, LICENSE-DOCS, SECURITY.md, CODE_OF_CONDUCT.md, SUPPORT.md, README는 포털이 만들어 주지 않으므로 Phase 4 표준 적용에서 넣습니다. GitHub 화면에 보이는 Code of Conduct는 Azure-Samples 조직의 기본 파일이 표시되는 것이지 리포 안의 파일이 아닙니다.

생성 다음 날 `microsoft-github-policy-service` 봇이 **"[Action Needed] This repo is inactive"** 이슈를 올립니다(첫 이관에서 실측: 생성 하루 뒤). 커밋이 `.gitignore` 하나뿐인 빈 리포를 archive 후보로 잡는 자동 정책이며, 6-1 상단의 archive 안내와 같은 장치입니다. 무시하면 안 되고, push가 끝난 뒤 이슈 본문의 지시대로 처리합니다(보통 이슈를 닫거나 댓글로 유지 의사를 남기면 됩니다). 리포 생성과 push 사이 간격을 짧게 잡을수록 이 이슈를 볼 일이 줄어듭니다.

#### 6-2-1. GitHub 설정

Direct Owner는 GitHub 관리자 권한이 아닙니다. 포털 Overview 우측 **Elevate your access**로 JIT 승격한 뒤 GitHub Settings에 들어갑니다. 승격은 시간 제한이 있으므로 아래 설정을 한 번에 끝냅니다.

Topics는 Settings가 아니라 리포 첫 화면(Code 탭) About 옆 톱니바퀴에서 넣습니다. `workshop`, `korean`, 제품 토큰(`foundry` 등) 세 개입니다. 조직 안에서 우리 팀 워크샵만 걸러내는 검색 축이 됩니다.

브랜치 보호는 Settings → Rulesets에서 합니다. 허브 리포의 `template/rulesets/protect-main.json`을 **Import a ruleset**으로 올리면 표준 설정이 한 번에 들어옵니다. 직접 만들 때는 아래 값입니다.

| 항목 | 값 |
|---|---|
| Ruleset name | `protect-main` |
| Enforcement status | **Disabled** (push 뒤에 Active로 전환) |
| Bypass list | Repository admin — JIT 승격 상태의 오너가 긴급 수정에 씀 |
| Target branches | Include default branch |
| Rules | Restrict deletions, Block force pushes, Require a pull request before merging (approvals 1) |

임포트 JSON도 `enforcement: disabled` 상태로 저장돼 있습니다. 6-3의 첫 push(강제 push가 될 수 있음)가 Active 상태에서 거부되기 때문입니다. push가 끝나면 Active로 바꿉니다.

Settings → General의 Features는 워크샵 리포 공통값으로 맞춥니다. Wikis는 끕니다(문서는 리포 md로만 두어야 카탈로그가 수집합니다). Issues는 수강자 피드백 창구로 켜 두고, Projects와 Discussions는 끕니다. Allow forking은 유지합니다. 기본 브랜치가 `main`인지도 확인합니다.

### 6-3. push

push 권한은 두 가지가 함께 필요합니다(첫 이관에서 실측). 첫째, git이 쓰는 자격 증명(GitHub CLI 토큰이나 Credential Manager)에 Azure-Samples 조직의 **SAML SSO 승인**이 돼 있어야 합니다. `github.com/settings/applications` → Authorized OAuth Apps → 해당 앱 → Organization access에서 Azure-Samples를 Authorize 하거나, `gh auth refresh -h github.com -s repo`로 다시 승인합니다. 둘째, Direct Owner라도 평소 권한은 읽기뿐이므로 포털 Overview의 **Elevate your access**로 JIT 승격한 상태에서 push합니다. 둘 중 하나가 빠지면 `403`이 납니다.

초기 커밋은 `.gitignore` 하나뿐이므로 덮어써도 잃는 것이 없습니다. Phase 3에서 정한 경로대로 올립니다.

- 이력 보존: 구 리포의 표준화 브랜치를 새 리포 `main`으로 지정해 push합니다. 표준화 브랜치가 구 리포 `main`의 이력을 전부 포함하므로 이력이 그대로 보존되고, 구 리포를 손대지 않으며, 다른 브랜치와 `refs/pull/*`은 옮기지 않습니다. `git push --mirror`는 모든 브랜치가 이름 그대로 복사돼 새 리포 `main`이 표준 적용 전 상태가 될 수 있으므로 구 리포 `main`에 머지가 끝난 경우에만 씁니다.

  ```bash
  cd <구리포 작업본>
  git fetch origin --prune
  git remote add azs https://github.com/Azure-Samples/<새리포>.git
  git push azs origin/<표준화 브랜치>:refs/heads/main
  ```

  새 리포의 초기 커밋과 이력이 갈리므로 첫 push가 `non-fast-forward`로 거부되면 `--force`를 붙입니다. 잃는 것은 `.gitignore` 커밋 하나이고, Ruleset이 아직 없거나 Disabled면 통과합니다.
- 스쿼시·추출: 작업본에 같은 방식으로 remote를 추가하고 `git push azs main`을 합니다.

Ruleset이 Active 상태였다면 `protected branch hook declined`로 거부되므로 Disabled로 바꾼 뒤 다시 push합니다.

push 뒤 봇이 자동 PR을 올리지는 않습니다(첫 이관 실측: 필수 파일이 모두 들어 있는 상태로 push, 직후 PR 0건). 대신 6-2에서 말한 "inactive" 이슈가 열려 있으면 이 시점에 닫습니다.

push가 끝나면 Ruleset을 Active로 전환하고, 이 리포의 Ruleset을 Export해 허브 리포의 `template/rulesets/protect-main.json`과 내용이 같은지 한 번 대조합니다.

### 6-4. 검증과 공개 전환

Codespaces에서 워크샵을 처음부터 끝까지 완주하는 E2E 검증을 하고 완주일을 frontmatter `validated_on`에 적습니다. `last_updated`와는 다른 값이며 카탈로그의 stale 판정은 `validated_on` 기준입니다.

워크아이템이 승인되면 포털 Overview 우측 Administrator tools의 **Publicize**로 공개 전환합니다. 버튼을 누르면 확인 대화 없이 **즉시** public으로 바뀌므로(첫 이관 실측), 반드시 워크아이템 State를 먼저 확인합니다. 승인 전에 눌렀다면 포털이 되돌릴 때까지 기다리지 말고 GitHub Settings → Danger Zone → Change visibility로 직접 Private으로 되돌립니다. 공개 뒤에는 6-1에서 체크한 `azure-samples-members` 읽기 권한이 의미를 잃으므로 그대로 두어도 됩니다.

### 6-5. 등재와 정리

허브 리포의 카탈로그에 entry를 추가하는 PR을 올립니다. frontmatter가 표준을 지키고 있으므로 등록은 URL 한 줄이고 태그·last update 컬럼은 자동으로 채워집니다.

구 리포는 README를 새 리포 링크만 남긴 리다이렉트 안내문으로 교체하고 Archive 처리합니다. 블로그·발표자료에 박힌 기존 링크가 있으므로 삭제하지 않습니다.

### 남은 실측 항목

| 항목 | 채우는 시점 |
|---|---|
| Fallback security group 이름 | IDWeb에서 팀 그룹 확인 또는 신설 후 |
| 릴리스 심사 소요 시간·승인자 | 해당 리포의 릴리스 심사 승인 시 |

2026-09-16 첫 push에서 확정된 항목: push 권한(SSO 승인 + JIT 승격 둘 다 필요), 봇 PR 없음, 생성 다음 날 "inactive" 이슈, 심사 3단계 구조, Publicize 즉시 전환 — 각각 6-3, 6-2, 6-1-4, 6-4에 반영했습니다.

---

## 부록 1 — 유형별 분기

본문은 C형 기준입니다. 다른 두 유형은 다음이 달라집니다.

### B형 — 노트북 실행형

노트북이 본문인 리포는 Phase 2와 4의 비중이 커집니다.

- Phase 0: 장기간 커밋이 멈춘 preview SDK 리포라면 **사전 E2E 재검증이 선행 조건**입니다. SDK 버전 변화로 깨진 부분을 이관 전에 고칩니다.
- Phase 2: 커밋된 노트북 출력이 있는 리포는 출력 스캔이 특히 중요합니다. 출력에서 개인 리소스 식별자가 확인되면 **history는 스쿼시 강제**입니다.
- Phase 4: 루트에 평면으로 놓인 공백 포함 파일명(`01. lab.ipynb` 류)을 폴더 구조 + kebab-case로 개편하고, 각 장에 md 안내서를 페어링합니다. 출력은 전체 클리어합니다. devcontainer와 lock 파일이 이미 있다면 유지합니다.

### A형 — 포털 클릭스루형

브라우저 실습이 본문인 리포는 코드 관련 작업 대신 문서·에셋 작업이 커집니다.

- Phase 0: 이관 범위가 핵심 결정입니다. 워크샵이 큰 리포의 서브폴더로 존재한다면 경로 (c)로 추출하거나, 이력을 포기하고 경로 (b)로 복사합니다. 라이선스가 MIT 외 계열이라면 전환 동의도 이 단계에서 받습니다.
- Phase 4: 공백 포함 파일명 전면 개명과, 여기에 딸린 스크린샷 상대경로 일괄 재작성이 최대 작업입니다. 클릭스루 리포는 이미지가 수백 장에 이르는 경우가 많아 이 작업은 반드시 하네스의 링크 검사와 한 단위로 진행합니다. devcontainer는 면제하고 `execution: [portal]`로 선언합니다. 스크린샷에는 alt-text를 붙이고, UI 변경에 취약한 이미지는 개수를 줄이는 방향으로 정리합니다.
- 문서별 수기 날짜 서명이 있다면 frontmatter의 `last_updated`로 승격하고 본문에서는 제거합니다.
- 긴 단일 문서 랩은 Phase 0에서 분할형으로 지정해 진입 README + 단계 문서 구조로 재구성하는 것을 검토합니다.

## 부록 2 — 자주 만나는 문제

**첫 push가 거부됩니다.** `403`이면 SSO 승인 또는 JIT 승격이 빠진 것이고(6-3), `protected branch hook declined`면 Ruleset `protect-main`이 Active 상태이기 때문입니다. Settings → Rulesets에서 Disabled로 바꾸고 push한 뒤 다시 Active로 되돌립니다(6-2-1, 6-3).

**filter-repo 실행 후 remote가 사라졌습니다.** git-filter-repo는 실수 방지를 위해 origin을 의도적으로 제거합니다. 정상 동작이며, 새 리포 주소는 Phase 6-3에서 remote로 추가합니다.

**개명 후 이미지가 깨집니다.** 파일명을 바꾸면 본문 상대 링크가 함께 바뀌어야 합니다. 하네스의 링크 검사로 잡히므로, 개명 작업은 반드시 하네스 통과까지를 한 단위로 진행합니다.

**한글 파일명이 GitHub URL에서 인코딩됩니다.** 공백·한글 경로가 남아 있다는 신호입니다. 하네스의 경로 검사를 다시 돌려 잔존 파일을 찾습니다.

**노트북 출력을 지웠는데 diff가 너무 큽니다.** 출력 클리어는 콘텐츠 커밋과 분리해 단독 커밋으로 만드는 편이 리뷰하기 좋습니다.
