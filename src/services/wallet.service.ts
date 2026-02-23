// src/services/wallet.service.ts - FIXED TO MATCH BACKEND
import apiClient from '../api/api';

interface WalletData {
  id: string;
  userId: string;
  available: string;
  reserved: string;
  pending: string;
  totalDeposited: string;
  totalWithdrawn: string;
  totalEarned: string;
  totalSpent: string;
  createdAt: string;
  updatedAt: string;
}

interface LedgerEntry {
  id: string;
  userId: string;
  type: string;
  amount: string;
  balance: string;
  refId?: string;
  refType?: string;
  description?: string;
  createdAt: string;
}

class WalletService {
  /**
   * Get wallet balance
   */
  async getWallet(): Promise<{ success: boolean; data: { wallet: WalletData } }> {
    const response = await apiClient.get('/wallet');
    return response.data;
  }

  /**
   * Get transaction history (ledger entries)
   * Backend returns: { success, data: [], pagination }
   */
  async getTransactions(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ 
    success: boolean; 
    data: LedgerEntry[];  // ✅ Direct array, not entries!
    pagination: any;
  }> {
    const response = await apiClient.get('/wallet/transactions', { params });
    return response.data;
  }

  /**
   * Initiate deposit (Crypto only for now)
   */
  async initiateDeposit(data: {
    provider: 'CRYPTO' | 'PAYME';
    amount: number;
    coin?: string;
    network?: string;
  }): Promise<{
    success: boolean;
    data: {
      transaction: {
        id: string;
        amount: number;
        provider: string;
        status: string;
        createdAt: string;
      };
      payment: {
        paymentUrl: string;
        miniAppUrl?: string;
        webAppUrl?: string;
        provider: string;
        invoiceId?: number;
        expiresAt?: string;
        acceptedAssets?: string[];
        description: string;
      };
    };
  }> {
    const response = await apiClient.post('/payments/deposit/initiate', data);
    return response.data;
  }

  /**
   * Check deposit status
   */
  async checkDepositStatus(txId: string) {
    const response = await apiClient.get(`/payments/deposit/${txId}/status`);
    return response.data;
  }

  /**
   * Request withdrawal (BEP-20 USDT only)
   */
  async requestWithdraw(data: {
    amount: number;
    bep20Address: string;
  }) {
    const response = await apiClient.post('/payments/withdraw/request', data);
    return response.data;
  }
}

export default new WalletService();