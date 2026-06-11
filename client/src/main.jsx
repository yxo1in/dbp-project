import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Register from './Register.jsx'

// 💡 Vite의 Fast Refresh 규칙을 맞추기 위해 default export로 내보냅니다.
export default function MainContainer() {
  // 'login'이면 로그인창, 'register'면 회원가입창을 보여주는 스위치
  const [view, setView] = useState('login');

  return (
    <>
      {view === 'login' ? (
        <App changeView={setView} />
      ) : (
        <Register changeView={setView} />
      )}
    </>
  );
}

// 딱 한 번만 실행되는 구동 코드가 맨 아래에서 실행됩니다.
ReactDOM.createRoot(document.getElementById('root')).render(<MainContainer />);