import { useState } from 'react';
import './Map.css';

export default function MainPage({ user }) {
  // 가짜 좌석 데이터 (나중에 DB 연동)
  const [seats] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      status: i === 2 || i === 5 || i === 12 ? 'using' : i === 8 ? 'disabled' : 'empty',
    }))
  );

  const handleSeatClick = (seat) => {
    if (seat.status === 'using') alert('이미 이용 중인 좌석입니다.');
    else if (seat.status === 'disabled') alert('점검 중인 좌석입니다.');
    else alert(`${seat.id}번 좌석을 선택하셨습니다.`);
  };

  return (
    <div className="main-content-wrapper">
      <div className="main-content-header">
        <div className="user-welcome">
          <h1>좌석 현황</h1>
        </div>

        <div className="seat-legend">
          <div className="legend-item"><span className="dot empty"></span> 선택 가능</div>
          <div className="legend-item"><span className="dot using"></span> 이용 중</div>
          <div className="legend-item"><span className="dot disabled"></span> 점검 중</div>
        </div>
      </div>

      {/* 좌석 배치도 영역 */}
      <div className="room-container">
        <div className="screen-bar">F R O N T D E S K</div>
        
        <div className="seats-grid">
          {seats.map((seat) => (
            <div 
              key={seat.id} 
              className={`seat-box ${seat.status}`}
              onClick={() => handleSeatClick(seat)}
            >
              <span className="num">{seat.id}</span>
              <span className="state-text">
                {seat.status === 'empty' ? '선택' : seat.status === 'using' ? '이용중' : '점검'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}