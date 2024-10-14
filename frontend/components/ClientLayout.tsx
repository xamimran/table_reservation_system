"use client";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      {children}
      <Toaster />
    </LanguageProvider>
  );
}
