// src/app/wallet/wallet.tsx - FIXED FOR BACKEND
import { useState, useEffect } from "react";
import { 
  Wallet as WalletIcon, 
  Plus, 
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  X,
  Bitcoin,
  ExternalLink,
} from "lucide-react";
import walletService from "../../services/wallet.service";

const Wallet = () => {
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const defaultWallet = {
      available: '0',
      reserved: '0',
      pending: '0',
      totalDeposited: '0',
      totalWithdrawn: '0',
      totalEarned: '0',
      totalSpent: '0'
    };

    try {
      // Load wallet
      const walletRes = await walletService.getWallet();
      console.log('Wallet API response:', walletRes);
      
      if (walletRes?.data?.wallet) {
        setWalletData(walletRes.data.wallet);
      } else {
        setWalletData(defaultWallet);
      }
    } catch (walletError: any) {
      console.error('Wallet load error:', walletError);
      setError(walletError.response?.data?.message || 'Failed to load wallet');
      setWalletData(defaultWallet);
    }

    try {
      // Load transactions - backend returns { data: [] } directly!
      const txRes = await walletService.getTransactions({ limit: 20 });
      console.log('Transactions API response:', txRes);
      
      // ✅ Backend returns data: [] directly, not data.entries!
      setTransactions(txRes.data || []);
    } catch (txError) {
      console.error('Transactions load error:', txError);
      setTransactions([]);
    }

    setLoading(false);
  };

  const formatCurrency = (amount: string | number) => {
    return `$${parseFloat(String(amount || 0)).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
            </div>
            <p className="text-muted-foreground">Manage your balance and transactions</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
              <button 
                onClick={loadData}
                className="mt-2 text-sm text-destructive underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Available Balance */}
            <div className="p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <WalletIcon className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4 tabular-nums">
                {formatCurrency(walletData?.available || 0)}
              </h2>
              <button
                onClick={() => setShowDepositModal(true)}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Funds
              </button>
            </div>

            {/* Reserved */}
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Reserved</p>
                <Clock className="w-4 h-4 text-yellow-500" />
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4 tabular-nums">
                {formatCurrency(walletData?.reserved || 0)}
              </h2>
              <p className="text-xs text-muted-foreground">For pending campaigns</p>
            </div>

            {/* Total Deposited */}
            <div className="p-6 bg-card border border-border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Total Deposited</p>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <h2 className="text-4xl font-bold text-foreground mb-4 tabular-nums">
                {formatCurrency(walletData?.totalDeposited || 0)}
              </h2>
              <p className="text-xs text-muted-foreground">All-time deposits</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-card border border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Total Spent</p>
              <p className="text-xl font-bold text-orange-500 tabular-nums">
                {formatCurrency(walletData?.totalSpent || 0)}
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Total Earned</p>
              <p className="text-xl font-bold text-blue-500 tabular-nums">
                {formatCurrency(walletData?.totalEarned || 0)}
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Withdrawn</p>
              <p className="text-xl font-bold text-purple-500 tabular-nums">
                {formatCurrency(walletData?.totalWithdrawn || 0)}
              </p>
            </div>
            <div className="p-4 bg-card border border-border rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Pending</p>
              <p className="text-xl font-bold text-yellow-500 tabular-nums">
                {formatCurrency(walletData?.pending || 0)}
              </p>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            </div>

            {transactions.length === 0 ? (
              <div className="p-16 text-center">
                <WalletIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground mt-2">Add funds to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx: any) => (
                      <tr key={tx.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {parseFloat(tx.amount) > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium text-foreground capitalize">
                              {tx.type.toLowerCase().replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-muted-foreground">
                            {tx.description || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-sm font-semibold tabular-nums ${
                            parseFloat(tx.amount) > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {parseFloat(tx.amount) > 0 ? '+' : ''}
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
    </>
  );
};

// Deposit Modal
const DepositModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 5) {
      alert('Minimum deposit: $5');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await walletService.initiateDeposit({
        provider: 'CRYPTO',
        amount: parseFloat(amount),
        coin: 'USDT',
        network: 'TRC20',
      });

      if (response.data.payment.paymentUrl) {
        window.open(response.data.payment.paymentUrl, '_blank');
        alert('✅ Payment page opened! Complete payment, then refresh this page.');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Deposit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Add Funds</h3>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="text-sm font-semibold text-foreground mb-2 block">Amount (USD)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Minimum: $5"
            className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mb-6 p-4 border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <Bitcoin className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Crypto (USDT)</p>
              <p className="text-xs text-muted-foreground">Pay with CryptoBot</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDeposit}
          disabled={!amount || parseFloat(amount) < 5 || isSubmitting}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Opening...
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Continue to Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Wallet;