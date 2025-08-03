import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Target } from "lucide-react";

interface InvestmentData {
  type: 'investment';
  title: string;
  description: string;
  tokens: string[];
  expectedReturn: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface InvestmentModalProps {
  investmentData: InvestmentData;
  onInvest: (data: InvestmentData) => void;
}

export function InvestmentModal({ investmentData, onInvest }: InvestmentModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-3 w-3" />;
      case 'medium': return <Target className="h-3 w-3" />;
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleInvest = () => {
    onInvest(investmentData);
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border border-border rounded-lg bg-card mt-3">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium">{investmentData.title}</span>
            </div>
            {isExpanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Description */}
            <p className="text-sm text-muted-foreground">
              {investmentData.description}
            </p>

            {/* Tokens */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Tokens</span>
              <div className="flex flex-wrap gap-2">
                {investmentData.tokens.map((token, index) => (
                  <Badge key={index} variant="outline" className="px-2 py-1">
                    {token}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Investment Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm font-medium">Expected Return</span>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-green-700">
                    {investmentData.expectedReturn}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Risk Level</span>
                <div className={`p-3 rounded-lg border flex items-center gap-2 ${getRiskColor(investmentData.riskLevel)}`}>
                  {getRiskIcon(investmentData.riskLevel)}
                  <span className="text-sm font-medium capitalize">
                    {investmentData.riskLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button onClick={handleInvest} className="w-full">
              Invest Now
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}