import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';

// Base API URL from environment
const API_URL = import.meta.env.VITE_TS_API_URL || 'http://localhost:8000';

// Track API availability
let apiAvailable = true;

// Helper function for API calls
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    apiAvailable = true;
    return response.json();
  } catch (error) {
    apiAvailable = false;
    throw error;
  }
}

// Export API availability status
export function useApiStatus() {
  return { apiAvailable };
}

// =====================
// Bot Management Hooks
// =====================

interface Bot {
  id: string;
  name: string;
  status: 'active' | 'paused';
  description: string;
  icon: string;
  profit: string;
  trades: number;
  category: 'arbitrage' | 'price-impact' | 'twap' | 'mev-protection';
  created_at: number;
  updated_at: number;
}

interface BotPerformance {
  botId: string;
  profit: string;
  trades: number;
  successRate: number;
  profitHistory: { timestamp: number; value: string }[];
  riskMetrics: {
    maxDrawdown: string;
    sharpeRatio: number;
    volatility: string;
  };
}

export function useBots(category?: string) {
  const { address } = useAppKitAccount();
  
  return useQuery<{ success: boolean; bots: Bot[]; count: number }>({
    queryKey: ['bots', address, category],
    queryFn: () => {
      const params = new URLSearchParams();
      if (address) params.append('wallet_address', address);
      if (category) params.append('category', category);
      
      return apiCall(`/bots?${params.toString()}`);
    },
    enabled: true, // Always enabled, will work without wallet connection
  });
}

export function useBotToggle() {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();
  
  return useMutation({
    mutationFn: ({ botId }: { botId: string }) => 
      apiCall(`/bots/${botId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ wallet_address: address }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
    },
  });
}

export function useBotPerformance(botId: string) {
  const { address } = useAppKitAccount();
  
  return useQuery<{ success: boolean; performance: BotPerformance }>({
    queryKey: ['bot-performance', botId, address],
    queryFn: () => {
      const params = new URLSearchParams();
      if (address) params.append('wallet_address', address);
      
      return apiCall(`/bots/${botId}/performance?${params.toString()}`);
    },
    enabled: !!botId,
  });
}

// ========================
// Transaction Hooks
// ========================

interface Transaction {
  id: string;
  timestamp: number;
  status: 'completed' | 'in-progress' | 'failed' | 'pending';
  sourceChain: string;
  destinationChain: string;
  tokenFrom: string;
  tokenTo: string;
  amount: string;
  txHash: string;
  gasUsed?: string;
  gasFee?: string;
  exchangeRate?: string;
  type: 'swap' | 'bridge' | 'transfer' | 'stake' | 'unstake';
  protocol?: string;
  explorerUrl: string;
  blockNumber?: number;
  confirmations?: number;
}

export function useTransactions(filters?: {
  status?: string;
  chain?: string;
  type?: string;
  limit?: number;
  offset?: number;
}) {
  const { address } = useAppKitAccount();
  
  return useQuery<{
    success: boolean;
    transactions: Transaction[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }>({
    queryKey: ['transactions', address, filters],
    queryFn: () => {
      if (!address) throw new Error('Wallet not connected');
      
      const params = new URLSearchParams();
      params.append('wallet', address);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.chain) params.append('chain', filters.chain);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());
      
      return apiCall(`/transactions?${params.toString()}`);
    },
    enabled: !!address,
  });
}

export function useTrackTransaction() {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();
  
  return useMutation({
    mutationFn: (data: {
      txHash: string;
      sourceChain: string;
      type?: string;
      tokenFrom?: string;
      tokenTo?: string;
      amount?: string;
    }) => 
      apiCall('/transactions/track', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          wallet_address: address,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useTransactionDetails(txHash: string, chain?: string) {
  return useQuery<{ success: boolean; transaction: Transaction }>({
    queryKey: ['transaction', txHash, chain],
    queryFn: () => {
      const params = new URLSearchParams();
      if (chain) params.append('chain', chain);
      
      return apiCall(`/transactions/${txHash}?${params.toString()}`);
    },
    enabled: !!txHash,
  });
}

// =====================
// Portfolio Hooks
// =====================

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  change24h: string;
  changePercent: string;
  chainId: number;
  contractAddress?: string;
  price: string;
  decimals: number;
}

interface PortfolioSummary {
  totalValue: string;
  change24h: string;
  changePercent: string;
  activeAssets: number;
  volume24h: string;
  lastUpdated: number;
}

export function usePortfolio(chains?: string, refresh?: boolean) {
  const { address } = useAppKitAccount();
  
  return useQuery<{
    success: boolean;
    summary: PortfolioSummary;
    assets: PortfolioAsset[];
  }>({
    queryKey: ['portfolio', address, chains],
    queryFn: () => {
      if (!address) throw new Error('Wallet not connected');
      
      const params = new URLSearchParams();
      if (chains) params.append('chains', chains);
      if (refresh) params.append('refresh', 'true');
      
      return apiCall(`/portfolio/${address}?${params.toString()}`);
    },
    enabled: !!address,
    staleTime: refresh ? 0 : 300000, // 5 minute cache unless refresh requested
    cacheTime: 600000, // Keep in cache for 10 minutes
  });
}

export function usePortfolioPerformance(period: string = '30d', chains?: string) {
  const { address } = useAppKitAccount();
  
  return useQuery<{
    success: boolean;
    performance: {
      totalReturn: string;
      totalReturnPercent: string;
      sharpeRatio: number;
      maxDrawdown: string;
      volatility: string;
      chartData: { timestamp: number; value: string; change: string }[];
    };
  }>({
    queryKey: ['portfolio-performance', address, period, chains],
    queryFn: () => {
      if (!address) throw new Error('Wallet not connected');
      
      const params = new URLSearchParams();
      params.append('period', period);
      if (chains) params.append('chains', chains);
      
      return apiCall(`/portfolio/${address}/performance?${params.toString()}`);
    },
    enabled: !!address,
  });
}

// =====================
// Market Data Hooks
// =====================

interface MarketNews {
  id: string;
  title: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  percentage?: string;
  timestamp: number;
  source?: string;
  category?: string;
}

interface TokenPrice {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  changePercent: string;
  marketCap?: string;
  volume24h?: string;
  lastUpdated: number;
}

export function useMarketNews(filters?: {
  limit?: number;
  category?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return useQuery<{ success: boolean; news: MarketNews[]; count: number }>({
    queryKey: ['market-news', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.category) params.append('category', filters.category);
      if (filters?.trend) params.append('trend', filters.trend);
      
      return apiCall(`/market/news?${params.toString()}`);
    },
    staleTime: 300000, // Cache for 5 minutes
    cacheTime: 600000, // Keep in cache for 10 minutes
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

export function useTokenPrices(symbols: string[], chainId: number = 1) {
  return useQuery<{
    success: boolean;
    prices: Record<string, TokenPrice>;
    chainId: number;
  }>({
    queryKey: ['token-prices', symbols.join(','), chainId],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('symbols', symbols.join(','));
      params.append('chainId', chainId.toString());
      
      return apiCall(`/market/prices?${params.toString()}`);
    },
    enabled: symbols.length > 0,
    staleTime: 60000, // 1 minute cache
  });
}

export function useTrendingTokens(chainId: number = 1, limit: number = 10) {
  return useQuery<{
    success: boolean;
    trending: {
      rank: number;
      symbol: string;
      name: string;
      price: string;
      changePercent: string;
      volume24h: string;
      marketCap: string;
    }[];
  }>({
    queryKey: ['trending-tokens', chainId, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('chainId', chainId.toString());
      params.append('limit', limit.toString());
      
      return apiCall(`/market/trending?${params.toString()}`);
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}

// ========================
// Play-to-Earn (Gamification) Hooks
// ========================

interface UserProgress {
  walletAddress: string;
  level: number;
  totalRewards: string;
  completedChallenges: string[];
  currentStage: number;
  xp: number;
  streakDays: number;
  lastActiveDate: number;
  achievements: string[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  xpReward: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  requirements: string[];
  category: string;
  unlockLevel?: number;
  timeLimit?: number;
}

export function useUserProgress() {
  const { address } = useAppKitAccount();
  
  return useQuery<{
    success: boolean;
    progress: UserProgress;
    nextLevelXp: number;
    currentLevelProgress: number;
  }>({
    queryKey: ['user-progress', address],
    queryFn: () => {
      if (!address) throw new Error('Wallet not connected');
      
      return apiCall(`/user/progress/${address}`);
    },
    enabled: !!address,
  });
}

export function useChallenges(filters?: {
  difficulty?: string;
  category?: string;
  completed?: boolean;
}) {
  return useQuery<{ success: boolean; challenges: Challenge[]; count: number }>({
    queryKey: ['challenges', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.completed !== undefined) params.append('completed', filters.completed.toString());
      
      return apiCall(`/challenges?${params.toString()}`);
    },
  });
}

export function useCompleteChallenge() {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();
  
  return useMutation({
    mutationFn: ({ challengeId, proof }: { challengeId: string; proof?: any }) => 
      apiCall(`/challenges/${challengeId}/complete`, {
        method: 'POST',
        body: JSON.stringify({
          walletAddress: address,
          proof,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

export function useClaimDailyReward() {
  const queryClient = useQueryClient();
  const { address } = useAppKitAccount();
  
  return useMutation({
    mutationFn: () => 
      apiCall('/daily-reward', {
        method: 'POST',
        body: JSON.stringify({ walletAddress: address }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });
}

export function useLeaderboard(type: 'xp' | 'level' = 'xp', limit: number = 10) {
  return useQuery<{
    success: boolean;
    leaderboard: {
      rank: number;
      walletAddress: string;
      level: number;
      totalRewards: string;
      xp: number;
      challengesCompleted: number;
    }[];
  }>({
    queryKey: ['leaderboard', type, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('type', type);
      params.append('limit', limit.toString());
      
      return apiCall(`/leaderboard?${params.toString()}`);
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// =====================
// Chat API Hooks (Thread-based)
// =====================

interface ChatThread {
  id: string;
  title: string;
  wallet_address?: string;
  created_at: number;
  updated_at: number;
  message_count: number;
  last_message: string;
  category?: string;
}

interface ChatMessage {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  wallet_address?: string;
}

export function useChat(message: string, enabled: boolean = false) {
  const { address } = useAppKitAccount();
  
  return useQuery({
    queryKey: ['chat', message, address],
    queryFn: () => 
      apiCall('/chat', {
        method: 'POST',
        body: JSON.stringify({
          user_prompt: message,
          wallet_address: address,
        }),
      }),
    enabled: enabled && message.length > 0,
  });
}

export function useChatThreads() {
  const { address } = useAppKitAccount();
  
  return useQuery<{ success: boolean; threads: ChatThread[] }>({
    queryKey: ['chat-threads', address],
    queryFn: () => {
      const params = new URLSearchParams();
      if (address) params.append('wallet_address', address);
      
      return apiCall(`/chat-threads?${params.toString()}`);
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useChatThread(threadId: string) {
  return useQuery<{ 
    success: boolean; 
    thread: ChatThread; 
    messages: ChatMessage[];
  }>({
    queryKey: ['chat-thread', threadId],
    queryFn: () => apiCall(`/chat-thread/${threadId}`),
    enabled: !!threadId,
  });
}

export function useDeleteChatThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (threadId: string) => 
      apiCall(`/chat-thread/${threadId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-threads'] });
    },
  });
}

export function useChatHistory() {
  const { address } = useAppKitAccount();
  
  return useQuery({
    queryKey: ['chat-history', address],
    queryFn: () => {
      if (!address) throw new Error('Wallet not connected');
      
      return apiCall(`/chat-history/${address}`);
    },
    enabled: !!address,
  });
}