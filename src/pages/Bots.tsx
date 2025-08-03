import { AppSidebar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, BarChart3, Zap, Play, Pause } from "lucide-react";
import { useBots, useBotToggle } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const Bots = () => {
  const { data, isLoading, error } = useBots();
  const botToggle = useBotToggle();
  const { toast } = useToast();

  // Hardcoded fallback data
  const fallbackBots = [
    {
      id: "arbitrage-bot-1",
      name: "Multi-DEX Arbitrage Bot",
      status: "active" as const,
      description: "Exploits price differences across DEXs for consistent profits",
      icon: "⚡",
      profit: "+$2,847.23",
      trades: 156,
      category: "arbitrage" as const,
      created_at: Date.now() - 86400000 * 7,
      updated_at: Date.now() - 3600000
    },
    {
      id: "price-impact-tracker-1",
      name: "Large Order Monitor",
      status: "active" as const,
      description: "Tracks large transactions and market impact for informed trading",
      icon: "📊",
      profit: "+$1,245.67",
      trades: 89,
      category: "price-impact" as const,
      created_at: Date.now() - 86400000 * 5,
      updated_at: Date.now() - 7200000
    },
    {
      id: "twap-bot-1",
      name: "TWAP Execution Engine",
      status: "paused" as const,
      description: "Time-weighted average price strategy for large orders",
      icon: "⏰",
      profit: "+$892.45",
      trades: 23,
      category: "twap" as const,
      created_at: Date.now() - 86400000 * 3,
      updated_at: Date.now() - 10800000
    },
    {
      id: "mev-protection-1",
      name: "MEV Shield",
      status: "active" as const,
      description: "Protects against MEV attacks and front-running",
      icon: "🛡️",
      profit: "+$1,567.89",
      trades: 234,
      category: "mev-protection" as const,
      created_at: Date.now() - 86400000 * 10,
      updated_at: Date.now() - 1800000
    }
  ];

  // Use API data if available, otherwise use fallback
  const bots = data?.bots || fallbackBots;
  const isDemo = !data && !isLoading;

  const handleToggleBot = async (botId: string, currentStatus: 'active' | 'paused') => {
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Bot controls disabled in demo mode. Connect to API to enable.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await botToggle.mutateAsync({ botId });
      toast({
        title: "Bot Status Updated",
        description: `Bot ${result.status === 'active' ? 'activated' : 'paused'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle bot status",
        variant: "destructive",
      });
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'arbitrage': return TrendingUp;
      case 'price-impact': return BarChart3;
      case 'twap': return Activity;
      case 'mev-protection': return Zap;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="ml-20 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">🤖 Bots</h1>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Failed to load bots. Please try again later.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {isDemo && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    📡 API not available - showing hardcoded demo data
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bots.map((bot) => {
                  const IconComponent = getIcon(bot.category);
                  return (
                <Card key={bot.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{bot.description}</p>
                    <div className="flex justify-between items-center text-sm mb-4">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Today's P&L</span>
                        <span className={`font-medium ${bot.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {bot.profit}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Trades</span>
                        <span className="font-medium">{bot.trades}</span>
                      </div>
                    </div>
                    <Button
                      variant={bot.status === "active" ? "destructive" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={() => handleToggleBot(bot.id, bot.status)}
                      disabled={botToggle.isPending || isDemo}
                    >
                      {bot.status === "active" ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Bot
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Bot
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bots;