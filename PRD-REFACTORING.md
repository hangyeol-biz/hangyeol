# 한결 컨설팅 홈페이지 리팩토링 PRD

## 프로젝트 개요

**목표**: 기존 KEAI(한국기업심사원) 프로젝트 기반 홈페이지를 한결 컨설팅 브랜드로 완전히 전환

**현황 분석**:
- KEAI 관련 클래스명: 3,108개
- `class="keai-"` 패턴: 1,716개
- "한국기업심사원" 텍스트: 7개
- 영향 파일: 25개+

---

## 브랜드 정보

| 항목 | 기존 (KEAI) | 변경 (한결) |
|------|-------------|-------------|
| 상호명 | KEAI / 한국기업심사원 | 한결 / 한결 컨설팅 |
| 영문명 | KEAI | HANGYEOL |
| 클래스 접두사 | `keai-` | `hangyeol-` |
| 도메인 | k-eai.kr | biz-hangyeol.co.kr |
| 대표자 | - | 김현구 |
| 대표번호 | - | 1688-7483 |
| 이메일 | - | khg471@naver.com |
| 주소 | - | 경상북도 구미시 옥계북로 36, 802호 Room 5 |

---

## 작업 범위

### 1. 클래스명 교체 (전체)
```
keai- → hangyeol-
KEAI → HANGYEOL
```

### 2. 콘텐츠 교체
- 회사명: KEAI, 한국기업심사원 → 한결, 한결 컨설팅
- 도메인: k-eai.kr → biz-hangyeol.co.kr
- 연락처, 주소, 사업자정보 업데이트

### 3. API/설정 파일 정리
- js/config.js 브랜드 정보
- api/*.js 파일 내 하드코딩된 값
- sitemap.xml, robots.txt 도메인

---

## 파일별 작업 목록

### HTML 메인 페이지 (Claude 1 담당)
| 파일 | 클래스 수 | 콘텐츠 교체 | 우선순위 |
|------|----------|-------------|----------|
| index.html | 314 | 필요 | 높음 |
| company.html | 205 | 필요 | 높음 |
| fund.html | 413 | 필요 | 높음 |

### HTML 서브 페이지 (Claude 2 담당)
| 파일 | 클래스 수 | 콘텐츠 교체 | 우선순위 |
|------|----------|-------------|----------|
| process.html | 256 | 필요 | 높음 |
| pro.html | 222 | 필요 | 높음 |
| mkt.html | 112 | 필요 | 중간 |
| post.html | 112 | 필요 | 중간 |
| board.html | 82 | 필요 | 중간 |
| privacy.html | - | 필요 | 낮음 |

### CSS/JS/API 파일 (Claude 3 담당)
| 파일 | 작업 내용 |
|------|----------|
| css/styles.css | 415개 클래스명 교체 |
| js/main.js | 32개 참조 교체 |
| js/components.js | 클래스명 교체 |
| js/config.js | 브랜드 정보 교체 |
| js/analytics.js | 참조 교체 |
| api/*.js | API 설정 교체 |
| dashboard/*.html | 대시보드 클래스 교체 |

---

## 교체 규칙

### 클래스명 교체
```
.keai-header → .hangyeol-header
.keai-footer → .hangyeol-footer
.keai-hero → .hangyeol-hero
.keai-section → .hangyeol-section
.keai-card → .hangyeol-card
.keai-btn → .hangyeol-btn
.keai-form → .hangyeol-form
.keai-logo → .hangyeol-logo
... (모든 keai- 접두사)
```

### 텍스트 교체
```
KEAI → 한결 컨설팅 (또는 HANGYEOL)
한국기업심사원 → 한결 컨설팅
k-eai.kr → biz-hangyeol.co.kr
www.k-eai.kr → www.biz-hangyeol.co.kr
```

### ID 교체
```
id="keai-*" → id="hangyeol-*"
```

---

## 검증 체크리스트

- [ ] `grep -r "keai" public/` 결과 0건
- [ ] `grep -r "KEAI" public/` 결과 0건
- [ ] `grep -r "한국기업심사원" public/` 결과 0건
- [ ] `grep -r "k-eai" public/` 결과 0건
- [ ] 모든 페이지 브라우저 렌더링 정상
- [ ] 모든 스타일 정상 적용
- [ ] 모든 JavaScript 기능 정상 동작
- [ ] 폼 제출 테스트 통과
- [ ] 모바일 반응형 테스트 통과

---

## 주의사항

1. **CSS-HTML 동기화 필수**: 클래스명 변경 시 CSS와 HTML 동시 변경
2. **JavaScript 셀렉터 확인**: querySelector, getElementById 등 확인
3. **백업**: 작업 전 현재 상태 Git 커밋
4. **단계적 배포**: 각 Claude 작업 완료 후 통합 테스트

---

## 일정

| 단계 | 작업 | 담당 |
|------|------|------|
| 1 | CSS 클래스명 교체 | Claude 3 |
| 2 | HTML 메인 페이지 | Claude 1 |
| 3 | HTML 서브 페이지 | Claude 2 |
| 4 | JS/API 파일 정리 | Claude 3 |
| 5 | 통합 테스트 | 전체 |
| 6 | 배포 | - |

---

**문서 버전**: 1.0
**작성일**: 2025-01-16
