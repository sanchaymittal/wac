import { AppSidebar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, BarChart3, Zap } from "lucide-react";

const Bots = () => {
  const activeBots = [
    {
      id: 1,
      name: "Arbitrage Bot",
      status: "active",
      description: "Automatically identifies and executes arbitrage opportunities across multiple DEXs",
      icon: TrendingUp,
      profit: "+$1,245.67",
      trades: 23
    },
    {
      id: 2,
      name: "Price Impact Tracker",
      status: "active",
      description: "Monitors price impact on large trades and suggests optimal execution strategies",
      icon: BarChart3,
      profit: "+$892.34",
      trades: 15
    },
    {
      id: 3,
      name: "TWAP Bot",
      status: "active",
      description: "Time-Weighted Average Price execution for large orders to minimize market impact",
      icon: Activity,
      profit: "+$567.89",
      trades: 8
    },
    {
      id: 4,
      name: "MEV Protection Bot",
      status: "paused",
      description: "Protects against MEV attacks and front-running on high-value transactions",
      icon: Zap,
      profit: "+$234.12",
      trades: 3
    }
  ];

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBots.map((bot) => {
              const IconComponent = bot.icon;
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
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Today's P&L</span>
                        <span className="font-medium text-green-600">{bot.profit}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">Trades</span>
                        <span className="font-medium">{bot.trades}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bots;