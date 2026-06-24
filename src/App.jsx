import { useState, useEffect } from 'react';
import Stage from './pages/Stage/Stage';
import Login from './components/Login/Login'; 
import './App.css';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID; 
const REDIRECT_URI = window.location.origin + "/";

function App() {
    const [token, setToken] = useState("");

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        let code = urlParams.get('code');
        let savedToken = window.localStorage.getItem("token");

        if (!savedToken && code) {
            window.history.replaceState({}, document.title, "/");
            
            const codeVerifier = window.localStorage.getItem('code_verifier');
            
            const fetchToken = async () => {
                try {
                    const response = await fetch('https://accounts.spotify.com/api/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            client_id: CLIENT_ID,
                            grant_type: 'authorization_code',
                            code: code,
                            redirect_uri: REDIRECT_URI,
                            code_verifier: codeVerifier,
                        }),
                    });
                    
                    const data = await response.json();
                    if (data.access_token) {
                        window.localStorage.setItem("token", data.access_token);
                        setToken(data.access_token);
                    }
                } catch (err) {
                    console.error("Erro ao gerar token PKCE:", err);
                }
            };
            
            fetchToken();
        } else {
            setToken(savedToken);
        }
    }, []);

    const logout = () => {
        setToken("");
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("code_verifier");
    };

    return (
        <div className="App">
            {!token ? (
                <Login />
            ) : (
                <>
                    <button onClick={logout} style={{ position: 'absolute', top: '100px', right: '15px', zIndex: 999, padding: '8px 15px', background: 'rgba(0, 0, 0, 0.5)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        Desconectar
                    </button>
                    <Stage token={token} />
                </>
            )}
        </div>
    );
}

export default App;