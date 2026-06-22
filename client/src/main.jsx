  // main.jsx
  import { useState } from 'react'
  import ReactDOM from 'react-dom/client'
  import Login from './Login.jsx'
  import Register from './Register.jsx'
  import Map from './Map.jsx'
  import Home from './Home.jsx'
  import MenuContainer from './MenuContainer.jsx'
  import Profile from './Profile.jsx'

  export default function MainContainer() {
    const [view, setView] = useState('login');
    const [user, setUser] = useState(null);

    const handleLoginSuccess = (userData) => {
      setUser(userData);
      setView('home');
    };

    const renderView = () => {
      switch (view) {
        case 'login':
          return <Login changeView={setView} onLoginSuccess={handleLoginSuccess} />;
        case 'register':
          return <Register changeView={setView} />;
        case 'home':
          return <Home user={user} changeView={setView} />;
        case 'map':
          return <Map user={user}/>
        case 'profile':
          return <Profile user={user}/>
        default:
          return <Login changeView={setView} onLoginSuccess={handleLoginSuccess} />;
      }
    };

    return (
      <>
        {renderView()} {} 
      </>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<MenuContainer />);