import { useState, useEffect } from 'react';
import styles from './Stage.module.css';
import PlaceHolder from '../../assets/PlaceHolder.png';
import { Menu, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat } from 'lucide-react';

function Stage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const duration = 180; // Duração simulada de 3 minutos (180 segundos)

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

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div className={styles.stage}>
            
            {/* TOPO */}
            <header className={styles.header}>
                <Menu className={styles.menuIcon} size={28} />
            </header>

            {/* CENTRO */}
            <main className={styles.center}>
                <img src={PlaceHolder} alt="Capa" className={styles.coverImage} />
            </main>

            {/* RODAPÉ */}
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
                    
                    <div className={styles.playButtonWrapper} onClick={togglePlay}>
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