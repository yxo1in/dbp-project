// Register.jsx
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
    const newErrors = {};
    if (!name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!phone.trim()) newErrors.phone = '휴대폰 번호를 입력해주세요.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!email.includes('@')) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 8) {
      newErrors.password = '8자 이상 입력해주세요.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 한 번 더 입력해주세요.';
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
      console.log(error);
      setErrors({ serverError: '서버에 연결할 수 없습니다.' });
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setErrors({});
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setErrors({});
      handleRegisterSubmit();
    }
  };

  const stepLabel = step === 1 ? '기본 정보' : step === 2 ? '계정 설정' : '가입 완료';
  const progressPercent = `${Math.round((step / 3) * 100)}%`;

  return (
    <div className="reg-container">
      <div className="reg-box-left" style={{ backgroundImage: `url(/img/Container.svg)` }} />

      <div className="reg-box-right">
        <div className="reg-form-container">

          <div className="reg-step-header">
            <div className="reg-step-info">
              <span>{step} / 3단계</span>
              <span>{progressPercent}</span>
            </div>
            <h3>{stepLabel}</h3>
            <div className="reg-progress-bar">
              <div className="reg-progress" style={{ width: progressPercent }} />
            </div>
          </div>

          <div className="reg-input-group">

            {step === 1 && (
              <>
                <label>이름</label>
                <div className={`reg-input-wrapper ${errors.name ? 'input-error' : ''}`}>
                  <input
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {errors.name && <span className="error-text">{errors.name}</span>}

                <label style={{ marginTop: '14px' }}>휴대폰 번호</label>
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

                <div className="reg-input-wrapper" style={{ marginTop: '8px' }}>
                  <input type="text" placeholder="인증번호 6자리" maxLength={6} />
                </div>

                <button className="reg-login-btn" onClick={handleNextStep}>다음</button>
                <p className="reg-sign-in">
                  이미 회원이신가요? <span onClick={() => changeView('login')}>로그인</span>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <label>이메일</label>
                <div className={`reg-input-wrapper ${errors.email ? 'input-error' : ''}`}>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}

                <label style={{ marginTop: '14px' }}>비밀번호</label>
                <div className={`reg-input-wrapper ${errors.password ? 'input-error' : ''}`}>
                  <input
                    type="password"
                    placeholder="8자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}

                <label style={{ marginTop: '14px' }}>비밀번호 확인</label>
                <div className={`reg-input-wrapper ${errors.confirmPassword ? 'input-error' : ''}`}>
                  <input
                    type="password"
                    placeholder="비밀번호 재입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

                {errors.serverError && (
                  <span className="error-text" style={{ marginTop: '10px' }}>{errors.serverError}</span>
                )}

                <button className="reg-login-btn" onClick={handleNextStep}>가입 완료</button>
              </>
            )}

            {step === 3 && (
              <div className="reg-success-view">
                <div className="reg-success-icon">✓</div>
                <h4>가입이 완료되었습니다.</h4>
                <p>Study Space를 이용해 주셔서 감사합니다.</p>
                <button className="reg-login-btn" onClick={() => changeView('login')}>로그인</button>
              </div>
            )}

          </div>

          <div className="reg-form-footer">
            Study Space &nbsp;·&nbsp; 이용약관 &nbsp;·&nbsp; 개인정보처리방침
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;