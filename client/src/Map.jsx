// Map.jsx
import { useEffect, useState } from 'react';
import './Map.css';

export default function Map({ user }) {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = () => {
    fetch('http://localhost:5000/api/seats')
      .then(res => {
        if (!res.ok) throw new Error('좌석 로딩 실패');
        return res.json();
      })
      .then(data => {
        setSeats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchSeats(); }, []);

  const handleSeatClick = (seat) => {
    if (seat.status === 'using')    { alert('이미 이용 중인 좌석입니다.'); return; }
    if (seat.status === 'disabled') { alert('점검 중인 좌석입니다.'); return; }
    if (!user?.memberId)            { alert('다시 로그인해 주세요.'); return; }

    if (!window.confirm(`${seat.id}번 좌석을 선택하시겠습니까?`)) return;

    fetch('http://localhost:5000/api/seats/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seat_id: seat.id, member_id: user.memberId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) fetchSeats();
        else alert(`배정 실패: ${data.message}`);
      })
      .catch(() => alert('서버와 통신 중 오류가 발생했습니다.'));
  };

  // 총 18석: A구역 12석(1~12), 창가 B 3석(13~15), 창가 C 3석(16~18)
  const zoneA = seats.slice(0, 12);
  const zoneB = seats.slice(12, 15);
  const zoneC = seats.slice(15, 18);

  const emptySeats = seats.filter(s => s.status === 'empty').length;
  const usingSeats = seats.filter(s => s.status === 'using').length;

  if (loading) {
    return <div className="map-loading">좌석 정보를 불러오는 중입니다.</div>;
  }

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
              {zoneA.map(seat => (
                <div key={seat.id} className={`seat-box ${seat.status}`} onClick={() => handleSeatClick(seat)}>
                  <span className="num">{seat.id}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="zone-divider" />

          {/* 창가 구역 */}
          <div className="window-zone">
            <div className="zone">
              <span className="zone-label">창가 B</span>
              <div className="seats-grid cols-3">
                {zoneB.map(seat => (
                  <div key={seat.id} className={`seat-box ${seat.status}`} onClick={() => handleSeatClick(seat)}>
                    <span className="num">{seat.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="window-divider" />

            <div className="zone">
              <span className="zone-label">창가 C</span>
              <div className="seats-grid cols-3">
                {zoneC.map(seat => (
                  <div key={seat.id} className={`seat-box ${seat.status}`} onClick={() => handleSeatClick(seat)}>
                    <span className="num">{seat.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 요약 */}
      <div className="room-summary">
        <span className="summary-stat"><strong>{emptySeats}</strong>석 이용 가능</span>
        <span className="summary-dot" />
        <span className="summary-stat"><strong>{usingSeats}</strong>석 이용 중</span>
        <span className="summary-dot" />
        <span className="summary-stat">전체 <strong>{seats.length}</strong>석</span>
      </div>

    </div>
  );
}