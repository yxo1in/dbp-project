import { useState } from 'react';
import './App.css'; 

function App({ changeView }){
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(''); // 에러 저장용 상태

    const handleLogin = async () => {
        setLoginError(''); // 버튼 누를 때마다 에러 초기화

        if (!phone.trim()) {
            setLoginError('전화번호를 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone }),
            });

            const data = await response.json();

            // 💡 백엔드에서 success: true를 보내왔고 응답이 정상(200)일 때만 성공 처리
            if (response.ok && data.success) {
                console.log(`${data.user.name}님 로그인 성공!`, data.user);
                
                // 로그인 성공 후 메인 화면으로 이동하고 싶다면 아래 주석을 해제하세요.
                // changeView('home'); 
            } else {
                // 💡 백엔드가 실패 응답(401 등)을 보냈을 때 메시지를 화면에 세팅!
                setLoginError(data.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.log(error); // Unused variable 에러 방지용 log
            setLoginError('백엔드 서버와 연결할 수 없습니다. (서버가 켜져 있는지 확인하세요)');
        }
    };

    return(
        <div className='container'>
            <div className='box-left' style={{ backgroundImage: `url(/img/Container.svg)` }}></div>
            <div className='box-right'>
                <div className='iconContainer'>
                    <div className='icon' style={{ backgroundImage: `url(/img/bookIcon.svg)` }}></div>
                </div>
                
                <div className='input-group'>
                    <label htmlFor="phoneNumber">전화번호</label>
                    <div className='input-wrapper'>
                        <div className='input-icon' style={{ backgroundImage : 'url(/img/phoneIcon.svg)'}}></div>
                        <input 
                            type="text" 
                            id="phoneNumber" 
                            placeholder='010-0000-0000'
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    
                    <label htmlFor="phonePassword" style={{ marginTop:'10px'}}>암호</label>
                    <div className='input-wrapper'>
                        <div className='input-icon' style={{ backgroundImage : 'url(/img/passwordIcon.svg)'}}></div>
                        <input 
                            type="password" 
                            id="phonePassword" 
                            placeholder='********'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    {/* 💡 에러 문구 렌더링 영역 (글씨가 정상 출력되는지 확인하는 곳) */}
                    {loginError && (
                        <span style={{ color: '#e53e3e', fontSize: '12px', marginTop: '8px', textAlign: 'left', width: '100%', fontFamily: 'IBM Plex Sans KR', display: 'block' }}>
                            {loginError}
                        </span>
                    )}
                    
                    <button className='login-btn' onClick={handleLogin}>로그인</button>
                    
                    <p className='sign-in' style={{ cursor: 'pointer' }} onClick={() => changeView('register')}>회원가입</p>
                </div>

                <div className="reg-form-footer">
                    Study Space | 이용약관 | 개인정보처리방침
                </div>
            </div>
        </div>
    );
}

export default App;