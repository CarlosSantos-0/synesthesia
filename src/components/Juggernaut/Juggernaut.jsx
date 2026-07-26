import { useRef, useEffect } from 'react';
import styles from './Juggernaut.module.css';

export default function Juggernaut({ albumCoverUrl, bpm = 150 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let activeLasers = [];
        
        let colorPalette = [
            '0, 255, 255', '255, 0, 128', '57, 255, 20', '255, 0, 0'
        ];

        const sustainedKeys = {
            'j': { active: false, x: 0, y: 0, startA: 0, targetA: Math.PI / 2, currentA: 0, dir: 1, color: '' },
            'k': { active: false, x: 0, y: 1, startA: 0, targetA: -Math.PI / 2, currentA: 0, dir: -1, color: '' },
            'l': { active: false, x: 1, y: 0, startA: Math.PI, targetA: Math.PI / 2, currentA: 0, dir: -1, color: '' },
            'ç': { active: false, x: 1, y: 1, startA: Math.PI, targetA: Math.PI * 1.5, currentA: 0, dir: 1, color: '' },
        };

        const spaceLaser = {
            active: false,
            colors: [],
            timer: 0,
            stepIndex: 0 
        };

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
                    offCtx.filter = 'saturate(200%)'; 
                    offCtx.drawImage(img, 0, 0, 2, 2);
                    const data = offCtx.getImageData(0, 0, 2, 2).data;
                    colorPalette = [
                        `${data[0]}, ${data[1]}, ${data[2]}`,
                        `${data[4]}, ${data[5]}, ${data[6]}`,
                        `${data[8]}, ${data[9]}, ${data[10]}`,
                        `${data[12]}, ${data[13]}, ${data[14]}`
                    ];
                } catch (err) {
                    console.error("Bloqueio de imagem:", err);
                }
            };
            img.src = `${albumCoverUrl}?${new Date().getTime()}`; 
        };

        extractColors();

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const fireLasers = (origin, baseAngle) => {
            const numLasers = 5;
            const spread = Math.PI / 2.5; 
            const startAngle = baseAngle - (spread / 2);
            const angleStep = spread / (numLasers - 1);
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];

            for (let i = 0; i < numLasers; i++) {
                activeLasers.push({
                    startX: origin.x,
                    startY: origin.y,
                    angle: startAngle + (i * angleStep),
                    length: Math.max(canvas.width, canvas.height) * 1.5, 
                    thickness: 12 + Math.random() * 20, 
                    opacity: 1.0, 
                    decay: 0.15 + Math.random() * 0.1, 
                    color: color
                });
            }
        };

        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();

            if (key === ' ') {
                e.preventDefault();
                if (!spaceLaser.active) {
                    spaceLaser.active = true;
                    // Agora precisamos apenas de 2 cores por disparo
                    spaceLaser.colors = [
                        colorPalette[Math.floor(Math.random() * colorPalette.length)],
                        colorPalette[Math.floor(Math.random() * colorPalette.length)]
                    ];
                    spaceLaser.timer = 0; 
                    spaceLaser.stepIndex = Math.floor(Math.random() * 16); 
                }
                return;
            }

            if (e.repeat) return; 

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            
            if (key === 'f') fireLasers({ x: cx, y: 0 }, Math.PI / 2);
            else if (key === 's') fireLasers({ x: cx, y: canvas.height }, -Math.PI / 2);
            else if (key === 'a') fireLasers({ x: 0, y: cy }, 0);
            else if (key === 'd') fireLasers({ x: canvas.width, y: cy }, Math.PI);

            if (sustainedKeys[key]) {
                if (!sustainedKeys[key].active) {
                    sustainedKeys[key].active = true;
                    sustainedKeys[key].currentA = sustainedKeys[key].startA;
                    sustainedKeys[key].color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
                }
            }
        };

        const handleKeyUp = (e) => {
            const key = e.key.toLowerCase();
            if (key === ' ') {
                e.preventDefault();
                spaceLaser.active = false;
            }
            if (sustainedKeys[key]) {
                sustainedKeys[key].active = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter'; 
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            // 1. GATILHO AUTOMÁTICO SUBMACHINE OTIMIZADO
            if (spaceLaser.active) {
                const framesPerBeat = 3600 / bpm; 
                const framesPerShot = framesPerBeat / 4; 

                if (spaceLaser.timer <= 0) {
                    const anglePerStep = (Math.PI * 2) / 16;
                    const currentBaseAngle = spaceLaser.stepIndex * anglePerStep;
                    const halfLength = Math.max(canvas.width, canvas.height); 
                    
                    // OTIMIZAÇÃO: Dispara apenas 2 lasers (0° e 90°) que rasgam a tela toda
                    [0, Math.PI / 2].forEach((offset, idx) => {
                        const shotAngle = currentBaseAngle + offset;
                        
                        // Recua o ponto inicial para fora da tela, no lado oposto
                        const startX = cx - Math.cos(shotAngle) * halfLength;
                        const startY = cy - Math.sin(shotAngle) * halfLength;
                        
                        activeLasers.push({
                            startX, 
                            startY,
                            angle: shotAngle,
                            length: halfLength * 2.5, // Comprimento total massivo cruzando de ponta a ponta
                            thickness: 35 + Math.random() * 15, 
                            opacity: 1.0, 
                            decay: 0.5, // 2 frames de vida
                            color: spaceLaser.colors[idx]
                        });
                    });

                    spaceLaser.stepIndex = (spaceLaser.stepIndex + 1) % 4; 
                    
                    if (spaceLaser.stepIndex === 0) {
                        spaceLaser.stepIndex = Math.floor(Math.random() * 16);
                        spaceLaser.colors = [
                            colorPalette[Math.floor(Math.random() * colorPalette.length)],
                            colorPalette[Math.floor(Math.random() * colorPalette.length)]
                        ];
                    }

                    spaceLaser.timer = framesPerShot;
                } else {
                    spaceLaser.timer--;
                }
            }

            // 2. RENDERIZADOR GERAL (WASD + Submachine)
            for (let i = activeLasers.length - 1; i >= 0; i--) {
                const laser = activeLasers[i];
                ctx.beginPath();
                ctx.moveTo(laser.startX, laser.startY);
                
                const endX = laser.startX + Math.cos(laser.angle) * laser.length;
                const endY = laser.startY + Math.sin(laser.angle) * laser.length;
                
                ctx.lineTo(endX, endY);
                
                ctx.strokeStyle = `rgba(255, 255, 255, ${laser.opacity * 0.95})`; 
                ctx.lineWidth = laser.thickness * 0.35; 
                ctx.lineCap = 'square'; 
                
                ctx.shadowBlur = 45; 
                ctx.shadowColor = `rgba(${laser.color}, ${laser.opacity})`;
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.strokeStyle = `rgba(${laser.color}, ${laser.opacity * 0.7})`;
                ctx.lineWidth = laser.thickness;
                ctx.stroke();
                
                laser.opacity -= laser.decay;
                if (laser.opacity <= 0) {
                    activeLasers.splice(i, 1);
                }
            }

            // 3. CANTOS JKLÇ (Varredura Melódica)
            const sweepSpeed = (bpm / 120) * 0.05; 
            Object.values(sustainedKeys).forEach(laser => {
                if (laser.active) {
                    laser.currentA += sweepSpeed * laser.dir;
                    let reachedLimit = false;
                    if (laser.dir === 1 && laser.currentA >= laser.targetA) reachedLimit = true;
                    if (laser.dir === -1 && laser.currentA <= laser.targetA) reachedLimit = true;

                    if (reachedLimit) {
                        laser.active = false;
                        return;
                    }

                    const startX = laser.x * canvas.width;
                    const startY = laser.y * canvas.height;
                    const length = Math.max(canvas.width, canvas.height) * 1.5;
                    const endX = startX + Math.cos(laser.currentA) * length;
                    const endY = startY + Math.sin(laser.currentA) * length;

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
                    ctx.lineWidth = 6;
                    ctx.lineCap = 'round';
                    ctx.shadowBlur = 35;
                    ctx.shadowColor = `rgb(${laser.color})`;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    ctx.strokeStyle = `rgba(${laser.color}, 0.5)`;
                    ctx.lineWidth = 25;
                    ctx.stroke();
                }
            });

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
    }, [albumCoverUrl, bpm]); 

    return <canvas ref={canvasRef} className={styles.canvasOverlay} />;
}