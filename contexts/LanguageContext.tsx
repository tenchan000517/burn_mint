"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, Translations } from '@/types/language';
import enTranslations from '@/locales/en.json';
import jaTranslations from '@/locales/ja.json';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  formatMessage: (key: string, values: Record<string, string | number>) => string;
}

const translations: Record<SupportedLanguage, any> = {
  en: enTranslations,
  ja: jaTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>('ja'); // Default to Japanese
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved language preference from localStorage if available
  useEffect(() => {
    if (isClient) {
      const savedLanguage = localStorage.getItem('language') as SupportedLanguage;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ja')) {
        setLanguage(savedLanguage);
      }
    }
  }, [isClient]);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('language', language);
    }
  }, [language, isClient]);

  // Function to get nested translation by dot-notation key
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return result;
  };

  // Function to format messages with variables
  const formatMessage = (key: string, values: Record<string, string | number>): string => {
    let message = t(key);
    
    Object.entries(values).forEach(([k, v]) => {
      message = message.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
    
    return message;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatMessage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}