// Portfolio Analysis and Validation Logic
import { usePortfolio, useTokenPrices } from '@/hooks/useApi';

export interface PortfolioAnalysis {
  hasSufficientFunds: boolean;
  availableAmount: number;
  totalBalance: number;
  chainDistribution: ChainBalance[];
  recommendations: PortfolioRecommendation[];
  riskAssessment: RiskAssessment;
  marketContext: MarketContext;
}

export interface ChainBalance {
  chainId: number;
  chainName: string;
  balance: number;
  gasEstimate: number;
  bridgeFee?: number;
  optimal: boolean;
}

export interface PortfolioRecommendation {
  type: 'swap_available' | 'bridge_optimal' | 'reduce_amount' | 'wait_gas' | 'market_timing';
  title: string;
  description: string;
  savings?: string;
  confidence: number;
}

export interface RiskAssessment {
  portfolioPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
  suggestions: string[];
}

export interface MarketContext {
  currentPrice: number;
  priceChange24h: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  gasEnvironment: 'low' | 'medium' | 'high';
  marketSentiment: string;
  optimalTiming: boolean;
}

export class PortfolioAnalyzer {
  /**
   * Analyze user's portfolio for a specific swap request
   */
  static async analyzeSwapRequest(
    walletAddress: string,
    fromToken: string,
    toToken: string,
    requestedAmount: number,
    userPreference: 'cheapest' | 'fastest' | 'balanced' = 'cheapest'
  ): Promise<PortfolioAnalysis> {
    
    // 1. Get user's portfolio data
    const portfolioData = await this.getPortfolioData(walletAddress);
    const tokenPrices = await this.getTokenPrices([fromToken, toToken]);
    const marketData = await this.getMarketContext(toToken);
    
    // 2. Check balance across all chains
    const chainBalances = await this.analyzeChainDistribution(
      portfolioData, 
      fromToken, 
      requestedAmount
    );
    
    // 3. Calculate total available funds
    const totalBalance = chainBalances.reduce((sum, chain) => sum + chain.balance, 0);
    const hasSufficientFunds = totalBalance >= requestedAmount;
    
    // 4. Generate intelligent recommendations
    const recommendations = await this.generateRecommendations(
      chainBalances,
      requestedAmount,
      totalBalance,
      userPreference,
      marketData
    );
    
    // 5. Assess portfolio risk
    const riskAssessment = this.assessRisk(
      portfolioData,
      fromToken,
      requestedAmount,
      tokenPrices
    );
    
    return {
      hasSufficientFunds,
      availableAmount: Math.min(totalBalance, requestedAmount),
      totalBalance,
      chainDistribution: chainBalances,
      recommendations,
      riskAssessment,
      marketContext: marketData
    };
  }

  /**
   * Get comprehensive portfolio data
   */
  private static async getPortfolioData(walletAddress: string) {
    try {
      // This would use the existing usePortfolio hook data
      const response = await fetch(`/api/portfolio/${walletAddress}?chains=all&refresh=true`);
      return await response.json();
    } catch (error) {
      console.error('Portfolio data fetch failed:', error);
      return null;
    }
  }

  /**
   * Get current token prices and market data
   */
  private static async getTokenPrices(symbols: string[]) {
    try {
      const response = await fetch(`/api/market/prices?symbols=${symbols.join(',')}`);
      return await response.json();
    } catch (error) {
      console.error('Price data fetch failed:', error);
      return {};
    }
  }

  /**
   * Analyze token distribution across chains
   */
  private static async analyzeChainDistribution(
    portfolioData: any,
    token: string,
    requestedAmount: number
  ): Promise<ChainBalance[]> {
    const chains = [
      { id: 1, name: 'Ethereum', gasMultiplier: 1.0 },
      { id: 137, name: 'Polygon', gasMultiplier: 0.1 },
      { id: 42161, name: 'Arbitrum', gasMultiplier: 0.3 },
      { id: 10, name: 'Optimism', gasMultiplier: 0.3 },
      { id: 8453, name: 'Base', gasMultiplier: 0.2 }
    ];

    const balances = await Promise.all(
      chains.map(async (chain) => {
        const balance = this.getTokenBalanceOnChain(portfolioData, token, chain.id);
        const gasEstimate = await this.estimateGasCost(chain.id, chain.gasMultiplier);
        
        return {
          chainId: chain.id,
          chainName: chain.name,
          balance,
          gasEstimate,
          bridgeFee: chain.id !== 1 ? await this.estimateBridgeFee(chain.id, 1) : 0,
          optimal: this.determineOptimalChain(balance, gasEstimate, requestedAmount)
        };
      })
    );

    return balances.sort((a, b) => {
      if (a.optimal && !b.optimal) return -1;
      if (!a.optimal && b.optimal) return 1;
      return b.balance - a.balance;
    });
  }

  /**
   * Generate intelligent recommendations based on analysis
   */
  private static async generateRecommendations(
    chainBalances: ChainBalance[],
    requestedAmount: number,
    totalBalance: number,
    preference: string,
    marketData: MarketContext
  ): Promise<PortfolioRecommendation[]> {
    const recommendations: PortfolioRecommendation[] = [];
    
    // Insufficient funds scenarios
    if (totalBalance < requestedAmount) {
      const deficit = requestedAmount - totalBalance;
      
      recommendations.push({
        type: 'reduce_amount',
        title: 'Swap Available Amount',
        description: `You have $${totalBalance.toFixed(2)} available. Swap ${totalBalance.toFixed(0)} ${chainBalances[0]?.balance > 0 ? 'USDC' : 'tokens'} instead?`,
        confidence: 0.9
      });

      if (deficit < totalBalance * 0.5) {
        recommendations.push({
          type: 'bridge_optimal',
          title: 'Bridge Additional Funds',
          description: `Bridge $${deficit.toFixed(2)} from another chain to complete your swap`,
          confidence: 0.7
        });
      }
    }

    // Multi-chain optimization
    const optimalChain = chainBalances.find(c => c.optimal);
    if (optimalChain && preference === 'cheapest') {
      const savings = chainBalances[0].gasEstimate - optimalChain.gasEstimate;
      if (savings > 5) {
        recommendations.push({
          type: 'bridge_optimal',
          title: `Use ${optimalChain.chainName} for Lower Fees`,
          description: `Swap on ${optimalChain.chainName} to save $${savings.toFixed(2)} in gas fees`,
          savings: `$${savings.toFixed(2)}`,
          confidence: 0.85
        });
      }
    }

    // Market timing recommendations
    if (marketData.gasEnvironment === 'high') {
      recommendations.push({
        type: 'wait_gas',
        title: 'High Gas Environment',
        description: 'Consider waiting for lower gas fees or using a Layer 2 solution',
        confidence: 0.7
      });
    }

    if (!marketData.optimalTiming && Math.abs(marketData.priceChange24h) > 5) {
      recommendations.push({
        type: 'market_timing',
        title: 'Consider Market Timing',
        description: `${marketData.toToken} is ${marketData.priceChange24h > 0 ? 'up' : 'down'} ${Math.abs(marketData.priceChange24h).toFixed(1)}% today. Consider DCA or waiting.`,
        confidence: 0.6
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Assess investment risk for the proposed swap
   */
  private static assessRisk(
    portfolioData: any,
    fromToken: string,
    amount: number,
    prices: any
  ): RiskAssessment {
    const totalPortfolioValue = portfolioData?.summary?.totalValue || 0;
    const swapValue = amount * (prices[fromToken]?.price || 1);
    const portfolioPercentage = (swapValue / totalPortfolioValue) * 100;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (portfolioPercentage > 50) {
      riskLevel = 'high';
      warnings.push('This swap represents over 50% of your portfolio');
      suggestions.push('Consider reducing the swap amount or DCA over time');
    } else if (portfolioPercentage > 25) {
      riskLevel = 'medium';
      warnings.push('This is a significant portion of your portfolio');
      suggestions.push('Consider your overall asset allocation strategy');
    }

    if (portfolioData?.assets?.length === 1) {
      warnings.push('Your portfolio lacks diversification');
      suggestions.push('Consider maintaining some stable assets');
    }

    return {
      portfolioPercentage,
      riskLevel,
      warnings,
      suggestions
    };
  }

  /**
   * Get market context for informed decision making
   */
  private static async getMarketContext(token: string): Promise<MarketContext> {
    try {
      // This would integrate with market data APIs
      const marketResponse = await fetch(`/api/market/context/${token}`);
      const data = await marketResponse.json();
      
      return {
        currentPrice: data.price || 0,
        priceChange24h: data.change24h || 0,
        trend: this.determineTrend(data.change24h, data.volume24h),
        gasEnvironment: await this.assessGasEnvironment(),
        marketSentiment: data.sentiment || 'neutral',
        optimalTiming: this.assessOptimalTiming(data)
      };
    } catch (error) {
      return {
        currentPrice: 0,
        priceChange24h: 0,
        trend: 'neutral',
        gasEnvironment: 'medium',
        marketSentiment: 'neutral',
        optimalTiming: true
      };
    }
  }

  // Helper methods
  private static getTokenBalanceOnChain(portfolioData: any, token: string, chainId: number): number {
    return portfolioData?.assets?.find((asset: any) => 
      asset.symbol === token && asset.chainId === chainId
    )?.balance || 0;
  }

  private static async estimateGasCost(chainId: number, multiplier: number): Promise<number> {
    // Estimate gas costs based on current network conditions
    const baseGas = 50; // Base gas cost in USD
    return baseGas * multiplier;
  }

  private static async estimateBridgeFee(fromChain: number, toChain: number): Promise<number> {
    // Estimate bridge fees
    return 10; // Simplified bridge fee
  }

  private static determineOptimalChain(balance: number, gasEstimate: number, requested: number): boolean {
    return balance >= requested && gasEstimate < 20;
  }

  private static determineTrend(change24h: number, volume24h: number): 'bullish' | 'bearish' | 'neutral' {
    if (change24h > 3 && volume24h > 1000000) return 'bullish';
    if (change24h < -3 && volume24h > 1000000) return 'bearish';
    return 'neutral';
  }

  private static async assessGasEnvironment(): Promise<'low' | 'medium' | 'high'> {
    // Assess current gas environment
    return 'medium'; // Simplified
  }

  private static assessOptimalTiming(data: any): boolean {
    // Assess if timing is good for the swap
    return Math.abs(data.change24h) < 5; // Simplified
  }
}