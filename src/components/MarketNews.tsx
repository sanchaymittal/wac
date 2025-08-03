import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Activity, ChevronLeft, ChevronRight, RefreshCw, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { NewsService } from "@/lib/newsService";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  trend: "up" | "down" | "neutral";
  percentage: string;
  timeAgo: string;
  source?: string;
  category?: string;
  url?: string;
}

export function MarketNews() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch news using LLM service
  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const news = await NewsService.fetchLatestNews(10);
      const formattedNews: NewsItem[] = news.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        trend: item.trend,
        percentage: item.percentage || '',
        timeAgo: formatTimeAgo(item.timestamp),
        source: item.source,
        category: item.category,
        url: item.url
      }));
      setNewsItems(formattedNews);
    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to fetch news');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch news on mount and set up refresh interval
  useEffect(() => {
    fetchNews();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fallback data when API is unavailable
  const fallbackNews: NewsItem[] = [
    {
      id: "1",
      title: "Bitcoin Rally Continues",
      description: "BTC surges past $42K as institutional investors show renewed interest",
      trend: "up",
      percentage: "+8.5%",
      timeAgo: "32 minutes ago",
      source: "CoinDesk",
      category: "Bitcoin",
      url: "https://www.coindesk.com/markets/bitcoin/"
    },
    {
      id: "2", 
      title: "Investor Sentiment Bullish",
      description: "Fear & Greed Index hits 'Greed' territory as market confidence returns",
      trend: "up",
      percentage: "+15%",
      timeAgo: "1 hour ago",
      source: "CoinMarketCap",
      category: "Market",
      url: "https://coinmarketcap.com/charts/"
    },
    {
      id: "3",
      title: "ETH Staking Rewards",
      description: "Ethereum staking yields attractive returns as network activity increases",
      trend: "up",
      percentage: "+4.2%",
      timeAgo: "2 hours ago",
      source: "Etherscan",
      category: "Ethereum",
      url: "https://etherscan.io/gasTracker"
    },
    {
      id: "4",
      title: "DeFi TVL Recovery",
      description: "Total Value Locked in DeFi protocols shows signs of recovery",
      trend: "up",
      percentage: "+12.3%",
      timeAgo: "3 hours ago",
      source: "DeFi Pulse",
      category: "DeFi",
      url: "https://defipulse.com/"
    }
  ];

  // Use fetched news if available, fallback to demo data
  const displayNews = error || newsItems.length === 0 ? fallbackNews : newsItems;
  
  // Handle news item click
  const handleNewsClick = (item: NewsItem) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };
  
  // Helper function to format timestamp to "time ago"
  function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

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
          <div className="flex items-center space-x-2">
            {!isCollapsed && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  fetchNews();
                }}
                className="p-1 hover:bg-accent rounded transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            )}
            {isCollapsed ? 
              <ChevronLeft className="h-4 w-4 text-muted-foreground" /> : 
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            }
          </div>
        </div>
        {!isCollapsed && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Latest market updates and trends</p>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : newsItems.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {error ? 'Demo' : newsItems.length > 0 ? 'Live' : 'Loading'}
              </span>
            </div>
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          <div className="p-4 space-y-3 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="p-3 bg-card border-border">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-muted animate-pulse mt-1"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                      <div className="h-2 bg-muted rounded animate-pulse w-full"></div>
                      <div className="h-2 bg-muted rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              displayNews.map((item, index) => (
                <Card 
                  key={item.id} 
                  className={`group p-3 bg-card border-border transition-all duration-200 ${
                    item.url 
                      ? 'hover:bg-accent/50 hover:border-accent cursor-pointer hover:shadow-sm' 
                      : 'hover:bg-accent/30'
                  }`}
                  onClick={() => handleNewsClick(item)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Dotted indicator */}
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-foreground"></div>
                      {index < displayNews.length - 1 && (
                        <div className="w-px h-12 mt-1 border-l border-dotted border-border"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(item.trend)}
                          <span className="text-xs font-medium text-foreground">{item.percentage}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.source && (
                            <span className="text-xs text-muted-foreground">{item.source}</span>
                          )}
                          <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                          {item.url && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium text-foreground mb-1 leading-tight">
                        {item.title}
                      </h4>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                      
                      {item.category && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs bg-accent text-accent-foreground rounded-full">
                            {item.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="p-4 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {error ? 'Demo data - API unavailable' : newsItems.length > 0 ? 'Live crypto news' : 'Loading...'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Updates every 5 minutes
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}