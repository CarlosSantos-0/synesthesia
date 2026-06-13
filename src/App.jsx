import { useEffect, useState } from 'react';
import Stage from './pages/Stage/Stage';
import { redirectToAuthCodeFlow, getAccessToken } from './spotify';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        return; 
    }

    const fetchToken = async () => {
        const tokenFromApi = await getAccessToken(code);
        if (tokenFromApi) {
            setToken(tokenFromApi);
            window.history.pushState({}, null, '/'); 
        }
    };

    fetchToken();
  }, []);

  return (
    <>
      {token ? (
        <Stage token={token} /> 
      ) : (
        <div style={loginStyles}>
          <button onClick={redirectToAuthCodeFlow} style={buttonStyles}>
            Conectar com Spotify
          </button>
        </div>
      )}
    </>
  );
}

const loginStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#08060d'
};

const buttonStyles = {
  padding: '16px 32px',
  borderRadius: '99px',
  backgroundColor: '#1DB954',
  color: 'white',
  fontWeight: 'bold',
  fontFamily: 'sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  cursor: 'pointer',
  border: 'none',
  transition: 'transform 0.2s',
};

export default App;