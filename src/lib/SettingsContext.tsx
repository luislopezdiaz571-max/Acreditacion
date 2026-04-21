
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, handleFirestoreError } from './firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { SystemSettings } from '../types';

interface SettingsContextType {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>, userId: string) => Promise<void>;
  loading: boolean;
}

const defaultSettings: SystemSettings = {
  generalDriveLink: 'https://drive.google.com/drive/folders/1o0yHy_ywwviOO16wvlHSLOK1ieW3JZzb',
  updatedAt: new Date().toISOString(),
  updatedBy: 'System'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, 'system_config', 'settings');
    
    // Check if doc exists, if not create with defaults
    getDoc(settingsRef).then(docSnap => {
      if (!docSnap.exists()) {
        setDoc(settingsRef, defaultSettings);
      }
    });

    const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as SystemSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Settings sync error", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SystemSettings>, userId: string) => {
    try {
      const settingsRef = doc(db, 'system_config', 'settings');
      const updatedData = {
        ...settings,
        ...newSettings,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };
      await setDoc(settingsRef, updatedData);
    } catch (e) {
      handleFirestoreError(e, 'update', 'system_config/settings');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
