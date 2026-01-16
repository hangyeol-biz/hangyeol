// ========================================
// 한결 컨설팅 설정 파일
// ========================================

const CONFIG = {
  // API Base URL
  API_BASE: '/api',

  // 관리자 비밀번호 (자동 인증용)
  ADMIN_PASSWORD: 'aa@@6562',

  // 브랜드 정보
  BRAND: {
    name: '한결',
    fullName: '한결 컨설팅',
    copyright: '© 2025 한결 컨설팅. All rights reserved.'
  }
};

// 전역 접근 가능하도록 export
window.CONFIG = CONFIG;
