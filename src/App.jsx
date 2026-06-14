import { useEffect, useState, useRef } from 'react';
import Stage from './pages/Stage/Stage';
import { redirectToAuthCodeFlow, getAccessToken } from './spotify';

function App() {
  const [token, setToken] = useState(null);
  
  // Criamos o nosso cadeado (começa destrancado)
  const hasFetchedToken = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // Se não tem código, ou se o cadeado já foi trancado, aborta.
    if (!code || hasFetchedToken.current) {
        return; 
    }

    // Tranca o cadeado para a segunda execução do StrictMode bater na porta e voltar
    hasFetchedToken.current = true;

    const fetchToken = async () => {
        try {
            const tokenFromApi = await getAccessToken(code);
            if (tokenFromApi) {
                setToken(tokenFromApi);
                // Limpa a URL
                window.history.pushState({}, null, '/'); 
            }
        } catch (error) {
            console.error("Erro ao resgatar o token:", error);
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