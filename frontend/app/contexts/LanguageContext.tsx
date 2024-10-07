import React, { createContext, useState, useContext, ReactNode } from "react";
import { IntlProvider } from "react-intl";
import enMessages from "../messages/en.json";
import itMessages from "../messages/it.json";

type Locale = "en" | "it";

interface Messages {
  [key: string]: string;
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const messages: Record<Locale, Messages> = {
  en: enMessages,
  it: itMessages,
};

const LanguageContext = createContext<LanguageContextType>({
  locale: "it",
  setLocale: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [locale, setLocale] = useState<Locale>("it");

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <IntlProvider messages={messages[locale]} locale={locale}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
