import { useState, useRef, useEffect } from 'react';
import './Profile.css';

// 💡 setUser를 부모(MenuContainer)로부터 받아오도록 추가했습니다.
export default function Profile({ user, setUser }) {
  const [avatarSrc, setAvatarSrc] = useState(null);
  const fileInputRef = useRef(null);

  // 편집 상태
  const [editing, setEditing] = useState(null); // 'phone' | 'email' | null

  // 부모(MenuContainer)에게 받은 유저 데이터로 상태 초기화 및 실시간 동기화
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [tempVal, setTempVal] = useState('');

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // 비밀번호 관련 상태
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMessage, setPwMessage] = useState(null); // { type: 'error'|'success', text }

  // 이름 첫 글자 (아바타 기본)
  const initial = (user?.name || '?')[0];

  // 총 이용 시간 (분 → 시간/분)
  const totalMinutes = user?.totalUsedTime ?? 0;
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  };

  const startEdit = (field) => {
    setEditing(field);
    setTempVal(field === 'phone' ? phone : email);
  };

  const cancelEdit = () => {
    setEditing(null);
    setTempVal('');
  };

  const saveEdit = async (field) => {
    // 💡 [추가] 정보 저장 전 한 번 더 물어보는 확인창
    const fieldName = field === 'phone' ? '전화번호' : '이메일';
    if (!window.confirm(`입력하신 ${fieldName}로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const body = field === 'phone'
        ? { phone: tempVal }
        : { email: tempVal };

      const res = await fetch(`http://localhost:5000/api/member/${user.memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (field === 'phone') setPhone(tempVal);
        else setEmail(tempVal);
        
        // ⭐ [핵심 추가] 부모 컴포넌트의 유저 상태를 변경하여 localStorage에도 새 정보가 영구 저장되도록 연동합니다.
        if (setUser) {
          setUser(prev => ({
            ...prev,
            [field]: tempVal
          }));
        }

        setEditing(null);
        alert(`${fieldName} 변경이 완료되었습니다.`);
      } else {
        alert(data.message || '저장에 실패했습니다.');
      }
    } catch {
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  const handlePasswordChange = async () => {
    setPwMessage(null);

    if (!currentPw) { setPwMessage({ type: 'error', text: '현재 비밀번호를 입력해주세요.' }); return; }
    if (!newPw) { setPwMessage({ type: 'error', text: '새 비밀번호를 입력해주세요.' }); return; }
    if (newPw.length < 8) { setPwMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' }); return; }
    if (newPw !== confirmPw) { setPwMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' }); return; }

    // 💡 [추가] 비밀번호 변경 적용 전 한 번 더 물어보기
    if (!window.confirm("비밀번호를 변경하시겠습니까?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/member/${user.memberId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPwMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
        
        // 부모 컴포넌트의 비밀번호 정보도 최신화 (필요한 경우)
        if (setUser) {
          setUser(prev => ({ ...prev, password: newPw }));
        }

        setTimeout(() => { setPwOpen(false); setPwMessage(null); }, 1500);
      } else {
        setPwMessage({ type: 'error', text: data.message || '변경에 실패했습니다.' });
      }
    } catch {
      setPwMessage({ type: 'error', text: '서버와 통신 중 오류가 발생했습니다.' });
    }
  };

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <h1>프로필</h1>
        <p>계정 정보를 확인하고 수정할 수 있습니다.</p>
      </header>

      {/* 아바타 + 이름 */}
      <div className="profile-card profile-avatar-section">
        <div className="avatar-circle" onClick={() => fileInputRef.current?.click()}>
          {avatarSrc
            ? <img src={avatarSrc} alt="프로필" />
            : initial
          }
          <div className="avatar-overlay"><span>변경</span></div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="avatar-upload-input"
          onChange={handleAvatarChange}
        />
        <div className="avatar-info">
          <span className="avatar-name">{user?.name || '—'}</span>
          <span className="avatar-sub">사진을 클릭해 변경할 수 있습니다.</span>
        </div>
      </div>

      {/* 이용 통계 */}
      <div className="profile-card profile-stats">
        <div className="stat-item">
          <span className="stat-label">총 이용 시간</span>
          <span className="stat-value">
            {totalHours}<span className="stat-unit">시간</span>
            {totalMins > 0 && <> {totalMins}<span className="stat-unit">분</span></>}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">남은 시간</span>
          <span className="stat-value">
            {Math.floor((user?.remainingTime ?? 0) / 60)}<span className="stat-unit">시간</span>
          </span>
        </div>
      </div>

      {/* 계정 정보 */}
      <div className="profile-card">
        <p className="card-section-title">계정 정보</p>

        {/* 전화번호 */}
        <div className="info-row">
          <div className="info-left">
            <span className="info-label">전화번호</span>
            {editing !== 'phone' && (
              <span className={`info-value ${!phone ? 'placeholder' : ''}`}>
                {phone || '등록된 번호가 없습니다.'}
              </span>
            )}
          </div>
          {editing === 'phone' ? (
            <div className="edit-form">
              <input
                className="edit-input"
                type="text"
                value={tempVal}
                onChange={e => setTempVal(e.target.value)}
                placeholder="010-0000-0000"
                autoFocus
              />
              <button className="save-btn" onClick={() => saveEdit('phone')}>저장</button>
              <button className="cancel-btn" onClick={cancelEdit}>취소</button>
            </div>
          ) : (
            <button className="edit-btn" onClick={() => startEdit('phone')}>수정</button>
          )}
        </div>

        {/* 이메일 */}
        <div className="info-row">
          <div className="info-left">
            <span className="info-label">이메일</span>
            {editing !== 'email' && (
              <span className={`info-value ${!email ? 'placeholder' : ''}`}>
                {email || '등록된 이메일이 없습니다.'}
              </span>
            )}
          </div>
          {editing === 'email' ? (
            <div className="edit-form">
              <input
                className="edit-input"
                type="email"
                value={tempVal}
                onChange={e => setTempVal(e.target.value)}
                placeholder="example@email.com"
                autoFocus
              />
              <button className="save-btn" onClick={() => saveEdit('email')}>저장</button>
              <button className="cancel-btn" onClick={cancelEdit}>취소</button>
            </div>
          ) : (
            <button className="edit-btn" onClick={() => startEdit('email')}>수정</button>
          )}
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="profile-card">
        <p className="card-section-title">보안</p>

        {!pwOpen ? (
          <button className="pw-toggle-btn" onClick={() => setPwOpen(true)}>
            비밀번호 변경
          </button>
        ) : (
          <div className="password-form">
            <div className="password-input-group">
              <label>현재 비밀번호</label>
              <input
                className="edit-input"
                type="password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="현재 비밀번호"
              />
            </div>
            <div className="password-input-group">
              <label>새 비밀번호</label>
              <input
                className="edit-input"
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="8자 이상"
              />
            </div>
            <div className="password-input-group">
              <label>새 비밀번호 확인</label>
              <div className="password-confirm-row">
                <input
                  className="edit-input"
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="비밀번호 재입력"
                />
                <button className="save-btn" onClick={handlePasswordChange}>변경</button>
                <button className="cancel-btn" onClick={() => {
                  setPwOpen(false);
                  setCurrentPw(''); setNewPw(''); setConfirmPw('');
                  setPwMessage(null);
                }}>취소</button>
              </div>
            </div>
            {pwMessage && (
              <span className={pwMessage.type === 'error' ? 'pw-error' : 'pw-success'}>
                {pwMessage.text}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}