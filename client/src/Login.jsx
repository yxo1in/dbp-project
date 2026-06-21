// Login.jsx
import { useState } from 'react';
import './Login.css';

function Login({ changeView, onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    setLoginError('');

    if (!phone.trim()) {
      setLoginError('전화번호를 입력해주세요.');
      return;
    }
    if (!password) {
      setLoginError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setLoginError(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.log(error);
      setLoginError('서버에 연결할 수 없습니다.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="container">
      <div className="box-left" style={{ backgroundImage: `url(/img/Container.svg)` }} />

      <div className="box-right">
        <div className="iconContainer">
          <div className="icon" style={{ backgroundImage: `url(/img/bookIcon.svg)` }} />
        </div>

        <div className="input-group">
          <label htmlFor="phoneNumber">전화번호</label>
          <div className="input-wrapper">
            <div className="input-icon" style={{ backgroundImage: 'url(/img/phoneIcon.svg)' }} />
            <input
              type="text"
              id="phoneNumber"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <label htmlFor="phonePassword" style={{ marginTop: '12px' }}>비밀번호</label>
          <div className="input-wrapper">
            <div className="input-icon" style={{ backgroundImage: 'url(/img/passwordIcon.svg)' }} />
            <input
              type="password"
              id="phonePassword"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {loginError && (
            <span style={{
              color: '#c0392b',
              fontSize: '12px',
              marginTop: '8px',
              fontFamily: 'IBM Plex Sans KR',
              display: 'block',
            }}>
              {loginError}
            </span>
          )}

          <button className="login-btn" onClick={handleLogin}>로그인</button>

          <p className="sign-in" onClick={() => changeView('register')}>
            계정이 없으신가요? 회원가입
          </p>
        </div>

        <div className="reg-form-footer">
          Study Space &nbsp;·&nbsp; 이용약관 &nbsp;·&nbsp; 개인정보처리방침
        </div>
      </div>
    </div>
  );
}

export default Login;