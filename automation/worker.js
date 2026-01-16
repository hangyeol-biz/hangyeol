// ================================================
// KEAI 한국기업심사원 - 통합 Workers API
// 작성일: 2024-12-13
// 기능: Airtable + Resend + Telegram + SENS SMS 통합
// 배포: Cloudflare Workers
// ================================================

// 설정 (환경변수에서 가져옴 - Cloudflare Dashboard에서 설정)
// 필요한 환경변수:
// - AIRTABLE_TOKEN
// - RESEND_API_KEY
// - TELEGRAM_BOT_TOKEN
// - NCP_ACCESS_KEY
// - NCP_SECRET_KEY

// HMAC-SHA256 서명 생성 함수 (네이버 SENS API용)
async function makeSignature(method, url, timestamp, accessKey, secretKey) {
  const space = " ";
  const newLine = "\n";
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

export default {
  async fetch(request, env) {
    // 환경변수에서 설정 가져오기
    const CONFIG = {
      AIRTABLE: {
        BASE_ID: 'appYxrGK0yOZ8YdIG',
        TABLE_NAME: '고객정보',
        TOKEN: env.AIRTABLE_TOKEN,
        SHARE_URL: 'https://airtable.com/appYxrGK0yOZ8YdIG/shrNjfhYB8gCYNB2P'
      },
      RESEND: {
        API_KEY: env.RESEND_API_KEY,
        FROM: 'KEAI 한국기업심사원 <noreply@mail.policy-fund.online>'
      },
      EMAIL: {
        STAFF: 'ceo@k-eai.kr',
        BCC: 'mkt@polarad.co.kr'
      },
      TELEGRAM: {
        BOT_TOKEN: env.TELEGRAM_BOT_TOKEN,
        CHAT_ID: '-1003366455717'
      },
      SENS: {
        SERVICE_ID: 'ncp:sms:kr:362578528555:keai',
        ACCESS_KEY: env.NCP_ACCESS_KEY,
        SECRET_KEY: env.NCP_SECRET_KEY,
        FROM: '01028886514'  // 발신번호
      }
    };
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // POST 요청만 허용
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const data = await request.json();
      console.log('📥 Request received:', data);

      // 응답 결과 객체
      const results = {
        success: true,
        airtable: { success: false, id: null, error: null },
        email: { customer: { success: false, error: null }, staff: { success: false, error: null } },
        telegram: { success: false, error: null },
        sms: { success: false, error: null }
      };

      // ================================================
      // 1. Airtable 저장
      // ================================================
      try {
        console.log('📤 Saving to Airtable...');
        const airtableResponse = await fetch(
          `https://api.airtable.com/v0/${CONFIG.AIRTABLE.BASE_ID}/${encodeURIComponent(CONFIG.AIRTABLE.TABLE_NAME)}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CONFIG.AIRTABLE.TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: data.airtableFields
            })
          }
        );

        if (airtableResponse.ok) {
          const airtableResult = await airtableResponse.json();
          results.airtable.success = true;
          results.airtable.id = airtableResult.id;
          console.log('✅ Airtable saved:', airtableResult.id);
        } else {
          const error = await airtableResponse.json();
          results.airtable.error = error;
          console.error('❌ Airtable error:', error);
        }
      } catch (error) {
        results.airtable.error = error.message;
        console.error('❌ Airtable exception:', error.message);
      }

      // ================================================
      // 2. Resend 이메일 발송 (고객용)
      // ================================================
      if (!data.skipCustomerEmail && data.customerEmail) {
        try {
          console.log('📧 Sending customer email...');
          const customerEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CONFIG.RESEND.API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: CONFIG.RESEND.FROM,
              to: [data.customerEmail],
              subject: data.customerSubject,
              html: data.customerHtml
            })
          });

          if (customerEmailResponse.ok) {
            const customerResult = await customerEmailResponse.json();
            results.email.customer.success = true;
            console.log('✅ Customer email sent:', customerResult.id);
          } else {
            const error = await customerEmailResponse.json();
            results.email.customer.error = error;
            console.error('❌ Customer email error:', error);
          }
        } catch (error) {
          results.email.customer.error = error.message;
          console.error('❌ Customer email exception:', error.message);
        }
      } else {
        results.email.customer.success = true;
        results.email.customer.error = 'Skipped (no customer email)';
        console.log('⏭️ Customer email skipped');
      }

      // ================================================
      // 3. Resend 이메일 발송 (담당자용)
      // ================================================
      try {
        console.log('📧 Sending staff email...');
        const staffEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CONFIG.RESEND.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: CONFIG.RESEND.FROM,
            to: CONFIG.EMAIL.STAFF,
            bcc: CONFIG.EMAIL.BCC,
            subject: data.staffSubject,
            html: data.staffHtml
          })
        });

        if (staffEmailResponse.ok) {
          const staffResult = await staffEmailResponse.json();
          results.email.staff.success = true;
          console.log('✅ Staff email sent:', staffResult.id);
        } else {
          const error = await staffEmailResponse.json();
          results.email.staff.error = error;
          console.error('❌ Staff email error:', error);
        }
      } catch (error) {
        results.email.staff.error = error.message;
        console.error('❌ Staff email exception:', error.message);
      }

      // ================================================
      // 4. Telegram 메시지 발송
      // ================================================
      try {
        console.log('📱 Sending Telegram message...');

        const fields = data.airtableFields;
        const telegramText = `🔔 <b>KEAI 한국기업심사원 - 신규 심사 신청</b>

<b>👤 고객정보</b>
├ 기업명: <b>${fields['기업명'] || ''}</b>
├ 사업자번호: ${fields['사업자번호'] || ''}
├ 대표자명: <b>${fields['대표자명'] || ''}</b>
├ 연락처: <code>${fields['연락처'] || ''}</code>
├ 이메일: ${fields['이메일'] || ''}
└ 업종: ${fields['업종'] || ''}

<b>💰 자금정보</b>
├ 통화가능시간: ${fields['통화가능시간'] || ''}
├ 설립연도: ${fields['설립연도'] || ''}
├ 필요자금규모: ${fields['필요자금규모'] || ''}
└ 자금종류: ${fields['자금종류'] ? (Array.isArray(fields['자금종류']) ? fields['자금종류'].join(', ') : fields['자금종류']) : ''}

${fields['문의사항'] ? `<b>💬 문의내용</b>\n${fields['문의사항']}\n` : ''}
📊 <a href="${CONFIG.AIRTABLE.SHARE_URL}">Airtable에서 확인</a>`;

        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${CONFIG.TELEGRAM.BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              chat_id: CONFIG.TELEGRAM.CHAT_ID,
              text: telegramText,
              parse_mode: 'HTML',
              disable_web_page_preview: true
            })
          }
        );

        if (telegramResponse.ok) {
          const telegramResult = await telegramResponse.json();
          results.telegram.success = true;
          console.log('✅ Telegram sent:', telegramResult.result.message_id);
        } else {
          const error = await telegramResponse.json();
          results.telegram.error = error;
          console.error('❌ Telegram error:', error);
        }
      } catch (error) {
        results.telegram.error = error.message;
        console.error('❌ Telegram exception:', error.message);
      }

      // ================================================
      // 5. SENS SMS(LMS) 발송 - 고객에게 접수 안내 문자
      // ================================================
      if (data.airtableFields && data.airtableFields['연락처']) {
        try {
          console.log('📱 Sending SMS via SENS...');

          // 연락처에서 하이픈 제거
          const customerPhone = data.airtableFields['연락처'].replace(/-/g, '');

          // LMS 메시지 내용
          const smsContent = `[한국기업심사원] 접수완료
24시간이내 담당자 배정후
연락드립니다.

상담희망시간 회신 시
해당시간에 연락드립니다.

상담운영
오전 9시~ 오후6시`;

          // SENS API 요청 준비
          const timestamp = Date.now().toString();
          const uri = `/sms/v2/services/${CONFIG.SENS.SERVICE_ID}/messages`;
          const signature = await makeSignature('POST', uri, timestamp, CONFIG.SENS.ACCESS_KEY, CONFIG.SENS.SECRET_KEY);

          const smsPayload = {
            type: 'LMS',  // 장문 문자 (LMS)
            from: CONFIG.SENS.FROM,
            subject: '[한국기업심사원]',  // LMS 제목
            content: smsContent,
            messages: [
              {
                to: customerPhone
              }
            ]
          };

          const smsResponse = await fetch(
            `https://sens.apigw.ntruss.com${uri}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'x-ncp-apigw-timestamp': timestamp,
                'x-ncp-iam-access-key': CONFIG.SENS.ACCESS_KEY,
                'x-ncp-apigw-signature-v2': signature
              },
              body: JSON.stringify(smsPayload)
            }
          );

          if (smsResponse.ok) {
            const smsResult = await smsResponse.json();
            results.sms.success = true;
            console.log('✅ SMS sent:', smsResult.requestId);
          } else {
            const error = await smsResponse.json();
            results.sms.error = error;
            console.error('❌ SMS error:', error);
          }
        } catch (error) {
          results.sms.error = error.message;
          console.error('❌ SMS exception:', error.message);
        }
      } else {
        results.sms.error = 'No phone number provided';
        console.log('⏭️ SMS skipped - no phone number');
      }

      // ================================================
      // 최종 응답
      // ================================================
      console.log('📊 Final results:', results);

      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('💥 Fatal error:', error.message);
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
