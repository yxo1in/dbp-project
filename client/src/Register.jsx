import { useState } from 'react';
import './Register.css'; 

function Register({ changeView }) {
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    let newErrors = {};
    if (!name.trim()) newErrors.name = '성함을 입력해주세요.';
    if (!phone.trim()) newErrors.phone = '휴대폰 번호를 입력해주세요.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!email.includes('@')) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegisterSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, email }), 
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(3);
      } else {
        setErrors({ serverError: data.message || '가입 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.log(setErrors({ serverError: '백엔드 서버가 켜져 있는지 확인해 주세요!' }));
      console.log(error);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setErrors({});
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setErrors({});
        handleRegisterSubmit(); 
      }
    }
  };

  return (
    <div className='reg-container'>
      <div className='reg-box-left' style={{ backgroundImage: `url(/img/Container.svg)` }}>
      </div>

      <div className='reg-box-right'>
        <div className='reg-form-container'>
          <div className="reg-step-header">
            <div className="reg-step-info">
              <span>STEP 0{step} / 03</span>
              <span className="reg-percent">{step === 1 ? '33%' : step === 2 ? '66%' : '100%'}</span>
            </div>
            <h3>{step === 1 ? '기본 정보 입력' : step === 2 ? '계정 정보 입력' : '가입 완료'}</h3>
            <div className="reg-progress-bar">
              <div className="reg-progress" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
          </div>

          <div className='reg-input-group'>
            {step === 1 && (
              <>
                <label>이름</label>
                <div className={`reg-input-wrapper ${errors.name ? 'input-error' : ''}`}>
                  <input 
                    type="text" 
                    placeholder="성함을 입력해주세요" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {errors.name && <span className="error-text">{errors.name}</span>}

                <label style={{ marginTop: '15px' }}>휴대폰 번호</label>
                <div className="reg-input-row">
                  <div className={`reg-input-wrapper ${errors.phone ? 'input-error' : ''}`}>
                    <input 
                      type="text" 
                      placeholder="010-0000-0000" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <button className="reg-side-btn" type="button">인증번호 발송</button>
                </div>
                {errors.phone && <span className="error-text">{errors.phone}</span>}
                
                <div className='reg-input-wrapper' style={{marginTop: '10px'}}>
                   <input type="text" placeholder="인증번호 6자리 입력" maxLength={6} />
                </div>

                <button className='reg-login-btn' onClick={handleNextStep}>다음 단계로 ➔</button>
                <p className='reg-sign-in'>
                    이미 회원이신가요? <span onClick={() => changeView('login')}>로그인하기</span>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <label>이메일</label>
                <div className={`reg-input-wrapper ${errors.email ? 'input-error' : ''}`}>
                  <input 
                    type="email" 
                    placeholder="example@study.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}

                <label style={{ marginTop: '15px' }}>비밀번호</label>
                <div className={`reg-input-wrapper ${errors.password ? 'input-error' : ''}`}>
                  <input 
                    type="password" 
                    placeholder="8자 이상 입력해주세요" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}

                <label style={{ marginTop: '15px' }}>비밀번호 확인</label>
                <div className={`reg-input-wrapper ${errors.confirmPassword ? 'input-error' : ''}`}>
                  <input 
                    type="password" 
                    placeholder="비밀번호를 한번 더 입력해주세요" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                
                {/* 서버 에러 발생 시 출력되는 문구 */}
                {errors.serverError && <span className="error-text" style={{ marginTop: '10px', fontWeight: 'bold' }}>{errors.serverError}</span>}

                <button className='reg-login-btn' onClick={handleNextStep}>회원가입 완료 ➔</button>
              </>
            )}

            {step === 3 && (
              <div className="reg-success-view">
                <div className="reg-success-icon">✔</div>
                <h4>회원가입이 완료되었습니다!</h4>
                <p>Study Space의 회원이 되신 것을 환영합니다.</p>
                <button className='reg-login-btn' onClick={() => changeView('login')}>로그인하러 가기</button>
              </div>
            )}
          </div>

          <div className="reg-form-footer">
            Study Space | 이용약관 | 개인정보처리방침
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;