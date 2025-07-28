import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

export const useKonamiCode = () => {
  const [konamiIdx, setKonamiIdx] = useState(0);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === KONAMI_CODE[konamiIdx]) {
      const newIdx = konamiIdx + 1;
      setKonamiIdx(newIdx);
      if (newIdx === KONAMI_CODE.length) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
        });
        window.dispatchEvent(new CustomEvent('konamiEasterEgg'));
        setKonamiIdx(0);
      }
    } else {
      setKonamiIdx(e.key === KONAMI_CODE[0] ? 1 : 0);
    }
  }, [konamiIdx]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
};
