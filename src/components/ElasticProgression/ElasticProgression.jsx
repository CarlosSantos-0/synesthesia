import { useRef, useEffect } from 'react';
import styles from './ElasticProgression.module.css';

export default function ElasticProgression({ albumCoverUrl, bpm = 120, energy = 0.5, isPlaying = true }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Variáveis de estado do Canvas
        let particles = [];
        let colorPalette = [{ r: 255, g: 255, b: 255 }]; // Branco padrão
        let bgR = 10, bgG = 10, bgB = 10; // Fundo escuro padrão
        const numParticles = 150;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // 1. INICIALIZAÇÃO DAS PARTÍCULAS
        const initializeParticles = () => {
            particles = Array.from({ length: numParticles }).map(() => {
                const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                return {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    lastX: 0,
                    depth: 0.2 + Math.random() * 0.8,
                    size: 1 + Math.random() * 2,
                    opacity: 0.2 + Math.random() * 0.8,
                    color: randomColor
                };
            });
        };

        // 2. EXTRATOR DE CORES DO ÁLBUM
        const extractColors = () => {
            if (!albumCoverUrl) {
                initializeParticles();
                return;
            }

            const img = new Image();
            img.crossOrigin = "Anonymous"; 
            
            img.onload = () => {
                try {
                    const offscreenCanvas = document.createElement('canvas');
                    const offCtx = offscreenCanvas.getContext('2d');
                    offscreenCanvas.width = 2;
                    offscreenCanvas.height = 2;
                    
                    offCtx.filter = 'saturate(100%)'; 
                    offCtx.drawImage(img, 0, 0, 2, 2);
                    
                    const data = offCtx.getImageData(0, 0, 2, 2).data;
                    
                    const c1 = { r: data[0], g: data[1], b: data[2] };
                    const c2 = { r: data[4], g: data[5], b: data[6] };
                    const c3 = { r: data[8], g: data[9], b: data[10] };
                    const c4 = { r: data[12], g: data[13], b: data[14] };
                    
                    colorPalette = [c1, c2, c3, c4];
                    
                    bgR = Math.floor(((c1.r + c2.r + c3.r + c4.r) / 4) * 0.15);
                    bgG = Math.floor(((c1.g + c2.g + c3.g + c4.g) / 4) * 0.15);
                    bgB = Math.floor(((c1.b + c2.b + c3.b + c4.b) / 4) * 0.15);
                    
                    initializeParticles();
                } catch (err) {
                    console.error("Bloqueio de leitura de imagem:", err);
                    initializeParticles();
                }
            };

            img.src = `${albumCoverUrl}?${new Date().getTime()}`; 
        };

        extractColors();

        // 3. VARIÁVEIS DO MOTOR RÍTMICO E FÍSICA
        let lastTime = performance.now();
        let beatAccumulator = 0;
        let beatCount = 0; // Alterna entre 0 (Kick) e 1 (Snare)
        
        const safeBpm = bpm > 0 ? bpm : 120;
        
        // CORREÇÃO: O relógio volta a bater a cada 1 batida inteira (Semínima)
        // Isso sincroniza perfeitamente com a grade do seu FL Studio
        const msPerBeat = 60000 / safeBpm;
        const msPerStep = msPerBeat; 

        let currentSpeed = 0; 
        let targetSpeed = 2; 

        // 4. LOOP DE RENDERIZAÇÃO
        const render = (time) => {
            let deltaTime = time - lastTime;
            if (deltaTime > 100) deltaTime = 16; 
            lastTime = time;

            if (isPlaying) {
                beatAccumulator += deltaTime;

                if (beatAccumulator >= msPerStep) {
                    beatAccumulator -= msPerStep;

                    // O padrão exato da sua imagem: Kick -> Snare -> Kick -> Snare
                    if (beatCount === 0) {
                        // KICK (Tempos 1 e 3): Arranca pra frente
                        currentSpeed = 150 * energy; 
                        targetSpeed = 4;            
                    } else {
                        // SNARE (Tempos 2 e 4): Breca e para
                        currentSpeed = -15 * energy; // Dá um leve tranco pra trás na caixa
                        targetSpeed = 0.1; // Fica praticamente parado até o próximo kick
                    }

                    beatCount = (beatCount + 1) % 2; 
                }
            } else {
                targetSpeed = 0.2;
            }

            // Atrito elástico mantido para a viagem ficar suave
            currentSpeed += (targetSpeed - currentSpeed) * 0.05;

            // Pinta o fundo com a cor média
            ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Desenha e move as partículas
            particles.forEach(p => {
                p.lastX = p.x;
                p.x += currentSpeed * p.depth;

                // Wrap-around horizontal (efeito infinito)
                if (p.x > canvas.width) {
                    p.x = 0;
                    p.lastX = 0; 
                } else if (p.x < 0) {
                    p.x = canvas.width;
                    p.lastX = canvas.width;
                }

                // Desenha a linha de rastro de movimento (Motion Blur)
                ctx.beginPath();
                ctx.moveTo(p.lastX, p.y);
                ctx.lineTo(p.x, p.y);
                
                ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
                ctx.lineWidth = p.size;
                ctx.lineCap = 'round'; 
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [bpm, energy, isPlaying, albumCoverUrl]);

    return <canvas ref={canvasRef} className={styles.elasticCanvas} />;
}