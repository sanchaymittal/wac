import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Zap } from "lucide-react";

interface ActionData {
  type: 'swap' | 'buy' | 'sell' | 'transfer';
  fromToken: string;
  toToken: string;
  suggestedAmount?: string;
  suggestedChain?: string;
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionData: ActionData;
  onExecute: (params: any) => void;
}

export function ActionModal({ isOpen, onClose, actionData, onExecute }: ActionModalProps) {
  const [amount, setAmount] = useState(actionData.suggestedAmount || "");
  const [fromChain, setFromChain] = useState(actionData.suggestedChain || "ethereum");
  const [toChain, setToChain] = useState(actionData.suggestedChain || "ethereum");
  const [service, setService] = useState("1inch");

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
    onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {getActionTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Token Flow */}
          <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
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

          {/* Service Selection */}
          <div className="space-y-2">
            <Label>Service</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1inch">1inch</SelectItem>
                <SelectItem value="paraswap">ParaSwap</SelectItem>
                <SelectItem value="uniswap">Uniswap</SelectItem>
                <SelectItem value="sushiswap">SushiSwap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExecute} className="flex-1">
              {getActionTitle()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}