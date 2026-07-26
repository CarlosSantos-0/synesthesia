import { useState, useEffect } from 'react';

export function useVirtualInsanity(activeSpecial) {
    const [isVirtualInsanity, setIsVirtualInsanity] = useState(false);
    
    // Estado inicial seguro
    const [viVars, setViVars] = useState({
        header: { x: 0, y: 0, s: 1 },
        main: { x: 0, y: 0, s: 1 },
        footer: { x: 0, y: 0, s: 1 }
    });

    useEffect(() => {
        // A função de sorteio fica aqui dentro para ser usada pelo evento
        const generateRandomVI = () => {
            const randomTransform = () => ({
                x: Math.floor(Math.random() * 80) - 40, // Entre -40vw e +40vw
                y: Math.floor(Math.random() * 60) - 30, // Entre -30vh e +30vh
                s: (Math.random() * 0.4 + 0.8).toFixed(2) // Entre 0.8 e 1.2
            });

            return {
                header: randomTransform(),
                main: randomTransform(),
                footer: randomTransform()
            };
        };

        const handleKeyDown = (e) => {
            if (e.key.toLowerCase() === 'v' && !e.repeat && activeSpecial === 'virtual-insanity') {
                setViVars(generateRandomVI());
                setIsVirtualInsanity(true);
            }
        };

        const handleKeyUp = (e) => {
            if (e.key.toLowerCase() === 'v') {
                setIsVirtualInsanity(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [activeSpecial]); // Re-executa se a configuração na Sidebar mudar

    // Retorna o que o Stage precisa saber
    return { isVirtualInsanity, viVars };
}