import { eng } from "@/locales/eng";
import { ru } from "@/locales/ru";
import { uz } from "@/locales/uz";
import type { Language } from "@/types";
import { useLocation } from "react-router-dom";

const translations = { uz, eng, ru };

export const useTranslations = () => {
  const { pathname } = useLocation();
  const lang = pathname.split("/")[1] as Language;

  const currentLang = translations[lang] ? lang : "uz";

  return {
    ...translations[currentLang],
    locale: currentLang,
  };
};
