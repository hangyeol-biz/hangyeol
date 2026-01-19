# 한결 컨설팅 리팩토링 - Claude 팀 작업 요청문

## 공통 정보

**프로젝트 경로**: `F:\pola_homepage\8.20th_kimhyungoo_hangyeol`
**PRD 문서**: `PRD-REFACTORING.md` 참조

### 교체 규칙
- `keai-` → `hangyeol-`
- `KEAI` → `HANGYEOL` 또는 `한결 컨설팅`
- `한국기업심사원` → `한결 컨설팅`
- `k-eai.kr` → `biz-hangyeol.co.kr`

### 주의사항
- CSS와 HTML의 클래스명은 반드시 동시에 변경
- 작업 완료 후 `grep -r "keai" [작업파일]` 로 잔재 확인
- Git 커밋하지 말고 작업만 완료

---

## Claude 1 - CSS 전체 + HTML 메인 페이지

### 요청문 (복사용)
```
한결 컨설팅 홈페이지 리팩토링 작업 - Claude 1 담당

프로젝트: F:\pola_homepage\8.20th_kimhyungoo_hangyeol
PRD: PRD-REFACTORING.md 참조

## 담당 작업

### 1단계: CSS 클래스명 전체 교체 (최우선)
파일: public/css/styles.css
- 모든 `.keai-` → `.hangyeol-` 교체
- 약 415개 클래스 예상

### 2단계: HTML 메인 페이지 (3개)
파일:
- public/index.html (314개)
- public/company.html (205개)
- public/fund.html (413개)

작업 내용:
1. class="keai-*" → class="hangyeol-*" 교체
2. id="keai-*" → id="hangyeol-*" 교체
3. 텍스트 "KEAI", "한국기업심사원" → "한결 컨설팅" 교체
4. 도메인 "k-eai.kr" → "biz-hangyeol.co.kr" 교체

## 교체 규칙
- keai- → hangyeol-
- KEAI → 한결 컨설팅 (또는 HANGYEOL)
- 한국기업심사원 → 한결 컨설팅
- k-eai.kr → biz-hangyeol.co.kr

## 검증
작업 완료 후 실행:
grep -r "keai" public/css/styles.css
grep -r "keai" public/index.html
grep -r "keai" public/company.html
grep -r "keai" public/fund.html

결과가 0건이어야 함.

## 주의
- Git 커밋하지 말 것 (통합 후 일괄 커밋)
- CSS 먼저 완료 후 HTML 작업 진행
```

---

## Claude 2 - HTML 서브 페이지

### 요청문 (복사용)
```
한결 컨설팅 홈페이지 리팩토링 작업 - Claude 2 담당

프로젝트: F:\pola_homepage\8.20th_kimhyungoo_hangyeol
PRD: PRD-REFACTORING.md 참조

## 담당 작업

### HTML 서브 페이지 (6개)
파일:
- public/process.html (256개)
- public/pro.html (222개)
- public/mkt.html (112개)
- public/post.html (112개)
- public/board.html (82개)
- public/privacy.html

작업 내용:
1. class="keai-*" → class="hangyeol-*" 교체
2. id="keai-*" → id="hangyeol-*" 교체
3. 텍스트 "KEAI", "한국기업심사원" → "한결 컨설팅" 교체
4. 도메인 "k-eai.kr" → "biz-hangyeol.co.kr" 교체

## 교체 규칙
- keai- → hangyeol-
- KEAI → 한결 컨설팅 (또는 HANGYEOL)
- 한국기업심사원 → 한결 컨설팅
- k-eai.kr → biz-hangyeol.co.kr

## 검증
작업 완료 후 실행:
grep -r "keai" public/process.html
grep -r "keai" public/pro.html
grep -r "keai" public/mkt.html
grep -r "keai" public/post.html
grep -r "keai" public/board.html
grep -r "keai" public/privacy.html

결과가 0건이어야 함.

## 주의
- Git 커밋하지 말 것 (통합 후 일괄 커밋)
- Claude 1이 CSS 작업 완료 후 진행 권장 (클래스명 동기화)
```

---

## Claude 3 - JS/API/Dashboard

### 요청문 (복사용)
```
한결 컨설팅 홈페이지 리팩토링 작업 - Claude 3 담당

프로젝트: F:\pola_homepage\8.20th_kimhyungoo_hangyeol
PRD: PRD-REFACTORING.md 참조

## 담당 작업

### 1. JavaScript 파일 (5개)
파일:
- public/js/main.js (32개)
- public/js/components.js
- public/js/config.js
- public/js/analytics.js
- public/js/settings.js
- public/js/image-loader.js

작업 내용:
1. 클래스 셀렉터 교체: '.keai-' → '.hangyeol-'
2. ID 셀렉터 교체: '#keai-' → '#hangyeol-'
3. 문자열 'KEAI' → '한결' 또는 'HANGYEOL'

### 2. Dashboard 파일 (8개)
폴더: public/dashboard/
파일:
- index.html, board.html, analytics.html
- images.html, leads.html, popups.html
- post-edit.html, settings.html

### 3. 기타 파일
- public/llms.txt
- public/docs/*.html
- public/admin-login.html

## 교체 규칙
- keai- → hangyeol-
- KEAI → 한결 컨설팅 (또는 HANGYEOL)
- 한국기업심사원 → 한결 컨설팅
- k-eai.kr → biz-hangyeol.co.kr

## 검증
작업 완료 후 실행:
grep -r "keai" public/js/
grep -r "keai" public/dashboard/
grep -r "keai" public/docs/
grep -r "keai" public/llms.txt
grep -r "keai" public/admin-login.html

결과가 0건이어야 함.

## 주의
- Git 커밋하지 말 것 (통합 후 일괄 커밋)
- config.js의 브랜드 정보 확인 (이미 한결로 변경됨)
```

---

## 작업 순서

```
1. Claude 1: CSS 먼저 완료 (클래스명 정의)
      ↓
2. Claude 1, 2, 3: 병렬 작업
   - Claude 1: HTML 메인
   - Claude 2: HTML 서브
   - Claude 3: JS/Dashboard
      ↓
3. 통합 검증
   grep -r "keai" public/
   grep -r "KEAI" public/
   grep -r "한국기업심사원" public/
      ↓
4. 브라우저 테스트
      ↓
5. Git 커밋 & 배포
```

---

## 통합 검증 명령어

```bash
# 전체 검증 (0건이어야 함)
grep -ri "keai" public/
grep -ri "한국기업심사원" public/
grep -ri "k-eai\.kr" public/

# 새 클래스명 확인 (있어야 함)
grep -c "hangyeol-" public/css/styles.css
grep -c "hangyeol-" public/index.html
```

---

## 최종 커밋 메시지

```
리팩토링: KEAI → 한결 컨설팅 브랜드 전환

- 클래스명 교체: keai- → hangyeol- (3,108개)
- 텍스트 교체: KEAI, 한국기업심사원 → 한결 컨설팅
- 도메인 교체: k-eai.kr → biz-hangyeol.co.kr
- CSS, HTML, JS, Dashboard 전체 업데이트

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```
