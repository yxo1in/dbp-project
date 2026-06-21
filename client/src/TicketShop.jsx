// src/TicketShop.jsx
import './TicketShop.css';

export default function TicketShop({ setView }) {
  // 기간권을 제외했으므로 단순 배열 구조로 명확하게 변경
  const timeTickets = [
    { id: 1, name: '2시간권', price: '3,000원', desc: '당일 가볍게 집중할 때 필요한 기본 시간권' },
    { id: 2, name: '50시간권', price: '65,000원', desc: '시험 기간 진득하게 몰입하는 추천 시간권' },
    { id: 3, name: '100시간권', price: '120,000원', desc: '꾸준한 목표를 달성하기 위한 대용량 시간권', hot: true },
    { id: 4, name: '200시간권', price: '220,000원', desc: '장기 프로젝트를 준비하는 카공족 필수 플랜' },
  ];

  const handleBuy = (name) => {
    alert(`${name} 결제 창으로 이동합니다.`);
  };

  return (
    <div className="ticket-shop-wrapper">
      <header className="shop-header">
        <div className="shop-header-top">
          {/* 💡 홈 화면으로 갈 수 있는 깔끔한 뒤로가기 화살표 버튼 */}
          <button className="back-arrow-btn" onClick={() => setView('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1>이용권 구매</h1>
        </div>
        <p>이용 패턴에 맞는 충전 플랜을 선택하세요.</p>
      </header>

      <div className="shop-tabs">
        <span>시간권 충전</span>
      </div>

      {/* 💡 세로 와이드 카드 리스트 레이아웃 */}
      <div className="ticket-list">
        {timeTickets.map((ticket) => (
          <div key={ticket.id} className={`ticket-card ${ticket.hot ? 'hot-card' : ''}`}>
            
            <div className="ticket-main">
              <div className="ticket-title-area">
                <h3>{ticket.name}</h3>
                {ticket.hot && <span className="hot-tag">BEST</span>}
              </div>
              <p>{ticket.desc}</p>
            </div>

            <div className="ticket-footer">
              <span className="price">{ticket.price}</span>
              <button className="buy-btn" onClick={() => handleBuy(ticket.name)}>
                선택
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}