import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  trend: "up" | "down" | "neutral";
  percentage: string;
  timeAgo: string;
}

export function MarketNews() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newsItems] = useState<NewsItem[]>([
    {
      id: "1",
      title: "Bitcoin Rally Continues",
      description: "BTC surges past $42K as institutional investors show renewed interest",
      trend: "up",
      percentage: "+8.5%",
      timeAgo: "2 hours ago"
    },
    {
      id: "2", 
      title: "Investor Sentiment Bullish",
      description: "Fear & Greed Index hits 'Greed' territory as market confidence returns",
      trend: "up",
      percentage: "+15%",
      timeAgo: "4 hours ago"
    },
    {
      id: "3",
      title: "ETH Staking Rewards",
      description: "Ethereum staking yields attractive returns as network activity increases",
      trend: "up",
      percentage: "+4.2%",
      timeAgo: "6 hours ago"
    },
    {
      id: "4",
      title: "DeFi TVL Recovery",
      description: "Total Value Locked in DeFi protocols shows signs of recovery",
      trend: "up",
      percentage: "+12.3%",
      timeAgo: "8 hours ago"
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-foreground" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-muted-foreground" />;
      default:
        return <Activity className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className={`bg-card border-l border-border h-full overflow-hidden transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Header with collapse button */}
      <div className="p-4 border-b border-border">
        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-foreground" />
            {!isCollapsed && <h3 className="font-semibold text-foreground">What's New</h3>}
          </div>
          {isCollapsed ? 
            <ChevronLeft className="h-4 w-4 text-muted-foreground" /> : 
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
        </div>
        {!isCollapsed && (
          <p className="text-xs text-muted-foreground mt-3">Latest market updates and trends</p>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="p-4 space-y-3 overflow-y-auto">
            {newsItems.map((item, index) => (
              <Card key={item.id} className="p-3 bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-3">
                  {/* Dotted indicator */}
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-foreground"></div>
                    {index < newsItems.length - 1 && (
                      <div className="w-px h-12 mt-1 border-l border-dotted border-border"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(item.trend)}
                        <span className="text-xs font-medium text-foreground">{item.percentage}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                    </div>
                    
                    <h4 className="text-sm font-medium text-foreground mb-1 leading-tight">
                      {item.title}
                    </h4>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Market data updates every 5 minutes
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}