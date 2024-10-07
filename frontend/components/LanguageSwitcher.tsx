"use client";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useTranslations } from "@/app/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const t = useTranslations();

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "it" : "en");
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="flex items-center space-x-2"
    >
      <Globe className="w-4 h-4" />
      <span>{locale === "en" ? "Italiano" : "English"}</span>
    </Button>
  );
}
