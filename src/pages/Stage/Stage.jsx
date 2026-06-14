import { useState, useEffect } from 'react';
import styles from './Stage.module.css';
import PlaceHolder from '../../assets/PlaceHolder.png';
import { Menu } from 'lucide-react';

// Importação dos Componentes das Camadas
import DynamicBackground from '../../components/DynamicBackground/DynamicBackground';
import KineticParticles from '../../components/KineticParticles/KineticParticles';
import OrbitalRhythm from '../../components/OrbitalRhythm/OrbitalRhythm';
import MelodicEQ from '../../components/MelodicEQ/MelodicEQ';
import Sidebar from '../SideBar/Sidebar';

function Stage({ token }) {
    // --- ESTADOS DO MENU E CAMADAS ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeBackground, setActiveBackground] = useState('particles');
    const [activeRhythm, setActiveRhythm] = useState(8);
    const [activeMelodic, setActiveMelodic] = useState('eq-bottom');

    // --- ESTADOS DE CONTROLE DE RÍTMO ---
    const [bpm, setBpm] = useState(120); 
    const [energy, setEnergy] = useState(0.5); 

    // --- ESTADOS DE REPRODUÇÃO (SPOTIFY) ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(180);
    const [albumCover, setAlbumCover] = useState(PlaceHolder);
    const [trackName, setTrackName] = useState('');
    const [artistName, setArtistName] = useState('');
    const [trackId, setTrackId] = useState(null);

    // 1. Motor de Polling: Busca metadados da música atual a cada 1 segundo
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

    // 2. Motor de Análise: Captura o BPM e Energia REAIS da música
    useEffect(() => {
        if (!token || !trackId) return;

        const fetchAudioData = async () => {
            try {
                const resFeatures = await fetch(`https://api.spotify.com/v1/audio-features/$$${trackId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (resFeatures.ok) {
                    const dataFeatures = await resFeatures.json();
                    if (dataFeatures) {
                        setBpm(dataFeatures.tempo || 120); 
                        setEnergy(dataFeatures.energy || 0.5);  
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar características de áudio:", error);
            }
        };

        fetchAudioData();
    }, [token, trackId]);

    // 3. Relógio Local: Incrementa a barra de progresso segundo a segundo na UI
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
            
            {/* INTERFACE DE CONTROLE COMPLETA */}
            <Sidebar 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                activeBg={activeBackground}
                setActiveBg={setActiveBackground}
                activeRhythm={activeRhythm}        
                setActiveRhythm={setActiveRhythm}
                activeMelodic={activeMelodic}         
                setActiveMelodic={setActiveMelodic}
            />

            {/* CAMADA 1: BACKGROUNDS */}
            {activeBackground === 'dynamic' && (
                <DynamicBackground albumCoverUrl={albumCover} bpm={bpm} energy={energy} />
            )}

            {activeBackground === 'particles' && (
                <KineticParticles albumCoverUrl={albumCover} bpm={bpm} energy={energy} />
            )}

            {/* CAMADA 2: RÍTMICOS */}
            {activeRhythm > 0 && (
                <OrbitalRhythm bpm={bpm} steps={activeRhythm} />
            )}

            {/* CAMADA 3: MELÓDICOS */}
            {activeMelodic === 'eq-bottom' && (
                <MelodicEQ bpm={bpm} energy={energy} />
            )}
            
            {/* CAMADA 4: UI DE TEXTOS E METADADOS */}
            <header className={styles.header}>
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