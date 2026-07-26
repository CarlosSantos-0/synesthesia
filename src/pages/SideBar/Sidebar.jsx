import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Layers, Activity, Radio, Keyboard } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ 
    isOpen, 
    onClose, 
    activeBg, 
    setActiveBg, 
    activeRhythm, 
    setActiveRhythm,
    activeMelodic,       
    setActiveMelodic,
    activeSoundboard,
    setActiveSoundboard,
}) {
    const [isBgMenuExpanded, setIsBgMenuExpanded] = useState(true);
    const [isRhythmMenuExpanded, setIsRhythmMenuExpanded] = useState(true);
    const [isMelodicMenuExpanded, setIsMelodicMenuExpanded] = useState(true);
    const [isSoundboardMenuExpanded, setIsSoundboardMenuExpanded] = useState(true);

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} onClick={onClose}></div>

            <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h2>Menu</h2>
                    <X className={styles.closeIcon} onClick={onClose} size={28} strokeWidth={1.5} />
                </div>

                <div className={styles.content}>
                    
                    {/* GRUPO 1: BACKGROUNDS */}
                    <div className={styles.menuGroup}>
                        <div className={styles.groupHeader} onClick={() => setIsBgMenuExpanded(!isBgMenuExpanded)}>
                            <div className={styles.groupTitle}>
                                <Layers size={20} strokeWidth={1.5} />
                                <span>Background</span>
                            </div>
                            {isBgMenuExpanded ? <ChevronDown size={20} strokeWidth={1.5} /> : <ChevronRight size={20} strokeWidth={1.5} />}
                        </div>

                        {isBgMenuExpanded && (
                            <div className={styles.groupOptions}>
                                <button className={`${styles.optionBtn} ${activeBg === 'dynamic' ? styles.active : ''}`} onClick={() => { console.log('Sidebar selected background', 'dynamic'); setActiveBg('dynamic'); }}>
                                    Névoa Reativa
                                </button>
                                <button className={`${styles.optionBtn} ${activeBg === 'particles' ? styles.active : ''}`} onClick={() => { console.log('Sidebar selected background', 'particles'); setActiveBg('particles'); }}>
                                    Partículas Cinéticas
                                </button>
                                <button className={`${styles.optionBtn} ${activeBg === 'brutalist' ? styles.active : ''}`} onClick={() => { console.log('Sidebar selected background', 'brutalist'); setActiveBg('brutalist'); }}>
                                    Brutalista
                                </button>
                                <button className={`${styles.optionBtn} ${activeBg === 'elastic' ? styles.active : ''}`} onClick={() => { console.log('Sidebar selected background', 'elastic'); setActiveBg('elastic'); }}>
                                    Slam jam
                                </button>
                                <button className={`${styles.optionBtn} ${activeBg === 'starry' ? styles.active : ''}`} onClick={() => { console.log('Sidebar selected background', 'starry'); setActiveBg('starry'); }}>
                                    Céu Estrelado
                                </button>
                                <button className={`${styles.optionBtn} ${activeBg === 'none' ? styles.active : ''}`} onClick={() => { console.log('Sidebar selected background', 'none'); setActiveBg('none'); }}>
                                    Fundo Escuro
                                </button>
                            </div>
                        )}
                    </div>

                    {/* GRUPO 2: RÍTMICOS */}
                    <div className={styles.menuGroup}>
                        <div className={styles.groupHeader} onClick={() => setIsRhythmMenuExpanded(!isRhythmMenuExpanded)}>
                            <div className={styles.groupTitle}>
                                <Activity size={20} strokeWidth={1.5} />
                                <span>Rítmicos</span>
                            </div>
                            {isRhythmMenuExpanded ? <ChevronDown size={20} strokeWidth={1.5} /> : <ChevronRight size={20} strokeWidth={1.5} />}
                        </div>

                        {isRhythmMenuExpanded && (
                            <div className={styles.groupOptions}>
                                <button className={`${styles.optionBtn} ${activeRhythm === 4 ? styles.active : ''}`} onClick={() => setActiveRhythm(4)}>
                                    Anel Orbital (4 Beats)
                                </button>
                                <button className={`${styles.optionBtn} ${activeRhythm === 8 ? styles.active : ''}`} onClick={() => setActiveRhythm(8)}>
                                    Anel Orbital (8 Beats)
                                </button>
                                <button className={`${styles.optionBtn} ${activeRhythm === 16 ? styles.active : ''}`} onClick={() => setActiveRhythm(16)}>
                                    Anel Orbital (16 Beats)
                                </button>
                                <button className={`${styles.optionBtn} ${activeRhythm === 'glitch' ? styles.active : ''}`} onClick={() => setActiveRhythm('glitch')}>
                                    Take Time (8 Beats)
                                </button>
                                <button className={`${styles.optionBtn} ${activeRhythm === 0 ? styles.active : ''}`} onClick={() => setActiveRhythm(0)}>
                                    Desligado
                                </button>
                            </div>
                        )}
                    </div>

                    {/* GRUPO 3: MELÓDICOS */}
                    <div className={styles.menuGroup}>
                        <div className={styles.groupHeader} onClick={() => setIsMelodicMenuExpanded(!isMelodicMenuExpanded)}>
                            <div className={styles.groupTitle}>
                                <Radio size={20} strokeWidth={1.5} />
                                <span>Melódicos</span>
                            </div>
                            {isMelodicMenuExpanded ? <ChevronDown size={20} strokeWidth={1.5} /> : <ChevronRight size={20} strokeWidth={1.5} />}
                        </div>

                        {isMelodicMenuExpanded && (
                            <div className={styles.groupOptions}>
                                <button className={`${styles.optionBtn} ${activeMelodic === 'eq-bottom' ? styles.active : ''}`} onClick={() => setActiveMelodic('eq-bottom')}>
                                    EQ Espelhado (Base)
                                </button>
                                <button className={`${styles.optionBtn} ${activeMelodic === 'none' ? styles.active : ''}`} onClick={() => setActiveMelodic('none')}>
                                    Desligado
                                </button>
                            </div>
                        )}

                        
                    </div>
                    
                    {/* GRUPO 4: SOUNDBOARDS */}
                    <div className={styles.menuGroup}>
                        <div className={styles.groupHeader} onClick={() => setIsSoundboardMenuExpanded(!isSoundboardMenuExpanded)}>
                            <div className={styles.groupTitle}>
                                <Keyboard size={20} strokeWidth={1.5} />
                                <span>Soundboards</span>
                            </div>
                            {isSoundboardMenuExpanded ? <ChevronDown size={20} strokeWidth={1.5} /> : <ChevronRight size={20} strokeWidth={1.5} />}
                        </div>

                        {isSoundboardMenuExpanded && (
                            <div className={styles.groupOptions}>
                                <button className={`${styles.optionBtn} ${activeSoundboard === 'juggernaut' ? styles.active : ''}`} onClick={() => setActiveSoundboard('juggernaut')}>
                                    Juggernaut (Dubstep)
                                </button>
                                <button className={`${styles.optionBtn} ${activeSoundboard === 'none' ? styles.active : ''}`} onClick={() => setActiveSoundboard('none')}>
                                    Desligado
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}