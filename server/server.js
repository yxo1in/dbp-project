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
  const { name, phone } = req.body; // 리액트에서 보낸 데이터 받아오기

  // 간단한 유효성 검사
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: '이름과 전화번호를 모두 입력해주세요.' });
  }

  // 데이터베이스에 회원 정보 삽입 쿼리 (member_id는 자동 증가가 아니라면 일단 현재 날짜 조합이나 로직에 맞춰 처리해야하므로 샘플 ID 생성 혹은 쿼리 가공 필요)
  // 제공해주신 테이블의 member_id가 AUTO_INCREMENT가 아니기 때문에 임시로 현재 타임스탬프 기반 숫자를 부여하거나 필요시 테이블 수정이 필요할 수 있습니다.
  const tempMemberId = Math.floor(Math.random() * 1000000); 

  const query = 'INSERT INTO member (member_id, name, phone) VALUES (?, ?, ?)';
  
  db.query(query, [tempMemberId, name, phone], (err, result) => {
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

// ==========================================
// 🔑 [API 2] 로그인 라우터 (전화번호로 회원 조회)
// ==========================================
app.post('/api/login', (req, res) => {
  const { phone } = req.body;

  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, message: '전화번호를 입력해주세요.' });
  }

  // 탈퇴하지 않은 회원 중 전화번호가 일치하는 회원 조회
  const query = 'SELECT * FROM member WHERE phone = ? AND is_deleted = 0';
  
  db.query(query, [phone.trim()], (err, results) => {
    if (err) {
      console.error('로그인 쿼리 에러:', err);
      return res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
    }

    // 💡 중요: 일치하는 회원이 없을 때 (결과 배열이 비었을 때)
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: '존재하지 않는 회원 정보입니다.' });
    }

    // 💡 회원을 찾았을 때 (로그인 성공)
    return res.status(200).json({ 
      success: true, 
      message: '로그인 성공!', 
      user: {
        id: results[0].member_id,
        name: results[0].name,
        phone: results[0].phone
      }
    });
  });
});

// 서버 구동
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 달리는 중!`);
});