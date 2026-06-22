// src/Map.jsx
import { useEffect, useState } from 'react';
import './Map.css';

export default function Map({ user, setUser, setView }) {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = () => {
    fetch('http://localhost:5000/api/seats')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setSeats(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchSeats(); }, []);

  // 🧹 [공통 로직] 퇴실 처리를 수행하는 함수
  const executeCheckout = (seatId) => {
    if (!user?.memberId) { alert('다시 로그인해 주세요.'); return; }
    if (!window.confirm(`${seatId}번 좌석에서 퇴실하시겠습니까?`)) return;

    fetch('http://localhost:5000/api/seats/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seat_id: seatId, member_id: user.memberId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('퇴실 처리가 완료되었습니다.');
          if (setUser) {
            setUser(prev => ({ ...prev, currentSeat: null }));
          }
          fetchSeats();
        } else {
          alert(data.message || '퇴실에 실패했습니다.');
        }
      })
      .catch(() => alert('서버와 통신 중 오류가 발생했습니다.'));
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'disabled') { alert('점검 중인 좌석입니다.'); return; }
    if (!user?.memberId) { alert('다시 로그인해 주세요.'); return; }

    const userCurrentSeat = user?.currentSeat;

    // 1️⃣ 내 좌석이면 퇴실 처리 호출
    if (seat.status === 'using' && seat.id === userCurrentSeat) {
      executeCheckout(seat.id);
      return;
    }

    // 2️⃣ 다른 사람이 쓰고 있는 좌석일 때
    if (seat.status === 'using') { alert('이미 이용 중인 좌석입니다.'); return; }

    // 3️⃣ 이미 자리를 쓰고 있는데 다른 빈 자리를 선택할 때
    if (userCurrentSeat) {
      alert(`이미 ${userCurrentSeat}번 좌석을 이용 중입니다.\n자리를 바꾸시려면 우측 하단 퇴실 버튼이나 기존 좌석을 클릭해 주세요.`);
      return;
    }

    // 4️⃣ 빈 좌석 — 입실 처리
    if (!window.confirm(`${seat.id}번 좌석을 선택하시겠습니까?`)) return;

    fetch('http://localhost:5000/api/seats/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seat_id: seat.id, member_id: user.memberId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(`${seat.id}번 좌석 배정이 완료되었습니다!`);
          if (setUser) {
            setUser(prev => ({ ...prev, currentSeat: seat.id }));
          }
          fetchSeats();
          if (setView) setView('home');
        } else {
          alert(data.message || '배정에 실패했습니다.');
        }
      })
      .catch(() => alert('서버와 통신 중 오류가 발생했습니다.'));
  };

  const zoneA = seats.slice(0, 12);
  const zoneB = seats.slice(12, 15);
  const zoneC = seats.slice(15, 18);

  const emptySeats = seats.filter(s => s.status === 'empty').length;
  const usingSeats = seats.filter(s => s.status === 'using').length;

  if (loading) return <div className="map-loading">좌석 정보를 불러오는 중입니다.</div>;

  return (
    <div className="main-content-wrapper">
      <div className="main-content-header">
        <div className="user-welcome">
          <h1>좌석 현황</h1>
          <p>좌석을 선택하면 바로 입실됩니다.</p>
        </div>
        <div className="seat-legend">
          <div className="legend-item"><span className="dot empty" />선택 가능</div>
          <div className="legend-item"><span className="dot using" />이용 중</div>
          <div className="legend-item"><span className="dot disabled" />점검 중</div>
        </div>
      </div>

      <div className="room-container">
        <div className="room-layout">
          <div className="front-desk-bar">FRONT DESK</div>

          {/* A 구역 */}
          <div className="zone">
            <span className="zone-label">A 구역</span>
            <div className="seats-grid cols-6">
              {zoneA.map(seat => {
                const isMySeat = seat.id === user?.currentSeat;
                return (
                  <div 
                    key={seat.id} 
                    className={`seat-box ${seat.status} ${isMySeat ? 'my-seat' : ''}`} 
                    onClick={() => handleSeatClick(seat)}
                  >
                    <span className="num">{seat.id}</span>
                    {isMySeat && <span className="my-seat-indicator" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="zone-divider" />

          {/* 창가 B & C 구역 */}
          <div className="window-zone">
            <div className="zone">
              <span className="zone-label">창가 B</span>
              <div className="seats-grid cols-3">
                {zoneB.map(seat => {
                  const isMySeat = seat.id === user?.currentSeat;
                  return (
                    <div 
                      key={seat.id} 
                      className={`seat-box ${seat.status} ${isMySeat ? 'my-seat' : ''}`} 
                      onClick={() => handleSeatClick(seat)}
                    >
                      <span className="num">{seat.id}</span>
                      {isMySeat && <span className="my-seat-indicator" />}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="window-divider" />
            
            <div className="zone">
              <span className="zone-label">창가 C</span>
              <div className="seats-grid cols-3">
                {zoneC.map(seat => {
                  const isMySeat = seat.id === user?.currentSeat;
                  return (
                    <div 
                      key={seat.id} 
                      className={`seat-box ${seat.status} ${isMySeat ? 'my-seat' : ''}`} 
                      onClick={() => handleSeatClick(seat)}
                    >
                      <span className="num">{seat.id}</span>
                      {isMySeat && <span className="my-seat-indicator" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💡 [수정] 오른쪽 끝에 조건별 퇴실 버튼 추가 */}
      <div className="room-summary">
        <div className="summary-stats-left">
          <span className="summary-stat"><strong>{emptySeats}</strong>석 이용 가능</span>
          <span className="summary-dot" />
          <span className="summary-stat"><strong>{usingSeats}</strong>석 이용 중</span>
          <span className="summary-dot" />
          <span className="summary-stat">전체 <strong>{seats.length}</strong>석</span>
        </div>

        <button 
          className={`checkout-action-btn ${user?.currentSeat ? 'active' : 'disabled'}`}
          disabled={!user?.currentSeat}
          onClick={() => executeCheckout(user.currentSeat)}
        >
          {user?.currentSeat ? `퇴실하기` : '퇴실하기'}
        </button>
      </div>
    </div>
  );
}