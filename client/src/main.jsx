import { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Register from './Register.jsx'

export default function MainContainer() {
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

ReactDOM.createRoot(document.getElementById('root')).render(<MainContainer />);