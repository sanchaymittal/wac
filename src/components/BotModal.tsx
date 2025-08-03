import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Bot, ChevronDown, ChevronUp, Zap } from "lucide-react";

interface BotData {
  type: 'bot';
  name: string;
  description: string;
  features: string[];
  category: string;
}

interface BotModalProps {
  botData: BotData;
  onActivate: (data: BotData) => void;
}

export function BotModal({ botData, onActivate }: BotModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleActivate = () => {
    onActivate(botData);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'trading': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'defi': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'arbitrage': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'portfolio': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border border-border rounded-lg bg-card mt-3">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{botData.name}</span>
            </div>
            {isExpanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Category Badge */}
            <div className="flex justify-start">
              <Badge className={`px-3 py-1 ${getCategoryColor(botData.category)}`}>
                {botData.category}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {botData.description}
            </p>

            {/* Features */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Key Features</span>
              <div className="space-y-2">
                {botData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Zap className="h-3 w-3 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button onClick={handleActivate} className="w-full">
              Activate Bot
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}