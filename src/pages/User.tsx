import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  User as UserIcon, 
  Wallet, 
  PieChart, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  ExternalLink,
  BarChart3,
  Target,
  Zap,
  Globe,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { ConnectButton } from "@/components/ConnectButton";
import { AppSidebar } from "@/components/AppSidebar";
import { usePortfolio } from "@/hooks/useApi";
import { useAppKitAccount } from "@reown/appkit/react";

// Chain configurations for enhanced display
const CHAIN_CONFIGS = {
  1: { name: 'Ethereum', color: 'bg-blue-500', shortName: 'ETH' },
  137: { name: 'Polygon', color: 'bg-purple-500', shortName: 'MATIC' },
  42161: { name: 'Arbitrum', color: 'bg-orange-500', shortName: 'ARB' },
  8453: { name: 'Base', color: 'bg-indigo-500', shortName: 'BASE' },
  10: { name: 'Optimism', color: 'bg-red-500', shortName: 'OP' }
} as const;

// Utility functions
const formatAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const parseValue = (valueStr: string): number => {
  const cleaned = valueStr.replace(/[$,]/g, '');
  return parseFloat(cleaned) || 0;
};


export default function User() {
  const { address, isConnected } = useAppKitAccount();
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  // Fetch real portfolio data from API
  const { data: portfolioData, isLoading, error, refetch } = usePortfolio();
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Handle address copy
  const handleCopyAddress = async () => {
    if (address) {
      await copyToClipboard(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };
  
  // Use API data or show empty portfolio
  const portfolio = portfolioData || {
    summary: {
      totalValue: "$0.00",
      change24h: "$0.00",
      changePercent: "0.00%",
      activeAssets: 0,
      volume24h: "$0.00",
      lastUpdated: Date.now()
    },
    assets: []
  };

  const isPositive = portfolio.summary.changePercent.startsWith('+');
  
  // Enhanced portfolio analytics
  const totalValue = parseValue(portfolio.summary.totalValue);
  const filteredAssets = selectedChain 
    ? portfolio.assets.filter(asset => asset.chainId === selectedChain)
    : portfolio.assets;
    
  // Calculate chain distribution
  const chainDistribution = portfolio.assets.reduce((acc, asset) => {
    const chainId = asset.chainId;
    const value = parseValue(asset.value);
    acc[chainId] = (acc[chainId] || 0) + value;
    return acc;
  }, {} as Record<number, number>);

  // Get unique chains
  const activeChains = Object.keys(chainDistribution).map(Number).sort();
  
  // Format values for display
  const formatValue = (value: string) => hideBalances ? "****" : value;

  return (
    <div className="h-screen bg-background flex flex-col pl-20">
      {/* Import and include sidebar */}
      <div className="absolute left-0 top-0 h-full">
        <AppSidebar />
      </div>
      {/* Enhanced Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Portfolio</h1>
                  {isConnected && address && (
                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {formatAddress(address)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyAddress}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {copiedAddress && (
                        <span className="text-xs text-green-500">Copied!</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status Indicator */}
              {isConnected && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500 animate-pulse' : portfolioData ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                  <span className="text-xs font-medium">
                    {error ? 'Demo Mode' : portfolioData ? 'Live Data' : 'Loading...'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Hide Balances Toggle */}
              {isConnected && (
                <Button
                  onClick={() => setHideBalances(!hideBalances)}
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {hideBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="hidden sm:inline">
                    {hideBalances ? 'Show' : 'Hide'}
                  </span>
                </Button>
              )}
              
              {/* Refresh Button */}
              {isConnected && (
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isLoading || refreshing}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${(isLoading || refreshing) ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              )}
              
              <ConnectButton />
            </div>
          </div>

          {/* Chain Filter Pills */}
          {isConnected && activeChains.length > 1 && (
            <div className="flex items-center space-x-2 mt-4">
              <span className="text-xs text-muted-foreground">Chains:</span>
              <Button
                onClick={() => setSelectedChain(null)}
                variant={selectedChain === null ? "default" : "ghost"}
                size="sm"
                className="h-6 text-xs"
              >
                All
              </Button>
              {activeChains.map(chainId => {
                const config = CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS];
                const percentage = ((chainDistribution[chainId] / totalValue) * 100).toFixed(1);
                return (
                  <Button
                    key={chainId}
                    onClick={() => setSelectedChain(chainId)}
                    variant={selectedChain === chainId ? "default" : "ghost"}
                    size="sm"
                    className="h-6 text-xs flex items-center space-x-1"
                  >
                    <div className={`w-2 h-2 rounded-full ${config?.color || 'bg-gray-500'}`}></div>
                    <span>{config?.shortName || `Chain ${chainId}`}</span>
                    <span className="text-muted-foreground">({percentage}%)</span>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Enhanced Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Value Card */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {formatValue(portfolio.summary.totalValue)}
                </div>
                <div className={`flex items-center text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  <span>{portfolio.summary.changePercent}</span>
                  <span className="text-muted-foreground ml-1">24h</span>
                </div>
              </CardContent>
            </Card>

            {/* Active Assets Card */}
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <Target className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{portfolio.summary.activeAssets}</div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 mr-1" />
                  <span>{activeChains.length} chain{activeChains.length !== 1 ? 's' : ''}</span>
                </div>
              </CardContent>
            </Card>

            {/* Largest Holding Card */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Largest Holding</CardTitle>
                <div className="p-1.5 bg-purple-500/20 rounded-lg">
                  <Zap className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                {portfolio.assets.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold mb-1">
                      {portfolio.assets.reduce((largest, asset) => 
                        parseValue(asset.value) > parseValue(largest.value) ? asset : largest
                      ).symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatValue(portfolio.assets.reduce((largest, asset) => 
                        parseValue(asset.value) > parseValue(largest.value) ? asset : largest
                      ).value)}
                    </div>
                  </>
                ) : (
                  <div className="text-xl text-muted-foreground">-</div>
                )}
              </CardContent>
            </Card>

            {/* Performance Card */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">24h Change</CardTitle>
                <div className="p-1.5 bg-orange-500/20 rounded-lg">
                  <Activity className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-1">
                  {formatValue(portfolio.summary.change24h)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Portfolio change
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chain Distribution */}
          {isConnected && activeChains.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Chain Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeChains.map(chainId => {
                  const config = CHAIN_CONFIGS[chainId as keyof typeof CHAIN_CONFIGS];
                  const value = chainDistribution[chainId];
                  const percentage = ((value / totalValue) * 100);
                  
                  return (
                    <div key={chainId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${config?.color || 'bg-gray-500'}`}></div>
                          <span className="font-medium">{config?.name || `Chain ${chainId}`}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                          <span className="font-medium">${value.toFixed(2)}</span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Asset Holdings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5" />
                  <span>Assets</span>
                  {selectedChain && (
                    <Badge variant="outline" className="ml-2">
                      {CHAIN_CONFIGS[selectedChain as keyof typeof CHAIN_CONFIGS]?.name || `Chain ${selectedChain}`}
                    </Badge>
                  )}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Wallet className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Connect your wallet to view your portfolio and track assets across multiple chains
                  </p>
                  <ConnectButton />
                </div>
              ) : isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border border-border rounded-xl animate-pulse">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-24"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-5 bg-muted rounded w-20 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <PieChart className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {selectedChain ? 'No Assets on This Chain' : 'No Assets Found'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    {error 
                      ? 'Unable to load portfolio data. Please try again.' 
                      : selectedChain 
                        ? 'This wallet has no tracked assets on the selected chain'
                        : 'This wallet has no tracked assets on supported chains'
                    }
                  </p>
                  {error && (
                    <Button onClick={handleRefresh} variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  )}
                  {selectedChain && (
                    <Button onClick={() => setSelectedChain(null)} variant="ghost">
                      View All Chains
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssets.map((asset, index) => {
                    const chainConfig = CHAIN_CONFIGS[asset.chainId as keyof typeof CHAIN_CONFIGS];
                    const assetValue = parseValue(asset.value);
                    const portfolioPercentage = totalValue > 0 ? ((assetValue / totalValue) * 100) : 0;
                    
                    return (
                      <div 
                        key={`${asset.symbol}-${asset.chainId}-${index}`} 
                        className="group flex items-center space-x-4 p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        {/* Asset Icon & Info */}
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                              <span className="font-bold text-primary">
                                {asset.symbol.slice(0, 3)}
                              </span>
                            </div>
                            {/* Chain indicator */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${chainConfig?.color || 'bg-gray-500'}`}></div>
                          </div>
                          
                          <div>
                            <div className="font-semibold">{asset.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-2">
                              <span>{formatValue(asset.balance)} {asset.symbol}</span>
                              <span>•</span>
                              <span>{chainConfig?.name || `Chain ${asset.chainId}`}</span>
                            </div>
                          </div>
                        </div>

                        {/* Portfolio Allocation */}
                        <div className="flex-1 px-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Portfolio allocation</span>
                            <span>{portfolioPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={portfolioPercentage} className="h-1.5" />
                        </div>

                        {/* Value & Performance */}
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {formatValue(asset.value)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={asset.changePercent.startsWith('+') ? "default" : "destructive"} 
                              className="text-xs"
                            >
                              {asset.changePercent}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Footer */}
                  <Separator className="my-6" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>
                        {error ? '⚠️ Demo Mode' : portfolioData ? '🟢 Live Data' : '🟡 Loading...'}
                      </span>
                      <span>•</span>
                      <span>Powered by 1inch Portfolio API</span>
                    </div>
                    {portfolio.summary.lastUpdated && (
                      <span>
                        Updated {new Date(portfolio.summary.lastUpdated).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}