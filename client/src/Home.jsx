// src/Home.jsx
import { useState } from 'react';
import './Home.css';

export default function Home({ user, setView }) {

  const formatRemainingTime = (minutes) => {
    if (minutes === null || minutes === undefined) return '확인 중';
    if (minutes === 0) return '0분';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}분`;
    if (mins === 0) return `${hours}시간`;
    return `${hours}시간 ${mins}분`;
  };

  return (
    <div className="home-wrapper">

      <header className="home-header">
        <h1>{user?.name || '회원'}님</h1>
        <p>오늘도 좋은 공부 되세요.</p>
      </header>

      <section className="dashboard-grid">

        {/* 이용 현황 */}
        <div className="dash-card">
          <div className="card-header">
            <h3>이용 현황</h3>
            <span className={`card-badge ${user?.currentSeat ? 'active' : ''}`}>
              {user?.currentSeat ? '이용 중' : '미이용'}
            </span>
          </div>
          <div className="status-content">
            <div className="status-item">
              <span>남은 시간</span>
              <strong>{formatRemainingTime(user?.remainingTime)}</strong>
            </div>
            <div className="status-item">
              <span>이용 좌석</span>
              <strong>{user?.currentSeat ? `${user.currentSeat}번` : '—'}</strong>
            </div>
          </div>
          <button className="quick-action-btn secondary" onClick={() => setView('map')}>
            {user?.currentSeat ? '좌석 변경 / 퇴실' : '좌석 선택'}
          </button>
        </div>

        {/* 이용권 */}
        <div className="dash-card">
          <div className="card-header">
            <h3>이용권</h3>
          </div>
          <div className="ticket-box">
            <div className="ticket-info">
              <span className="ticket-label">시간권 · 인기</span>
              <p>100시간 이용권</p>
            </div>
            <div className="ticket-price">
              <span>120,000원</span>
            </div>
          </div>
          <button className="quick-action-btn primary" onClick={() => setView('ticket')}>
            이용권 구매
          </button>
        </div>

        {/* 공지사항 */}
        <div className="dash-card notices">
          <div className="card-header">
            <h3>공지사항</h3>
          </div>
          <ul className="notice-list">
            <li>
              <span className="notice-tag">공지</span>
              <p>하계 기간 에어컨 필터 정기 점검 안내 (7월 15일)</p>
            </li>
            <li>
              <span className="notice-tag">이벤트</span>
              <p>100시간권 구매 시 10시간 추가 증정</p>
            </li>
            <li>
              <span className="notice-tag">안내</span>
              <p>심야 시간 정기 방역 및 대청소 구역 안내</p>
            </li>
          </ul>
        </div>

      </section>
    </div>
  );
}