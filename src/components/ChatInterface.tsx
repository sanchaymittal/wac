import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, ArrowUp } from "lucide-react";
import { MarketNews } from "@/components/MarketNews";
import { ActionModal } from "@/components/ActionModal";
import { InvestmentModal } from "@/components/InvestmentModal";
import { BotModal } from "@/components/BotModal";
import { ChatHistory } from "@/components/ChatHistory";
import { useToast } from "@/hooks/use-toast";
import { ConnectButton } from "@/components/ConnectButton";
import { sendChatMessage } from "@/lib/chatApi";

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

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  actionData?: ActionData;
  investmentData?: InvestmentData;
  botData?: BotData;
}

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export function ChatInterface() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate meaningful thread title from first user message
  const generateThreadTitle = (firstMessage: string): string => {
    const message = firstMessage.trim();
    if (message.length <= 50) return message;
    
    // Try to get a meaningful snippet
    const sentences = message.split(/[.!?]+/);
    const firstSentence = sentences[0].trim();
    
    if (firstSentence.length <= 50) return firstSentence;
    
    // Fallback to first 47 chars + "..."
    return message.slice(0, 47) + "...";
  };

  // Load current thread from URL parameters or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const threadId = urlParams.get('thread');
    
    if (threadId) {
      // Load specific thread from history
      const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const thread = chatHistory.find((t: ChatThread) => t.id === threadId);
      if (thread) {
        setMessages(thread.messages);
        setCurrentThreadId(threadId);
        return;
      }
    }
    
    // Load current thread from localStorage if no URL param
    const currentThread = localStorage.getItem('currentChatThread');
    if (currentThread) {
      const thread: ChatThread = JSON.parse(currentThread);
      setMessages(thread.messages);
      setCurrentThreadId(thread.id);
    }
  }, []);

  // Save thread and update browser history
  const saveThread = (threadMessages: ChatMessage[], threadId?: string) => {
    if (threadMessages.length === 0) return;

    const id = threadId || currentThreadId || Date.now().toString();
    const title = generateThreadTitle(threadMessages[0].content);
    
    const thread: ChatThread = {
      id,
      title,
      messages: threadMessages,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save current thread
    localStorage.setItem('currentChatThread', JSON.stringify(thread));
    setCurrentThreadId(id);

    // Update chat history
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const existingIndex = chatHistory.findIndex((t: ChatThread) => t.id === id);
    
    if (existingIndex >= 0) {
      chatHistory[existingIndex] = thread;
    } else {
      chatHistory.unshift(thread);
    }
    
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory.slice(0, 50))); // Keep 50 threads

    // Update browser URL without page reload
    const newUrl = `${window.location.pathname}?thread=${id}`;
    window.history.replaceState({ threadId: id }, '', newUrl);
  };

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveThread(messages, currentThreadId);
    }
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Start new chat
  const startNewChat = () => {
    setMessages([]);
    setCurrentThreadId(null);
    localStorage.removeItem('currentChatThread');
    
    // Update URL to remove thread parameter
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Load a specific thread
  const loadThread = (thread: ChatThread) => {
    setMessages(thread.messages);
    setCurrentThreadId(thread.id);
    
    // Update URL with thread parameter
    const newUrl = `${window.location.pathname}?thread=${thread.id}`;
    window.history.replaceState({ threadId: thread.id }, '', newUrl);
  };

  // Dummy intent detection and response logic
  const detectIntent = (userMessage: string): ActionData | null => {
    const message = userMessage.toLowerCase();
    if (message.includes('buy') && message.includes('eth')) {
      return {
        type: 'buy',
        fromToken: 'USDC',
        toToken: 'ETH',
        suggestedAmount: '1000',
        suggestedChain: 'ethereum'
      };
    }
    if (message.includes('swap') || (message.includes('to') && (message.includes('usdc') || message.includes('eth')))) {
      return {
        type: 'swap',
        fromToken: 'USDC',
        toToken: 'ETH',
        suggestedAmount: '500',
        suggestedChain: 'ethereum'
      };
    }
    if (message.includes('sell') && message.includes('eth')) {
      return {
        type: 'sell',
        fromToken: 'ETH',
        toToken: 'USDC',
        suggestedAmount: '1',
        suggestedChain: 'ethereum'
      };
    }
    return null;
  };

  // Detect investment intent
  const detectInvestmentIntent = (userMessage: string): InvestmentData | null => {
    const message = userMessage.toLowerCase();
    if (message.includes('invest') || message.includes('yield') || message.includes('staking') || message.includes('portfolio')) {
      return {
        type: 'investment',
        title: 'DeFi Yield Strategy',
        description: 'Diversified yield farming strategy across established protocols with auto-compounding features.',
        tokens: ['ETH', 'USDC', 'AAVE', 'UNI'],
        expectedReturn: '8.5% APY',
        riskLevel: 'medium'
      };
    }
    return null;
  };

  // Detect bot intent
  const detectBotIntent = (userMessage: string): BotData | null => {
    const message = userMessage.toLowerCase();
    if (message.includes('bot') || message.includes('automate') || message.includes('trading') || message.includes('strategy')) {
      return {
        type: 'bot',
        name: 'DeFi Arbitrage Bot',
        description: 'Automated arbitrage trading bot that identifies price differences across DEXs and executes profitable trades.',
        features: ['Cross-DEX arbitrage', 'Gas optimization', 'Real-time monitoring', 'Risk management'],
        category: 'arbitrage'
      };
    }
    return null;
  };

  const generateDummyResponse = (userMessage: string): { content: string; actionData?: ActionData; investmentData?: InvestmentData; botData?: BotData } => {
    const actionData = detectIntent(userMessage);
    const investmentData = detectInvestmentIntent(userMessage);
    const botData = detectBotIntent(userMessage);
    
    if (actionData) {
      const actionResponses = {
        buy: `I'll help you buy ${actionData.toToken} with ${actionData.fromToken}. I've found the best rates across multiple DEXs and can execute this trade for you.`,
        swap: `Perfect! I can swap your ${actionData.fromToken} to ${actionData.toToken}. Let me show you the best available rates and execution options.`,
        sell: `I'll help you sell your ${actionData.fromToken} for ${actionData.toToken}. Here are the current market rates and optimal execution strategies.`,
        transfer: `I can help you transfer your ${actionData.fromToken} across chains efficiently with minimal fees.`
      };
      return {
        content: actionResponses[actionData.type],
        actionData
      };
    }
    
    if (investmentData) {
      return {
        content: "Based on your interest in investment opportunities, I've found a promising DeFi yield strategy that matches your risk profile. This diversified approach offers stable returns while maintaining reasonable risk exposure.",
        investmentData
      };
    }
    
    if (botData) {
      return {
        content: "I can help you automate your trading strategy with our advanced DeFi bot. This bot specializes in arbitrage opportunities and can help maximize your returns while you sleep.",
        botData
      };
    }
    
    const responses = [
      "I'll help you rebalance your portfolio. Based on your request for 60% stablecoins and 40% ETH, I recommend gradually moving your assets to minimize slippage and fees.",
      "Great question! For yield farming opportunities, I suggest looking at established protocols like Aave, Compound, or Uniswap V3 pools with reasonable APYs.",
      "Your portfolio analysis shows moderate risk exposure. Consider diversifying across different asset classes and maintaining some stable positions.",
      "I understand you want to optimize your DeFi strategy. Let me provide some insights based on current market conditions and your risk profile."
    ];
    return { content: responses[Math.floor(Math.random() * responses.length)] };
  };

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString() + '-user',
        content: message.trim(),
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage("");
      setIsLoading(true);

      try {
        const response = await sendChatMessage(userMessage.content);
        if (response) {
          // API response
          const assistantMessage: ChatMessage = {
            id: Date.now().toString() + '-assistant',
            content: response.reply || "(no response)",
            role: 'assistant',
            timestamp: new Date(),
            actionData: response.actionData
          };
          setMessages(prev => [...prev, assistantMessage]);
        } else {
          // Dummy fallback
          const dummy = generateDummyResponse(userMessage.content);
          const assistantMessage: ChatMessage = {
            id: Date.now().toString() + '-assistant',
            content: dummy.content,
            role: 'assistant',
            timestamp: new Date(),
            actionData: dummy.actionData,
            investmentData: dummy.investmentData,
            botData: dummy.botData
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      } catch (error) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + '-error',
            content: "Sorry, something went wrong.",
            role: 'assistant',
            timestamp: new Date()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionExecute = (params: any) => {
    toast({
      title: "Action Executed",
      description: `Successfully initiated ${params.type} of ${params.amount} ${params.fromToken} to ${params.toToken}`,
    });
  };

  const handleInvestmentExecute = (data: InvestmentData) => {
    toast({
      title: "Investment Initiated",
      description: `Successfully started ${data.title} with expected ${data.expectedReturn} return`,
    });
  };

  const handleBotActivate = (data: BotData) => {
    toast({
      title: "Bot Activated",
      description: `Successfully activated ${data.name} for automated trading`,
    });
  };

  const suggestedQuestions = [
    "Buy ETH with USDC",
    "Swap 1000 USDC to ETH on the cheapest route", 
    "Sell 2 ETH for USDC",
    "Rebalance my portfolio to be 60% stablecoins, 40% ETH",
    "What's the best yield farming opportunity for my assets?",
    "Show me market updates and trending cryptocurrencies"
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold cursor-pointer" onClick={startNewChat}>
            wac.ai
          </h2>
          <ConnectButton />
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center px-6 py-8 overflow-y-auto">
              <div className="w-full max-w-3xl">
                {/* Main Title */}
                <div className="text-center mb-12">
                  <h1 className="text-3xl md:text-4xl font-medium text-foreground mb-6">
                    What can I help you with today?
                  </h1>
                </div>

                {/* Suggested Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start text-wrap whitespace-normal border-border hover:bg-accent rounded-xl"
                      onClick={() => setMessage(question)}
                    >
                      <span className="text-sm leading-relaxed">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="h-full overflow-y-auto px-6 py-8">
              <div className="w-full max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                       msg.role === 'user' 
                         ? 'bg-accent text-accent-foreground ml-auto' 
                         : 'bg-secondary text-secondary-foreground'
                     }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                         {msg.actionData && (
                           <ActionModal
                             actionData={msg.actionData}
                             onExecute={handleActionExecute}
                           />
                         )}
                         {msg.investmentData && (
                           <InvestmentModal
                             investmentData={msg.investmentData}
                             onInvest={handleInvestmentExecute}
                           />
                         )}
                         {msg.botData && (
                           <BotModal
                             botData={msg.botData}
                             onActivate={handleBotActivate}
                           />
                         )}
                     </div>
                  </div>
                ))}
                
                 {isLoading && (
                   <div className="flex justify-start">
                     <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-secondary">
                       <div className="flex space-x-1">
                         <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce opacity-70"></div>
                         <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce opacity-70" style={{animationDelay: '0.1s'}}></div>
                         <div className="w-2 h-2 bg-secondary-foreground rounded-full animate-bounce opacity-70" style={{animationDelay: '0.2s'}}></div>
                       </div>
                     </div>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>
             </div>
           )}
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="shrink-0 border-t border-border px-6 py-4 bg-background">
          <div className="w-full max-w-3xl mx-auto">
            <div className="relative bg-background border border-border rounded-3xl shadow-lg overflow-hidden">
              <div className="flex items-end px-4 py-3">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message wac.ai..."
                  className="flex-1 min-h-[52px] max-h-[200px] border-0 bg-transparent resize-none focus:ring-0 focus:outline-none px-3 py-3 text-base leading-6"
                  rows={1}
                  style={{
                    height: 'auto',
                    minHeight: '52px',
                    overflowY: message.split('\n').length > 3 ? 'auto' : 'hidden'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                  }}
                />
                
                <div className="flex items-center space-x-2 ml-3 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-muted-foreground hover:text-foreground"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  
                  {message.trim() && (
                    <Button
                      onClick={handleSend}
                      size="icon"
                      className="h-10 w-10 bg-primary hover:bg-primary/90 rounded-full"
                      disabled={isLoading}
                    >
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center mt-3">
              <p className="text-xs text-muted-foreground">
                wac.ai can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market News Sidebar */}
      <MarketNews />


    </div>
  );
}