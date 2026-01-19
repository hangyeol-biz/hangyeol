# PRD: 한결비즈니스 홈페이지

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 한결비즈니스 홈페이지 |
| 브랜드명 | 한결 (HANGYEOL CONSULTING) |
| 로컬 경로 | `F:\pola_homepage\8.20th_kimhyungoo_hangyeol` |
| 작성일 | 2025-01-16 |

---

## 연결환경

### 배포 및 저장소

| 서비스 | URL |
|--------|-----|
| **GitHub** | https://github.com/hangyeol-biz/hangyeol |
| **Vercel** | https://vercel.com/hangyeols-projects-f88eba8a/hangyeol |
| **홈페이지** | https://biz-hangyeol.co.kr |
| **Worker** | https://hangyeol.khg471.workers.dev |
| **R2 Public** | https://pub-e4b5b5d1dd6444d0bcea69a72ac64a2e.r2.dev |

### 외부 서비스

| 서비스 | ID/URL |
|--------|--------|
| **Airtable Base** | `appMkaHfMP4ZGxcPw` |
| **Airtable Table** | `tblv1hdnYYIeU1V5h` |
| **Telegram Chat** | `-1003699023763` |
| **Cloudflare Account** | `1886ec3623cea58c2f9df4b57199f86d` |
| **R2 Bucket** | `hangyeol` |

### Git 명령어

```bash
# SSH 푸시
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_hangyeol" git push origin main

# Vercel 배포 (hangyeol 프로젝트로 연결됨)
vercel --prod --token $VERCEL_TOKEN

# Worker 배포
CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" npx wrangler deploy
```

> 모든 토큰/키는 `.env.local` 파일에 저장됨 (Git 제외)

### ⚠️ 배포 주의사항

| 항목 | 설명 |
|------|------|
| **배포 폴더** | `public/` 폴더가 실제 배포됨 |
| **HTML 수정 시** | 루트 HTML 수정 후 **반드시 `public/` 폴더로 복사** 필요 |
| **복사 명령어** | `cp index.html company.html fund.html mkt.html post.html pro.html process.html privacy.html public/` |
| **추가 파일** | `public/board.html`은 별도 수정 필요 (루트에 없음) |
| **Vercel 프로젝트** | `hangyeols-projects-f88eba8a/hangyeol` (자동 연결됨) |

---

## ⚠️ 중요 경고 - 환경 분리 필수

### 절대 사용 금지 항목

> **이 프로젝트는 `F:\bas_homepage\33.leeganghee` (한국기업심사원/KEAI) 프로젝트를 복사하여 생성되었습니다.**
>
> **기존 KEAI 프로젝트의 모든 연결 환경을 사용하면 안 됩니다!**

| 서비스 | KEAI (절대 사용 금지) | 한결비즈니스 (새로 설정 필요) |
|--------|----------------------|------------------------------|
| Airtable Base | ❌ appYxrGK0yOZ8YdIG | ✅ 새 Base 생성 필요 |
| Airtable Token | ❌ patLrqsWWAheA6dVc... | ✅ 새 토큰 생성 필요 |
| Telegram Bot | ❌ 8053531001:AAHs... | ✅ 새 봇/채널 설정 필요 |
| Telegram Chat ID | ❌ -1003366455717 | ✅ 새 채팅방 설정 필요 |
| Cloudflare Worker | ❌ keai.lkh1000712.workers.dev | ✅ 새 Worker 생성 필요 |
| Cloudflare R2 | ❌ pub-614b08f38e094d04a78e718d3e8e811b | ✅ 새 버킷 생성 필요 |
| Vercel 프로젝트 | ❌ keai-three.vercel.app | ✅ 새 프로젝트 생성 필요 |
| GitHub 레포 | ❌ lkh1000712-create/keai | ✅ 새 레포 생성 필요 |

### 체크리스트 (배포 전 필수 확인)

- [x] Airtable: 새 Base 생성 및 토큰 발급 ✅
- [x] Telegram: 새 봇/채널 설정 완료 ✅
- [x] Cloudflare: 새 Worker 및 R2 버킷 생성 ✅
- [x] Vercel: 새 프로젝트 생성 ✅
- [x] GitHub: 새 레포지토리 생성 ✅
- [x] 모든 환경변수: `.env.local`에 새 값으로 설정 ✅

---

## 목표

HTML/CSS/JS 기반 홈페이지 구축 (한결비즈니스 브랜드에 맞춤)

---

## 브랜드 정보

### 기본 정보

| 항목 | 내용 |
|------|------|
| 상호명 | 한결 |
| 대표자 | 김현구 |
| 대표번호 | 1688-7483 |
| 휴대폰 | 010-4532-6750 |
| 이메일 | khg471@naver.com |
| 주소 | 경상북도 구미시 옥계북로 36, 802호 Room 5 (옥계동, 메디칼타워) |
| 사업자등록번호 | 252-18-02813 |
| 홈페이지 도메인 | biz-hangyeol.co.kr |

### 컬러 팔레트

```css
/* Primary - Navy Blue (메인 브랜드 컬러) */
--color-primary: #1E3A5F;
--color-primary-dark: #152B47;
--color-primary-light: #2A4A73;

/* Secondary - Royal Blue (강조/액센트) */
--color-secondary: #2563EB;
--color-secondary-dark: #1D4ED8;
--color-secondary-light: #3B82F6;

/* Gradient */
--gradient-primary: linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%);
--gradient-dark: linear-gradient(135deg, #152B47 0%, #1E3A5F 100%);

/* Background */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F8FAFC;
--color-bg-tertiary: #F1F5F9;

/* Text */
--color-text-primary: #1E293B;
--color-text-secondary: #64748B;
--color-text-muted: #94A3B8;
```

> 상세 컬러 가이드: `color-palette.html` 참조

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Styling | Tailwind CSS |
| Backend | Cloudflare Workers (새로 생성) |
| Database | Airtable (새 Base 생성) |
| Hosting | Vercel (새 프로젝트) |
| Storage | Cloudflare R2 (새 버킷) |
| Version Control | GitHub (새 레포) |

---

## 개발 단계

### Phase 1: 환경 설정
- [ ] 새 GitHub 레포지토리 생성
- [ ] 새 Vercel 프로젝트 생성
- [ ] 새 Airtable Base 생성
- [ ] 새 Cloudflare Worker 생성
- [ ] 새 R2 버킷 생성
- [ ] `.env.local` 환경변수 설정

### Phase 2: 브랜드 커스터마이징
- [ ] 컬러 팔레트 적용
- [ ] 로고 교체
- [ ] 브랜드 정보 반영
- [ ] 콘텐츠 수정

### Phase 3: 기능 연동
- [ ] 문의 폼 Worker 연동
- [ ] Airtable 연동
- [ ] 텔레그램 알림 연동

### Phase 4: 배포 및 테스트
- [ ] Vercel 배포
- [ ] 폼 테스트
- [ ] 반응형 테스트

---

## 환경변수 목록

`.env.local` 파일에 설정 (새로 발급 필요)

```env
# Airtable (새로 생성)
AIRTABLE_TOKEN=pat새토큰
AIRTABLE_BASE_ID=app새베이스ID

# Telegram (새로 설정)
TELEGRAM_BOT_TOKEN=새봇토큰
TELEGRAM_CHAT_ID=새채팅ID

# Cloudflare (새로 생성)
CLOUDFLARE_API_TOKEN=새API토큰
CLOUDFLARE_ACCOUNT_ID=새계정ID

# R2 (새로 생성)
R2_BUCKET_NAME=새버킷명
R2_ACCESS_KEY_ID=새액세스키
R2_SECRET_ACCESS_KEY=새시크릿키
R2_PUBLIC_URL=새퍼블릭URL

# Vercel (새로 설정)
VERCEL_TOKEN=새토큰

# Admin
ADMIN_PASSWORD=새비밀번호
```

---

## 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 0.1 | 2025-01-16 | PRD 초안 작성 (프로젝트 복사 및 환경 분리 명시) |
