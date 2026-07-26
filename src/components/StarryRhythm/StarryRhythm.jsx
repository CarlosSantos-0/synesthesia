import { useRef, useEffect } from 'react';
import styles from './StarryRhythm.module.css';

export default function StarryRhythm({ albumCoverUrl, bpm = 120, energy = 0.5, isPlaying = true }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let stars = [];
        let colorPalette = [{ r: 255, g: 255, b: 255 }];
        const numStars = 250;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // 1. INICIALIZAÇÃO - ESTRELAS MAIORES E MUITO MAIS VISÍVEIS
        const initializeStars = () => {
            stars = Array.from({ length: numStars }).map(() => {
                const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                
                const isTiny = Math.random() > 0.15;
                // DOBRAMOS O TAMANHO BASE
                const baseRadius = isTiny ? (1.5 + Math.random() * 1.5) : (3.5 + Math.random() * 3);
                
                return {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() * 0.3 + 0.1) * (baseRadius * 0.3),
                    vy: (Math.random() * 0.3 - 0.15) * (baseRadius * 0.3),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02 * baseRadius,
                    
                    baseRadius: baseRadius,
                    // A OPACIDADE BASE AGORA É ALTA (Elas nunca apagam no fundo)
                    baseOpacity: isTiny ? (0.4 + Math.random() * 0.4) : (0.7 + Math.random() * 0.3),
                    flareMultiplier: isTiny ? (3 + Math.random() * 3) : (1.5 + Math.random() * 2),
                    
                    currentRadius: baseRadius,
                    currentOpacity: isTiny ? 0.4 : 0.7,
                    color: randomColor
                };
            });
        };

        const extractColors = () => {
            if (!albumCoverUrl) {
                initializeStars();
                return;
            }

            const img = new Image();
            img.crossOrigin = "Anonymous"; 
            
            img.onload = () => {
                try {
                    const offCanvas = document.createElement('canvas');
                    const offCtx = offCanvas.getContext('2d');
                    offCanvas.width = 2;
                    offCanvas.height = 2;
                    
                    offCtx.filter = 'saturate(300%) contrast(100%)'; 
                    offCtx.drawImage(img, 0, 0, 2, 2);
                    
                    const data = offCtx.getImageData(0, 0, 2, 2).data;
                    
                    colorPalette = [
                        { r: data[0], g: data[1], b: data[2] },
                        { r: data[4], g: data[5], b: data[6] },
                        { r: data[8], g: data[9], b: data[10] },
                        { r: data[12], g: data[13], b: data[14] }
                    ];
                    
                    initializeStars();
                } catch (err) {
                    console.error("Bloqueio CORS ou erro na capa:", err);
                    initializeStars();
                }
            };
            img.src = `${albumCoverUrl}?${new Date().getTime()}`; 
        };

        extractColors();

        const draw4PointStar = (x, y, radius, rotation, opacity, color, hasGlow) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.beginPath();
            
            const spikes = 4;
            const innerRadius = radius * 0.25; 
            
            for(let i = 0; i < spikes * 2; i++) {
                const r = (i % 2 === 0) ? radius : innerRadius;
                const angle = (i * Math.PI) / spikes;
                if(i === 0) {
                    ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                } else {
                    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
                }
            }
            
            ctx.closePath();
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
            
            if (hasGlow) {
                // AUMENTAMOS O HALO DA LUZ MASSIVAMENTE (De 15 para 35)
                ctx.shadowBlur = 35;
                ctx.shadowColor = `rgb(${color.r}, ${color.g}, ${color.b})`; 
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.fill();
            ctx.restore();
        };

        let lastTime = performance.now();
        let beatAccumulator = 0;
        
        const safeBpm = bpm > 0 ? bpm : 120;
        const msPerBeat = 60000 / safeBpm;
        const msPerStep = msPerBeat * 0.25; 

        const render = (time) => {
            let deltaTime = time - lastTime;
            if (deltaTime > 100) deltaTime = 16; 
            lastTime = time;

            if (isPlaying) {
                beatAccumulator += deltaTime;

                if (beatAccumulator >= msPerStep) {
                    beatAccumulator -= msPerStep;

                    if (stars.length > 0 && Math.random() < (energy * 0.85)) {
                        const starsToFlare = Math.floor(Math.random() * 15) + 5;
                        
                        for (let i = 0; i < starsToFlare; i++) {
                            const randomStar = stars[Math.floor(Math.random() * stars.length)];
                            if (randomStar) {
                                randomStar.currentOpacity = 1.0; 
                                randomStar.currentRadius = randomStar.baseRadius * randomStar.flareMultiplier;
                            }
                        }
                    }
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ATIVANDO A SOMA DE LUZ (Efeito Neon Overdrive)
            ctx.globalCompositeOperation = 'lighter';

            stars.forEach(s => {
                s.currentOpacity += (s.baseOpacity - s.currentOpacity) * 0.1;
                s.currentRadius += (s.baseRadius - s.currentRadius) * 0.1;
                
                if (s.currentOpacity < 0) s.currentOpacity = 0.01;

                s.x += s.vx;
                s.y += s.vy;
                s.rotation += s.rotationSpeed;

                if (s.x > canvas.width + 20) s.x = -20;
                else if (s.x < -20) s.x = canvas.width + 20;
                
                if (s.y > canvas.height + 20) s.y = -20;
                else if (s.y < -20) s.y = canvas.height + 20;

                // Baixei a tolerância para o brilho ligar mais fácil
                const isFlaring = s.currentOpacity > s.baseOpacity + 0.15;
                
                draw4PointStar(
                    s.x, 
                    s.y, 
                    s.currentRadius, 
                    s.rotation, 
                    s.currentOpacity, 
                    s.color, 
                    isFlaring
                );
            });

            // DESLIGANDO PARA NÃO QUEBRAR O CLEAR_RECT DO PRÓXIMO FRAME
            ctx.globalCompositeOperation = 'source-over';

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [bpm, energy, isPlaying, albumCoverUrl]);

    return <canvas ref={canvasRef} className={styles.starryCanvas} />;
}