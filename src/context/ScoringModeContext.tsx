import React, { createContext, useContext, useEffect, useState } from 'react';

export type ScoringMode = 'points' | 'questions';

interface ScoringModeContextType {
  scoringMode: ScoringMode;
  setScoringMode: (mode: ScoringMode) => void;
}

const ScoringModeContext = createContext<ScoringModeContextType | undefined>(undefined);

export const ScoringModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scoringMode, setScoringModeState] = useState<ScoringMode>(() => {
    return (localStorage.getItem('scoringMode') as ScoringMode) || 'points';
  });

  useEffect(() => {
    console.log('DEBUG ScoringModeContext: Saving scoringMode to localStorage:', scoringMode);
    localStorage.setItem('scoringMode', scoringMode);
  }, [scoringMode]);

  const setScoringMode = (mode: ScoringMode) => {
    console.log('DEBUG ScoringModeContext: setScoringMode called with:', mode);
    console.log('DEBUG ScoringModeContext: Previous scoringMode:', scoringMode);
    setScoringModeState(mode);
  };

  return (
    <ScoringModeContext.Provider value={{ scoringMode, setScoringMode }}>
      {children}
    </ScoringModeContext.Provider>
  );
};

export const useScoringMode = () => {
  const context = useContext(ScoringModeContext);
  if (!context) throw new Error('useScoringMode must be used within a ScoringModeProvider');
  return context;
}
