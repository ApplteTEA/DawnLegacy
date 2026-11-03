# 기술 구조 및 개발 인계

기준: 2026-11-03 필드 재구축 코드 및 브라우저 검증.

## 웹 실행 흐름
1. index.html: Canvas, HUD, 방향키/액션 UI, 에셋 로딩 상태.
2. bootstrap.js: field-manifest.js → field-actors.js → world-v2.js → game.js 순차 로드.
3. field-manifest.js: 로컬 PNG 경로, 프레임 크기/개수, 발 기준점, 원본 출처/크레딧.
4. field-actors.js: 승인된 이동 한 칸을 140ms로 보간. 동행은 주인공의 직전 경로 꼭짓점으로 이동하며 자신의 이동 벡터로 방향 결정. 발 y 기준 정렬 후 PNG만 그림. 캐릭터 도형 대체 없음.
5. world-v2.js: 기존 필드 타일/건물/수목과 카메라. 캐릭터 그리기는 FIELD_ACTORS에 위임.
6. game.js: 기존 충돌/인카운터/전투/진행 로직을 유지하고 이동 성공 후 FIELD_ACTORS.move 호출. 빠른 입력은 보간 중 제한하여 경로 유실 방지.
7. assets/field/: 인물 5종, 포켓몬 84종, 그림자, manifest.json, 원본 및 라이선스. 필드의 외부 이미지 요청 없음. 기존 배틀 이미지 외부 로딩은 유지.

## 저장 호환
- 키 dawnLegacyCompleteV2 / 기존 version 유지.
- fieldFollower: x, y, face를 추가 저장. 구형 followerTrail은 인접·충돌 검사 후 이관하고 없으면 안전한 인접 칸에서 시작.
- 보간 시간/이미지 캐시는 런타임 전용. 재로드는 마지막 논리 타일에서 시작.

## 검증/배포
- GitHub Pages push(main) 파이프라인에 JS 문법 및 경로 단위 검사 추가.
- tools/import-field-assets.py: 커밋 고정 원본을 로컬 아틀라스로 변환.
- tools/validate-field-assets.py: Pillow 기반 전종/전방향 검사.
- tests/mobile.html: 격리된 미리보기 원점에서만 테스트 세이브를 사용하는 390×844 실제 게임 iframe.

## 설계 원칙
- 렌더링, 게임 상태, 이벤트 진행, 데이터 정의를 가능한 한 분리
- 방향 상태와 이동 프레임은 데이터로 전달하고, 렌더러는 정해진 스프라이트를 그림
- 포켓몬 종류별 필드 스프라이트는 명시적 에셋 매핑 및 오류 처리를 사용
- 라이벌 스타팅은 **최초 생성 시 결정하고 세이브에 보존**. 로딩 때 재추첨 금지
- 이벤트 진행 플래그는 중복 실행되지 않도록 저장
- 저장 구조를 바꿀 때 구버전 세이브 마이그레이션 제공
- 모바일 Canvas 해상도/스케일/픽셀 보간을 일관되게 처리

## 아직 확인할 것
- Android/iOS 실기기 터치 및 WebView 표시.
- 전종 개별 육안 확인, 이로치 필드 팔레트 추가, 전체 포획/진화/진행 회귀.
- 라이벌 및 새 스토리는 아직 기획이며 이번 변경에 포함하지 않음.
