import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, AlertCircle, CheckCircle } from "lucide-react";
import { useAdStore } from "../../store/adStore";
import AdComposer from "../../components/ad/AdComposer";
import AudienceReach from "../../components/ad/AudienceReach";
import BudgetPricing from "../../components/ad/BudgetPricing";
import LivePreview from "../../components/ad/LivePreview";
import AIRecommendations from "../../components/ad/AIRecommendations";
import { useLocation } from "react-router-dom";


const LaunchAd = () => {
  const navigate = useNavigate();
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
  } = useAdStore();

  const location = useLocation();


  useEffect(() => {
  // If coming from duplicate, form is already pre-filled via updateFormData in MyAds
  // No need to do anything here - just clear location state
  if (location.state) {
    window.history.replaceState({}, document.title);
  }
}, []);

  useEffect(() => {
    fetchTargetingOptions();
  }, [fetchTargetingOptions]);

  useEffect(() => {
    if (currentStep === 2) {
      fetchPricingEstimate();
    }
  }, [currentStep, formData.targetImpressions, formData.targeting, fetchPricingEstimate]);

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

  const steps = [
    { id: 0, name: "Create", description: "Design your ad" },
    { id: 1, name: "Target", description: "Choose audience" },
    { id: 2, name: "Launch", description: "Set budget" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
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
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Create Campaign</h1>
              <p className="text-muted-foreground">Launch in 3 simple steps</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
                      currentStep === index
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : currentStep > index
                        ? "bg-green-500/10 border-green-500/30 text-green-600"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                  >
                    {currentStep > index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          currentStep === index
                            ? "bg-primary-foreground/20"
                            : "bg-muted"
                        }`}
                      >
                        {index + 1}
                      </div>
                    )}
                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold">{step.name}</div>
                      <div className="text-xs opacity-75">{step.description}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`hidden lg:block w-8 h-px mx-1 ${
                        currentStep > index ? "bg-green-500" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Messages */}
        {(error || successMessage) && (
          <div className="mb-6">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive text-sm">Error</div>
                  <div className="text-sm text-destructive/80 mt-0.5">{error}</div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-green-600 text-sm">Success</div>
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
                    {currentStep === 0 ? "Cancel" : "← Previous"}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || isSubmitting}
                    className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LivePreview />
            <div className="hidden lg:block">
              <AIRecommendations />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchAd;