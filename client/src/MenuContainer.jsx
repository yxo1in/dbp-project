// MenuContainer.jsx
import { useState } from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Map from './Map.jsx';
import Home from './Home.jsx';

import './MenuContainer.css'; 

export default function MenuContainer() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('home'); 
  };

  if (view === 'login') {
    return <Login changeView={setView} onLoginSuccess={handleLoginSuccess} />;
  }
  if (view === 'register') {
    return <Register changeView={setView} />;
  }

  return (
    <div className="app-layout">
      
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box" style={{ color: 'white', backgroundImage: `url(/img/bookIcon.svg)` }}></div>
          <div>
            <h3>Study Space</h3>
            <p>Premium Lounge</p>
          </div>
        </div>

        <nav className="menu-list">
          <button className={`menu-item ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
            <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/homeIcon.svg)` }}></span>
            홈
          </button>
          
          <button className={`menu-item ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>
            <span className='menu-icon' style={{ backgroundImage: `url(/img/menu/seatIcon.svg)`}}></span>
            좌석 현황
          </button>
          
          <button className="menu-item">
            <span className='menu-icon' style={{ backgroundImage: `url(/img/menu/ticketIcon.svg)` }}></span>
            이용권 구매
          </button>
          <button className="menu-item">
            <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/profileIcon.svg)` }}></span>
            프로필
          </button>
        </nav>

        <button className="logout-btn" onClick={() => setView('login')}>
          <span className='menu-icon' style={{ backgroundImage: `url(/img/menu/logOutIcon.svg)` }}></span>
          로그아웃
        </button>
      </aside>

      <main className="content-area">
        {view === 'home' && <Home user = {user} setView={setView}/>}
        {view === 'map' && <Map user={user} />}
      </main>

    </div>
  );
}