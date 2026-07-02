import { useRef, useEffect } from 'react';
import styles from './GlitchRhythm.module.css';

export default function GlitchRhythm({ bpm = 120, energy = 0.5, isPlaying = true }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const numSpheres = 8;
        const baseRadius = 250; 
        const stepAngle = Math.PI / 4; 

        // 1. TAMANHO DAS ESFERAS (Ajuste aqui)
        const spheres = Array.from({ length: numSpheres }).map((_, i) => ({
            angle: stepAngle * i,
            opacity: 0, 
            // O primeiro número é o tamanho mínimo. O segundo é a variação aleatória.
            // Ex: 12 + Math.random() * 8 = Esferas variando de 12px a 20px de raio.
            radius: 12 + Math.random() * 8,
        }));

        let lastTime = performance.now();
        let beatAccumulator = 0;
        let stepCount = 0; // O nosso Step Sequencer interno
        
        const safeBpm = bpm > 0 ? bpm : 120;
        const msPerBeat = 60000 / safeBpm;
        const msPerStep = msPerBeat / 2; // Colcheias

        const render = (time) => {
            let deltaTime = time - lastTime;
            
            // 2. CORREÇÃO DO BUG DE SEGUNDO PLANO (Trava do Delta Time)
            // Se passou mais de 100ms (aba oculta), reseta para 1 frame (16ms)
            if (deltaTime > 100) {
                deltaTime = 16;
            }
            
            lastTime = time;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            if (isPlaying) {
                beatAccumulator += deltaTime;

                if (beatAccumulator >= msPerStep) {
                    beatAccumulator -= msPerStep; 
                    
                    // Conta de 0 a 7 (Um compasso de 4 batidas subdivididas)
                    stepCount = (stepCount + 1) % 8; 
                    
                    // 3. LÓGICA DE BATERIA (Groove de Kick e Snare)
                    // Bumbo nos steps 0 e 4 / Caixa nos steps 2 e 6
                    const isMainBeat = (stepCount % 2 === 0);

                    spheres.forEach(sphere => {
                        let currentEnergy = energy;
                        
                        // Reduz drasticamente a poluição nos contratempos
                        if (!isMainBeat) {
                            currentEnergy = energy * 0.2; 
                        }

                        const actionTrigger = Math.random();
                        
                        if (actionTrigger < currentEnergy) {
                            sphere.opacity = 1.0; 

                            const glitchRoll = Math.random();

                            // As porcentagens de salto continuam caóticas
                            if (glitchRoll < 0.1) {
                                sphere.angle -= stepAngle;
                            } else if (glitchRoll < 0.2) {
                                sphere.angle += stepAngle * 2;
                            } else {
                                sphere.angle += stepAngle;
                            }
                        }
                    });
                }
            }

            spheres.forEach(sphere => {
                if (sphere.opacity > 0.01) {
                    sphere.opacity *= 0.85; 
                } else {
                    sphere.opacity = 0;
                }

                if (sphere.opacity > 0) {
                    const x = centerX + Math.cos(sphere.angle) * baseRadius;
                    const y = centerY + Math.sin(sphere.angle) * baseRadius;

                    ctx.beginPath();
                    ctx.arc(x, y, sphere.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${sphere.opacity})`; 
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = 'white';
                    ctx.fill();
                    ctx.shadowBlur = 0; 
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [bpm, energy, isPlaying]);

    return <canvas ref={canvasRef} className={styles.canvasGlitch} />;
}