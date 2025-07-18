import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const changeLanguage = async (language) => {
    try {
      await AsyncStorage.setItem('userLanguage', language);
      setSelectedLanguage(language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{ selectedLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}