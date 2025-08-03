import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, ArrowUp, Zap } from "lucide-react";
import { MarketNews } from "@/components/MarketNews";
import { InvestmentModal } from "@/components/InvestmentModal";
import { BotModal } from "@/components/BotModal";
import { ChatHistory } from "@/components/ChatHistory";
import TalkToInvestResponse from "@/components/TalkToInvestResponse";
import { MarkdownContent } from "@/components/MarkdownContent";
import { useToast } from "@/hooks/use-toast";
import { ConnectButton } from "@/components/ConnectButton";
import { ReimagineTool } from "@/components/ReimagineTool";
import { sendChatMessage } from "@/lib/chatApi";
import { useAppKitAccount } from "@reown/appkit/react";
import { TalkToInvestResponse as TalkToInvestResponseType } from "@/types/TalkToInvest";

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
  
  // Enhanced for Talk to Invest responses
  actionResponse?: TalkToInvestResponseType;
  requiresAction?: boolean;
  isExecuting?: boolean;
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
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const [messageCounter, setMessageCounter] = useState(0);
  
  const { toast } = useToast();
  const { address } = useAppKitAccount();
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

  const generateSimpleFallbackResponse = (): { content: string } => {
    // Simple fallback response when all services fail
    return { 
      content: "I'm experiencing some technical difficulties connecting to my analysis services. Please try your request again, and I'll help you with your Web3 investing needs." 
    };
  };

  const handleSend = async () => {
    if (message.trim()) {
      const nextCounter = messageCounter + 1;
      setMessageCounter(nextCounter);
      
      const userMessage: ChatMessage = {
        id: `${Date.now()}-${nextCounter}-user`,
        content: message.trim(),
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage("");
      setIsLoading(true); // Show loading animation while waiting for AI response

      try {
        console.log('🔗 Attempting main chat API...');
        const response = await sendChatMessage(userMessage.content, currentThreadId, address);
        if (response) {
          console.log('✅ Main API responded, skipping fallbacks');
          // API response with thread management
          const assistantMessage: ChatMessage = {
            id: `${Date.now()}-${nextCounter}-main-api`,
            content: response.reply || "(no response)",
            role: 'assistant',
            timestamp: new Date(),
            actionData: response.actionData,
            
            // Enhanced Talk to Invest data
            actionResponse: response.actionResponse,
            requiresAction: response.requiresAction,
            isExecuting: false
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          // Track this as a new message for animation
          setNewMessageIds(prev => new Set([...prev, assistantMessage.id]));
          
          // Update thread ID if we got a new one
          if (response.threadId && response.threadId !== currentThreadId) {
            setCurrentThreadId(response.threadId);
          }
        } else {
          // Main API returned null - show simple fallback
          console.log('🔄 Main API returned null, using simple fallback...');
          const fallback = generateSimpleFallbackResponse();
          const assistantMessage: ChatMessage = {
            id: `${Date.now()}-${nextCounter}-fallback`,
            content: fallback.content,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setNewMessageIds(prev => new Set([...prev, assistantMessage.id]));
        }
      } catch (error) {
        console.error('💥 Chat error caught in ChatInterface:', error);
        console.error('💥 Error details:', {
          message: error.message,
          stack: error.stack,
          type: typeof error,
          error
        });
        
        const errorMessage: ChatMessage = {
          id: `${Date.now()}-${nextCounter}-error`,
          content: "Sorry, something went wrong. Check console for details.",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false); // Hide loading animation once response is received
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

  // Talk to Invest action handlers - executes directly
  const handleTalkToInvestAction = (actionData: any) => {
    handleActionExecute(actionData);
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
          <div className="flex items-center gap-3">
            <ReimagineTool />
            <ConnectButton />
          </div>
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
                    {msg.role === 'user' ? (
                      // User messages
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-accent text-accent-foreground ml-auto">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      // Assistant messages
                      <div className="w-full">
                        {msg.actionResponse && msg.requiresAction ? (
                          // Enhanced Talk to Invest response (only show when action is actually required)
                          <TalkToInvestResponse
                            response={{...msg.actionResponse, originalResponse: msg.content}}
                            onPrimaryAction={handleTalkToInvestAction}
                            isExecuting={msg.isExecuting}
                            skipAnimation={!newMessageIds.has(msg.id)}
                          />
                        ) : null}
                        {msg.actionData ? (
                          // Legacy action data - show inline action card
                          <div className="w-full">
                            <div className="rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground mb-4">
                              <MarkdownContent content={msg.content} />
                            </div>
                            <TalkToInvestResponse
                              response={{
                                type: msg.actionData.type,
                                summary: {
                                  emoji: '🚀',
                                  action: `${msg.actionData.type === 'buy' ? 'Buy' : 'Swap'} ${msg.actionData.toToken}`,
                                  primaryDetails: 'Ready to execute'
                                },
                                metrics: [],
                                primaryAction: {
                                  text: `${msg.actionData.type === 'buy' ? 'Buy' : 'Swap'} ${msg.actionData.toToken}`,
                                  emoji: '🚀',
                                  actionType: msg.actionData.type,
                                  disabled: false,
                                  executionData: {
                                    fromToken: msg.actionData.fromToken,
                                    toToken: msg.actionData.toToken,
                                    fromAmount: msg.actionData.suggestedAmount,
                                    fromChain: msg.actionData.suggestedChain
                                  }
                                },
                                originalResponse: msg.content,
                                timestamp: Date.now()
                              }}
                              onPrimaryAction={handleTalkToInvestAction}
                              isExecuting={false}
                            />
                          </div>
                        ) : (
                          // Plain text response
                          <div className="rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground">
                            <MarkdownContent content={msg.content} />
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
                        )}
                      </div>
                    )}
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