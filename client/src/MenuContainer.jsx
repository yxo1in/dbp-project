import { useState, useEffect } from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Map from './Map.jsx';
import Home from './Home.jsx';
import TicketShop from './TicketShop.jsx';
import Profile from './Profile.jsx';
import './MenuContainer.css';

export default function MenuContainer() {
  // 1️⃣ 앱이 켜질 때 localStorage 금고에 로그인 데이터가 있는지 먼저 확인합니다.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('study_space_user');
    return savedUser ? JSON.parse(savedUser) : {
      memberId: null,
      name: '',
      phone: '',
      email: '',
      remainingTime: null,
      currentSeat: null,
    };
  });

  // 2️⃣ user 정보에 따라 기본 화면(view)을 세팅합니다. (로그인 되어있으면 'home', 없으면 'login')
  const [view, setView] = useState(() => {
    const savedUser = localStorage.getItem('study_space_user');
    return savedUser ? 'home' : 'login';
  });

  // 3️⃣ user 상태가 바뀔 때마다 자동으로 localStorage 금고를 최신화해 줍니다.
  useEffect(() => {
    if (user.memberId) {
      localStorage.setItem('study_space_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('study_space_user');
    }
  }, [user]);

  // 💡 로그인 성공 시 백엔드가 준 정보를 저장 + 금고에 저장
  const handleLoginSuccess = (userData) => {
    const newUser = {
      memberId: userData.id,
      name: userData.name,
      phone: userData.phone || '',
      email: userData.email || '',
      remainingTime: userData.remainingTime || 0,
      currentSeat: userData.currentSeat || null,
    };
    setUser(newUser);
    setView('home');
  };

  // 💡 실시간 회원 정보 갱신 (선택지 B 백엔드와 연동되어 새로고침 시에도 동기화됨)
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
          remainingTime: data.remainingTime ?? 0,
        }));
      })
      .catch(() => {
        setUser(prev => ({ ...prev, remainingTime: 0 }));
      });
  }, [user.memberId]);

  // ⏰ 실시간 잔여 시간 차감 및 자동 퇴실 타이머
  useEffect(() => {
    let intervalId = null;

    if (user?.memberId && user?.currentSeat && user?.remainingTime > 0) {
      console.log("⏰ 실시간 잔여 시간 차감 타이머 활성화");
      
      intervalId = setInterval(() => {
        setUser(prevUser => {
          if (!prevUser) return prevUser;

          // 1분 이하로 남았을 때 자동 퇴실 처리
          if (prevUser.remainingTime <= 1) {
            clearInterval(intervalId);
            alert("이용 시간이 모두 만료되어 자동으로 퇴실 처리됩니다.");
            
            fetch('http://localhost:5000/api/seats/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ seat_id: prevUser.currentSeat, member_id: prevUser.memberId }),
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) setView('home');
            })
            .catch(err => console.error("자동 퇴실 API 오류:", err));

            return { ...prevUser, remainingTime: 0, currentSeat: null };
          }

          return {
            ...prevUser,
            remainingTime: prevUser.remainingTime - 1
          };
        });
      }, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user?.currentSeat, user?.memberId]);

  // 🚪 로그아웃 버튼 클릭 시 안전장치 팝업 및 좌석 반납 처리
  const handleLogout = () => {
    if (!window.confirm("로그아웃 하시겠습니까?\n이용 중인 좌석이 있다면 자동으로 퇴실 처리됩니다.")) {
      return; 
    }

    if (user.memberId && user.currentSeat) {
      fetch('http://localhost:5000/api/seats/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seat_id: user.currentSeat, member_id: user.memberId }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            console.error("로그아웃 자동 퇴실 실패:", data.message);
          }
        })
        .catch(err => console.error("로그아웃 자동 퇴실 통신 오류:", err));
    }

    // 🧹 [교정 완료] 튕겨나갔던 세션 초기화 코드를 함수 내부 정상 위치로 재배치했습니다.
    localStorage.removeItem('study_space_user');
    setUser({
      memberId: null,
      name: '',
      phone: '',
      email: '',
      remainingTime: null,
      currentSeat: null,
    });
    setView('login');
  };

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
            <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/ticketIcon.png)` }} />
            이용권 구매
          </button>

          <button 
            className={`menu-item ${view === 'profile' ? 'active' : ''}`}
            onClick={() => setView('profile')}
          >
            <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/profileIcon.png)` }} />
            프로필
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="menu-icon" style={{ backgroundImage: `url(/img/menu/logOutIcon.svg)` }} />
          로그아웃
        </button>
      </aside>

      <main className="content-area">
        {view === 'home' && <Home user={user} setView={setView} />}
        {view === 'map' && <Map user={user} setUser={setUser} setView={setView}/>}
        {view === 'ticket' && <TicketShop user={user} setUser={setUser} setView={setView} />}
        {view === 'profile' && <Profile user={user} setUser={setUser} />}
      </main>
    </div>
  );
} 