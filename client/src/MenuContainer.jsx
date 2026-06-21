// MenuContainer.jsx
import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Map from './Map.jsx';
import Home from './Home.jsx';
import TicketShop from './TicketShop.jsx';
import './MenuContainer.css';

export default function MenuContainer() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState({
    memberId: null,
    name: '',
    remainingTime: null,
  });

  const handleLoginSuccess = (userData) => {
    setUser({
      memberId: userData.id,
      name: userData.name,
      remainingTime: null,
    });
    setView('home');
  };

  useEffect(() => {
    if (!user.memberId) return;

    fetch(`http://localhost:5000/api/member/${user.memberId}`)
      .then(res => {
        if (!res.ok) throw new Error('서버 응답 실패');
        return res.json();
      })
      .then(data => {
        setUser(prev => ({
          ...prev,
          remainingTime: data.remaining_time ?? 0,
        }));
      })
      .catch(() => {
        setUser(prev => ({ ...prev, remainingTime: 0 }));
      });
  }, [user.memberId]);

  if (view === 'login') return <Login changeView={setView} onLoginSuccess={handleLoginSuccess} />;
  if (view === 'register') return <Register changeView={setView} />;

  return (
    <div className="app-layout">

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box" style={{ backgroundImage: `url(/img/bookIcon.svg)` }} />
          <div>
            <h3>Study Space</h3>
            <p>Premium Lounge</p>
          </div>
        </div>

        <nav className="menu-list">
          <button
            className={`menu-item ${view === 'home' ? 'active' : ''}`}
            onClick={() => setView('home')}
          >
            <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/homeIcon.svg)` }} />
            홈
          </button>

          <button
            className={`menu-item ${view === 'map' ? 'active' : ''}`}
            onClick={() => setView('map')}
          >
            <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/seatIcon.png)` }} />
            좌석 현황
          </button>

          <button
            className={`menu-item ${view === 'ticket' ? 'active' : ''}`}
            onClick={() => setView('ticket')}
          >
            <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/ticketIcon.svg)` }} />
            이용권 구매
          </button>

          <button className="menu-item">
            <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/profileIcon.svg)` }} />
            프로필
          </button>
        </nav>

        <button className="logout-btn" onClick={() => setView('login')}>
          <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/logOutIcon.svg)` }} />
          로그아웃
        </button>
      </aside>

      <main className="content-area">
        {view === 'home' && <Home user={user} setView={setView} />}
        {view === 'map' && <Map user={user} />}
        {view === 'ticket' && <TicketShop />}
      </main>

    </div>
  );
}