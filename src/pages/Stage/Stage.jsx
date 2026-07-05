import { useState, useEffect } from 'react';
import styles from './Stage.module.css';
import PlaceHolder from '../../assets/PlaceHolder.png';
import { Menu } from 'lucide-react';

import DynamicBackground from '../../components/DynamicBackground/DynamicBackground';
import KineticParticles from '../../components/KineticParticles/KineticParticles';
import OrbitalRhythm from '../../components/OrbitalRhythm/OrbitalRhythm';
import MelodicEQ from '../../components/MelodicEQ/MelodicEQ';
import Sidebar from '../SideBar/Sidebar';
import GlitchRhythm from '../../components/GlitchRhythm/GlitchRhythm';
import BrutalistBackground from '../../components/BrutalistBackground/BrutalistBackground';
import ElasticProgression from '../../components/ElasticProgression/ElasticProgression';

function Stage({ token }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeBackground, setActiveBackground] = useState('particles');
    const [activeRhythm, setActiveRhythm] = useState(8);
    const [activeMelodic, setActiveMelodic] = useState('eq-bottom');

    // Estados estáticos mantidos para não quebrar a mesa de VJ
    const [bpm, setBpm] = useState(120); 
    const [energy, setEnergy] = useState(0.5); 

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(180);
    const [albumCover, setAlbumCover] = useState(PlaceHolder);
    const [trackName, setTrackName] = useState('');
    const [artistName, setArtistName] = useState('');
    const [trackId, setTrackId] = useState(null);

    useEffect(() => {
        if (!token) return;

        const fetchCurrentlyPlaying = async () => {
            try {
                const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 204) {
                    console.log('Spotify currently-playing returned 204 (no content)');
                    return;
                }
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Spotify currently-playing error', response.status, errorText);
                    return;
                }

                const data = await response.json();
                console.log('Spotify currently-playing data', data);
                
                if (data && data.item) {
                    console.log('Spotify item', {
                        id: data.item.id,
                        type: data.item.type,
                        name: data.item.name,
                        is_playing: data.is_playing,
                    });
                    setAlbumCover(data.item.album.images[0].url);
                    setIsPlaying(data.is_playing);
                    setProgress(Math.floor(data.progress_ms / 1000));
                    setDuration(Math.floor(data.item.duration_ms / 1000));
                    setTrackName(data.item.name);
                    setArtistName(data.item.artists.map(artist => artist.name).join(', '));
                    
                    if (data.item.type === 'track') {
                        if (data.item.id !== trackId) {
                            setTrackId(data.item.id);
                        }
                    } else {
                        setTrackId(null);
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

    useEffect(() => {
        console.log('Stage state', {
            activeBackground,
            isPlaying,
            trackId,
            trackName,
            artistName,
            bpm,
            energy,
        });
    }, [activeBackground, isPlaying, trackId, trackName, artistName, bpm, energy]);

    // O useEffect do fetchAudioData foi completamente removido daqui.

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

            {activeBackground === 'brutalist' && (
                <BrutalistBackground bpm={bpm} isPlaying={isPlaying} />
            )}

            {activeBackground === 'elastic' && (
                <ElasticProgression 
                    albumCoverUrl={albumCover} 
                    bpm={bpm} 
                    energy={energy} 
                    isPlaying={isPlaying} 
                />
            )}
            


            {activeRhythm > 0 && (
                <OrbitalRhythm bpm={bpm} steps={activeRhythm} isPlaying={isPlaying}/>
            )}

            {activeRhythm === 'glitch' && (
                <GlitchRhythm bpm={bpm} energy={energy} isPlaying={isPlaying} />
            )}

            {activeMelodic === 'eq-bottom' && (
                <MelodicEQ bpm={bpm} energy={energy} albumCoverUrl={albumCover} />
            )}
            
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