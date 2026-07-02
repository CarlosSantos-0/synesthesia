import { useRef, useEffect } from 'react';
import styles from './BrutalistBackground.module.css';

// ==========================================
// 1. EXTRAÇÃO DO VITE
// ==========================================
const globImports = import.meta.glob('../../assets/BrutalismBackgroundImages/*.png', {
    eager: true
});

const BRUTALIST_ASSETS = Object.values(globImports).map(module => 
    typeof module === 'string' ? module : module.default
);

export default function BrutalistBackground({ bpm = 120, energy = 0.5, isPlaying = true }) {
    const canvasRef = useRef(null);
    const imagesRef = useRef([]);

    // -------------------------------------------------------------
    // MOTOR DE PRÉ-RENDERIZAÇÃO (Intacto e Otimizado)
    // -------------------------------------------------------------
    useEffect(() => {
        let isMounted = true;

        const loadAndBakeImages = async () => {
            const bakedAssets = [];
            const MAX_TEXTURE_SIZE = 800; 

            for (const src of BRUTALIST_ASSETS) {
                const img = new Image();
                img.src = src;
                
                await new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });

                if (!isMounted || img.naturalWidth === 0) continue;

                let bakeWidth = img.naturalWidth;
                let bakeHeight = img.naturalHeight;
                const aspect = bakeWidth / bakeHeight;

                if (bakeWidth > MAX_TEXTURE_SIZE || bakeHeight > MAX_TEXTURE_SIZE) {
                    if (aspect > 1) {
                        bakeWidth = MAX_TEXTURE_SIZE;
                        bakeHeight = MAX_TEXTURE_SIZE / aspect;
                    } else {
                        bakeHeight = MAX_TEXTURE_SIZE;
                        bakeWidth = MAX_TEXTURE_SIZE * aspect;
                    }
                }

                const offCanvas = document.createElement('canvas');
                const padding = 40; 
                offCanvas.width = bakeWidth + padding * 2;
                offCanvas.height = bakeHeight + padding * 2;
                const offCtx = offCanvas.getContext('2d');

                offCtx.shadowBlur = 20; 
                offCtx.shadowColor = '#ffffff';
                offCtx.filter = 'invert(1)';
                
                offCtx.drawImage(img, padding, padding, bakeWidth, bakeHeight);

                bakedAssets.push({
                    canvasData: offCanvas,
                    width: offCanvas.width,
                    height: offCanvas.height
                });
            }

            if (isMounted) {
                imagesRef.current = bakedAssets;
            }
        };

        loadAndBakeImages();

        return () => {
            isMounted = false;
        };
    }, []);

    // -------------------------------------------------------------
    // LOOP DE ANIMAÇÃO PRINCIPAL
    // -------------------------------------------------------------
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

        let lastTime = performance.now();
        let beatAccumulator = 0;
        let stepCounter = 0; // Nosso metrônomo invisível
        
        const safeBpm = bpm > 0 ? bpm : 120;
        const msPerBeat = 60000 / safeBpm;
        const msPerStep = msPerBeat * 0.25; 

        let activeElements = [];
        let screenFlash = 0;

        const render = (time) => {
            let deltaTime = time - lastTime;
            if (deltaTime > 100) deltaTime = 16; 
            lastTime = time;

            if (isPlaying) {
                beatAccumulator += deltaTime;

                if (beatAccumulator >= msPerStep) {
                    beatAccumulator -= msPerStep; 
                    
                    // Conta 16 semicolcheias (um compasso inteiro de 4/4)
                    stepCounter = (stepCounter + 1) % 16; 
                    
                    // Verifica se estamos em um tempo forte (Bumbo/Caixa nos tempos 1, 2, 3 e 4)
                    const isMainBeat = (stepCounter % 4 === 0);

                    activeElements = activeElements.filter(el => {
                        el.life -= 0.25;
                        return el.life > 0 && Math.random() > 0.25; 
                    });
                    
                    if (activeElements.length < 3 && imagesRef.current.length > 0) {
                        if (Math.random() < (energy * 0.7)) {
                            const randomBakedAsset = imagesRef.current[Math.floor(Math.random() * imagesRef.current.length)];
                            
                            const margin = 100;
                            const randomX = margin + Math.random() * (canvas.width - margin * 2);
                            const randomY = margin + Math.random() * (canvas.height - margin * 2);
                            
                            activeElements.push({
                                asset: randomBakedAsset,
                                x: randomX,
                                y: randomY,
                                scale: 0.15 + Math.random() * 0.45,
                                life: 0.5 + Math.random() * 0.75 
                            });

                            // O FILTRO MUSICAL DO FLASH
                            // 85% de chance de piscar a tela no tempo forte.
                            // Apenas 10% de chance de piscar num contratempo quebrado.
                            const flashChance = isMainBeat ? 0.85 : 0.10;
                            
                            if (Math.random() < flashChance) {
                                screenFlash = 0.10 + (Math.random() * 0.15); // Flash levemente mais suave para não cegar
                            }
                        }
                    }
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // DESENHA O FLASH
            if (screenFlash > 0.01) {
                ctx.fillStyle = `rgba(255, 255, 255, ${screenFlash})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                screenFlash *= 0.85; 
            } else {
                screenFlash = 0;
            }

            // DESENHA AS IMAGENS
            activeElements.forEach(element => {
                const asset = element.asset;
                
                const maxSize = Math.min(canvas.width, canvas.height) * 0.45;
                const aspectRatio = asset.width / asset.height;
                let drawWidth = asset.width * element.scale;
                let drawHeight = asset.height * element.scale;

                if (drawWidth > maxSize || drawHeight > maxSize) {
                    if (aspectRatio >= 1) {
                        drawWidth = maxSize;
                        drawHeight = maxSize / aspectRatio;
                    } else {
                        drawHeight = maxSize;
                        drawWidth = maxSize * aspectRatio;
                    }
                }

                const drawX = element.x - (drawWidth / 2);
                const drawY = element.y - (drawHeight / 2);

                ctx.drawImage(asset.canvasData, drawX, drawY, drawWidth, drawHeight);
            });

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [bpm, energy, isPlaying]);

    return <canvas ref={canvasRef} className={styles.canvasBrutalist} />;
}