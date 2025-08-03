import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Wallet, PieChart, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { ConnectButton } from "@/components/ConnectButton";
import { AppSidebar } from "@/components/AppSidebar";

const mockPortfolioData = [
  { symbol: "ETH", name: "Ethereum", balance: "2.45", value: "$6,127.50", change: "+5.24%", isPositive: true },
  { symbol: "USDC", name: "USD Coin", balance: "1,250.00", value: "$1,250.00", change: "0.00%", isPositive: true },
  { symbol: "UNI", name: "Uniswap", balance: "45.32", value: "$387.74", change: "-2.15%", isPositive: false },
  { symbol: "LINK", name: "Chainlink", balance: "28.91", value: "$289.10", change: "+1.87%", isPositive: true },
];

const mockTransactions = [
  { type: "Swap", from: "USDC", to: "ETH", amount: "500", timestamp: "2 hours ago" },
  { type: "Buy", from: "USD", to: "UNI", amount: "200", timestamp: "1 day ago" },
  { type: "Transfer", from: "ETH", to: "Wallet", amount: "0.5", timestamp: "3 days ago" },
];

export default function User() {
  const [totalValue] = useState("$8,054.34");
  const [totalChange] = useState("+3.42%");
  const [isPositive] = useState(true);

  return (
    <div className="h-screen bg-background flex flex-col pl-20">
      {/* Import and include sidebar */}
      <div className="absolute left-0 top-0 h-full">
        <AppSidebar />
      </div>
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserIcon className="h-6 w-6" />
          <h1 className="text-xl font-semibold">User Portfolio</h1>
        </div>
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalValue}</div>
                <p className={`text-xs flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {totalChange} from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockPortfolioData.length}</div>
                <p className="text-xs text-muted-foreground">Across multiple chains</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$1,247</div>
                <p className="text-xs text-muted-foreground">+12% from yesterday</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed View */}
          <Tabs defaultValue="portfolio" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="portfolio" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPortfolioData.map((asset) => (
                      <div key={asset.symbol} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <span className="font-medium text-sm">{asset.symbol}</span>
                          </div>
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <div className="text-sm text-muted-foreground">{asset.balance} {asset.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{asset.value}</div>
                          <Badge variant={asset.isPositive ? "default" : "destructive"} className="text-xs">
                            {asset.change}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTransactions.map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{tx.type}: {tx.from} → {tx.to}</div>
                            <div className="text-sm text-muted-foreground">Amount: {tx.amount}</div>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tx.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}