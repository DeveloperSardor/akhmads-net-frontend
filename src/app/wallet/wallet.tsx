// src/app/wallet/wallet.tsx
import { useState, useEffect } from "react";
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  X,
  Bitcoin,
  ExternalLink,
} from "lucide-react";
import walletService from "../../services/wallet.service";
import { useTranslations } from "../../hooks/useTranslations";
import SEO from "../../components/SEO";

const fmt = (n: number) => `$${Math.abs(n).toFixed(2)}`;

function formatTxDescription(type: string, raw: string, txDesc: any): string {
  if (!txDesc) return raw || "-";

  // available: X → Y  (AD_SPEND, EARNINGS, etc.)
  const balanceMatch = raw?.match(/^available:\s*([\d.]+)\s*→\s*([\d.]+)/);
  if (balanceMatch) {
    return txDesc.balanceChange
      .replace("${from}", fmt(parseFloat(balanceMatch[1])))
      .replace("${to}", fmt(parseFloat(balanceMatch[2])));
  }

  // Ad reserve: available -$X, reserved +$X (adId: ID)
  const adReserveMatch = raw?.match(
    /Ad reserve:.*?available\s*-\$?([\d.]+).*?\(adId:\s*([^)]+)\)/i,
  );
  if (adReserveMatch) {
    return txDesc.adReserve
      .replace("${amount}", fmt(parseFloat(adReserveMatch[1])))
      .replace("{adId}", adReserveMatch[2].trim().slice(0, 12) + "…");
  }

  // Ad reserve release
  const adReleaseMatch = raw?.match(
    /Ad reserve release:.*?\+\$?([\d.]+).*?\(adId:\s*([^)]+)\)/i,
  );
  if (adReleaseMatch) {
    return txDesc.adReserveRelease
      .replace("${amount}", fmt(parseFloat(adReleaseMatch[1])))
      .replace("{adId}", adReleaseMatch[2].trim().slice(0, 12) + "…");
  }

  // Withdraw confirm: reserved -$X, totalWithdrawn +$X
  const withdrawMatch = raw?.match(
    /Withdraw confirm:.*?reserved\s*-\$?([\d.]+)/i,
  );
  if (withdrawMatch) {
    return txDesc.withdrawConfirm.replace(
      "${amount}",
      fmt(parseFloat(withdrawMatch[1])),
    );
  }

  // Withdraw reserve: available -$X, reserved +$X
  const withdrawReserveMatch = raw?.match(
    /Withdraw reserve:.*?available\s*-\$?([\d.]+)/i,
  );
  if (withdrawReserveMatch) {
    return txDesc.withdrawReserve.replace(
      "${amount}",
      fmt(parseFloat(withdrawReserveMatch[1])),
    );
  }

  // Earnings / deposit with simple amount
  if (type === "EARNINGS") {
    const amtMatch = raw?.match(/\+([\d.]+)/);
    if (amtMatch)
      return txDesc.earnings.replace("${amount}", fmt(parseFloat(amtMatch[1])));
  }
  if (type === "DEPOSIT") {
    const amtMatch = raw?.match(/\+([\d.]+)/);
    if (amtMatch)
      return txDesc.deposit.replace("${amount}", fmt(parseFloat(amtMatch[1])));
  }

  return txDesc.unknown?.replace("{raw}", raw || "-") ?? raw ?? "-";
}

const Wallet = () => {
  const t = useTranslations();
  const w = t.wallet;
  const locale = t.locale;

  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const defaultWallet = {
      available: "0",
      reserved: "0",
      pending: "0",
      totalDeposited: "0",
      totalWithdrawn: "0",
      totalEarned: "0",
      totalSpent: "0",
    };

    try {
      const walletRes = await walletService.getWallet();
      if (walletRes?.data?.wallet) {
        setWalletData(walletRes.data.wallet);
      } else {
        setWalletData(defaultWallet);
      }
    } catch (walletError: any) {
      console.error("Wallet load error:", walletError);
      setError(walletError.response?.data?.message || "Failed to load wallet");
      setWalletData(defaultWallet);
    }

    try {
      const txRes = await walletService.getTransactions({ limit: 20 });
      setTransactions(txRes.data || []);
    } catch (txError) {
      console.error("Transactions load error:", txError);
      setTransactions([]);
    }

    setLoading(false);
  };

  const formatCurrency = (amount: string | number) =>
    `$${parseFloat(String(amount || 0)).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={
          w?.pageTitle ? `${w.pageTitle} | Akhmads Net` : "Wallet | Akhmads Net"
        }
        description={
          w?.pageSubtitle ||
          "Manage your Akhmads Net wallet balance and transactions."
        }
      />
      <div className="min-h-screen bg-background pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                {w?.pageTitle}
              </h1>
            </div>
            <p className="text-muted-foreground">{w?.pageSubtitle}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={loadData}
                className="mt-2 text-sm text-destructive underline hover:no-underline"
              >
                {w?.retry}
              </button>
            </div>
          )}

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Available Balance */}
            <div className="p-8 bg-card border border-primary/20 rounded-3xl shadow-lg shadow-primary/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <WalletIcon className="w-24 h-24 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {w?.availableBalance}
                  </p>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <WalletIcon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <h2 className="text-5xl font-black text-foreground mb-8 tabular-nums tracking-tight">
                  {formatCurrency(walletData?.available || 0)}
                </h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="flex-1 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    {w?.addFunds}
                  </button>
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="flex-1 py-4 bg-background hover:bg-muted border border-border text-foreground font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <ArrowUpRight className="w-5 h-5 text-primary" />
                    {w?.withdrawBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* Reserved */}
            <div className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {w?.reserved}
                </p>
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                </div>
              </div>
              <h2 className="text-5xl font-black text-foreground mb-6 tabular-nums tracking-tight">
                {formatCurrency(walletData?.reserved || 0)}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                {w?.reservedHint}
              </p>
            </div>

            {/* Total Deposited */}
            <div className="p-8 bg-card border border-border rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {w?.totalDeposited}
                </p>
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
              <h2 className="text-5xl font-black text-foreground mb-6 tabular-nums tracking-tight">
                {formatCurrency(walletData?.totalDeposited || 0)}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/50">
                {w?.totalDepositedHint}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                label: w?.totalSpent,
                value: walletData?.totalSpent,
                color: "text-orange-600 dark:text-orange-500",
                bg: "bg-orange-500/5",
                border: "border-orange-500/10",
              },
              {
                label: w?.totalEarned,
                value: walletData?.totalEarned,
                color: "text-blue-600 dark:text-blue-500",
                bg: "bg-blue-500/5",
                border: "border-blue-500/10",
              },
              {
                label: w?.withdrawn,
                value: walletData?.totalWithdrawn,
                color: "text-purple-600 dark:text-purple-500",
                bg: "bg-purple-500/5",
                border: "border-purple-500/10",
              },
              {
                label: w?.pending,
                value: walletData?.pending,
                color: "text-yellow-600 dark:text-yellow-500",
                bg: "bg-yellow-500/5",
                border: "border-yellow-500/10",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`p-6 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/20 transition-all`}
              >
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black ${stat.color} tabular-nums`}>
                  {formatCurrency(stat.value || 0)}
                </p>
              </div>
            ))}
          </div>

          {/* Transactions */}
          <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {w?.recentTransactions}
              </h2>
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="p-24 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <WalletIcon className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <p className="text-foreground font-bold text-lg">
                  {w?.noTransactions}
                </p>
                <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">
                  {w?.noTransactionsHint}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {w?.txTableHeaders.type}
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {w?.txTableHeaders.description}
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {w?.txTableHeaders.date}
                      </th>
                      <th className="px-8 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {w?.txTableHeaders.amount}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx: any) => (
                      <tr
                        key={tx.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                                parseFloat(tx.amount) > 0
                                  ? "bg-green-500/10"
                                  : "bg-red-500/10"
                              }`}
                            >
                              {parseFloat(tx.amount) > 0 ? (
                                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-500" />
                              )}
                            </div>
                            <span className="text-sm font-bold text-foreground">
                              {(w?.txTypes as any)?.[tx.type] ??
                                tx.type.toLowerCase().replace(/_/g, " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm text-foreground/80 font-medium">
                            {formatTxDescription(
                              tx.type,
                              tx.description,
                              w?.txDesc,
                            )}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground font-medium">
                              {new Date(tx.createdAt).toLocaleDateString(
                                locale === "uz"
                                  ? "uz-UZ"
                                  : locale === "ru"
                                    ? "ru-RU"
                                    : "en-US",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span
                            className={`text-base font-black tabular-nums ${
                              parseFloat(tx.amount) > 0
                                ? "text-green-600 dark:text-green-500"
                                : "text-red-600 dark:text-red-500"
                            }`}
                          >
                            {parseFloat(tx.amount) > 0 ? "+" : ""}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onSuccess={loadData}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={loadData}
          availableBalance={walletData?.available || 0}
          locale={locale}
        />
      )}
    </>
  );
};

// Deposit Modal
const DepositModal = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const t = useTranslations();
  const dm = t.wallet?.depositModal;

  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 5) {
      alert(dm?.minAlert ?? "Minimum deposit: $5");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await walletService.initiateDeposit({
        provider: "CRYPTO",
        amount: parseFloat(amount),
        coin: "USDT",
        network: "TRC20",
      });

      if (response.data.payment.paymentUrl) {
        window.open(response.data.payment.paymentUrl, "_blank");
        alert(
          dm?.successMsg ??
            "✅ Payment page opened! Complete payment, then refresh this page.",
        );
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || dm?.failMsg || "Deposit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground">{dm?.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-muted rounded-2xl transition-colors group"
          >
            <X className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        <div className="mb-8">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">
            {dm?.amountLabel}
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={dm?.amountPlaceholder ?? "0.00"}
              className="w-full pl-12 pr-6 py-5 bg-background border-2 border-border rounded-2xl text-2xl font-black text-foreground outline-none focus:border-primary transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="mb-10 p-6 bg-primary/5 border-2 border-primary/10 rounded-3xl group hover:border-primary/20 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Bitcoin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground mb-1">
                {dm?.cryptoTitle}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {dm?.cryptoDesc}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDeposit}
          disabled={!amount || parseFloat(amount) < 5 || isSubmitting}
          className="w-full py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              {dm?.opening}
            </>
          ) : (
            <>
              <ExternalLink className="w-6 h-6" />
              {dm?.continue}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Withdraw Modal
const WithdrawModal = ({
  onClose,
  onSuccess,
  availableBalance,
  locale,
}: {
  onClose: () => void;
  onSuccess: () => void;
  availableBalance: number | string;
  locale: string;
}) => {
  const t = useTranslations();
  const wm = t.wallet?.withdrawModal;

  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < 10) {
      alert(wm?.minAlert ?? "Minimum withdrawal: $10");
      return;
    }
    if (parseFloat(amount) > parseFloat(String(availableBalance))) {
      alert(wm?.insufficientBalance ?? "Insufficient balance");
      return;
    }
    const bep20Regex = /^0x[a-fA-F0-9]{40}$/;
    if (!address.trim()) {
      alert(wm?.addressRequired ?? "Please enter a wallet address");
      return;
    }
    if (!bep20Regex.test(address.trim())) {
      alert(
        wm?.invalidAddress ??
          "Invalid BEP-20 address format. It should start with 0x and be 42 characters long.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await walletService.requestWithdraw({
        amount: parseFloat(amount),
        bep20Address: address.trim(),
      });

      alert(wm?.successMsg ?? "✅ Withdrawal requested successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(
        error.response?.data?.message || wm?.failMsg || "Withdrawal failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground">{wm?.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-muted rounded-2xl transition-colors group"
          >
            <X className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>

        <div className="mb-6">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">
            {wm?.amountLabel}
          </label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">
              $
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={wm?.amountPlaceholder ?? "0.00"}
              className="w-full pl-12 pr-6 py-5 bg-background border-2 border-border rounded-2xl text-2xl font-black text-foreground outline-none focus:border-primary transition-all shadow-inner"
            />
          </div>
          <div className="flex justify-between items-center mt-3 px-2">
            <span className="text-xs font-bold text-muted-foreground">
              {wm?.available ?? "Available:"}
              <span className="text-foreground ml-1">
                ${parseFloat(String(availableBalance || 0)).toFixed(2)}
              </span>
            </span>
            <button
              onClick={() => setAmount(String(availableBalance))}
              className="px-3 py-1 rounded-lg bg-primary/10 text-xs font-black text-primary hover:bg-primary/20 transition-colors"
            >
              {wm?.max ?? "MAX"}
            </button>
          </div>
        </div>

        <div className="mb-8">
          <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 block">
            {wm?.addressLabel}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={wm?.addressPlaceholder}
            className="w-full px-6 py-5 bg-background border-2 border-border rounded-2xl text-sm font-bold text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50 transition-all shadow-inner"
          />
        </div>

        <div className="mb-10 p-6 bg-primary/5 border-2 border-primary/10 rounded-3xl group hover:border-primary/20 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Bitcoin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground mb-1">
                {wm?.cryptoTitle}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {wm?.cryptoDesc}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={
            !amount ||
            parseFloat(amount) < 10 ||
            parseFloat(amount) > parseFloat(String(availableBalance)) ||
            !address ||
            isSubmitting
          }
          className="w-full py-5 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              {wm?.processing}
            </>
          ) : (
            <>
              <ArrowUpRight className="w-6 h-6" />
              {wm?.continue}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Wallet;
