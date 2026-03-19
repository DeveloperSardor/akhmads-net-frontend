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

        // Try to recover auth first (in case localstorage was cleared but cookie exists)
        const hasSession = await useAuthStore.getState().checkAuth();
        if (hasSession) {
          return; // the isAuthenticated useEffect will handle redirection
        }

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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-card border border-border p-8 text-center text-foreground shadow-2xl">
        <>
          <h1 className="text-2xl font-bold mb-2">{tl?.title}</h1>

          <p className="text-sm text-muted-foreground mb-6">
            <span className="text-primary font-medium">@{BOT_USERNAME}</span>{" "}
            {tl?.subtitle}
          </p>

          {code && (
            <div className="mb-6 p-6 bg-primary/5 border-2 border-primary/20 rounded-2xl">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {tl?.yourCode}
              </p>
              <div className="text-5xl font-black text-primary tracking-[0.2em] font-mono">
                {code}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {tl?.confirmCode}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mb-6 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/30 border-t-primary"></div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleOpenTelegram}
              disabled={isLoading || !deepLink}
              className="w-full rounded-2xl bg-primary hover:bg-primary/90 transition-all text-primary-foreground py-4 text-sm font-semibold shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? tl?.loading : tl?.openBot}
            </button>

            {error && (
              <button
                onClick={handleRefresh}
                className="w-full rounded-2xl bg-accent hover:bg-accent/80 transition-all text-foreground py-4 text-sm font-semibold"
              >
                {tl?.retry}
              </button>
            )}

            <p className="text-xs text-muted-foreground">
              {tl?.orSearch}{" "}
              <span className="text-primary font-medium">@{BOT_USERNAME}</span>{" "}
              {tl?.orSearchSuffix}
            </p>
          </div>

          <div className="mt-8 p-6 bg-accent/30 rounded-2xl border border-border">
            <p className="text-xs text-muted-foreground text-left space-y-2">
              <strong className="text-foreground text-sm block mb-2">
                {tl?.howTitle}
              </strong>
              <span className="block">1. {tl?.howStep1}</span>
              <span className="block">2. {tl?.howStep2}</span>
              <span className="block">3. {tl?.howStep3}</span>
            </p>
          </div>
        </>
      </div>
    </div>
  );
};

export default Login;
