// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

// 미들웨어 설정
app.use(cors());
app.use(express.json()); // 프론트엔드가 보낸 JSON 데이터를 읽기 위한 설정

// 🐬 MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',         // 💡 본인의 MySQL 유저네임 (기본은 root)
  password: 'Kwon092021!', // 💡 본인의 MySQL 비밀번호를 입력해주세요!
  database: 'dbp_pj'     // 💡 업로드해주신 SQL 파일의 데이터베이스명
});

// DB 연결 테스트
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL 연결 실패:', err);
    return;
  }
  console.log('🐬 MySQL 데이터베이스 연결 성공!');
});

// ==========================================
// 회원가입
// ==========================================
app.post('/api/register', (req, res) => {
  const { name, phone, password, email } = req.body;

  // 간단한 유효성 검사
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: '이름과 전화번호를 모두 입력해주세요.' });
  }

  const tempMemberId = Math.floor(Math.random() * 1000000); 

  const query = 'INSERT INTO member (member_id, name, phone, password, email) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [tempMemberId, name, phone, password, email], (err, result) => {
    if (err) {
      console.error('회원가입 쿼리 에러:', err);
      // 휴대폰 번호 중복 처리
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: '이미 가입된 휴대폰 번호입니다.' });
      }
      return res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
    }
    
    return res.status(200).json({ success: true, message: '회원가입이 완료되었습니다!' });
  });
});

// login  
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, message: '전화번호를 입력해주세요.' });
  }

  const query = `
    SELECT 
      m.*, 
      IFNULL(mt.remain_minutes, 0) AS remainingTime 
    FROM member m
    LEFT JOIN member_ticket mt ON m.member_id = mt.member_id
    WHERE m.phone = ? AND m.is_deleted = 0 AND m.password = ?
  `;
  
  db.query(query, [phone.trim(), password], (err, results) => {
    if (err) {
      console.error('로그인 쿼리 에러:', err);
      return res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: '존재하지 않는 회원 정보입니다.' });
    }

    return res.status(200).json({ 
      success: true, 
      message: '로그인 성공!', 
      user: {
        id: results[0].member_id,
        name: results[0].name,
        phone: results[0].phone,
        email: results[0].email,
        password: results[0].password,
        remainingTime: results[0].remainingTime 
      }
    });
  });
});

// 잔여 시간 조회
app.get('/api/member/:id', (req, res) => {
  const memberId = req.params.id; 

  console.log(`🔍 [요청진입] 아이디 ${memberId}의 실시간 잔여 시간을 조회합니다.`);

  // 💡 핵심 SQL: 현재 입실 중(check_out_at IS NULL)이라면 지금까지 앉아있는 시간(used_now)을 실시간 계산합니다.
  const query = `
    SELECT 
      m.member_id, 
      m.name, 
      mt.remain_minutes,
      (SELECT TIMESTAMPDIFF(MINUTE, ul.check_in_at, NOW()) 
       FROM usage_log ul 
       WHERE ul.member_id = m.member_id AND ul.check_out_at IS NULL 
       ORDER BY ul.check_in_at DESC LIMIT 1) AS used_now
    FROM member m
    LEFT JOIN member_ticket mt ON m.member_id = mt.member_id
    WHERE m.member_id = ?
  `;

  db.query(query, [memberId], (err, results) => {
    if (err) {
      console.error('❌ 잔여 시간 조회 SQL 자체 에러:', err.message);
      return res.status(500).json({ error: '데이터베이스 조회 실패', detail: err.message });
    }

    if (!results || results.length === 0 || !results[0]) {
      console.log(`⚠️ 학번 ${memberId}는 member 테이블에 존재하지 않습니다.`);
      return res.status(404).json({ error: '존재하지 않는 회원입니다.' });
    }

    const dbMemberId = results[0].member_id || memberId;
    const dbName = results[0].name || '회원';
    const rawTime = results[0].remain_minutes;
    const totalRemainingTime = (rawTime === null || rawTime === undefined) ? 0 : rawTime;
    
    // 현재 자리에 앉아 흘러간 시간 (없으면 0분)
    const usedNow = results[0].used_now || 0; 

    // ⭐ [핵심] 실제 유저에게 보낼 최종 잔여 시간 = (DB에 기록된 시간 - 현재 자리에 앉아 흘러간 시간)
    // 0 이하로 떨어지지 않게 Math.max로 안전장치 설정
    const finalRemainingTime = Math.max(0, totalRemainingTime - usedNow);

    console.log(`🐬 [조회성공] 아이디: ${dbMemberId}, 이름: ${dbName}, DB원본시간: ${totalRemainingTime}분, 현재이용시간: ${usedNow}분 -> 최종전달시간: ${finalRemainingTime}분`);

    return res.status(200).json({
      member_id: dbMemberId,
      name: dbName,
      remainingTime: finalRemainingTime
    });
  });
});

// 좌석 

app.get('/api/seats', (req, res) => {
  const query = 'SELECT seat_id, status FROM seat ORDER BY seat_id ASC';

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ 좌석 조회 SQL 에러:', err.message);
      return res.status(500).json({ error: '좌석 데이터를 가져오지 못했습니다.' });
    }
    
    // 💡 만약 DB의 seat 테이블에 데이터가 아예 없다면(0개라면), 
    // 리액트가 멈추지 않도록 가짜 빈 좌석 24개를 실시간으로 생성해서 던져줍니다!
    if (!results || results.length === 0) {
      console.log("⚠️ DB에 좌석 데이터가 없어서 기본 24개 좌석을 생성하여 응답합니다.");
      const dummySeats = Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        status: 'empty'
      }));
      return res.status(200).json(dummySeats);
    }

    // 💡 DB 데이터가 존재할 때 매칭 처리
    const formattedSeats = results.map(seat => {
      // 혹시라도 seat_id 컬럼 인식을 못할 때를 대비해 기본값 매칭
      const seatId = seat.seat_id !== undefined ? seat.seat_id : (seat.id || 0);
      let seatStatus = 'empty';

      if (seat.status) {
        // 대소문자 무관하게 비교하기 위해 공백 제거 후 소문자 변환
        const currentStatus = seat.status.toString().trim().toLowerCase();
        if (currentStatus === 'using') seatStatus = 'using';
        if (currentStatus === 'disabled') seatStatus = 'disabled';
      }

      return {
        id: seatId,
        status: seatStatus
      };
    });

    console.log("🪑 [조회성공] 변환 후 전달될 첫 번째 좌석 확인:", formattedSeats[0]);

    return res.status(200).json(formattedSeats);
  });
});

// ─────────────────────────────────────────
// 회원 정보 수정 (전화번호 / 이메일)
// ─────────────────────────────────────────
app.patch('/api/member/:id', (req, res) => {
  const memberId = req.params.id;
  const { phone, email } = req.body;

  if (!phone && !email) {
    return res.status(400).json({ success: false, message: '수정할 정보가 없습니다.' });
  }

  const fields = [];
  const values = [];
  if (phone) { fields.push('phone = ?'); values.push(phone); }
  if (email) { fields.push('email = ?'); values.push(email); }
  values.push(memberId);

  db.query(`UPDATE member SET ${fields.join(', ')} WHERE member_id = ?`, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: '이미 사용 중인 전화번호입니다.' });
      return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: '존재하지 않는 회원입니다.' });
    
    return res.status(200).json({ success: true, message: '회원 정보가 성공적으로 수정되었습니다.' });
  });
});

// ─────────────────────────────────────────
// 비밀번호 변경
// ─────────────────────────────────────────
app.patch('/api/member/:id/password', (req, res) => {
  const memberId = req.params.id;
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ success: false, message: '비밀번호를 모두 입력해주세요.' });
  }

  db.query('SELECT password FROM member WHERE member_id = ?', [memberId], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    if (!results.length) return res.status(404).json({ success: false, message: '존재하지 않는 회원입니다.' });
    if (results[0].password !== current_password) {
      return res.status(401).json({ success: false, message: '현재 비밀번호가 올바르지 않습니다.' });
    }

    db.query('UPDATE member SET password = ? WHERE member_id = ?', [new_password, memberId], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
      return res.status(200).json({ success: true });
    });
  });
});

// ==========================================
// [수정] 입실 API: 잔여시간 검증 및 이용로그 생성 추가
// ==========================================
app.post('/api/seats/assign', (req, res) => {
  const { seat_id, member_id } = req.body;

  if (!seat_id || !member_id) {
    return res.status(400).json({ success: false, message: '좌석 번호와 회원 ID 정보가 누락되었습니다.' });
  }

  // 1. 유저의 잔여 시간 체크
  db.query('SELECT remain_minutes FROM member_ticket WHERE member_id = ?', [member_id], (err, ticketResult) => {
    if (err) return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    
    if (ticketResult.length === 0 || ticketResult[0].remain_minutes <= 0) {
      return res.status(400).json({ success: false, message: '잔여 시간이 없습니다. 이용권을 먼저 충전해 주세요.' });
    }

    // 2. 이미 다른 좌석을 이용 중인지 체크
    db.query('SELECT seat_id FROM seat WHERE member_id = ?', [member_id], (err2, seatResult) => {
      if (err2) return res.status(500).json({ success: false, message: '서버 오류' });
      if (seatResult.length > 0) {
        return res.status(400).json({ success: false, message: '이미 다른 좌석을 이용 중입니다.' });
      }

      // 3. 좌석 상태 업데이트
      const assignQuery = 'UPDATE seat SET status = "USING", member_id = ? WHERE seat_id = ? AND status = "EMPTY"';
      db.query(assignQuery, [member_id, seat_id], (err3, result) => {
        if (err3) return res.status(500).json({ success: false, message: '데이터베이스 업데이트 실패' });
        if (result.affectedRows === 0) return res.status(400).json({ success: false, message: '이미 선점되었거나 선택할 수 없는 좌석입니다.' });

        // 4. 이용 시작 로그 주입 (usage_log INSERT 추가)
        const logQuery = 'INSERT INTO usage_log (member_id, current_seat, check_in_at) VALUES (?, ?, NOW())';
        db.query(logQuery, [member_id, seat_id], (err4) => {
          if (err4) console.error('❌ 이용 로그 생성 실패:', err4.message);
          
          console.log(`🐬 [입실완료] 회원 ${member_id} -> ${seat_id}번 좌석 (이용로그 생성완료)`);
          return res.status(200).json({ success: true, message: '좌석 배정이 완료되었습니다.' });
        });
      });
    });
  });
});

// ==========================================
// [수정] 퇴실 API: 이용 시간 자동 계산 및 member_ticket 실시간 차감
// ==========================================
app.post('/api/seats/checkout', (req, res) => {
  const { seat_id, member_id } = req.body;

  if (!seat_id || !member_id) {
    return res.status(400).json({ success: false, message: '좌석 번호와 회원 ID가 필요합니다.' });
  }

  // 1. 진행 중인 이용 로그 조회 및 이용 시간(분) 계산
  const logSelectQuery = `
    SELECT id, check_in_at, TIMESTAMPDIFF(MINUTE, check_in_at, NOW()) AS used_minutes 
    FROM usage_log 
    WHERE member_id = ? AND current_seat = ? AND check_out_at IS NULL 
    ORDER BY check_in_at DESC LIMIT 1
  `;

  db.query(logSelectQuery, [member_id, seat_id], (err, logResults) => {
    if (err) return res.status(500).json({ success: false, message: '로그 조회 중 서버 오류가 발생했습니다.' });
    if (logResults.length === 0) return res.status(400).json({ success: false, message: '이용 중인 로그를 찾을 수 없습니다.' });

    const logId = logResults[0].id;
    // 최소 1분 미만으로 앉아있었어도 최소 1분 차감되도록 처리 (비즈니스 룰)
    const usedMinutes = Math.max(1, logResults[0].used_minutes);

    // 2. 좌석 상태 비우기
    db.query('UPDATE seat SET status = "EMPTY", member_id = NULL WHERE seat_id = ? AND member_id = ?', [seat_id, member_id], (err2, seatRes) => {
      if (err2) return res.status(500).json({ success: false, message: '좌석 반납 실패' });

      // 3. 이용 로그 종료 시점 기록
      db.query('UPDATE usage_log SET check_out_at = NOW() WHERE id = ?', [logId], (err3) => {
        if (err3) console.error('로그 업데이트 실패:', err3.message);

        // 4. ⭐ [핵심] 실제 사용한 시간만큼 유저의 이용권 시간 감산 처리 (0 이하로 가지 않게 GREATEST 활용)
        const updateTicketQuery = `
          UPDATE member_ticket 
          SET remain_minutes = GREATEST(0, CAST(remain_minutes AS SIGNED) - ?) 
          WHERE member_id = ?
        `;
        db.query(updateTicketQuery, [usedMinutes, member_id], (err4) => {
          if (err4) console.error('이용권 시간 차감 실패:', err4.message);
          
          console.log(`🧹 [퇴실완료] 회원: ${member_id}, 차감된 시간: ${usedMinutes}분`);
          return res.status(200).json({ success: true, usedMinutes: usedMinutes });
        });
      });
    });
  });
});

// ─────────────────────────────────────────
// 이용권 목록 조회
// ─────────────────────────────────────────
app.get('/api/tickets', (req, res) => {
  db.query('SELECT * FROM ticket ORDER BY price ASC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '이용권 데이터를 가져오지 못했습니다.' });
    return res.status(200).json(results);
  });
});

// ─────────────────────────────────────────
// 이용권 구매
// ─────────────────────────────────────────
app.post('/api/tickets/buy', (req, res) => {
  const { member_id, ticket_id } = req.body;

  if (!member_id || !ticket_id) {
    return res.status(400).json({ success: false, message: '회원 ID와 이용권 ID가 필요합니다.' });
  }

  db.query('SELECT time FROM ticket WHERE ticket_id = ?', [ticket_id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    if (!results.length) return res.status(404).json({ success: false, message: '존재하지 않는 이용권입니다.' });

    const minutesToAdd = results[0].time;

    db.query('SELECT id FROM member_ticket WHERE member_id = ? LIMIT 1', [member_id], (err2, existing) => {
      if (err2) return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });

      if (existing.length > 0) {
        db.query(
          'UPDATE member_ticket SET remain_minutes = remain_minutes + ? WHERE member_id = ?',
          [minutesToAdd, member_id],
          (err3) => {
            if (err3) return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
            return res.status(200).json({ success: true });
          }
        );
      } else {
        db.query(
          'INSERT INTO member_ticket (member_id, ticket_id, remain_minutes) VALUES (?, ?, ?)',
          [member_id, ticket_id, minutesToAdd],
          (err3) => {
            if (err3) return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
            return res.status(200).json({ success: true });
          }
        );
      }
    });
  });
});

// ─────────────────────────────────────────
// 총 이용 시간 조회
// ─────────────────────────────────────────
app.get('/api/member/:id/usage', (req, res) => {
  const memberId = req.params.id;

  // check_in_at과 check_out_at이 모두 완벽히 존재하는 정상 로그만 더하도록 쿼리 수정
  const query = `
    SELECT 
      (SELECT IFNULL(SUM(TIMESTAMPDIFF(MINUTE, check_in_at, check_out_at)), 0) 
       FROM usage_log 
       WHERE member_id = ? AND check_out_at IS NOT NULL AND check_in_at IS NOT NULL) AS pastUsedMinutes,
       
      (SELECT IFNULL(TIMESTAMPDIFF(MINUTE, check_in_at, NOW()), 0) 
       FROM usage_log 
       WHERE member_id = ? AND check_out_at IS NULL 
       ORDER BY check_in_at DESC LIMIT 1) AS currentUsedMinutes
  `;

  db.query(query, [memberId, memberId], (err, results) => {
    if (err) {
      console.error('❌ 총 이용 시간 조회 SQL 에러:', err.message);
      return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }

    const pastMinutes = results[0].pastUsedMinutes || 0;
    const currentMinutes = results[0].currentUsedMinutes || 0;

    // 혹시라도 마이너스나 비정상적인 데이터가 오면 0으로 필터링
    const totalUsedMinutes = Math.max(0, pastMinutes) + Math.max(0, currentMinutes);

    console.log(`📊 [이용시간조회] 회원: ${memberId} -> 과거: ${pastMinutes}분 + 현재: ${currentMinutes}분 = 총 ${totalUsedMinutes}분`);

    return res.status(200).json({ totalUsedMinutes: totalUsedMinutes });
  });
});
// ─────────────────────────────────────────
// [추가] 회원 탈퇴 API (CASCADE 연동 버전)
// ─────────────────────────────────────────
app.delete('/api/member/:id', (req, res) => {
  const memberId = req.params.id;

  console.log(`🚨 [탈퇴요청] 회원 ID ${memberId}의 계정 삭제를 시작합니다.`);

  // DB 외래키(CASCADE) 덕분에 member 테이블만 지우면 
  // usage_log, member_ticket 등의 흔적은 MySQL이 알아서 한 방에 지워줍니다!
  const query = 'DELETE FROM member WHERE member_id = ?';

  db.query(query, [memberId], (err, result) => {
    if (err) {
      console.error('❌ 회원 탈퇴 쿼리 에러:', err.message);
      return res.status(500).json({ success: false, message: '서버 오류로 인해 탈퇴 처리에 실패했습니다.' });
    }

    // 영향을 받은 행(Row)이 0개라면 애초에 존재하지 않는 회원 ID인 경우입니다.
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '존재하지 않는 회원 정보입니다.' });
    }

    console.log(`🧹 [탈퇴완료] 회원 ID ${memberId} 삭제 및 관련 자식 데이터 CASCADE 폭파 완료!`);
    return res.status(200).json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });
  });
});

// 서버 구동
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});