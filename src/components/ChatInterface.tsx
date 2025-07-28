import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, ArrowUp, Wallet } from "lucide-react";
import { MarketNews } from "@/components/MarketNews";
import { ActionModal } from "@/components/ActionModal";
import { useToast } from "@/hooks/use-toast";

interface ActionData {
  type: 'swap' | 'buy' | 'sell' | 'transfer';
  fromToken: string;
  toToken: string;
  suggestedAmount?: string;
  suggestedChain?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  actionData?: ActionData;
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

  // Start new chat
  const startNewChat = () => {
    setMessages([]);
    setCurrentThreadId(null);
    localStorage.removeItem('currentChatThread');
    
    // Update URL to remove thread parameter
    window.history.replaceState({}, '', window.location.pathname);
  };

  const detectIntent = (userMessage: string): ActionData | null => {
    const message = userMessage.toLowerCase();
    
    // Buy intent
    if (message.includes('buy') && message.includes('eth')) {
      return {
        type: 'buy',
        fromToken: 'USDC',
        toToken: 'ETH',
        suggestedAmount: '1000',
        suggestedChain: 'ethereum'
      };
    }
    
    // Swap intent
    if (message.includes('swap') || (message.includes('to') && (message.includes('usdc') || message.includes('eth')))) {
      return {
        type: 'swap',
        fromToken: 'USDC',
        toToken: 'ETH',
        suggestedAmount: '500',
        suggestedChain: 'ethereum'
      };
    }
    
    // Sell intent
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

  const generateDummyResponse = (userMessage: string): { content: string; actionData?: ActionData } => {
    const actionData = detectIntent(userMessage);
    
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

      // Simulate API call delay
      setTimeout(() => {
        const response = generateDummyResponse(userMessage.content);
        const assistantMessage: ChatMessage = {
          id: Date.now().toString() + '-assistant',
          content: response.content,
          role: 'assistant',
          timestamp: new Date(),
          actionData: response.actionData
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
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
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold">wac.ai</h2>
          </div>
          <Button variant="outline" size="sm">
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
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
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="w-full max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                       msg.role === 'user' 
                         ? 'bg-primary text-primary-foreground ml-auto' 
                         : 'bg-muted text-muted-foreground'
                     }`}>
                       <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        {msg.actionData && (
                          <ActionModal
                            actionData={msg.actionData}
                            onExecute={handleActionExecute}
                          />
                        )}
                     </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-muted">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Input - Always at bottom */}
          <div className="border-t border-border px-6 py-4">
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
      </div>

      {/* Market News Sidebar */}
      <MarketNews />

    </div>
  );
}