// Talk to Invest - Action-First Response Types

export type ActionType = 'swap' | 'bot' | 'stake' | 'portfolio' | 'bridge' | 'lend';

export type RiskLevel = 'low' | 'medium' | 'high';

export type MetricStatus = 'success' | 'warning' | 'error' | 'neutral';

export interface ActionSummary {
  emoji: string;
  action: string;
  primaryDetails: string;
}

export interface ActionMetric {
  label: string;
  value: string;
  status?: MetricStatus;
  emoji?: string;
}

export interface PrimaryAction {
  text: string;
  emoji: string;
  disabled?: boolean;
  loading?: boolean;
  actionType: ActionType;
  executionData?: ExecutionData;
}

export interface SecondaryAction {
  text: string;
  emoji?: string;
  actionType?: string;
}

export interface RiskWarning {
  level: RiskLevel;
  message: string;
}

export interface TechnicalDetails {
  title: string;
  content: string;
  expandable: boolean;
  contractAddresses?: Record<string, string>;
  additionalInfo?: Record<string, any>;
}

export interface ExecutionData {
  // Swap specific
  fromToken?: string;
  toToken?: string;
  fromAmount?: string;
  toAmount?: string;
  slippage?: number;
  gasFee?: string;
  route?: string;
  
  // Bot specific
  botType?: string;
  strategy?: string;
  frequency?: string;
  budget?: string;
  
  // Staking specific
  stakingToken?: string;
  stakingAmount?: string;
  apy?: number;
  lockPeriod?: string;
  
  // Universal
  estimatedGas?: number;
  estimatedTime?: number;
  chainId?: number;
  userBalance?: string;
  balanceStatus?: MetricStatus;
}

export interface TalkToInvestResponse {
  type: ActionType;
  summary: ActionSummary;
  metrics: ActionMetric[];
  primaryAction: PrimaryAction;
  secondaryActions?: SecondaryAction[];
  riskWarning?: RiskWarning;
  technicalDetails?: TechnicalDetails;
  
  // Original AI response for fallback
  originalResponse?: string;
  
  // Metadata
  confidence?: number;
  processingTime?: number;
  timestamp: number;
}

// Specific action response types for better type safety
export interface SwapResponse extends TalkToInvestResponse {
  type: 'swap';
  executionData: {
    fromToken: string;
    toToken: string;
    fromAmount: string;
    toAmount: string;
    slippage: number;
    gasFee: string;
    route: string;
    estimatedGas: number;
    estimatedTime: number;
    userBalance: string;
    balanceStatus: MetricStatus;
  };
}

export interface BotResponse extends TalkToInvestResponse {
  type: 'bot';
  executionData: {
    botType: string;
    strategy: string;
    frequency: string;
    budget: string;
    targetTokens: string[];
    successRate: number;
    estimatedGas: number;
  };
}

export interface StakeResponse extends TalkToInvestResponse {
  type: 'stake';
  executionData: {
    stakingToken: string;
    stakingAmount: string;
    apy: number;
    lockPeriod: string;
    dailyRewards: string;
    userBalance: string;
    balanceStatus: MetricStatus;
  };
}

// Response parsing and validation utilities
export interface ResponseParser {
  parseAIResponse(response: string, intentType?: ActionType): TalkToInvestResponse;
  validateResponse(response: TalkToInvestResponse): boolean;
  extractActionData(response: string): ExecutionData | null;
}

// Action execution types
export interface ActionExecution {
  execute(actionData: ExecutionData): Promise<ExecutionResult>;
  preview(actionData: ExecutionData): Promise<PreviewResult>;
  estimate(actionData: ExecutionData): Promise<EstimateResult>;
}

export interface ExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: number;
  executionTime?: number;
}

export interface PreviewResult {
  estimatedGas: number;
  estimatedTime: number;
  route?: string;
  priceImpact?: number;
  minimumReceived?: string;
  warnings?: string[];
}

export interface EstimateResult {
  gasFee: string;
  gasFeeUSD: string;
  executionTime: number;
  slippage: number;
  route: string;
}

// Chat integration types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  
  // Enhanced for action responses
  actionResponse?: TalkToInvestResponse;
  executionStatus?: 'pending' | 'executing' | 'completed' | 'failed';
  transactionHash?: string;
}

export interface ChatResponse {
  reply: string;
  parsed_intent?: any;
  thread_id?: string;
  thread_title?: string;
  
  // Enhanced for action responses
  actionResponse?: TalkToInvestResponse;
  requiresAction?: boolean;
  actionType?: ActionType;
}

// Market data types for real-time information
export interface MarketData {
  [token: string]: {
    price: number;
    change24h: number;
    volume24h: number;
    lastUpdated: number;
  };
}

export interface GasData {
  slow: number;
  standard: number;
  fast: number;
  instant: number;
  lastUpdated: number;
}

export interface UserBalances {
  [token: string]: {
    balance: string;
    balanceUSD: string;
    chainId: number;
  };
}

// Template system for generating responses
export interface ResponseTemplate {
  id: string;
  actionType: ActionType;
  template: string;
  requiredFields: string[];
  optionalFields: string[];
}

export interface TemplateData {
  [key: string]: string | number | boolean;
}

export const DEFAULT_TEMPLATES: Record<ActionType, ResponseTemplate> = {
  swap: {
    id: 'swap-default',
    actionType: 'swap',
    template: `💎 **Ready to buy {{amount}} {{toToken}} for ~${{cost}} {{fromToken}}**
Gas: ${{gas}} • Time: {{time}} min • Route: {{route}}

📊 Current {{toToken}}: ${{price}} ({{change}}% today)
💰 Your {{fromToken}}: ${{balance}} {{balanceStatus}}
⚡ Gas Fee: ${{gas}} ({{gasLevel}})
📈 Slippage: {{slippage}}% (recommended)

🚀 Buy {{amount}} {{toToken}} Now`,
    requiredFields: ['amount', 'toToken', 'fromToken', 'cost', 'gas', 'time', 'route', 'price', 'change', 'balance', 'slippage'],
    optionalFields: ['balanceStatus', 'gasLevel']
  },
  
  bot: {
    id: 'bot-default',
    actionType: 'bot',
    template: `🤖 **{{botType}} Bot Setup**
Strategy: {{strategy}} • Budget: ${{budget}}/day • Risk: {{riskLevel}} {{riskEmoji}}

🎯 Target tokens: {{targetTokens}}
📈 Success rate: ~{{successRate}}% profitable trades
⚡ Gas per trade: ${{gasPerTrade}}
⏱️ Frequency: {{frequency}}

🎯 Create Bot`,
    requiredFields: ['botType', 'strategy', 'budget', 'riskLevel', 'targetTokens', 'successRate', 'gasPerTrade', 'frequency'],
    optionalFields: ['riskEmoji']
  },
  
  stake: {
    id: 'stake-default',
    actionType: 'stake',
    template: `🌾 **{{token}} Staking Setup**
APY: {{apy}}% • Min stake: ${{minStake}} • Lock: {{lockPeriod}}

💰 Your {{token}}: {{amount}} ({{value}})
📈 Daily rewards: ~${{dailyReward}}
⚠️ Risk: {{riskLevel}}
🔒 Lock period: {{lockPeriod}}

🔒 Start Staking`,
    requiredFields: ['token', 'apy', 'minStake', 'lockPeriod', 'amount', 'value', 'dailyReward', 'riskLevel'],
    optionalFields: []
  },
  
  portfolio: {
    id: 'portfolio-default', 
    actionType: 'portfolio',
    template: `📊 **Portfolio Rebalancing**
Action: {{action}} • Total value: ${{totalValue}} • Changes: {{changes}}

⚖️ Recommended moves:
• {{move1}}: {{amount1}}
• {{move2}}: {{amount2}}

⚖️ Execute Rebalance`,
    requiredFields: ['action', 'totalValue', 'changes', 'move1', 'amount1', 'move2', 'amount2'],
    optionalFields: []
  },
  
  bridge: {
    id: 'bridge-default',
    actionType: 'bridge', 
    template: `🌉 **Cross-Chain Bridge**
Move {{amount}} {{token}} from {{fromChain}} to {{toChain}}
Bridge fee: ${{bridgeFee}} • Time: {{time}} min

💰 Your {{token}} on {{fromChain}}: {{balance}} {{balanceStatus}}
🌉 Bridge: {{bridgeProtocol}}
⚡ Total fees: ${{totalFees}}
⏱️ Estimated time: {{time}} minutes

🌉 Bridge {{amount}} {{token}}`,
    requiredFields: ['amount', 'token', 'fromChain', 'toChain', 'bridgeFee', 'time', 'balance', 'bridgeProtocol', 'totalFees'],
    optionalFields: ['balanceStatus']
  },
  
  lend: {
    id: 'lend-default',
    actionType: 'lend',
    template: `🏦 **{{protocol}} Lending**
Supply {{amount}} {{token}} • Earn {{apy}}% APY
Collateral ratio: {{collateralRatio}}% • Liquidation: ${{liquidationPrice}}

💰 Your {{token}}: {{balance}} ({{value}})
📈 Current APY: {{apy}}% 
🛡️ Health factor: {{healthFactor}}
⚠️ Liquidation price: ${{liquidationPrice}}

🏦 Supply {{amount}} {{token}}`,
    requiredFields: ['protocol', 'amount', 'token', 'apy', 'collateralRatio', 'liquidationPrice', 'balance', 'value', 'healthFactor'],
    optionalFields: []
  }
};