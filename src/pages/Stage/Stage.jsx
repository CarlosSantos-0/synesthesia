import { useState, useEffect } from 'react';
import styles from './Stage.module.css';
import PlaceHolder from '../../assets/PlaceHolder.png';
import { Menu, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat } from 'lucide-react';

function Stage({ token }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [albumCover, setAlbumCover] = useState(PlaceHolder);
    const duration = 180; 

    useEffect(() => {
        if (!token) return;

        const fetchCurrentlyPlaying = async () => {
            try {
                const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 204 || response.status > 400) {
                    return; 
                }

                const data = await response.json();
                
                if (data && data.item) {
                    setAlbumCover(data.item.album.images[0].url);
                    setIsPlaying(data.is_playing);
                    setProgress(Math.floor(data.progress_ms / 1000));
                }
            } catch (error) {
                console.error("Erro ao buscar música:", error);
            }
        };

        fetchCurrentlyPlaying();

        const interval = setInterval(fetchCurrentlyPlaying, 5000);
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => (prev >= duration ? 0 : prev + 1));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const progressPercent = (progress / duration) * 100;

    return (
        <div className={styles.stage}>
            
            <header className={styles.header}>
                <Menu className={styles.menuIcon} size={28} />
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

                <div className={styles.controls}>
                    <Shuffle size={22} className={styles.controlIcon} />
                    <SkipBack size={28} className={styles.controlIcon} />
                    
                    <div className={styles.playButtonWrapper}>
                        {isPlaying ? (
                            <Pause size={36} className={styles.playIcon} fill="currentColor" />
                        ) : (
                            <Play size={36} className={styles.playIcon} fill="currentColor" />
                        )}
                    </div>
                    
                    <SkipForward size={28} className={styles.controlIcon} />
                    <Repeat size={22} className={styles.controlIcon} />
                </div>
            </footer>
            
        </div>
    );
}

export default Stage;