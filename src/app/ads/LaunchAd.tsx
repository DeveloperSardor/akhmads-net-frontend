// src/app/ads/LaunchAd.tsx
import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Check, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
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
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 relative">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-all mb-8 group bg-card/50 px-4 py-2 rounded-xl border border-border/50 hover:border-primary/30"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {la?.back ?? "Orqaga"}
          </button>

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-8 p-8 bg-card/40 backdrop-blur-xl border border-border rounded-3xl relative overflow-hidden shadow-2xl shadow-black/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                 <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">Campaign</span>
                 <div className="w-1 h-1 bg-border rounded-full" />
                 <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Step {currentStep + 1} of 3</span>
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">
                {editAdId ? "Reklamani tahrirlash" : (la?.pageTitle ?? "Kampaniya yaratish")}
              </h1>
              <p className="text-muted-foreground max-w-lg leading-relaxed">
                {editAdId ? "O'zgartirishlarni kiriting va qayta yuboring" : (la?.pageSubtitle ?? "3 oddiy qadam bilan o'z reklamangizni butun tarmoqqa yoying")}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="relative z-10 flex items-center gap-3 p-1.5 bg-background/50 border border-border/50 rounded-2xl">
              {steps.map((step, index) => {
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;
                return (
                  <div key={index} className="flex items-center">
                    <div
                      className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : isCompleted
                            ? "bg-green-500/10 text-green-500"
                            : "text-muted-foreground hover:bg-white/5"
                        }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                            isActive
                              ? "bg-primary-foreground/20"
                              : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {index + 1}
                        </div>
                      )}
                      <div className="hidden lg:block lg:min-w-[80px]">
                        <div className="text-[11px] font-black uppercase tracking-wider">{step.name}</div>
                        <div className={`text-[10px] opacity-70 ${isActive ? 'text-primary-foreground' : ''}`}>{step.description}</div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden xl:block w-4 h-px bg-border/50 mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Edit mode - rejection reason banner */}
        {editAdId && editAdRejectionReason && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-600 dark:text-amber-400 text-sm mb-1">
                Admin izohi:
              </div>
              <div className="text-sm text-amber-600/80 dark:text-amber-400/80">
                {String(editAdRejectionReason).replace(/^Edit requested:\s*/i, "")}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {(error || successMessage) && (
          <div className="mb-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive text-sm">
                    {la?.errorLabel ?? "Error"}
                  </div>
                  <div className="text-sm text-destructive/80 mt-0.5">{error}</div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-600 text-sm">
                    {la?.successLabel ?? "Success"}
                  </div>
                  <div className="text-sm text-green-600/80 mt-0.5">{successMessage}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {currentStep === 0 && <AdComposer />}
              {currentStep === 1 && <AudienceReach />}
              {currentStep === 2 && <BudgetPricing />}

              {/* Navigation */}
              {currentStep < 2 && (
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-card border border-border hover:bg-muted text-foreground font-medium rounded-xl transition-all"
                  >
                    {currentStep === 0
                      ? (la?.cancel ?? "Cancel")
                      : (la?.previous ?? "← Previous")}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                    className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                  >
                    {la?.continue ?? "Continue →"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LivePreview />
            <FeaturedBots />

            <div className="bg-gradient-to-br from-primary/15 to-indigo-900/30 border border-primary/20 rounded-3xl overflow-hidden relative group shadow-2xl shadow-primary/5">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/20 rounded-full blur-2xl transition-transform group-hover:scale-150 duration-700" />
              <div className="relative p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 shadow-inner border border-primary/20">
                  <SendOutlined className="text-2xl" />
                </div>
                <h3 className="font-bold text-2xl text-foreground mb-3">{t.broadcastCard?.title ?? 'Professional Broadcast'}</h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                  {t.broadcastCard?.description ?? "Barcha faol bot foydalanuvchilariga to'g'ridan-to'g'ri massiv xabarlar yuboring. Yuqori natija va tezkor yetkazib berish."}
                </p>
                <button
                  onClick={() => navigate(`/${lang}/broadcasts/new`)}
                  className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-black transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group/btn active:scale-95"
                >
                  {t.broadcastCard?.button ?? 'Boshlash'} <ArrowLeft className="w-4 h-4 rotate-180 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchAd;