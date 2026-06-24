import { useRef, useEffect } from 'react';
import { extractColors } from 'extract-colors';
import styles from './MelodicEQ.module.css';

export default function MelodicEQ({ bpm = 120, energy = 0.5, albumCoverUrl }) {
    const canvasRef = useRef(null);
    const colorRef = useRef('rgba(255, 255, 255, 0.5)');

    useEffect(() => {
        if (!albumCoverUrl) return;
        
        extractColors(albumCoverUrl)
            .then((colors) => {
                if (colors && colors.length > 0) {
                    const primaryColor = colors[0];
                    colorRef.current = `rgba(${primaryColor.red}, ${primaryColor.green}, ${primaryColor.blue}, 0.8)`;
                }
            })
            .catch((err) => console.error("Erro na extração de cor do equalizador:", err));
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
        const currentHeights = new Array(barsPerSide).fill(0);

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

                // Cálculo da curva base (Vales no centro, montanhas nas extremidades)
                const baseShape = Math.pow(ratio, 3) * 150;

                // Modulação orgânica de frequência e sobreposição de ondas
                const wave = Math.sin(time * 1.5 + i * 0.1) * 20 + Math.sin(time * 2.5 - i * 0.05) * 8;

                // Aplicação da energia musical sobre a amplitude alvo
                const targetHeight = (15 + baseShape + (wave * (energy * 1.5))) * (0.6 + energy * 0.8);

                // Suavização linear (Lerp) para fluidez de movimento do bloco
                currentHeights[i] += (targetHeight - currentHeights[i]) * 0.25;

                const drawHeight = -currentHeights[i];
                
                // Renderização espelhada a partir do centro (Direita e Esquerda)
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