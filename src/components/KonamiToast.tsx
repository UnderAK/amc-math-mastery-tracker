import React, { useEffect, useState } from "react";

// Konami toast component
export const KonamiToast = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => {
      setShow(true);
      setTimeout(() => setShow(false), 3500);
    };
    window.addEventListener("konamiEasterEgg", handler);
    return () => window.removeEventListener("konamiEasterEgg", handler);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-yellow-300 to-pink-300 px-6 py-3 rounded-xl shadow-lg border-2 border-yellow-500 text-lg font-bold flex items-center gap-2 animate-bounce">
      🥚✨ Konami code unlocked! Enjoy the magic!
    </div>
  );
};
