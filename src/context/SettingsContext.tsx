import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export type ScoringMode = 'points' | 'questions';

interface Settings {
  scoreDisplayMode: 'percentage' | 'points';
  scoringMode: ScoringMode;
}

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  // Legacy compatibility methods for ScoringModeContext
  scoringMode: ScoringMode;
  setScoringMode: (mode: ScoringMode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('settings');
    const legacyScoringMode = localStorage.getItem('scoringMode') as ScoringMode;
    
    // Migrate from old dual-context system
    const defaultSettings = {
      scoreDisplayMode: 'percentage' as const,
      scoringMode: (legacyScoringMode || 'points') as ScoringMode
    };
    
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      // Ensure scoringMode exists in settings, migrate from legacy if needed
      if (!parsed.scoringMode && legacyScoringMode) {
        parsed.scoringMode = legacyScoringMode;
      }
      return { ...defaultSettings, ...parsed };
    }
    
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    // Keep legacy localStorage key in sync for backward compatibility
    localStorage.setItem('scoringMode', settings.scoringMode);
  }, [settings]);

  // Legacy compatibility method for components using ScoringModeContext
  const setScoringMode = (mode: ScoringMode) => {
    setSettings(prev => ({ ...prev, scoringMode: mode }));
  };

  const contextValue: SettingsContextType = {
    settings,
    setSettings,
    scoringMode: settings.scoringMode,
    setScoringMode,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Legacy compatibility hook for components using ScoringModeContext
export const useScoringMode = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useScoringMode must be used within a SettingsProvider');
  }
  return {
    scoringMode: context.scoringMode,
    setScoringMode: context.setScoringMode,
  };
};
