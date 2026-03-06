/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const allowedLangs = ["uz", "eng", "ru"];

const ChekLang = () => {
  const { lang } = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    if (!lang || !allowedLangs.includes(lang)) {
      navigate("/ru", { replace: true });
    }
  }, [lang, navigate]);

  useEffect(() => {
    // Try to recover auth state from httpOnly cookie on app load
    // in case local storage was cleared or out of sync.
    checkAuth().catch(() => {});
  }, [checkAuth]);

  return <Outlet />;
};

export default ChekLang;
