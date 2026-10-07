# Skill ZIP 빌드와 배포

이 문서는 배포 담당자용입니다. 사용자는 [설치 가이드](skill-guide.md)에 따라 배포 ZIP URL을 `npx skills add`에 지정하거나 ZIP을 내려받아 수동 설치합니다. 저장소를 직접 clone하거나 빌드할 필요는 없습니다.

## 빌드와 검증

표준 저장소의 배포할 커밋을 준비합니다. Node.js 22 이상과 Git이 필요하며, `package.json`이 있는 저장소 최상위 폴더에서 실행합니다.

```powershell
npm ci
npm test
npm run validate
npm run build:skill
```

각 명령이 성공한 뒤 다음 명령으로 넘어갑니다. `npm run build:skill`은 참고 자료를 포함한 폴더와 `local-only\skill-dist\workshop-standardization.zip`을 생성합니다. 생성물은 Git에서 제외되며 소스에 커밋하지 않습니다.

ZIP에는 `workshop-standardization` 폴더 하나가 있고 그 안에 SKILL.md·assets·references·LICENSE.md·manifest.json을 넣습니다. 허용 목록에 있는 파일만 포함하며, 출력 폴더에 예상하지 못한 파일이 있으면 빌드를 중단합니다.

테스트는 ZIP을 해제해 정확한 파일 목록·바이트·해시·상대 링크와 폴더 구조를 확인합니다. 실제 에이전트 호출, 워크샵 E2E나 조직 공개 심사를 대신하지 않습니다.

## GitHub Releases 게시

검증한 소스 커밋을 저장소에 반영한 뒤 그 커밋으로 빌드합니다. GitHub Releases에서 새 배포를 만들고, 해당 커밋을 가리키는 고유 태그를 지정해 ZIP을 Assets에 첨부합니다. 표준이 초안인 동안에는 제목과 설명에 미리 보기 상태를 명시하고 **pre-release**로 게시합니다.

첫 배포의 태그는 `workshop-skill-v0.1.0-preview.1`, asset 이름은 `workshop-standardization.zip`입니다. 새 배포에는 새 태그를 사용하며 기존 배포 파일을 바꾸지 않습니다. 배포 설명에 포함 범위, 검증 결과와 아직 수행하지 않은 검증을 기록합니다.

배포 후 ZIP을 실제로 내려받아 로컬 산출물과 SHA-256이 같은지 확인합니다. 설치 가이드의 CLI 명령에 들어 있는 ZIP URL과 수동 다운로드·배포 페이지 링크를 새 버전으로 함께 갱신합니다. HTML 안내서에서 최신 문서가 열리도록 Pages를 다시 게시합니다.

GitHub의 자동 `Source code (zip)`은 설치용 번들이 아닙니다. 사용자에게는 Assets의 `workshop-standardization.zip`을 안내하세요.

## 문서와 번들 관리

원본 skill은 [SKILL.md](../.github/skills/workshop-standardization/SKILL.md), 참고 문서는 이 저장소의 Markdown을 기준으로 관리합니다. [빌드 스크립트](../scripts/build-skill.mjs)가 외부 상대 링크를 번들 내부 링크로 바꾸므로 원본 skill 폴더만 압축하지 않습니다.

ZIP은 빌드 시점의 파일을 묶은 자료입니다. 배포 소스에 미커밋 변경이 없는지 확인하고, 실제 결정 시트·실행 로그·시크릿·내부 식별자를 포함하지 않습니다. ZIP과 GitHub Pages의 게시 권한·승인은 별도로 확인합니다.
