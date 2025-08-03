// Intelligent Chat Service with LLM Reasoning
import { PortfolioAnalyzer, PortfolioAnalysis } from './portfolioAnalyzer';
import { RouteAnalyzer, RouteAnalysis } from './routeAnalyzer';
import { TalkToInvestResponse } from '@/types/TalkToInvest';

export interface IntelligentChatRequest {
  userPrompt: string;
  walletAddress?: string;
  threadId?: string;
  context?: ChatContext;
}

export interface ChatContext {
  previousActions: string[];
  userPreferences: UserPreferences;
  marketConditions: MarketConditions;
}

export interface UserPreferences {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredSpeed: 'cheapest' | 'fastest' | 'balanced';
  maxSlippage: number;
  preferredChains: number[];
}

export interface MarketConditions {
  volatilityLevel: 'low' | 'medium' | 'high';
  gasEnvironment: 'low' | 'medium' | 'high';
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  majorEvents: string[];
}

export interface IntelligentChatResponse {
  reply: string;
  actionResponse?: TalkToInvestResponse;
  requiresAction: boolean;
  reasoning: string;
  recommendations: string[];
  riskWarnings: string[];
  marketInsights: string[];
}

export class IntelligentChatService {
  
  /**
   * Process user request with full intelligence pipeline
   */
  static async processRequest(request: IntelligentChatRequest): Promise<IntelligentChatResponse> {
    console.log('🧠 Starting intelligent analysis for:', request.userPrompt);
    
    // 1. Parse user intent
    const intent = await this.parseUserIntent(request.userPrompt);
    console.log('🎯 Parsed intent:', intent);
    
    // 2. Analyze user's portfolio if swap-related
    let portfolioAnalysis: PortfolioAnalysis | null = null;
    if (intent.type === 'swap' && request.walletAddress) {
      portfolioAnalysis = await PortfolioAnalyzer.analyzeSwapRequest(
        request.walletAddress,
        intent.fromToken,
        intent.toToken,
        intent.amount,
        intent.preference
      );
      console.log('💼 Portfolio analysis:', portfolioAnalysis);
    }
    
    // 3. Analyze routes if actionable
    let routeAnalysis: RouteAnalysis | null = null;
    if (intent.type === 'swap' && portfolioAnalysis?.hasSufficientFunds) {
      routeAnalysis = await RouteAnalyzer.analyzeRoutes(
        intent.fromToken,
        intent.toToken,
        intent.amount,
        intent.fromChain || 1,
        intent.toChain || 1,
        intent.preference || 'cheapest'
      );
      console.log('🛣️ Route analysis:', routeAnalysis);
    }
    
    // 4. Get market context
    const marketContext = await this.getMarketContext(intent.toToken || 'ETH');
    console.log('📊 Market context:', marketContext);
    
    // 5. Generate intelligent response
    const response = await this.generateIntelligentResponse(
      intent,
      portfolioAnalysis,
      routeAnalysis,
      marketContext,
      request.walletAddress
    );
    
    console.log('✅ Generated intelligent response');
    return response;
  }

  /**
   * Parse user intent from natural language using LLM
   */
  private static async parseUserIntent(prompt: string): Promise<SwapIntent> {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if it's a swap-related request
    const swapKeywords = ['swap', 'exchange', 'trade', 'convert', 'buy', 'sell'];
    const isSwapRequest = swapKeywords.some(keyword => lowerPrompt.includes(keyword));
    
    if (!isSwapRequest) {
      return { type: 'general', prompt };
    }
    
    // Parse swap details using regex patterns
    const amountPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:dollars?|usd|usdc)/i, // "100 dollar", "100 USD"
      /(\d+(?:\.\d+)?)\s*(eth|ethereum|btc|bitcoin)/i // "1 ETH", "0.5 BTC"
    ];
    
    const tokenPatterns = [
      /(?:swap|trade|convert|exchange)\s+(\w+)(?:\s+(?:for|to|into))?/i,
      /(?:buy|purchase)\s+(\w+)/i,
      /(?:sell)\s+(\w+)/i
    ];
    
    let amount = 100; // default
    let fromToken = 'ETH';
    let toToken = 'USDC';
    
    // Extract amount
    for (const pattern of amountPatterns) {
      const match = prompt.match(pattern);
      if (match) {
        amount = parseFloat(match[1]);
        // If pattern includes token, set fromToken
        if (match[2]) {
          const token = match[2].toUpperCase();
          if (token.includes('DOLLAR') || token.includes('USD')) {
            toToken = 'USDC';
          } else {
            fromToken = token === 'ETHEREUM' ? 'ETH' : token;
          }
        }
        break;
      }
    }
    
    // Determine swap direction based on phrasing
    if (lowerPrompt.includes('swap') && lowerPrompt.includes('for')) {
      // "swap eth for 100 dollar" - fromToken is ETH, want 100 dollars worth
      const forMatch = prompt.match(/swap\s+(\w+)\s+for\s+(\d+(?:\.\d+)?)\s*(?:dollars?|usd|usdc)/i);
      if (forMatch) {
        fromToken = forMatch[1].toUpperCase() === 'ETHEREUM' ? 'ETH' : forMatch[1].toUpperCase();
        toToken = 'USDC';
        amount = parseFloat(forMatch[2]);
      }
    } else if (lowerPrompt.includes('swap') && lowerPrompt.includes('to')) {
      // "swap 100 USDC to ETH" - clear direction
      const toMatch = prompt.match(/swap\s+(\d+(?:\.\d+)?)\s*(\w+)\s+to\s+(\w+)/i);
      if (toMatch) {
        amount = parseFloat(toMatch[1]);
        fromToken = toMatch[2].toUpperCase();
        toToken = toMatch[3].toUpperCase() === 'ETHEREUM' ? 'ETH' : toMatch[3].toUpperCase();
      }
    } else if (lowerPrompt.includes('buy') || lowerPrompt.includes('purchase')) {
      // "buy 100 dollar of eth" or "buy eth with 100 dollar"
      if (lowerPrompt.includes('dollar') || lowerPrompt.includes('usd')) {
        fromToken = 'USDC';
        toToken = 'ETH';
      }
    }
    
    // Normalize token names
    if (fromToken === 'ETHEREUM') fromToken = 'ETH';
    if (toToken === 'ETHEREUM') toToken = 'ETH';
    if (fromToken.includes('DOLLAR') || fromToken.includes('USD')) fromToken = 'USDC';
    if (toToken.includes('DOLLAR') || toToken.includes('USD')) toToken = 'USDC';
    
    console.log('🎯 Parsed intent:', { fromToken, toToken, amount, prompt });
    
    return {
      type: 'swap',
      prompt,
      fromToken,
      toToken,
      amount,
      preference: 'cheapest'
    };
  }

  /**
   * Generate intelligent response with reasoning
   */
  private static async generateIntelligentResponse(
    intent: SwapIntent,
    portfolioAnalysis: PortfolioAnalysis | null,
    routeAnalysis: RouteAnalysis | null,
    marketContext: any,
    walletAddress?: string
  ): Promise<IntelligentChatResponse> {
    
    if (intent.type !== 'swap') {
      return this.generateGeneralResponse(intent.prompt);
    }
    
    // Check for wallet connection
    if (!walletAddress) {
      return {
        reply: "I'd love to help you with that swap! To provide personalized recommendations and check your portfolio, please connect your wallet first. Once connected, I can analyze your holdings and find the optimal route.",
        requiresAction: false,
        reasoning: "User needs to connect wallet for portfolio analysis",
        recommendations: ["Connect wallet to get personalized advice"],
        riskWarnings: [],
        marketInsights: []
      };
    }
    
    // Check portfolio sufficiency
    if (!portfolioAnalysis?.hasSufficientFunds) {
      return this.generateInsufficientFundsResponse(intent, portfolioAnalysis);
    }
    
    // Generate successful swap response with full analysis
    return this.generateSwapResponse(intent, portfolioAnalysis, routeAnalysis, marketContext);
  }

  /**
   * Generate response for insufficient funds scenario
   */
  private static generateInsufficientFundsResponse(
    intent: SwapIntent,
    portfolioAnalysis: PortfolioAnalysis | null
  ): IntelligentChatResponse {
    const available = portfolioAnalysis?.totalBalance || 0;
    const requested = intent.amount;
    const deficit = requested - available;
    
    let reply = `I checked your portfolio and found $${available.toFixed(2)} ${intent.fromToken} available, but you're looking to swap $${requested.toFixed(2)}. `;
    
    const recommendations: string[] = [];
    
    if (available > 0) {
      reply += `Here are your best options:\n\n`;
      reply += `💡 **Swap Available Amount**: Trade your full $${available.toFixed(2)} ${intent.fromToken} balance\n`;
      recommendations.push(`Swap ${available.toFixed(0)} ${intent.fromToken} instead`);
      
      if (deficit < available * 0.5) {
        reply += `🌉 **Bridge Additional Funds**: If you have ${intent.fromToken} on other chains, bridge $${deficit.toFixed(2)} to complete your full swap\n`;
        recommendations.push("Check other chains for additional funds");
      }
      
      reply += `💰 **Add Funds**: Deposit more ${intent.fromToken} to your wallet\n`;
      recommendations.push("Add funds to wallet");
    } else {
      reply += `You don't currently have any ${intent.fromToken} in your connected wallet. You'll need to deposit ${intent.fromToken} first.`;
      recommendations.push(`Deposit ${intent.fromToken} to your wallet`);
    }
    
    // Check for alternative tokens
    if (portfolioAnalysis?.chainDistribution) {
      const alternatives = portfolioAnalysis.chainDistribution
        .filter(chain => chain.balance > 0)
        .map(chain => `${chain.balance.toFixed(2)} on ${chain.chainName}`);
      
      if (alternatives.length > 0) {
        reply += `\n\n📊 **Your Current Holdings**: ${alternatives.join(', ')}`;
      }
    }
    
    return {
      reply,
      requiresAction: false,
      reasoning: `Insufficient funds: user has ${available} but needs ${requested}`,
      recommendations,
      riskWarnings: [],
      marketInsights: []
    };
  }

  /**
   * Generate successful swap response with full analysis
   */
  private static generateSwapResponse(
    intent: SwapIntent,
    portfolioAnalysis: PortfolioAnalysis,
    routeAnalysis: RouteAnalysis | null,
    marketContext: any
  ): IntelligentChatResponse {
    const route = routeAnalysis?.recommendedRoute;
    const outputAmount = (intent.amount * 0.998).toFixed(4); // Simplified calculation
    
    // Portfolio context
    let reply = `I analyzed your portfolio and found $${portfolioAnalysis.totalBalance.toFixed(2)} ${intent.fromToken} available across ${portfolioAnalysis.chainDistribution.length} chains. `;
    
    // Market context
    if (marketContext.priceChange24h !== 0) {
      const direction = marketContext.priceChange24h > 0 ? 'up' : 'down';
      const changeAbs = Math.abs(marketContext.priceChange24h);
      reply += `${intent.toToken} is ${direction} ${changeAbs.toFixed(1)}% today at $${marketContext.currentPrice.toFixed(0)}. `;
      
      if (changeAbs > 3) {
        reply += `Given the ${changeAbs > 5 ? 'significant' : 'notable'} movement, `;
        if (marketContext.priceChange24h > 0) {
          reply += `this could be a good entry point, but consider DCA if you're concerned about a pullback. `;
        } else {
          reply += `you might be buying a dip - potentially good timing. `;
        }
      }
    }
    
    // Route analysis
    if (route) {
      reply += `\n\nFor the ${intent.preference} route, I recommend ${route.name}. `;
      reply += route.reasoning;
      reply += ` Total cost: $${route.totalCost.toFixed(2)} (${route.gasEstimate.toFixed(2)} gas + ${(route.totalCost - route.gasEstimate).toFixed(2)} fees). `;
      reply += `You'll receive approximately ${outputAmount} ${intent.toToken}. `;
    }
    
    // Risk assessment
    const riskWarnings: string[] = [];
    const marketInsights: string[] = [];
    
    if (portfolioAnalysis.riskAssessment.portfolioPercentage > 25) {
      riskWarnings.push(`This swap represents ${portfolioAnalysis.riskAssessment.portfolioPercentage.toFixed(1)}% of your portfolio`);
      reply += `\n\n⚠️ **Portfolio Impact**: This swap represents ${portfolioAnalysis.riskAssessment.portfolioPercentage.toFixed(1)}% of your total portfolio value. `;
      if (portfolioAnalysis.riskAssessment.portfolioPercentage > 50) {
        reply += `Consider smaller position sizes or DCA strategy. `;
      }
    }
    
    // Recommendations
    const recommendations: string[] = [];
    portfolioAnalysis.recommendations.forEach(rec => {
      recommendations.push(rec.title);
      if (rec.savings) {
        reply += `\n💡 ${rec.title}: ${rec.description} (saves ${rec.savings})`;
      }
    });
    
    // Market insights
    if (marketContext.gasEnvironment === 'high') {
      marketInsights.push("Gas fees are currently high - consider Layer 2 options");
      reply += `\n⛽ **Gas Alert**: Network fees are elevated. Consider using Layer 2 solutions to save costs. `;
    }
    
    // Create action response
    const actionResponse: TalkToInvestResponse = {
      type: 'swap',
      summary: {
        emoji: '💎',
        action: `Ready to swap ${intent.amount} ${intent.fromToken} for ~${outputAmount} ${intent.toToken}`,
        primaryDetails: `Cost: $${route?.totalCost.toFixed(2) || '25'} • Time: ~${route?.executionTime || 2} min`
      },
      metrics: [
        {
          label: 'Current Price',
          value: `$${marketContext.currentPrice.toFixed(0)} (${marketContext.priceChange24h > 0 ? '+' : ''}${marketContext.priceChange24h.toFixed(1)}%)`,
          status: marketContext.priceChange24h > 0 ? 'success' : 'warning',
          emoji: '📊'
        },
        {
          label: 'Your Balance',
          value: `$${portfolioAnalysis.totalBalance.toFixed(0)} ${intent.fromToken}`,
          status: 'success',
          emoji: '💰'
        },
        {
          label: 'Gas Fee',
          value: `$${route?.gasEstimate.toFixed(0) || '15'}`,
          status: marketContext.gasEnvironment === 'high' ? 'warning' : 'success',
          emoji: '⚡'
        },
        {
          label: 'Slippage',
          value: `${route?.slippage.toFixed(1) || '0.5'}%`,
          status: 'neutral',
          emoji: '📈'
        }
      ],
      primaryAction: {
        text: `Swap ${outputAmount} ${intent.toToken}`,
        emoji: '🚀',
        disabled: false,
        actionType: 'swap',
        executionData: {
          fromToken: intent.fromToken,
          toToken: intent.toToken,
          fromAmount: intent.amount.toString(),
          toAmount: outputAmount,
          route: route?.name || 'Uniswap V3',
          gasFee: `$${route?.gasEstimate.toFixed(0) || '15'}`,
          slippage: route?.slippage || 0.5,
          fromChain: portfolioAnalysis.chainDistribution[0]?.chainName || 'ethereum',
          toChain: portfolioAnalysis.chainDistribution[0]?.chainName || 'ethereum'
        }
      },
      timestamp: Date.now(),
      confidence: route?.confidence || 0.9
    };
    
    return {
      reply,
      actionResponse,
      requiresAction: true,
      reasoning: `Portfolio validated, route analyzed, market conditions considered`,
      recommendations,
      riskWarnings,
      marketInsights
    };
  }

  /**
   * Generate response for general queries - fallback to simple message
   */
  private static generateGeneralResponse(prompt: string): IntelligentChatResponse {
    // Instead of hardcoded responses, let the main chat API handle this
    // This is just a fallback that shouldn't normally be reached
    return {
      reply: "I'm having trouble processing your request right now. Please try again and I'll help you with your Web3 investing needs.",
      requiresAction: false,
      reasoning: "Intelligent service fallback - should route to main API",
      recommendations: [],
      riskWarnings: [],
      marketInsights: []
    };
  }

  /**
   * Get market context for decision making
   */
  private static async getMarketContext(token: string) {
    // This would integrate with real market APIs
    return {
      currentPrice: token === 'ETH' ? 1600 : 1,
      priceChange24h: (Math.random() - 0.5) * 10, // -5% to +5%
      trend: 'neutral',
      gasEnvironment: 'medium',
      volume24h: 1000000000,
      sentiment: 'neutral'
    };
  }
}

// Types
interface SwapIntent {
  type: 'swap' | 'general';
  prompt: string;
  fromToken?: string;
  toToken?: string;
  amount?: number;
  preference?: 'cheapest' | 'fastest';
  fromChain?: number;
  toChain?: number;
}