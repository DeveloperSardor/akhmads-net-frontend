"use client";

import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/auth.service";
import { useTranslations } from "../../hooks/useTranslations";
import SEO from "../../components/SEO";

const BOT_USERNAME = "akhmadsnetbot";

const Login = () => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations();
  const tl = t.login;

  const { login, isAuthenticated } = useAuthStore();

  const [code, setCode] = useState<string>(""); // ✅ Single code
  const [deepLink, setDeepLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 🔒 Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ Already authenticated, redirecting...");
      navigate(`/${lang || "uz"}`, { replace: true });
    }
  }, [isAuthenticated, navigate, lang]);

  // 1️⃣ Initiate login
  useEffect(() => {
    if (isAuthenticated) return;

    const initiateLoginFlow = async () => {
      try {
        setIsLoading(true);
        setError("");
        console.log("🔄 Initiating login...");

        const response = await authService.initiateLogin();

        if (response.success && response.data) {
          setCode(response.data.code); // ✅ Single code
          setDeepLink(response.data.deepLink);

          console.log("✅ Login initiated:", {
            loginToken: response.data.loginToken,
            code: response.data.code,
          });

          // Start polling
          startPolling(response.data.loginToken);
        } else {
          setError(tl?.errorInit ?? "Login boshlashda xatolik yuz berdi");
        }
      } catch (err: any) {
        console.error("❌ Login initiate error:", err);
        setError(
          err?.response?.data?.message ||
            (tl?.errorGeneral ?? "Xatolik yuz berdi."),
        );
      } finally {
        setIsLoading(false);
      }
    };

    initiateLoginFlow();

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2️⃣ Polling function
  const startPolling = (token: string) => {
    let pollCount = 0;
    const maxPolls = 150; // 5 minutes (150 * 2 seconds)

    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;
      console.log(`🔄 Polling attempt ${pollCount}/${maxPolls}...`);

      if (pollCount > maxPolls) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setError(tl?.errorTimeout ?? "Vaqt tugadi. Sahifani yangilang.");
        return;
      }

      try {
        const response = await authService.checkLoginStatus(token);

        console.log("📊 Status response:", response);

        if (response.success && response.data.authorized) {
          console.log("✅ Login successful!", response.data);

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }

          if (response.data.tokens && response.data.user) {
            // Save tokens and redirect
            login(
              {
                accessToken: response.data.tokens.accessToken,
                refreshToken: response.data.tokens.refreshToken,
              },
              response.data.user,
            );
            console.log("💾 Tokens saved, redirecting...");
            navigate(`/${lang || "uz"}`, { replace: true });
          } else {
            setError(tl?.errorLogin ?? "Login muvaffaqiyatsiz.");
          }
        }
      } catch (err: any) {
        console.error("❌ Polling error:", err);
        // Don't stop polling on error, just log it
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleOpenTelegram = () => {
    if (deepLink) {
      console.log("🔗 Opening Telegram:", deepLink);
      window.open(deepLink, "_blank");
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <SEO
        title={tl?.title || "Login | Akhmads Net"}
        description={
          tl?.subtitle || "Login to your Akhmads Net account via Telegram."
        }
      />
      {/* Background (Optional, check path) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/src/assets/images/LoginPage.png')",
        }}
      />
      <div className="absolute inset-0 bg-black/70" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center text-white">
        <>
          <h1 className="text-xl font-semibold mb-2">{tl?.title}</h1>

          <p className="text-sm text-white/60 mb-4">
            <span className="text-purple-400">@{BOT_USERNAME}</span>{" "}
            {tl?.subtitle}
          </p>

          {code && (
            <div className="mb-6 p-6 bg-purple-500/10 border-2 border-purple-500/30 rounded-xl">
              <p className="text-sm text-white/70 mb-3">{tl?.yourCode}</p>
              <div className="text-4xl font-bold text-purple-300 tracking-widest font-mono">
                {code}
              </div>
              <p className="text-xs text-white/50 mt-3">{tl?.confirmCode}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mb-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleOpenTelegram}
              disabled={isLoading || !deepLink}
              className="w-full rounded-full bg-purple-600 hover:bg-purple-700 transition text-white py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? tl?.loading : tl?.openBot}
            </button>

            {error && (
              <button
                onClick={handleRefresh}
                className="w-full rounded-full bg-white/10 hover:bg-white/20 transition text-white py-3 text-sm font-medium"
              >
                {tl?.retry}
              </button>
            )}

            <p className="text-xs text-white/50">
              {tl?.orSearch}{" "}
              <span className="text-purple-400">@{BOT_USERNAME}</span>{" "}
              {tl?.orSearchSuffix}
            </p>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-white/60 text-left">
              <strong className="text-white">{tl?.howTitle}</strong>
              <br />
              1. {tl?.howStep1}
              <br />
              2. {tl?.howStep2}
              <br />
              3. {tl?.howStep3}
            </p>
          </div>
        </>
      </div>
    </div>
  );
};

export default Login;
