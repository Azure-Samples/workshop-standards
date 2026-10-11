# 이관 전 결정 기록

이관을 시작하기 전에 확정하는 결정의 기록입니다. 여기서 정한 값이 [상세 이관 가이드](../docs/migration-guide.md)의 각 Phase와 [AI 지시문](../prompts/migration.md)의 [입력] 블록에 들어갑니다. 이 파일은 공유 양식이며, 실제 작성본은 `local-only/`나 이관 작업 폴더에 보관하고 이 저장소에 커밋하지 않습니다.

작성 방법은 두 가지입니다. 직접 채워도 되고, 변환 에이전트에게 리포를 분석해 전 항목의 권고안을 만들게 한 뒤 확인·수정만 해도 됩니다(지시문의 "시트 인터뷰" 참조). 어느 쪽이든 삭제 대상·history 방침·유형 판정 같은 판단 항목의 최종 확정은 저자가 합니다.

## 템플릿

| 항목 | 값 | 판단 기준 (가이드 참조) |
|---|---|---|
| 구 리포 | | |
| 이관 범위 | migration_scope: full / subfolder, source_path: | 전체는 source_path를 "."으로, 서브폴더는 구 리포 루트 기준 실제 추출 경로로 확정 (Phase 0) |
| 작업 폴더 | work_folder: | 쓰기 작업을 수행할 승인한 로컬 절대 경로. 스쿼시·추출은 원본을 보존한 별도 폴더 |
| 새 리포명 | | `<product>-<topic>-workshop-kr` 소문자 kebab-case, product = foundry / fabric / apim / agent-framework, 포털·코드 병존 시 portal / sdk (Phase 6-1-1) |
| 공동 오너 | 저자 + 팀 카탈로그 담당자(현재 Kichul Kim) | Direct Owner 개인 2명 필수, security group은 Fallback 필드 (Phase 6-1-2) |
| 콘텐츠 유형 | A / B / C | 수강자의 주 학습 경로 기준 — 포털 클릭=A, 노트북 본문=B, md 본문+검증 노트북=C |
| 랩 단위·챕터 구조 | 랩 단위: / 분할형 랩: | 기본 단일 문서형, 분할 조건 충족 랩만 지정 — 선택은 저자, 실행은 AI |
| 추출 의존성 | dependency_paths: / 외부: | 서브폴더 추출 시 — 저장소 내 의존은 포함, 외부 자원은 기록만 |
| 배치 레이아웃 (선택) | root / labs | 미기입 시 자동 판정 — 최상위에 학습 경로 외 실행 코드(src, tests)가 있으면 labs, 없으면 root. 컨테이너명은 labs/ 통일 |
| 경로 매핑 (선택) | path_map: | 재현 가능한 개명이 필요하면 기존→표준 경로 명시. 미기입 시 AI가 매핑안을 변경 요약에 제시 |
| execution | codespaces / local / portal | A형만 portal 단독 허용 |
| 혼합 실행·환경 예외 검토 | 주 학습 경로: / 제약: / 대체 검증: / 보류 사유: | Markdown+포털·CLI·로컬 조합은 실행 환경을 별도 기록. 유형 불일치와 포털 전용 A형 외 Codespaces 면제 기준은 미확정이므로 보류 |
| 현재 라이선스 → 전환 | license_policy.current: / code: preserve 또는 MIT / docs: preserve 또는 CC-BY-SA-4.0 | 파일뿐 아니라 README 고지와 기존 적용 범위 확인·보존. 기존 MIT 문서의 CC BY-SA 적용도 필요한 동의 확인 |
| 라이선스 적용 범위 | license_policy.scope: | 코드·문서·이미지 경로, 권리자와 제외 자료 기록 |
| history 방침 | history_policy: preserve / squash | **보안 점검에서 이력 노출 발견 시 스쿼시 강제** (Phase 2), 중단 후 변경 계획 재확인 |
| 보안 점검 결과 | 현재 파일: / 전체 이력: / 오탐 근거: / 미실행: | 실노출 시 중단. 이력 실노출이면 스쿼시 확정, 자격 증명 폐기·재발급 별도. 현재 파일만 검사한 결과를 이력 통과로 표시하지 않음 |
| 내부 산출물 처리 | 제외 경로: | 계획서·실험 결과물·실행 로그·임시 스크립트는 제외 권고 |
| 사전 재검증 | 불필요 / 필요(사유: ) | 장기 미커밋 또는 preview SDK 의존이면 필요 |
| 라이선스 전환 동의 | license_policy.consent: completed / not-required, consent_basis: | 동의 완료 근거 또는 기존 조건을 변경하지 않아 불필요한 근거. 파일 부재·1인 저작만으로 해당 없음으로 처리하지 않음 |
| 거버넌스 파일 추가 계획 | 기존 경로: / 누락·추가 경로: / 문안 적용 승인: / 보류: | LICENSE/LICENCE 변형과 루트·.github·docs 확인. 기존 파일 보존, 업데이트·라이선스 전환 별도 승인 |
| 기여·지원 정책 | Issues: / PR 대상·브랜치: / 보안·행동 강령 적용: / CLA: / 도움 채널·지원 범위: | 실제 설정과 정책 확인. 미확정 값을 추정하지 않으며 공개 준비 보류 |
| 변환 계획 승인 | plan_approved: true / false | 실제 저자 승인이 있을 때만 true. 입력값 기입·결정 확정과 계획 승인은 별개이며 게시 승인도 별도 |
| E2E 검증 완료일 | (Phase 6-4에서 기입) | 사람이 최종 콘텐츠를 선언한 환경에서 완주한 날짜를 `validated_on`에 기록. 사전 실행은 최종 콘텐츠와 검증 범위가 같은지 확인 |

## 기입 예시 — 가상 리포 기준

명명 규약을 이미 지키고 있고 유지보수가 활발한 C형 리포를 가정한 예시입니다.

| 항목 | 값 | 비고 |
|---|---|---|
| 구 리포 | github.com/<저자>/foundry-rag-workshop | 단일 워크샵, 최근까지 커밋 지속 |
| 이관 범위 | migration_scope: full, source_path: "." | 리포 자체가 워크샵 하나 |
| 작업 폴더 | work_folder: "<저자가 승인한 로컬 작업본 절대 경로>" | 가상 예시의 placeholder이며 실제 실행 전 실제 경로로 확정 |
| 새 리포명 | foundry-rag-workshop-kr | 규약 6-1-1 적용 |
| 공동 오너 | 저자 + Kichul Kim | 팀 카탈로그 담당자 |
| 콘텐츠 유형 | C | md 가이드 본문 + 검증용 노트북 |
| 랩 단위·챕터 구조 | 폴더=랩, 전 랩 단일 문서형 | 분할 필요 랩 없음 |
| 추출 의존성 | 해당 없음 | 전체 이관 |
| 배치 레이아웃 (선택) | 미기입 → labs 자동 판정 | 최상위에 실행 코드 존재 가정 |
| 경로 매핑 (선택) | 미기입 | 이미 표준 명명, 개명 불필요 |
| execution | codespaces, local | devcontainer는 Phase 4에서 추가 |
| 현재 라이선스 → 전환 | current: README MIT 고지 / code: MIT / docs: CC-BY-SA-4.0 | 기존 고지와 코드·문서 적용 범위 확인·보존. 확인한 권리자 고지로 MIT 파일 보완, 승인한 문서 범위에만 CC BY-SA 적용 |
| 라이선스 적용 범위 | scope: 코드 src/와 문서 labs/·README.md, 확인한 저자 권리자 고지, 외부 자료는 기존 라이선스 유지 | 가상 예시에서 권리자·적용 범위·외부 자료를 확인했다고 가정 |
| history 방침 | history_policy: preserve (저자 선택) | 전체 이력 보안 점검 통과가 전제 |
| 보안 점검 결과 | working tree 사전 스캔 통과 | 이력 전체 gitleaks는 이관 시 재실행 |
| 내부 산출물 처리 | 제외: `docs/internal/` | 작업 계획 문서, 수강자 불필요 |
| 사전 재검증 | 불필요 | 유지보수 활발 |
| 라이선스 전환 동의 | consent: completed / consent_basis: 문서 CC BY-SA 적용에 필요한 저자 동의 완료 | 가상 예시에서 필요한 동의를 받았다고 가정. 1인 저작·파일 부재가 동의 불필요의 근거는 아님 |
| 변환 계획 승인 | plan_approved: false | 가상 예시는 실제 승인 증거가 아니며, 실제 값과 계획을 저자가 승인한 뒤에만 true |
| E2E 검증 완료일 | — | Phase 6-4에서 사람이 최종 콘텐츠를 완주한 뒤 기록 |

이 예시처럼 명명 규약을 이미 지키는 리포는 경로 개편 작업이 거의 없어, Phase 4의 실제 작업이 frontmatter 추가, devcontainer 추가, AGENTS.md 배치, 거버넌스 파일 6종(LICENSE·LICENSE-DOCS·SECURITY·CODE_OF_CONDUCT·SUPPORT·CONTRIBUTING) 확인과 승인한 누락 파일 추가, 노트북 출력 클리어, 내부 산출물 제거로 좁혀집니다. 거버넌스 문안의 적용 조건과 실제 기여·지원 설정은 별도로 확인합니다.
