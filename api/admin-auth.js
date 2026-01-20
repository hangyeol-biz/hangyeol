export default function handler(req, res) {
  // CORS 헤더 설정
  const allowedOrigins = [
    'https://biz-hangyeol.co.kr',
    'https://www.biz-hangyeol.co.kr',
    'https://admin.biz-hangyeol.co.kr'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // OPTIONS 요청 처리 (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  // 환경변수에서 비밀번호 가져오기 (없으면 기본값 사용)
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (password === ADMIN_PASSWORD) {
    // 인증 성공 - 쿠키 설정 (7일 유효)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();

    res.setHeader('Set-Cookie', [
      `admin_auth=authenticated; Path=/; Domain=.biz-hangyeol.co.kr; HttpOnly; SameSite=Lax; Expires=${expires}`,
    ]);

    return res.status(200).json({ success: true });
  }

  // 인증 실패
  return res.status(401).json({ success: false, error: 'Invalid password' });
}
