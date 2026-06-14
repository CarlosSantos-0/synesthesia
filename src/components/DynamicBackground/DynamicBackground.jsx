import { useRef, useEffect } from 'react';
import styles from './DynamicBackground.module.css';

export default function DynamicBackground({ albumCoverUrl, bpm = 120, energy = 0.5 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = Math.random() * 1000;

        // Cores padrão (escuras)
        let color1 = 'rgb(8, 6, 13)';
        let color2 = 'rgb(20, 15, 30)';

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const extractColors = () => {
            if (!albumCoverUrl) return;
            const img = new Image();
            img.crossOrigin = "Anonymous"; 
            img.onload = () => {
                const offscreenCanvas = document.createElement('canvas');
                const offCtx = offscreenCanvas.getContext('2d');
                offscreenCanvas.width = 2;
                offscreenCanvas.height = 2;
                offCtx.drawImage(img, 0, 0, 2, 2);
                const data = offCtx.getImageData(0, 0, 2, 2).data;
                color1 = `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
                color2 = `rgb(${data[12]}, ${data[13]}, ${data[14]})`;
            };
            img.src = `${albumCoverUrl}?${new Date().getTime()}`; 
        };

        extractColors();

        const render = () => {
            const baseSpeed = 0.001 + (energy * 0.003);
            time += baseSpeed;

            const width = canvas.width;
            const height = canvas.height;

            // 1. Limpa o frame
            ctx.filter = 'none';
            ctx.globalCompositeOperation = 'source-over'; 
            ctx.fillStyle = '#08060d';
            ctx.fillRect(0, 0, width, height);


            // 2. --- NOVA MATEMÁTICA DE PULSAÇÃO SUAVE ---
            const beatsPerSecond = bpm / 60;
            const measuresPerSecond = beatsPerSecond / 8; 
            const pulseTime = performance.now() / 1000;
            
            // rawSine vai de -1 a 1
            const rawSine = Math.sin(pulseTime * measuresPerSecond * Math.PI * 2); 
            // smoothPulse mapeia o resultado suavemente de 0 a 1 (sem cortes abruptos)
            const smoothPulse = (rawSine + 1) / 2;


            // 3. --- RAIO AMORTECIDO ---
            const baseRadius = Math.max(width, height) * 0.6;
            // Reduzimos o multiplicador de expansão de 0.1 para 0.05 para uma respiração sutil
            const pulseEffect = (baseRadius * 0.05 * smoothPulse * energy);
            const finalRadius = baseRadius + pulseEffect;

            ctx.globalCompositeOperation = 'lighten';


            // --- ESFERA 1 ---
            const x1 = width/2 + (Math.cos(time * 0.7) + Math.sin(time * 0.3)) * width * 0.3;
            const y1 = height/2 + (Math.sin(time * 0.5) + Math.cos(time * 0.9)) * height * 0.3;

            // Brilho muito mais contínuo e com ganho reduzido (máximo de 15 * energy)
            const brightness1 = 100 + (15 * energy * smoothPulse);
            ctx.filter = `saturate(250%) brightness(${brightness1}%) blur(${baseRadius * 0.3}px)`;

            const grad1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, finalRadius);
            grad1.addColorStop(0, color1); 
            grad1.addColorStop(1, 'rgba(0, 0, 0, 0)'); 

            ctx.fillStyle = grad1;
            ctx.fillRect(0, 0, width, height);


            // --- ESFERA 2 ---
            const x2 = width/2 + (Math.sin(time * 0.4) + Math.cos(time * 1.1)) * width * 0.3;
            const y2 = height/2 + (Math.cos(time * 0.8) + Math.sin(time * 0.6)) * height * 0.3;

            // Brilho secundário reduzido (máximo de 25 * energy)
            const brightness2 = 110 + (25 * energy * smoothPulse);
            ctx.filter = `saturate(400%) brightness(${brightness2}%) blur(${baseRadius * 0.3}px)`;

            const grad2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, finalRadius);
            grad2.addColorStop(0, color2);
            grad2.addColorStop(1, 'rgba(0, 0, 0, 0)'); 

            ctx.fillStyle = grad2;
            ctx.fillRect(0, 0, width, height);


            // 4. --- RESET E OVERLAY ---
            ctx.globalCompositeOperation = 'source-over'; 
            ctx.filter = 'none';
            
            const overlayOpacity = 0.25 - (energy * 0.1); 
            ctx.fillStyle = `rgba(8, 6, 13, ${overlayOpacity})`;
            ctx.fillRect(0, 0, width, height);

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [albumCoverUrl, bpm, energy]); 

    return <canvas ref={canvasRef} className={styles.canvasBackground} />;
}