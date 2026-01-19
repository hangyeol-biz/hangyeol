// ================================================
// 한결컨설팅 - Airtable Automation 스크립트
// 트리거: 새 레코드 생성 시 (Meta 리드)
// 동작: Worker 호출 → 텔레그램/이메일/SMS 발송
// ================================================

// Airtable Automation 설정:
// 1. Automations → Create automation
// 2. Trigger: When a record is created
// 3. Action: Run a script
// 4. 아래 코드 붙여넣기

// Worker URL (환경변수 CLOUDFLARE_WORKER_URL 참조)
const WORKER_URL = 'https://hangyeol.khg471.workers.dev';

// 입력 변수 설정 (Airtable에서 설정)
let inputConfig = input.config();

// 레코드 데이터 가져오기
let table = base.getTable('고객정보');
let record = await input.recordAsync('레코드', table);

if (record) {
    // 필드 값 추출
    const data = {
        접수일: record.getCellValueAsString('접수일'),
        지역: record.getCellValueAsString('지역'),
        업종: record.getCellValueAsString('업종'),
        상호명: record.getCellValueAsString('상호명'),
        이름: record.getCellValueAsString('이름'),
        연락처: record.getCellValueAsString('연락처'),
        상담희망시간: record.getCellValueAsString('상담희망시간'),
        플랫폼: 'Meta',
        광고명: record.getCellValueAsString('광고명') || '-'
    };

    console.log('📤 Sending to Worker:', JSON.stringify(data, null, 2));

    try {
        // Worker 호출
        let response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        let result = await response.json();
        console.log('✅ Worker Response:', JSON.stringify(result, null, 2));

        // 결과 요약
        if (result.success) {
            console.log('-------------------');
            console.log('📱 텔레그램:', result.telegram?.success ? '✅ 성공' : '❌ 실패');
            console.log('📧 이메일:', result.email?.staff?.success ? '✅ 성공' : '❌ 실패');
            console.log('💬 SMS:', result.sms?.success ? '✅ 성공' : '❌ 실패');
        } else {
            console.error('❌ Worker 호출 실패:', result.error);
        }

    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    }
} else {
    console.log('⚠️ 레코드를 찾을 수 없습니다.');
}
