// ========================================
// 대시보드 인증 체크
// ========================================

(function() {
  // www 도메인으로 통일
  if (window.location.hostname === 'biz-hangyeol.co.kr') {
    window.location.href = 'https://www.biz-hangyeol.co.kr' + window.location.pathname + window.location.search;
    return;
  }

  // 쿠키에서 인증 상태 확인
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // 인증 체크
  function checkAuth() {
    const authCookie = getCookie('admin_auth');

    if (authCookie !== 'authenticated') {
      // 현재 페이지 경로 저장 (로그인 후 돌아오기 위해)
      const currentPath = window.location.pathname;
      const loginUrl = '/admin-login.html?redirect=' + encodeURIComponent(currentPath);

      // 로그인 페이지로 리다이렉트
      window.location.href = loginUrl;
      return false;
    }

    return true;
  }

  // 페이지 로드 시 즉시 실행
  if (!checkAuth()) {
    // 인증 실패 시 페이지 내용 숨김
    document.documentElement.style.display = 'none';
  }
})();
