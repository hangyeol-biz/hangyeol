// ========================================
// 한결 컨설팅 설정 파일 예시
// 이 파일을 복사하여 config.js로 저장 후 값 입력
// ========================================

const CONFIG = {
  // Cloudflare Workers API URL
  WORKER_URL: 'https://your-worker.workers.dev',

  // 브랜드 정보
  BRAND: {
    name: '한결 컨설팅',
    fullName: '한국기업심사원',
    copyright: '© 2025 한결 컨설팅. All rights reserved.'
  }
};

window.CONFIG = CONFIG;
