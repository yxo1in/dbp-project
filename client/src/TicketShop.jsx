// src/TicketShop.jsx
import { useState, useEffect } from 'react';
import './TicketShop.css';

// 💡 부모에게서 user를 업데이트할 수 있는 함수(예: setUser 또는 loginUser 등)를 받아옵니다.
// 여기서는 가장 직관적인 'setUser'를 프롭스로 추가하여 연동합니다.
export default function TicketShop({ user, setUser, setView }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/tickets')
      .then(res => {
        if (!res.ok) throw new Error(`서버 응답 오류: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error(`응답 형식 오류: 데이터가 배열이 아닙니다.`);
        setTickets(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleBuy = async (ticket) => {
    const currentMemberId = user?.memberId || user?.id;
    
    if (!currentMemberId) { 
      alert('로그인이 필요합니다.'); 
      return; 
    }
    
    if (!window.confirm(`${ticket.ticket_name}을 구매하시겠습니까?\n${ticket.price.toLocaleString()}원`)) return;

    setBuying(ticket.ticket_id);
    try {
      const res = await fetch('http://localhost:5000/api/tickets/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: currentMemberId, ticket_id: ticket.ticket_id }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(`${ticket.ticket_name} 구매가 완료되었습니다.`);

        // 💡 [핵심] 구매 성공 시 프론트엔드의 user 상태도 실시간으로 결제한 시간만큼 더해줍니다!
        if (setUser && user) {
          const minutesToAdd = ticket.time || 0;
          setUser(prevUser => ({
            ...prevUser,
            // 백엔드 필드명 규격에 맞게 두 군데 모두 실시간 최신화 반영
            remainingTime: (prevUser.remainingTime || 0) + minutesToAdd,
            remain_minutes: (prevUser.remain_minutes || 0) + minutesToAdd
          }));
        }

        if (setView) setView('home'); // 구매 완료 후 메인 홈 화면으로 이동
      } else {
        alert(data.message || '구매에 실패했습니다.');
      }
    } catch {
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setBuying(null);
    }
  };

  const isHot = (ticket) => ticket.ticket_name === '100시간권' || ticket.ticket_name?.includes('100시간');

  if (loading) return <div className="map-loading">이용권 정보를 불러오는 중입니다.</div>;

  if (error) {
    return (
      <div className="ticket-shop-wrapper">
        <header className="shop-header">
          <div className="shop-header-top">
            <button className="back-arrow-btn" onClick={() => setView && setView('home')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <h1>이용권 구매</h1>
          </div>
        </header>
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: '#fff8f8',
          border: '0.5px solid #f5c6c6',
          borderRadius: '12px',
          fontFamily: 'IBM Plex Sans KR, sans-serif',
        }}>
          <p style={{ fontSize: '13px', color: '#c0392b', margin: '0 0 8px 0', fontWeight: 500 }}>이용권을 불러오지 못했습니다.</p>
          <p style={{ fontSize: '12px', color: '#9d8f84', margin: 0 }}>{error}</p>
          <p style={{ fontSize: '12px', color: '#9d8f84', margin: '8px 0 0 0' }}>
            서버가 실행 중인지, <code>GET /api/tickets</code> 엔드포인트가 있는지 확인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-shop-wrapper">
      <header className="shop-header">
        <div className="shop-header-top">
          <button className="back-arrow-btn" onClick={() => setView && setView('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1>이용권 구매</h1>
        </div>
        <p>이용 패턴에 맞는 충전 플랜을 선택하세요.</p>
      </header>

      <div className="shop-tabs">
        <span>시간권 충전</span>
      </div>

      <div className="ticket-list">
        {tickets.map((ticket) => {
          const rawTime = ticket.time || 0;
          const calculatedHours = Math.floor(rawTime / 60);

          return (
            <div key={ticket.ticket_id} className={`ticket-card ${isHot(ticket) ? 'hot-card' : ''}`}>
              <div className="ticket-main">
                <div className="ticket-title-area">
                  <h3>{ticket.ticket_name}</h3>
                  {isHot(ticket) && <span className="hot-tag">BEST</span>}
                </div>
                <p>{calculatedHours > 0 ? `${calculatedHours}시간` : `${rawTime}분`}</p>
              </div>
              <div className="ticket-footer">
                <span className="price">{(ticket.price || 0).toLocaleString()}원</span>
                <button
                  className="buy-btn"
                  onClick={() => handleBuy(ticket)}
                  disabled={buying === ticket.ticket_id}
                >
                  {buying === ticket.ticket_id ? '처리 중' : '선택'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}