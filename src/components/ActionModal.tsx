import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowRight, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface ActionData {
  type: 'swap' | 'buy' | 'sell' | 'transfer';
  fromToken: string;
  toToken: string;
  suggestedAmount?: string;
  suggestedChain?: string;
}

interface InvestmentData {
  type: 'investment';
  title: string;
  description: string;
  tokens: string[];
  expectedReturn: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface BotData {
  type: 'bot';
  name: string;
  description: string;
  features: string[];
  category: string;
}

interface ActionModalProps {
  actionData: ActionData;
  onExecute: (params: any) => void;
}

export function ActionModal({ actionData, onExecute }: ActionModalProps) {
  const [amount, setAmount] = useState(actionData.suggestedAmount || "");
  const [isExpanded, setIsExpanded] = useState(false);

  // Hardcoded values for cross-chain swap
  const fromChain = "ethereum";
  const toChain = "arbitrum";
  const service = "1inch fusion +";

  const handleExecute = () => {
    onExecute({
      amount,
      fromChain,
      toChain,
      service,
      fromToken: actionData.fromToken,
      toToken: actionData.toToken,
      type: actionData.type
    });
  };

  const getActionTitle = () => {
    switch (actionData.type) {
      case 'swap':
      case 'buy':
        return `${actionData.type === 'buy' ? 'Buy' : 'Swap'} ${actionData.toToken}`;
      case 'sell':
        return `Sell ${actionData.fromToken}`;
      case 'transfer':
        return `Transfer ${actionData.fromToken}`;
      default:
        return 'Execute Action';
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border border-border rounded-lg bg-card mt-3">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium">{getActionTitle()}</span>
            </div>
            {isExpanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Token Flow */}
            <div className="flex items-center justify-center gap-3 p-3 bg-muted rounded-lg">
              <Badge variant="secondary" className="px-3 py-1">
                {actionData.fromToken}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge variant="default" className="px-3 py-1">
                {actionData.toToken}
              </Badge>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Chain Selection - Hardcoded for Cross-chain */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From Chain</Label>
                <div className="p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium">Ethereum</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>To Chain</Label>
                <div className="p-3 bg-muted rounded-lg border">
                  <span className="text-sm font-medium">Arbitrum</span>
                </div>
              </div>
            </div>

            {/* Service Selection - Hardcoded */}
            <div className="space-y-2">
              <Label>Service</Label>
              <div className="p-3 bg-muted rounded-lg border">
                <span className="text-sm font-medium">1inch fusion +</span>
              </div>
            </div>

            {/* Action Button */}
            <Button onClick={handleExecute} className="w-full">
              {getActionTitle()}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}