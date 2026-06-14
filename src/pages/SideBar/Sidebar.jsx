import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ isOpen, onClose, activeBg, setActiveBg }) {
    const [isBgMenuExpanded, setIsBgMenuExpanded] = useState(true);

    return (
        <>
            <div 
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} 
                onClick={onClose}
            ></div>

            <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.header}>
                    <h2>Menu</h2>
                    <X className={styles.closeIcon} onClick={onClose} size={28} strokeWidth={1.5} />
                </div>

                <div className={styles.content}>
                    <div className={styles.menuGroup}>
                        <div 
                            className={styles.groupHeader}
                            onClick={() => setIsBgMenuExpanded(!isBgMenuExpanded)}
                        >
                            <div className={styles.groupTitle}>
                                <Layers size={20} strokeWidth={1.5} />
                                <span>Background</span>
                            </div>
                            {isBgMenuExpanded ? 
                                <ChevronDown size={20} strokeWidth={1.5} /> : 
                                <ChevronRight size={20} strokeWidth={1.5} />
                            }
                        </div>

                        {isBgMenuExpanded && (
                            <div className={styles.groupOptions}>
                                <button 
                                    className={`${styles.optionBtn} ${activeBg === 'dynamic' ? styles.active : ''}`}
                                    onClick={() => setActiveBg('dynamic')}
                                >
                                    Gradiente
                                </button>
                                
                                <button 
                                    className={`${styles.optionBtn} ${activeBg === 'none' ? styles.active : ''}`}
                                    onClick={() => setActiveBg('none')}
                                >
                                    Desligado (Limpo)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}