// src/app/ads/LaunchAd.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { SendOutlined } from "@ant-design/icons";
import { useAdStore } from "../../store/adStore";
import AdComposer from "../../components/ad/AdComposer";
import AudienceReach from "../../components/ad/AudienceReach";
import BudgetPricing from "../../components/ad/BudgetPricing";
import LivePreview from "../../components/ad/LivePreview";
import FeaturedBots from "../../components/ad/FeaturedBots";
import { useTranslations } from "../../hooks/useTranslations";

const LaunchAd = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();
  const t = useTranslations();
  const la = t.launchAd;

  const {
    currentStep,
    setStep,
    formData,
    isSubmitting,
    error,
    successMessage,
    clearError,
    clearSuccess,
    fetchTargetingOptions,
    fetchPricingEstimate,
    editAdId,
    editAdRejectionReason,
    resetForm,
  } = useAdStore();

  useEffect(() => {
    // If coming from duplicate, form is already pre-filled via updateFormData in MyAds
    if (location.state) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  useEffect(() => {
    fetchTargetingOptions();
  }, []);

  useEffect(() => {
    if (currentStep === 2) {
      fetchPricingEstimate();
    }
  }, [currentStep, formData.targetImpressions, formData.targeting]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => clearSuccess(), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccess]);

  const steps: { name: string; description: string }[] = la?.steps ?? [
    { name: "Create", description: "Design your ad" },
    { name: "Target", description: "Choose audience" },
    { name: "Launch", description: "Set budget" },
  ];

  const [campaignType, setCampaignType] = useState<"VIEWS" | null>(null);

  if (!campaignType && !editAdId && !location.state) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-4">
              {la?.pageTitle ?? "Kampaniya yaratish"}
            </h1>
            <p className="text-muted-foreground">
              {t.broadcastCard?.description ??
                "Reklama turini tanlang. O'z biznesingizni eng samarali usulda rivojlantiring."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* View Campaign */}
            <div
              onClick={() => setCampaignType("VIEWS")}
              className="cursor-pointer group relative bg-card border border-border hover:border-primary rounded-[2rem] p-10 overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/10 active:scale-[0.98]"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <SendOutlined className="text-4xl" />
              </div>
              <h3 className="text-3xl font-black text-foreground mb-4 italic tracking-tight">
                {la?.viewsTitle || "Oddiy Views"}
              </h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed font-medium">
                {la?.viewsDesc ||
                  "Kanallar va guruhlar orqali ko'rishlar (views) yig'ish platformasi bo'ylab barcha mos botlarda ko'rsatiladi."}
              </p>
              <div className="flex items-center text-primary font-black text-xs uppercase tracking-[0.2em]">
                {la?.startBtn || "Boshlash"}{" "}
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            {/* Broadcast Campaign */}
            <div
              onClick={() => navigate(`/${lang}/broadcasts/new`)}
              className="cursor-pointer group relative bg-card border border-primary/30 hover:border-primary rounded-[2rem] p-10 overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/10 active:scale-[0.98]"
            >
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
              <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform">
                <SendOutlined className="text-4xl" />
              </div>
              <h3 className="text-3xl font-black text-foreground mb-4 relative z-10 italic tracking-tight">
                {la?.broadcastTitle || "Rassilka (Broadcast)"}
              </h3>
              <p className="text-muted-foreground mb-8 relative z-10 text-lg leading-relaxed font-medium">
                {la?.broadcastDesc ||
                  "Aniq bir botning barcha aktiv foydalanuvchilariga to'g'ridan to'g'ri shaxsiy xabar yuborish."}
              </p>
              <div className="flex items-center text-primary font-black text-xs uppercase tracking-[0.2em] relative z-10">
                {la?.startBtn || "Boshlash"}{" "}
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      resetForm();
      navigate(-1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.text && formData.text.length >= 10;
      case 1:
        return formData.targetImpressions >= 100;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 relative">
          <button
            onClick={handleBack}
            className="group mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="p-2.5 rounded-xl bg-card border border-border group-hover:bg-accent group-hover:border-primary/30 transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest">
              {la?.back ?? "Orqaga"}
            </span>
          </button>

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-10 p-10 bg-card border border-border rounded-[2.5rem] relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20 shadow-sm">
                  Campaign
                </span>
                <div className="w-1.5 h-1.5 bg-border rounded-full" />
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">
                  Step {currentStep + 1} of 3
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4 italic">
                {editAdId
                  ? "Reklamani tahrirlash"
                  : (la?.pageTitle ?? "Kampaniya yaratish")}
              </h1>
              <p className="text-muted-foreground max-w-lg text-lg leading-relaxed font-medium">
                {editAdId
                  ? "O'zgartirishlarni kiriting va qayta yuboring"
                  : (la?.pageSubtitle ??
                    "3 oddiy qadam bilan o'z reklamangizni butun tarmoqqa yoying")}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="relative z-10 flex items-center gap-4 p-2 bg-muted/30 border border-border rounded-3xl shadow-inner">
              {steps.map((step, index) => {
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;
                return (
                  <div key={index} className="flex items-center">
                    <div
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-105"
                          : isCompleted
                            ? "bg-green-500/10 text-green-600 border border-green-500/20"
                            : "text-muted-foreground hover:bg-accent border border-transparent"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                            isActive
                              ? "bg-primary-foreground/20"
                              : "bg-background border border-border text-muted-foreground shadow-sm"
                          }`}
                        >
                          {index + 1}
                        </div>
                      )}
                      <div className="hidden lg:block lg:min-w-[90px]">
                        <div className="text-[11px] font-black uppercase tracking-[0.15em]">
                          {step.name}
                        </div>
                        <div
                          className={`text-[9px] font-bold uppercase tracking-widest opacity-60 ${isActive ? "text-primary-foreground" : ""}`}
                        >
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden xl:block w-6 h-px bg-border/50 mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Edit mode - rejection reason banner */}
        {editAdId && editAdRejectionReason && (
          <div className="mb-8 flex items-start gap-4 p-6 bg-amber-500/5 border-2 border-amber-500/30 rounded-3xl shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <div className="font-black text-amber-700 dark:text-amber-400 text-xs uppercase tracking-widest mb-1">
                Admin izohi:
              </div>
              <div className="text-sm font-medium text-amber-600/90 dark:text-amber-400/90 leading-relaxed">
                {String(editAdRejectionReason).replace(
                  /^Edit requested:\s*/i,
                  "",
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {(error || successMessage) && (
          <div className="mb-8">
            {error && (
              <div className="flex items-start gap-4 p-6 bg-destructive/5 border-2 border-destructive/20 rounded-3xl shadow-sm animate-in slide-in-from-top-2">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-destructive" />
                </div>
                <div className="flex-1">
                  <div className="font-black text-destructive text-xs uppercase tracking-widest mb-1">
                    {la?.errorLabel ?? "Error"}
                  </div>
                  <div className="text-sm font-medium text-destructive/90 leading-relaxed">
                    {error}
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-4 p-6 bg-green-500/5 border-2 border-green-500/20 rounded-3xl shadow-sm animate-in slide-in-from-top-2">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-black text-green-600 text-xs uppercase tracking-widest mb-1">
                    {la?.successLabel ?? "Success"}
                  </div>
                  <div className="text-sm font-medium text-green-600/90 leading-relaxed">
                    {successMessage}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-8">
              {currentStep === 0 && <AdComposer />}
              {currentStep === 1 && <AudienceReach />}
              {currentStep === 2 && <BudgetPricing />}

              {/* Navigation */}
              {currentStep < 2 && (
                <div className="flex items-center justify-between pt-6">
                  <button
                    onClick={handleBack}
                    className="px-8 py-4 bg-background border-2 border-border hover:bg-accent text-foreground font-black uppercase tracking-widest rounded-2xl transition-all shadow-sm active:scale-[0.98] text-xs"
                  >
                    {currentStep === 0
                      ? (la?.cancel ?? "Cancel")
                      : (la?.previous ?? "← Previous")}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                    className="px-10 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-2xl transition-all disabled:opacity-30 shadow-xl shadow-primary/25 active:scale-[0.98] text-xs"
                  >
                    {la?.continue ?? "Continue →"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <LivePreview />
            <FeaturedBots />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchAd;
