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
// 📝 [API 1] 회원가입 라우터 (React로부터 데이터를 받아 DB에 저장)
// ==========================================
app.post('/api/register', (req, res) => {
  const { name, phone, password, email } = req.body; // 리액트에서 보낸 데이터 받아오기

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

app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, message: '전화번호를 입력해주세요.' });
  }

  // ✅ 회원 정보와 잔여 시간을 함께 가져오는 쿼리로 변경
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
        password: results[0].password,
        remainingTime: results[0].remainingTime 
      }
    });
  });
});

// 잔여 시간 조회
app.get('/api/member/:id', (req, res) => {
  const memberId = req.params.id; 

  console.log(`🔍 [요청진입] 아이디 ${memberId}의 잔여 시간을 조회합니다.`);

  const query = `
    SELECT 
      m.member_id, 
      m.name, 
      mt.remain_minutes 
    FROM member m
    LEFT JOIN member_ticket mt ON m.member_id = mt.member_id
    WHERE m.member_id = ?
  `;

  db.query(query, [memberId], (err, results) => {
    if (err) {
      console.error('❌ 잔여 시간 조회 SQL 자체 에러:', err.message);
      return res.status(500).json({ error: '데이터베이스 조회 실패', detail: err.message });
    }

    // 결과 배열 자체가 비어있거나 데이터가 없을 때
    if (!results || results.length === 0 || !results[0]) {
      console.log(`⚠️ 학번 ${memberId}는 member 테이블에 존재하지 않습니다.`);
      return res.status(404).json({ error: '존재하지 않는 회원입니다.' });
    }

    // 💡 안전하게 하나씩 뽑아두기 (만약 null이면 기본값 대입)
    const dbMemberId = results[0].member_id || memberId;
    const dbName = results[0].name || '회원';
    const rawTime = results[0].remain_minutes;
    const finalRemainingTime = (rawTime === null || rawTime === undefined) ? 0 : rawTime;

    console.log(`🐬 [조회성공] 아이디: ${dbMemberId}, 이름: ${dbName}, 시간: ${finalRemainingTime}분`);

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
// 입실
app.post('/api/seats/assign', (req, res) => {
  const { seat_id, member_id } = req.body;

  if (!seat_id || !member_id) {
    return res.status(400).json({ success: false, message: '좌석 번호와 회원 ID 정보가 누락되었습니다.' });
  }

  // 💡 선택한 좌석의 상태를 'USING' 대문자로 바꾸고, member_id에 학번을 주입합니다.
  const query = 'UPDATE seat SET status = "USING", member_id = ? WHERE seat_id = ?';

  db.query(query, [member_id, seat_id], (err, result) => {
    if (err) {
      console.error('❌ 좌석 배정 SQL 에러:', err.message);
      return res.status(500).json({ success: false, message: '데이터베이스 좌석 업데이트 실패' });
    }

    console.log(`🐬 [입실완료] 학번 ${member_id} 회원이 ${seat_id}번 좌석에 입실했습니다.`);
    
    return res.status(200).json({ success: true, message: '좌석 배정이 성공적으로 완료되었습니다.' });
  });
});
// 서버 구동
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 달리는 중!`);
});