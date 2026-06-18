// src/Home.jsx
import { useState } from 'react';
import './Home.css';

export default function Home({ user, setView }) {
  return (
    <div className="home-wrapper">
      {/* 상단 웰컴 헤더 */}
      <header className="home-header">
        <h1>Welcome Back, {user?.name || '홍길동'}!</h1>
        <p>오늘도 당신의 꿈을 향한 열정을 응원합니다. ✨</p>
      </header>

      {/* 대시보드 카드 그리드 영역 */}
      <section className="dashboard-grid">
        
        {/* 1️⃣ 카드: 나의 이용 현황 */}
        <div className="dash-card my-status">
          <div className="card-header">
            <h3>나의 이용 현황</h3>
            <span className="card-badge">Using</span>
          </div>
          <div className="status-content">
            <div className="status-item">
              <span>남은 시간</span>
              <strong>24시간 15분</strong>
            </div>
            <div className="status-item">
              <span>현재 이용 좌석</span>
              <strong>이용 중 아님</strong>
            </div>
          </div>
          <button className="quick-action-btn primary" onClick={() => setView('map')}>
            지금 좌석 선택하기 ➔
          </button>
        </div>

        <div className="dash-card ticket-shop">
          <div className="card-header">
            <h3>추천 이용권 구매</h3>
            <span className="card-badge HOT">HOT</span>
          </div>
          <div className="ticket-recommend">
            <div className="ticket-info">
              <span className="ticket-name">⏱️ 기간권 / 시간 패키지</span>
              <p className="ticket-desc">가장 인기 있는 <strong>100시간 정기권</strong></p>
            </div>
            <div className="ticket-price">
              <span>80,000원</span>
            </div>
          </div>
          <button className="quick-action-btn brown" onClick={() => setView('ticket')}>
            🎟️ 이용권 구매하러 가기 ➔
          </button>
        </div>

        {/* 3️⃣ 카드: 공지사항 (전체 폭을 채우도록 하단 배치) */}
        <div className="dash-card notices">
          <h3>공지사항</h3>
          <ul className="notice-list">
            <li>
              <span className="notice-tag">[공지]</span>
              <p>하계 기간 에어컨 필터 정기 점검 안내 (7/15)</p>
            </li>
            <li>
              <span className="notice-tag">[이벤트]</span>
              <p>100시간권 구매 시 10시간 추가 증정 혜택!</p>
            </li>
            <li>
              <span className="notice-tag">[안내]</span>
              <p>심야 시간 정기 방역 및 대청소 구역 안내</p>
            </li>
          </ul>
        </div>

      </section>
    </div>
  );
}