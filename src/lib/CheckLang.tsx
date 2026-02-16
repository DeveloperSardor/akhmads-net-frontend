/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";

const allowedLangs = ["uz", "eng", "ru"];

const ChekLang = () => {
  const { lang } = useParams<{ lang?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lang || !allowedLangs.includes(lang)) {
      navigate("/uz", { replace: true });
    }
  }, [lang]);

  return <Outlet />;
};

export default ChekLang;