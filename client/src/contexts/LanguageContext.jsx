import { createContext, useContext, useState, useEffect } from "react";

// Import translation files
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';

const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // First check if we have a user preference in localStorage
    const saved = localStorage.getItem("language");
    if (saved && ["en", "es", "fr", "de"].includes(saved)) {
      return saved;
    }
    return "en"; // Default to English
  });

  const [currentTranslations, setCurrentTranslations] = useState(translations.en);

  useEffect(() => {
    // Update translations when language changes
    setCurrentTranslations(translations[language] || translations.en);
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguagePreference = (newLanguage) => {
    if (["en", "es", "fr", "de"].includes(newLanguage)) {
      setLanguage(newLanguage);
    }
  };

  // Method to sync language from user data
  const syncLanguageFromUser = (userLanguage) => {
    if (userLanguage && ["en", "es", "fr", "de"].includes(userLanguage)) {
      setLanguage(userLanguage);
    }
  };

  // Translation function
  const t = (key, options = {}) => {
    const keys = key.split('.');
    let value = currentTranslations;

    // Navigate through nested object
    for (const k of keys) {
      value = value?.[k];
    }

    // If translation not found, return the key
    if (value === undefined) {
      return key;
    }

    // Handle interpolation if options provided
    if (typeof value === 'string' && options) {
      return Object.keys(options).reduce((str, optionKey) => {
        return str.replace(new RegExp(`{{${optionKey}}}`, 'g'), options[optionKey]);
      }, value);
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: setLanguagePreference,
      syncLanguageFromUser,
      t,
      translations: currentTranslations
    }}>
      {children}
    </LanguageContext.Provider>
  );
};