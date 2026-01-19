// ================================================
// KEAI 한국기업심사원 - Meta 리드 알림 Worker
// 작성일: 2025-01-07
// 기능: Make에서 호출 → 텔레그램/이메일/SMS 발송
// ================================================

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    // 환경변수에서 설정 로드
    const CONFIG = {
      BRAND: {
        NAME: '한국기업심사원',
        CEO: '이강희',
        PHONE: '010-2888-6514',
        EMAIL: 'ceo@k-eai.kr'
      },
      EMAIL: {
        FROM: 'KEAI 한국기업심사원 <noreply@mail.policy-fund.online>',
        TO: env.STAFF_EMAIL || 'ceo@k-eai.kr',
        BCC: env.STAFF_BCC || 'mkt@polarad.co.kr'
      },
      RESEND: {
        API_KEY: env.RESEND_API_KEY
      },
      TELEGRAM: {
        BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
        CHAT_ID: env.TELEGRAM_CHAT_ID || '-1003366455717'
      },
      NAVER_SMS: {
        SERVICE_ID: env.NCP_SERVICE_ID || 'ncp:sms:kr:362578528555:keai',
        ACCESS_KEY: env.NCP_ACCESS_KEY,
        SECRET_KEY: env.NCP_SECRET_KEY,
        CALLING_NUMBER: env.SMS_FROM || '01028886514'
      },
      AIRTABLE_URL: env.AIRTABLE_SHARE_URL || 'https://airtable.com/appUzIaUBtV7YNlFp/shr6hwUcawFtwdymi'
    };

    try {
      const data = await request.json();
      console.log('📥 Meta Lead received:', data);

      const results = {
        success: true,
        telegram: { success: false, error: null },
        email: { staff: { success: false, error: null }, customer: { success: false, error: null } },
        sms: { success: false, error: null }
      };

      // 1. 텔레그램 알림 (내부)
      try {
        const telegramResult = await sendTelegramNotification(data, CONFIG);
        results.telegram = telegramResult;
      } catch (error) {
        results.telegram = { success: false, error: error.message };
      }

      // 2. 담당자 이메일 (내부)
      try {
        const staffEmailResult = await sendStaffEmail(data, CONFIG);
        results.email.staff = staffEmailResult;
      } catch (error) {
        results.email.staff = { success: false, error: error.message };
      }

      // 3. 고객 이메일 (이메일 필드가 있는 경우에만 발송)
      const customerEmail = data.이메일 || data.email || '';
      if (customerEmail && customerEmail.includes('@')) {
        try {
          const customerEmailResult = await sendCustomerEmail(data, customerEmail, CONFIG);
          results.email.customer = customerEmailResult;
        } catch (error) {
          results.email.customer = { success: false, error: error.message };
        }
      } else {
        results.email.customer = { success: true, skipped: true, reason: 'No customer email in Meta lead' };
      }

      // 4. SMS 발송 (고객)
      try {
        const smsResult = await sendNaverSMS(data, CONFIG);
        results.sms = smsResult;
      } catch (error) {
        results.sms = { success: false, error: error.message };
      }

      console.log('📊 Results:', results);
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('💥 Error:', error.message);
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// ================================================
// 텔레그램 알림 발송
// ================================================
async function sendTelegramNotification(data, CONFIG) {
  // 필드 매핑 (Make에서 전달되는 데이터 구조에 맞춤)
  const location = data.지역 || data.location || '-';
  const industry = data.업종 || data.industry || '-';
  const company = data.상호명 || data.company || '-';
  const name = data.이름 || data.name || '-';
  const phone = formatPhone(data.연락처 || data.phone || '-');
  const consultTime = data.상담희망시간 || data.consultTime || '-';
  const platform = data.플랫폼 || data.platform || 'Meta';
  const adName = data.광고명 || data.adName || '-';

  const currentTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const platformEmoji = platform.includes('인스타') ? '📷' : '👍';

  const message = `💰 <b>KEAI 한국기업심사원 - Meta 신규리드</b>
${platformEmoji} <b>${platform}</b>${adName !== '-' ? ' | ' + adName : ''}

<b>📋 기업정보</b>
├ 🏢 상호명: <b>${company}</b>
├ 🏭 업종: ${industry}
└ 📍 지역: ${location}

<b>👤 담당자</b>
├ 이름: ${name}
├ 📞 <code>${phone}</code>
└ ⏰ 상담희망: ${consultTime}

📊 <a href="${CONFIG.AIRTABLE_URL}">Airtable에서 확인</a>

⏰ ${currentTime}
📞 ${CONFIG.BRAND.PHONE}`;

  const response = await fetch(`https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CONFIG.TELEGRAM.CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });

  const result = await response.json();
  if (response.ok && result.ok) {
    return { success: true, messageId: result.result.message_id };
  } else {
    return { success: false, error: result.description || 'Telegram error' };
  }
}

// ================================================
// 담당자 이메일 발송
// ================================================
async function sendStaffEmail(data, CONFIG) {
  const location = data.지역 || data.location || '-';
  const industry = data.업종 || data.industry || '-';
  const company = data.상호명 || data.company || '-';
  const name = data.이름 || data.name || '-';
  const phone = formatPhone(data.연락처 || data.phone || '-');
  const consultTime = data.상담희망시간 || data.consultTime || '-';
  const platform = data.플랫폼 || data.platform || 'Meta';
  const adName = data.광고명 || data.adName || '-';

  const currentTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const platformEmoji = platform.includes('인스타') ? '📷' : '👍';

  const subject = `[한국기업심사원] Meta 신규 리드 - ${company} (${name})`;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Pretendard', -apple-system, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <div style="background: #3B82F6; padding: 30px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 700; white-space: nowrap;">KEAI 신규 무료 진단 신청</h1>
      <p style="margin: 8px 0 0 0; color: #BFDBFE; font-size: 14px;">${platform} 광고 접수${adName !== '-' ? ' - ' + adName : ''}</p>
    </div>
    <div style="padding: 20px;">
      <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin-bottom: 16px; border-radius: 4px;">
        <h3 style="margin: 0 0 16px 0; color: #1E40AF; font-size: 16px; font-weight: 700;">기업정보</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #666; width: 100px;">상호명</td><td style="color: #333; font-weight: 600;">${company}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">업종</td><td style="color: #333;">${industry}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">지역</td><td style="color: #333;">${location}</td></tr>
        </table>
      </div>
      <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin-bottom: 16px; border-radius: 4px;">
        <h3 style="margin: 0 0 16px 0; color: #1E40AF; font-size: 16px; font-weight: 700;">담당자 정보</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; color: #666; width: 100px;">이름</td><td style="color: #333; font-weight: 600;">${name}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">연락처</td><td style="color: #3B82F6; font-weight: 600;">${phone}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">상담희망</td><td style="color: #333;">${consultTime}</td></tr>
        </table>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${CONFIG.AIRTABLE_URL}" style="display: inline-block; background: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 14px;">Airtable에서 확인하기</a>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin: 16px 0;">접수시간: ${currentTime}</p>
    </div>
    <div style="background: #3B82F6; padding: 20px; text-align: center;">
      <p style="margin: 0; color: #ffffff; font-weight: 700; font-size: 16px;">KEAI 한국기업심사원</p>
      <p style="margin: 5px 0 0 0; color: #BFDBFE; font-size: 13px;">${CONFIG.BRAND.PHONE}</p>
    </div>
  </div>
</body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.RESEND.API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: CONFIG.EMAIL.FROM,
      to: CONFIG.EMAIL.TO,
      bcc: CONFIG.EMAIL.BCC,
      subject: subject,
      html: html
    })
  });

  const result = await response.json();
  if (response.ok) {
    return { success: true, resendId: result.id };
  } else {
    return { success: false, error: result.message || 'Resend error' };
  }
}

// ================================================
// 고객 이메일 발송
// ================================================
async function sendCustomerEmail(data, customerEmail, CONFIG) {
  const company = data.상호명 || data.company || '-';
  const name = data.이름 || data.name || '고객';
  const phone = formatPhone(data.연락처 || data.phone || '-');
  const consultTime = data.상담희망시간 || data.consultTime || '-';

  const subject = '[한국기업심사원] 상담신청이 접수되었습니다';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Pretendard', -apple-system, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white;">
    <div style="background: #3B82F6; padding: 30px 20px; text-align: center;">
      <p style="margin: 0 0 12px 0; color: #BFDBFE; font-size: 11px;">※ 본 메일은 발신 전용입니다</p>
      <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 16px;">
        <img src="https://pub-614b08f38e094d04a78e718d3e8e811b.r2.dev/white_logo_new.png" alt="KEAI" style="height: 52px;">
        <div style="text-align: left;">
          <p style="margin: 0; color: #ffffff; font-size: 34px; font-weight: 700; letter-spacing: -0.5px;">한국기업심사원</p>
          <p style="margin: 4px 0 0 0; color: #BFDBFE; font-size: 13px; letter-spacing: 0;">Korea Enterprise Auditing Institute</p>
        </div>
      </div>
      <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">상담신청이 접수되었습니다</h1>
    </div>
    <div style="padding: 30px 20px;">
      <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0 0 12px 0; font-size: 16px; color: #1E40AF;">안녕하세요, <strong>${name}</strong>님!</p>
        <p style="margin: 0; color: #374151; line-height: 1.8; font-size: 14px;">
          상담신청이 정상적으로 접수되었습니다.<br><br>
          영업일 기준 24시간 이내<br>
          담당 전문 컨설턴트가 연락드리겠습니다.
        </p>
      </div>

      <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1E40AF; font-size: 15px; font-weight: 600;">접수 내용</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #6B7280; width: 100px;">상호명</td><td style="color: #111; font-weight: 500;">${company}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">연락처</td><td style="color: #111; font-weight: 500;">${phone}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">상담희망</td><td style="color: #111; font-weight: 500;">${consultTime}</td></tr>
        </table>
      </div>

      <div style="background: #EFF6FF; padding: 16px 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
        <p style="margin: 0; color: #1E40AF; font-weight: 600; font-size: 14px;">
          영업일 기준 <strong style="color: #3B82F6;">24시간 이내</strong>에 연락드리겠습니다.
        </p>
      </div>

      <div style="text-align: center; padding: 20px 0; border-top: 1px dashed #E5E7EB;">
        <p style="margin: 0 0 10px 0; color: #6B7280; font-size: 13px;">문의사항이 있으시면 연락주세요</p>
        <p style="margin: 0; color: #3B82F6; font-size: 15px; font-weight: 600;">${CONFIG.BRAND.PHONE}</p>
      </div>
    </div>
    <div style="background: #3B82F6; padding: 20px; text-align: center;">
      <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <img src="https://pub-614b08f38e094d04a78e718d3e8e811b.r2.dev/white_logo_new.png" alt="KEAI" style="height: 38px;">
        <div style="text-align: left;">
          <p style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">한국기업심사원</p>
          <p style="margin: 3px 0 0 0; color: #BFDBFE; font-size: 10px; letter-spacing: 0;">Korea Enterprise Auditing Institute</p>
        </div>
      </div>
      <p style="margin: 8px 0 0 0; color: #BFDBFE; font-size: 11px;">※ 본 메일은 발신 전용입니다. 회신이 불가합니다.</p>
    </div>
  </div>
</body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.RESEND.API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: CONFIG.EMAIL.FROM,
      to: customerEmail,
      subject: subject,
      html: html
    })
  });

  const result = await response.json();
  if (response.ok) {
    return { success: true, resendId: result.id, to: customerEmail };
  } else {
    return { success: false, error: result.message || 'Resend error' };
  }
}

// ================================================
// 네이버 SENS SMS 발송 (고객용)
// ================================================
async function sendNaverSMS(data, CONFIG) {
  const phone = data.연락처 || data.phone || '';
  if (!phone || phone === '-') {
    return { success: false, error: 'No phone number provided' };
  }

  // 전화번호 정제
  let toNumber = String(phone).replace(/[^0-9]/g, '');
  if (toNumber.startsWith('82')) {
    toNumber = '0' + toNumber.substring(2);
  }
  if (!toNumber.startsWith('0')) {
    toNumber = '0' + toNumber;
  }

  // LMS 메시지 내용
  const smsContent = `[한국기업심사원]
상담신청이 접수되었습니다.
24시간 이내 담당자가 연락드립니다.

희망상담시간을 남겨주시면
해당 시간에 연락드립니다.

상담운영: 오전 9시~오후 6시`;

  const timestamp = Date.now().toString();
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${CONFIG.NAVER_SMS.SERVICE_ID}/messages`;

  // HMAC-SHA256 서명 생성
  const signature = await makeSignature(
    'POST',
    `/sms/v2/services/${CONFIG.NAVER_SMS.SERVICE_ID}/messages`,
    timestamp,
    CONFIG.NAVER_SMS.ACCESS_KEY,
    CONFIG.NAVER_SMS.SECRET_KEY
  );

  const body = {
    type: 'LMS',
    from: CONFIG.NAVER_SMS.CALLING_NUMBER,
    subject: '[한국기업심사원]',
    content: smsContent,
    messages: [{ to: toNumber }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-ncp-apigw-timestamp': timestamp,
      'x-ncp-iam-access-key': CONFIG.NAVER_SMS.ACCESS_KEY,
      'x-ncp-apigw-signature-v2': signature
    },
    body: JSON.stringify(body)
  });

  const result = await response.json();

  if (response.ok && result.statusCode === '202') {
    return { success: true, requestId: result.requestId };
  } else {
    return { success: false, error: result.statusMessage || result.error || 'SMS send failed' };
  }
}

// ================================================
// 네이버 클라우드 API 서명 생성
// ================================================
async function makeSignature(method, url, timestamp, accessKey, secretKey) {
  const space = ' ';
  const newLine = '\n';
  const message = method + space + url + newLine + timestamp + newLine + accessKey;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// ================================================
// 전화번호 포맷팅
// ================================================
function formatPhone(value) {
  if (!value || value === '-') return '-';
  let digits = String(value).replace(/[^0-9]/g, '');

  // 국가코드 처리
  if (digits.startsWith('82')) {
    digits = '0' + digits.substring(2);
  }
  if (!digits.startsWith('0')) {
    digits = '0' + digits;
  }

  // 포맷팅
  if (digits.length === 11 && digits.startsWith('010')) {
    return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7);
  } else if (digits.length === 10) {
    return digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
  }
  return value;
}
