import { useRef, useEffect } from 'react';
import styles from './OrbitalRhythm.module.css';

// Adicionei a prop isPlaying para travar o relógio quando a música parar
export default function OrbitalRhythm({ bpm = 120, steps = 8, isPlaying = true }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // MOTOR RÍTMICO SINCRONIZADO (Substituindo o performance.now absoluto)
        let lastTime = performance.now();
        let beatAccumulator = 0;
        let currentStep = 0;

        const safeBpm = bpm > 0 ? bpm : 120;
        const msPerBeat = 60000 / safeBpm;

        const render = (time) => {
            let deltaTime = time - lastTime;
            if (deltaTime > 100) deltaTime = 16;
            lastTime = time;

            if (isPlaying) {
                beatAccumulator += deltaTime;

                if (beatAccumulator >= msPerBeat) {
                    beatAccumulator -= msPerBeat;
                    currentStep = (currentStep + 1) % steps;
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = (canvas.height / 2) + 30;

            // Recriamos o valor contínuo para os anéis girarem suavemente, 
            // mas agora atrelado ao motor interno em vez do tempo do navegador
            const progress = isPlaying ? (beatAccumulator / msPerBeat) : 0;
            const currentBeatContinuous = currentStep + progress;
            const beatDecay = 1 - progress;

            // LÓGICA DO RITMO KICK/SNARE
            // Passos pares (0, 2, 4, 6) = Kick / Passos ímpares (1, 3, 5, 7) = Snare
            const isKick = currentStep % 2 === 0;

            // EFEITO VISUAL DE RESPIRAÇÃO:
            // No Kick o anel expande (+), no Snare ele contrai (-)
            const pulseAmount = isKick 
                ? 1 + (beatDecay * 0.06) 
                : 1 - (beatDecay * 0.04);

            const currentInnerRadius = 180 * pulseAmount; 
            const currentOuterRadius = 240 * pulseAmount;

            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            
            ctx.beginPath();
            ctx.arc(cx, cy, currentInnerRadius, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, currentOuterRadius, 0, Math.PI * 2);
            ctx.stroke();

            const innerAngle = (currentBeatContinuous / 4) * (Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(cx + Math.cos(innerAngle) * currentInnerRadius, cy + Math.sin(innerAngle) * currentInnerRadius, 4, 0, Math.PI * 2);
            ctx.fill();

            const outerAngle = -(currentBeatContinuous / 8) * (Math.PI * 2);
            ctx.beginPath();
            ctx.arc(cx + Math.cos(outerAngle) * currentOuterRadius, cy + Math.sin(outerAngle) * currentOuterRadius, 6, 0, Math.PI * 2);
            ctx.fill();

            const rectWidth = 12;
            const rectHeight = 30;

            for (let i = 0; i < steps; i++) {
                const angle = (i * (Math.PI * 2) / steps) - (Math.PI / 2);
                
                ctx.save();
                ctx.translate(cx, cy); 
                ctx.rotate(angle);     
                
                if (i === currentStep) {
                    // O marcador brilha mais forte no kick e mais suave no snare
                    const alpha = isKick ? 0.4 + (beatDecay * 0.6) : 0.2 + (beatDecay * 0.3);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; 
                    
                    // Somente o Kick recebe aura (shadowBlur)
                    ctx.shadowBlur = isKick ? 20 * beatDecay : 0;
                    ctx.shadowColor = 'white';
                } else {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.shadowBlur = 0;
                }

                ctx.fillRect(-rectWidth / 2, -currentOuterRadius - (rectHeight / 2), rectWidth, rectHeight);
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [bpm, steps, isPlaying]);

    return <canvas ref={canvasRef} className={styles.canvasContainer} />;
}