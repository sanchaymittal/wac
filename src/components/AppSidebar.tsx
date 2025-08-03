import { Home, Bot, Zap, Gamepad2, Plus, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate, useLocation } from "react-router-dom";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: "Home", path: "/", tooltip: "Chat Assistant" },
    { icon: MessageSquare, label: "Threads", path: "/threads", tooltip: "Chat History" },
    { icon: Bot, label: "Bots", path: "/bots", tooltip: "AI Bots" },
    { icon: Zap, label: "Actions", path: "/actions", tooltip: "Quick Actions" },
    { icon: Gamepad2, label: "Play to Earn", path: "/play-to-earn", tooltip: "Gaming & Rewards" },
    { icon: User, label: "User", path: "/user", tooltip: "Portfolio & Profile" },
  ];

  const handleNewChat = () => {
    localStorage.removeItem('currentChatThread');
    navigate("/");
    window.location.reload(); // Force reload to clear chat state
  };

  return (
    <TooltipProvider>
      <div className="fixed left-0 top-0 h-full w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4">
        {/* Logo */}
        <div className="mb-6">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">W</span>
          </div>
          <div className="text-xs text-sidebar-foreground text-center mt-1 font-medium">wac.ai</div>
        </div>

        {/* New Thread Button */}
        <div className="mb-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
                onClick={handleNewChat}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New thread</p>
            </TooltipContent>
          </Tooltip>
          <div className="text-xs text-sidebar-foreground text-center mt-1">New</div>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-4 flex-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.path} className="flex flex-col items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`w-12 h-12 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground ${
                        isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                      }`}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-6 w-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-xs text-sidebar-foreground text-center mt-1">{item.label}</div>
              </div>
            );
          })}
        </div>

      </div>
    </TooltipProvider>
  );
}