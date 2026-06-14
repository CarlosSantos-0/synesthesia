import { useRef, useEffect } from 'react';
import { extractColors } from 'extract-colors';
import styles from './MelodicEQ.module.css';

export default function MelodicEQ({ bpm = 120, energy = 0.5, albumCoverUrl }) {
    const canvasRef = useRef(null);
    const colorRef = useRef('rgba(255, 255, 255, 0.5)');

    // Extração de cor da capa
    useEffect(() => {
        if (!albumCoverUrl) return;
        extractColors(albumCoverUrl).then((colors) => {
            if (colors && colors.length > 0) {
                const p = colors[0];
                colorRef.current = `rgba(${p.red}, ${p.green}, ${p.blue}, 0.8)`;
            }
        });
    }, [albumCoverUrl]);

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

        const barsPerSide = 64;
        let currentHeights = new Array(barsPerSide).fill(0);

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const baseY = canvas.height;
            const time = performance.now() / 1000;

            const step = cx / barsPerSide;
            const gap = step * 0.3;
            const barWidth = step - gap;

            ctx.fillStyle = colorRef.current;

            for (let i = 0; i < barsPerSide; i++) {
                const ratio = i / (barsPerSide - 1);

                // --- MATEMÁTICA DE FORMA (VALE + MONTANHA) ---
                const baseShape = Math.pow(ratio, 3) * 150;

                // --- ONDULAÇÕES ORGÂNICAS (Mais rápidas) ---
                // Diminuí a divisão do tempo para o movimento ficar mais "agitado"
                const wave = Math.sin(time * 1.5 + i * 0.1) * 20 + Math.sin(time * 2.5 - i * 0.05) * 8;

                // --- INTENSIDADE AUMENTADA ---
                // Agora o energy tem mais peso na resposta das barras
                const targetHeight = (15 + baseShape + (wave * (energy * 1.5))) * (0.6 + energy * 0.8);

                // --- LERP MAIS ÁGIL (De 0.08 para 0.25) ---
                // Isso elimina a sensação de "lento demais"
                currentHeights[i] += (targetHeight - currentHeights[i]) * 0.25;

                // Desenha as barras
                const drawHeight = -currentHeights[i];
                ctx.fillRect(cx + (i * step), baseY, barWidth, drawHeight);
                ctx.fillRect(cx - (i * step) - step + gap, baseY, barWidth, drawHeight);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [bpm, energy]);

    return <canvas ref={canvasRef} className={styles.canvasContainer} />;
}