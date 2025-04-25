const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface Transaction {
  signature: string;
  slot: string;
  blockTime: string;
  time: string;
  fee: string;
  status: string;
  data: {
    from: string;
    to: string;
    amount: string;
  };
}

export interface WalletData {
  address: string;
  balance: string;
  usdValue: string;
  tokens: Array<{
    name: string;
    amount: string;
    value: string;
  }>;
  transactionCount: number;
  firstActivity: string;
  lastActivity: string;
}

export interface ProgramData {
  id: string;
  name: string;
  description: string;
  transactionCount: number;
  uniqueUsers: number;
  firstActivity: string;
  lastActivity: string;
}

export interface WalletTransactionResponse {
  total: number;
  transactions: Array<{
    signature: string;
    slot: string;
    blockTime: string;
    fee: string;
    status: string;
    data: {
      programId: string;
      accounts: string[];
      instructions: Array<{
        programId: string;
        data: string;
      }>;
    };
  }>;
}

export const api = {
  // Transaction endpoints
  getTransactions: async (limit: number = 10, offset: number = 0): Promise<Transaction[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limit, offset }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      
      // Return the data as is since it matches our Transaction interface
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  getTransactionBySignature: async (signature: string): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/transactions/signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature }),
    });
    if (!response.ok) throw new Error('Failed to fetch transaction');
    return response.json();
  },

  // Wallet endpoints
  getWalletTransactions: async (address: string, limit: number = 10, offset: number = 0): Promise<WalletTransactionResponse> => {
    const response = await fetch(`${API_BASE_URL}/wallet/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, limit, offset }),
    });
    if (!response.ok) throw new Error('Failed to fetch wallet transactions');
    return response.json();
  },

  getWalletTokenTransfers: async (address: string, limit: number = 10, offset: number = 0) => {
    const response = await fetch(`${API_BASE_URL}/wallet/token-transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, limit, offset }),
    });
    if (!response.ok) throw new Error('Failed to fetch wallet token transfers');
    return response.json();
  },
  getWalletTransactionCount: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/wallet/transaction-count`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) throw new Error('Failed to fetch wallet transaction count');
    return response.json();
  },
  getWalletProgramInteractions: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/wallet/programs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) throw new Error('Failed to fetch wallet program interactions');
    return response.json();
  },

  getWalletBalances: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/wallet/balances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    });
    if (!response.ok) throw new Error('Failed to fetch wallet balances');
    return response.json();
  },

  getWalletBalanceHistory: async (address: string, days: number = 30) => {
    const response = await fetch(`${API_BASE_URL}/wallet/balance-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, days }),
    });
    if (!response.ok) throw new Error('Failed to fetch wallet balance history');
    return response.json();
  },

  // Add wallet programs endpoint
  getWalletPrograms: async (address: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/programs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Wallet programs error:', errorData);
        throw new Error(`Failed to fetch wallet programs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getWalletPrograms:', error);
      throw error;
    }
  },

  // Program endpoints
  getProgramUsage: async (programId: string) => {
    const response = await fetch(`${API_BASE_URL}/programs/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programId }),
    });
    if (!response.ok) throw new Error('Failed to fetch program usage');
    return response.json();
  },

  getProgramInteractions: async (programId: string, days: number = 30) => {
    const response = await fetch(`${API_BASE_URL}/programs/interactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programId, days }),
    });
    if (!response.ok) throw new Error('Failed to fetch program interactions');
    return response.json();
  },
}; 