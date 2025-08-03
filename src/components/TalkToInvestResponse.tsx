import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { TalkToInvestResponse as TalkToInvestResponseType } from '@/types/TalkToInvest';

interface TalkToInvestResponseProps {
  response: TalkToInvestResponseType;
  onPrimaryAction: (actionData: any) => void;
  isExecuting?: boolean;
  skipAnimation?: boolean;
}

const TalkToInvestResponse: React.FC<TalkToInvestResponseProps> = ({
  response,
  onPrimaryAction,
  isExecuting = false,
  skipAnimation = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [amount, setAmount] = useState(response.primaryAction.executionData?.fromAmount || "1000");
  const [fromChain, setFromChain] = useState(response.primaryAction.executionData?.fromChain || "ethereum");
  const [toChain, setToChain] = useState(response.primaryAction.executionData?.toChain || "ethereum");
  const [service, setService] = useState("1inch-fusion");
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(!skipAnimation);
  const [showActionCard, setShowActionCard] = useState(skipAnimation);

  // Early return if response is incomplete - with more robust validation
  if (!response) {
    console.warn('TalkToInvestResponse: No response provided');
    return null;
  }
  
  if (!response.summary) {
    console.warn('TalkToInvestResponse: Missing summary in response:', response);
    return null;
  }
  
  if (!response.primaryAction) {
    console.warn('TalkToInvestResponse: Missing primaryAction in response:', response);
    return null;
  }
  

  // Use original LLM response when available, otherwise show simple message
  const getHumanizedResponse = () => {
    // Prefer the original LLM response if available
    if (response.originalResponse) {
      return response.originalResponse;
    }
    
    // Simple fallback without hardcoded responses
    return `I've prepared the ${response.type} action for you based on current market conditions. Review the details below and execute when ready.`;
  };

  // Streaming effect
  useEffect(() => {
    const fullText = getHumanizedResponse();
    
    if (skipAnimation) {
      // If skipping animation, show full text immediately
      setStreamedText(fullText);
      setIsStreaming(false);
      setShowActionCard(true);
    } else {
      // Otherwise, do the streaming animation
      let currentIndex = 0;
      
      const streamInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setStreamedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsStreaming(false);
          setShowActionCard(true);
          clearInterval(streamInterval);
        }
      }, 15); // Adjust speed here (lower = faster)

      return () => clearInterval(streamInterval);
    }
  }, [skipAnimation]);

  const handleExecute = () => {
    if (!response.primaryAction.disabled && !isExecuting) {
      const actionData = {
        amount,
        fromChain,
        toChain,
        service,
        fromToken: response.primaryAction.executionData?.fromToken || 'USDC',
        toToken: response.primaryAction.executionData?.toToken || 'ETH',
        type: response.type
      };
      onPrimaryAction(actionData);
    }
  };

  const getActionTitle = () => {
    const executionData = response.primaryAction.executionData || {};
    switch (response.type) {
      case 'swap':
      case 'buy':
        return `${response.type === 'buy' ? 'Buy' : 'Swap'} ${executionData.toToken || 'ETH'}`;
      case 'sell':
        return `Sell ${executionData.fromToken || 'ETH'}`;
      case 'transfer':
        return `Transfer ${executionData.fromToken || 'ETH'}`;
      default:
        return 'Execute Action';
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Streaming Humanized Response */}
      <div className="rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {streamedText}
          {isStreaming && <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />}
        </p>
      </div>
      
      {/* Inline Action Card (appears after streaming completes) */}
      {showActionCard && (
        <div className="bg-accent/50 rounded-lg border border-accent overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {/* Header with collapse toggle */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/60 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{getActionTitle()}</h3>
            </div>
            {isCollapsed ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            )}
          </div>

          {/* Collapsible Content */}
          {!isCollapsed && (
            <div className="p-4 pt-0 space-y-6">
              {/* Token Flow */}
              <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
                <Badge variant="secondary" className="px-3 py-1">
                  {response.primaryAction.executionData?.fromToken || 'USDC'}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="default" className="px-3 py-1">
                  {response.primaryAction.executionData?.toToken || 'ETH'}
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

              {/* Chain Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Chain</Label>
                  <Select value={fromChain} onValueChange={setFromChain}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="arbitrum">Arbitrum</SelectItem>
                      <SelectItem value="optimism">Optimism</SelectItem>
                      <SelectItem value="base">Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>To Chain</Label>
                  <Select value={toChain} onValueChange={setToChain}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="arbitrum">Arbitrum</SelectItem>
                      <SelectItem value="optimism">Optimism</SelectItem>
                      <SelectItem value="base">Base</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Service Display (Read-only) */}
              <div className="space-y-2">
                <Label>Service</Label>
                <div className="w-full px-3 py-2 bg-muted rounded-md border border-input">
                  <span className="text-sm">1inch Fusion+</span>
                </div>
              </div>

              {/* Metrics Display */}
              {response.metrics && response.metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {response.metrics.slice(0, 3).map((metric, index) => (
                    <div key={index} className="bg-background/50 rounded-lg p-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{metric.emoji}</span>
                        <span className="text-xs text-muted-foreground">{metric.label}:</span>
                      </div>
                      <div className="font-medium text-sm mt-1">{metric.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Button */}
              <Button 
                onClick={handleExecute} 
                className="w-full"
                size="lg"
                disabled={response.primaryAction.disabled || isExecuting}
              >
                {isExecuting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {getActionTitle()}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TalkToInvestResponse;