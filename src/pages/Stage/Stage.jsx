import { useState, useEffect } from 'react';
import styles from './Stage.module.css';
import PlaceHolder from '../../assets/PlaceHolder.png';
import { Menu } from 'lucide-react';
import DynamicBackground from '../../components/DynamicBackground/DynamicBackground';
import Sidebar from '../SideBar/Sidebar'

function Stage({ token }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeBackground, setActiveBackground] = useState('dynamic');

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(180);
    const [albumCover, setAlbumCover] = useState(PlaceHolder);
    const [trackName, setTrackName] = useState('');
    const [artistName, setArtistName] = useState('');
    
    const [trackId, setTrackId] = useState(null);
    const [bpm, setBpm] = useState(120); 
    const [energy, setEnergy] = useState(0.5); 

    useEffect(() => {
        if (!token) return;

        const fetchCurrentlyPlaying = async () => {
            try {
                const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 204 || response.status > 400) return; 

                const data = await response.json();
                
                if (data && data.item) {
                    setAlbumCover(data.item.album.images[0].url);
                    setIsPlaying(data.is_playing);
                    setProgress(Math.floor(data.progress_ms / 1000));
                    setDuration(Math.floor(data.item.duration_ms / 1000));
                    setTrackName(data.item.name);
                    setArtistName(data.item.artists.map(artist => artist.name).join(', '));
                    
                    if (data.item.id !== trackId) {
                        setTrackId(data.item.id);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar música:", error);
            }
        };

        fetchCurrentlyPlaying();
        const interval = setInterval(fetchCurrentlyPlaying, 1000); 
        return () => clearInterval(interval);
    }, [token, trackId]);

    // 2. Busca as características de áudio (Roda SÓ quando o trackId muda)
    useEffect(() => {
        if (!token || !trackId) return;

        const fetchAudioFeatures = async () => {
            try {
                const response = await fetch(`accounts.spotify.com/authorize?...4${trackId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (data) {
                    setBpm(data.tempo); 
                    setEnergy(data.energy);  
                }
            } catch (error) {
                console.error("Erro ao buscar features de áudio:", error);
            }
        };

        fetchAudioFeatures();
    }, [token, trackId]);

    // 3. Atualização local da barra de progresso
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => (prev >= duration ? 0 : prev + 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, duration]);

    const progressPercent = (progress / duration) * 100;

    return (
        <div className={styles.stage}>
            
            {/* INJETANDO A SIDEBAR */}
            <Sidebar 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                activeBg={activeBackground}
                setActiveBg={setActiveBackground}
            />

            {/* RENDERIZAÇÃO CONDICIONAL DO FUNDO */}
            {activeBackground === 'dynamic' && (
                <DynamicBackground 
                    albumCoverUrl={albumCover} 
                    bpm={bpm} 
                    energy={energy} 
                />
            )}
            
            <header className={styles.header}>
                {/* ADICIONADO O ONCLICK NO ÍCONE DO MENU */}
                <Menu 
                    className={styles.menuIcon} 
                    size={28} 
                    onClick={() => setIsMenuOpen(true)} 
                />
                <div className={styles.trackInfo}>
                    <h1 className={styles.trackName}>{trackName || "Sem reprodução"}</h1>
                    <p className={styles.artistName}>{artistName || "Nenhum artista"}</p>
                </div>
            </header>

            <main className={styles.center}>
                <img src={albumCover} alt="Capa" className={styles.coverImage} />
            </main>

            <footer className={styles.footer}>
                <div className={styles.progressBarContainer}>
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill} 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                        <div 
                            className={styles.progressIndicator} 
                            style={{ left: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            </footer>
            
        </div>
    );
}

export default Stage;