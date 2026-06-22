import { useRef, useEffect } from 'react';
import styles from './OrbitalRhythm.module.css';

export default function OrbitalRhythm({ bpm = 120, steps = 8 }) {
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

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const cx = canvas.width / 2;
            const cy = (canvas.height / 2) + 30;

            const beatsPerSecond = bpm / 60;
            const currentTime = performance.now() / 1000;
            const currentBeatContinuous = currentTime * beatsPerSecond;
            
            const currentStep = Math.floor(currentBeatContinuous) % steps;
            const beatDecay = 1 - (currentBeatContinuous % 1);

            const pulseAmount = 1 + (beatDecay * 0.04);
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
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + (beatDecay * 0.6)})`; 
                    ctx.shadowBlur = 15 * beatDecay;
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

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [bpm, steps]);

    return <canvas ref={canvasRef} className={styles.canvasContainer} />;
}