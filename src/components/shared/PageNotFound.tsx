import { useTranslations } from "@/hooks/useTranslations";

function PageNotFound() {
  const t = useTranslations();

  return <h2>{t.notFound.page}</h2>;
}

export default PageNotFound;
