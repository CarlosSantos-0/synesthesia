import { useRef, useEffect } from 'react';
import styles from './KineticParticles.module.css';

export default function KineticParticles({ albumCoverUrl, bpm = 120, energy = 0.5 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let colorPalette = [
            { r: 255, g: 255, b: 255 }
        ]; 
        
        // Retornamos as variáveis de fundo escuro padrão
        let bgR = 8, bgG = 6, bgB = 13;

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
                    
                    // Restauramos a matemática do fundo com 15% de brilho
                    bgR = Math.floor(((c1.r + c2.r + c3.r + c4.r) / 4) * 0.15);
                    bgG = Math.floor(((c1.g + c2.g + c3.g + c4.g) / 4) * 0.15);
                    bgB = Math.floor(((c1.b + c2.b + c3.b + c4.b) / 4) * 0.15);
                    
                    initializeParticles();
                } catch (err) {
                    console.error("Bloqueio de leitura de imagem:", err);
                }
            };

            img.src = `${albumCoverUrl}?${new Date().getTime()}`; 
        };

        extractColors();

        let particlesArray = [];
        const numberOfParticles = 200; 

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                
                // Mantemos o tamanho um pouco mais visível
                this.size = Math.random() * 2 + 1; 
                
                // Mantemos a opacidade base mais alta para brilho
                this.alpha = Math.random() * 0.5 + 0.5; 
                
                this.baseVx = (Math.random() - 0.5) * 0.5;
                this.baseVy = (Math.random() - 0.5) * 0.5;
                
                const randomColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                this.r = randomColor.r;
                this.g = randomColor.g;
                this.b = randomColor.b;
            }

            update(rhythmicShock) {
                const speedMultiplier = 1 + (energy * 2) + (rhythmicShock * energy * 15);
                this.x += this.baseVx * speedMultiplier;
                this.y += this.baseVy * speedMultiplier;

                if (this.x > canvas.width) this.x = 0;
                else if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                else if (this.y < 0) this.y = canvas.height;
            }

            draw() {
                ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initializeParticles = () => {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        };

        initializeParticles();

        const render = () => {
            ctx.globalCompositeOperation = 'source-over';
            
            // O fundo volta a usar a cor calculada dinamicamente com opacidade de 0.2 para o rastro
            ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 0.2)`; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Mantemos o modo 'lighter' para as partículas se somarem onde colidem
            ctx.globalCompositeOperation = 'lighter';

            const beatsPerSecond = bpm / 60;
            const pulseTime = performance.now() / 1000;
            const rawSine = Math.sin(pulseTime * beatsPerSecond * Math.PI); 
            const normalizedSine = (rawSine + 1) / 2;
            const rhythmicShock = Math.pow(normalizedSine, 20);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update(rhythmicShock);
                particlesArray[i].draw();
            }

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