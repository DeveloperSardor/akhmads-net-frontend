import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import authService from "../services/auth.service";

const NavigatePage = () => {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang?: string }>();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const defaultLang = "uz";

  useEffect(() => {
    const handleWidgetLogin = async () => {
      // Check if URL has Telegram Login Widget params
      const id = searchParams.get("id");
      const hash = searchParams.get("hash");
      const auth_date = searchParams.get("auth_date");

      if (id && hash && auth_date) {
        setIsVerifying(true);
        try {
          const params: Record<string, string> = {};
          searchParams.forEach((value, key) => {
            params[key] = value;
          });

          const response = await authService.telegramWidgetLogin(params);
          if (response.success && response.data) {
            // Log in user via store
            useAuthStore.getState().login(response.data.tokens, response.data.user);
            navigate(`/${lang || defaultLang}`, { replace: true });
            return;
          }
        } catch (error) {
          console.error("Widget login failed:", error);
          // Redirect to login page on failure
          navigate(`/${lang || defaultLang}/login`, { replace: true });
          return;
        } finally {
          setIsVerifying(false);
        }
      }

      // Normal navigation if no widget params or done verifying
      if (!isVerifying && !lang && !id) {
        navigate(`/${defaultLang}`, { replace: true });
      }
    };

    handleWidgetLogin();
  }, [lang, navigate, searchParams, isVerifying]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white mb-4"></div>
          <p className="text-white text-lg font-medium">Telegram orqali avtorizatsiya...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default NavigatePage;
