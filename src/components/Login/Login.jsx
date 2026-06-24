import styles from './Login.module.css';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID; 
const REDIRECT_URI = window.location.origin + "/";

const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
}

export default function Login() {
    
    const handleLogin = async () => {

        const codeVerifier = generateRandomString(64);
        window.localStorage.setItem('code_verifier', codeVerifier);
        
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);
        

        const scope = 'user-read-currently-playing user-read-playback-state';
        const authUrl = new URL("https://accounts.spotify.com/authorize"); 
        
        authUrl.search = new URLSearchParams({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
        }).toString();
        
        window.location.href = authUrl.toString();
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#08060d', color: '#fff', fontFamily: 'sans-serif', gap: '16px'}}>
            <h1>Synesthesia</h1>
            
            <button onClick={handleLogin} style={{ padding: '15px 30px', backgroundColor: '#1DB954', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                Entrar com o Spotify
            </button>
        </div>
    );
}