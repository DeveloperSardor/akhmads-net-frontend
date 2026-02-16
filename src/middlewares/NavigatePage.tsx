import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NavigatePage = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang?: string }>();
  const defaultLang = "uz";

  useEffect(() => {
    if (!lang) {
      navigate(`/${defaultLang}`, { replace: true });
    }
  }, [lang, navigate]);

  return null;
};

export default NavigatePage;
