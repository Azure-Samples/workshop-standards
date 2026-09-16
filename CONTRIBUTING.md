# 변경 제안과 검토

이 저장소는 워크샵의 표준과 적용 자료를 관리합니다. 개별 실습의 오류는 해당 워크샵 저장소에 제안합니다.

## Contributor License Agreement

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit [Contributor License Agreements](https://cla.opensource.microsoft.com).

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the
instructions provided by the bot. You will only need to do this once across all repos using our CLA.

## 행동 강령

이 프로젝트는 [Microsoft Open Source Code of Conduct](.github/CODE_OF_CONDUCT.md)를 따릅니다. 기여하기 전에 행동 강령을 확인합니다.

## 이슈와 기능 제안

기존 [이슈](https://github.com/Azure-Samples/azure-workshops-korea/issues)와 [PR](https://github.com/Azure-Samples/azure-workshops-korea/pulls)을 먼저 확인합니다. 문서 오류는 위치와 재현 조건을, 새로운 기능이나 표준 변경은 목적과 영향 범위를 작성합니다. 큰 변경은 구현 전에 이슈로 제안하고 담당자와 범위를 합의합니다.

## 변경 범위

표준을 바꿀 때는 기존 규칙, 변경 이유, 영향을 받는 콘텐츠 유형, 기존 워크샵에 필요한 조치를 기록합니다. 아직 결정되지 않은 내용은 초안이나 검토 항목으로 표시하며, 문서 정리만으로 승인된 규칙으로 바꾸지 않습니다.

규칙 변경은 [표준 문서](docs/standards.md)를 먼저 수정하고, 영향을 받는 [상세 가이드](docs/migration-guide.md)·[AI 지시문](prompts/migration.md)·[결정 양식](template/decision-sheet.md)을 같은 PR에서 갱신합니다. [HTML 안내서](workshop-migration-howto.html)에는 전체 흐름과 빠른 시작을 유지하며 상세 명령을 중복해서 넣지 않습니다.

## 검증

Node.js 22 이상과 Git을 준비한 뒤 다음 명령을 실행합니다.

```bash
npm ci
npm test
npm run validate
```

HTML이나 Pages 빌드를 수정했다면 데스크톱·모바일 화면에서 목차와 링크를 확인합니다. Pages artifact에는 HTML 안내서만 포함해야 합니다. 상세 Markdown 링크는 배포 커밋의 GitHub 파일 화면으로 연결합니다.

검증기는 공유 경로를 명시적으로 제한합니다. 새로운 최상위 경로를 추가하면 검증기의 공개 대상 목록과 테스트를 함께 검토합니다. `dry-run/`이나 실제 실행 기록을 검사에 포함시키기 위해 제외 규칙을 해제하지 않습니다.

외부 URL의 접근성, 조직의 게시 승인, 워크샵 E2E 실행과 시크릿 검사는 문서 링크 검사를 통과했다고 완료되는 항목이 아닙니다. 공개 전에는 게시할 파일과 Git 이력을 별도로 점검합니다.

## PR 검토

변경 목적과 범위, 검증 결과, 남은 판단 항목을 PR에 기록합니다. 표준·라이선스·콘텐츠 삭제·이력 변경은 담당자의 확인 없이 확정하지 않습니다. 스크린샷이나 로그에 키·토큰·실제 고객 데이터·내부 심사 식별자를 포함하지 않습니다.

실제 결정 시트와 실행 기록은 `local-only/` 또는 `dry-run/`에 보관합니다. Git 추적 여부도 확인하며, `.gitignore`가 과거 커밋까지 제거한다고 가정하지 않습니다.

표준 버전을 배포할 때는 별도 승인 후 태그와 변경 이력을 남깁니다. 현재 `package.json` 버전은 검증 도구용이며, 표준 v1.0 승인을 의미하지 않습니다.