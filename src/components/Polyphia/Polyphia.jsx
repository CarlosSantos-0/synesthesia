import { useRef, useEffect } from 'react';
import styles from './Polyphia.module.css';

export default function Polyphia({ albumCoverUrl }) {
    const canvasRef = useRef(null);
    const stringsRef = useRef([]); 
    
    // Controles do Pedal de Distorção e Lógica de Sintetizador (Sustain)
    const isOverdrive = useRef(false);
    const fuzzState = useRef({ amp: 0, noise: 0, time: 0 });
    const heldFuzzKeys = useRef([]); 

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        let colorPalette = ['255, 255, 255'];

        // --- GERAÇÃO DA TEIA CLEAN ---
        const getRandomEdgePoint = (width, height) => {
            const edge = Math.floor(Math.random() * 4);
            if (edge === 0) return { x: Math.random() * width, y: 0 }; 
            if (edge === 1) return { x: width, y: Math.random() * height }; 
            if (edge === 2) return { x: Math.random() * width, y: height }; 
            return { x: 0, y: Math.random() * height }; 
        };

        const generateWeb = (width, height) => {
            const NUM_STRINGS = 60;
            const newStrings = [];
            for (let i = 0; i < NUM_STRINGS; i++) {
                newStrings.push({
                    p1: getRandomEdgePoint(width, height),
                    p2: getRandomEdgePoint(width, height),
                    amp: 0,
                    freq: 0.8 + Math.random() * 0.5,
                    color: colorPalette[i % colorPalette.length]
                });
            }
            stringsRef.current = newStrings;
        };

        const extractColors = () => {
            if (!albumCoverUrl) return;
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                try {
                    const offscreenCanvas = document.createElement('canvas');
                    const offCtx = offscreenCanvas.getContext('2d');
                    offscreenCanvas.width = 3; offscreenCanvas.height = 2;
                    offCtx.filter = 'saturate(200%) brightness(150%)';
                    offCtx.drawImage(img, 0, 0, 3, 2);
                    const data = offCtx.getImageData(0, 0, 3, 2).data;
                    
                    colorPalette = [
                        `${data[0]}, ${data[1]}, ${data[2]}`,
                        `${data[4]}, ${data[5]}, ${data[6]}`,
                        `${data[8]}, ${data[9]}, ${data[10]}`,
                        `${data[12]}, ${data[13]}, ${data[14]}`
                    ];

                    stringsRef.current.forEach((str, i) => {
                        str.color = colorPalette[i % colorPalette.length];
                    });
                } catch (err) {}
            };
            img.src = `${albumCoverUrl}?${new Date().getTime()}`;
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            generateWeb(canvas.width, canvas.height);
            extractColors(); 
        };
        
        window.addEventListener('resize', resize);
        resize();

        // --- CONTROLES (KEYBOARD) ---
        const keyIntensityMap = {
            'KeyA': 1, 'KeyS': 2, 'KeyD': 3, 'KeyF': 4,
            'KeyG': 5, 'KeyH': 6, 'KeyJ': 7, 'KeyK': 8, 'KeyL': 9
        };

        const handleKeyDown = (e) => {
            if (e.repeat) return; 
            
            if (e.code === 'Space') {
                isOverdrive.current = true;
                return;
            }

            if (isOverdrive.current) {
                if (keyIntensityMap[e.code] && !heldFuzzKeys.current.includes(e.code)) {
                    heldFuzzKeys.current.push(e.code);
                }
            } 
            else {
                const strings = stringsRef.current;
                const amountToPluck = Math.floor(Math.random() * 3) + 1; 
                for (let i = 0; i < amountToPluck; i++) {
                    const randomIndex = Math.floor(Math.random() * strings.length);
                    strings[randomIndex].amp = Math.min(canvas.height * 0.04, strings[randomIndex].amp + canvas.height * 0.03); 
                }
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                isOverdrive.current = false; 
                heldFuzzKeys.current = [];   
                return;
            }
            heldFuzzKeys.current = heldFuzzKeys.current.filter(key => key !== e.code);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // --- RENDERIZAÇÃO ---
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';
            
            time += 1.5;

            if (isOverdrive.current) {
                // --- MODO SCOTT LEPAGE (FUZZ/OVERDRIVE) ---
                fuzzState.current.time += 0.2;
                const centerY = canvas.height / 2;
                const primaryColor = colorPalette[0] || '255, 255, 255';

                let targetAmp = 0;
                let targetNoise = 0;

                if (heldFuzzKeys.current.length > 0) {
                    const activeKey = heldFuzzKeys.current[heldFuzzKeys.current.length - 1];
                    const intensity = keyIntensityMap[activeKey];
                    
                    // Ajuste fino: Reduzido drasticamente para não dominar a tela toda
                    targetAmp = canvas.height * 0.015 * intensity; 
                    targetNoise = 5 * intensity; 
                }

                // 2. LERP Agressivo - Attack instantâneo e Muting rápido (85% de velocidade de resposta)
                fuzzState.current.amp += (targetAmp - fuzzState.current.amp) * 0.6;
                fuzzState.current.noise += (targetNoise - fuzzState.current.noise) * 0.6;

                const { amp, noise, time: fuzzTime } = fuzzState.current;

                ctx.beginPath();
                ctx.moveTo(0, centerY);

                const segments = 200; 
                for (let i = 0; i <= segments; i++) {
                    const x = (i / segments) * canvas.width;
                    
                    let wave = Math.sin((x * 0.01) + fuzzTime) * amp;
                    
                    if (noise > 0) {
                        // Correção: Removida a multiplicação pela amplitude que estava quebrando o gráfico
                        wave += (Math.random() - 0.5) * noise; 
                    }

                    // Limite de clipping mais suave e realista (15% da tela)
                    const clipLimit = canvas.height * 0.15;
                    wave = Math.max(Math.min(wave, clipLimit), -clipLimit);
                    
                    ctx.lineTo(x, centerY + wave);
                }

                ctx.shadowBlur = 40;
                ctx.shadowColor = `rgb(${primaryColor})`;
                ctx.strokeStyle = `rgba(${primaryColor}, 0.9)`;
                ctx.lineWidth = 18; // Linha um pouco mais controlada
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#FFF';
                ctx.lineWidth = 6; 
                ctx.stroke();

            } else {
                // --- MODO TIM HENSON (TEIA CLEAN/STACCATO) ---
                stringsRef.current.forEach(string => {
                    const dx = string.p2.x - string.p1.x;
                    const dy = string.p2.y - string.p1.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const nx = -dy / length;
                    const ny = dx / length;

                    ctx.beginPath();
                    ctx.moveTo(string.p1.x, string.p1.y);

                    if (string.amp < 0.5) {
                        ctx.lineTo(string.p2.x, string.p2.y);
                        ctx.shadowBlur = 0;
                        ctx.strokeStyle = `rgba(${string.color}, 0.1)`; 
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    } else {
                        const segments = 15;
                        for (let i = 1; i <= segments; i++) {
                            const t = i / segments;
                            const baseX = string.p1.x + dx * t;
                            const baseY = string.p1.y + dy * t;
                            const wave = Math.sin(t * Math.PI) * Math.cos(time * string.freq) * string.amp;
                            ctx.lineTo(baseX + nx * wave, baseY + ny * wave);
                        }

                        ctx.shadowBlur = 15;
                        ctx.shadowColor = `rgb(${string.color})`;
                        ctx.strokeStyle = `rgba(${string.color}, 0.8)`;
                        ctx.lineWidth = 3;
                        ctx.stroke();

                        ctx.shadowBlur = 0;
                        ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        string.amp *= 0.70; 
                    }
                });
            }

            ctx.globalCompositeOperation = 'source-over';
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [albumCoverUrl]);

    return <canvas ref={canvasRef} className={styles.canvasOverlay} />;
}