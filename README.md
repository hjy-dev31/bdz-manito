# 불도저 마니또 상점

Node.js 20 이상에서 `node local.mjs` 실행 후 http://127.0.0.1:4173 에 접속합니다. 참가자는 프로젝트 루트의 UTF-8 participants.csv에서 관리합니다. 첫 행은 `번호,이름,비밀번호,미션,대상번호`이며 번호의 앞자리 0도 구분합니다. 실제 명단은 Git에서 제외됩니다.

## 공개 배포

1. Cloudflare Workers Free에서 모듈 Worker를 만들고 worker.mjs 내용을 배포합니다.
2. Worker 설정에서 Secret 유형의 PARTICIPANTS_CSV에 헤더를 포함한 CSV 전체를 붙여 넣습니다(최대 5 KB). SITE_ORIGIN 텍스트 변수에는 GitHub Pages의 출처(예: https://example.github.io)를 지정합니다.
3. login.js의 workerUrl에 배포된 Worker의 HTTPS URL을 입력합니다.
4. GitHub 공개 저장소에 소스를 커밋하고 Settings → Pages에서 main 브랜치의 /(root)를 선택합니다. 명단은 GitHub 또는 정적 호스팅에 업로드하지 마세요.

입장 시 서버가 세 입력값을 같은 행과 대조합니다. 대상번호는 내가 챙길 참가자의 번호입니다. 은박을 긁으면 배정된 대상의 이름과 미션이 나타납니다.
