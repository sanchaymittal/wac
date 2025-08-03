import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatHistoryProps {
  isVisible: boolean;
  onThreadSelect: (thread: ChatThread) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function ChatHistory({ isVisible, onThreadSelect, onNewChat, onClose }: ChatHistoryProps) {
  const [chatHistory, setChatHistory] = useState<ChatThread[]>([]);

  useEffect(() => {
    if (isVisible) {
      const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      setChatHistory(history);
    }
  }, [isVisible]);

  const deleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = chatHistory.filter(thread => thread.id !== threadId);
    setChatHistory(updatedHistory);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay to close sidebar when clicking outside */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      <div className="fixed left-20 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 overflow-y-auto animate-slide-in-right">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-sidebar-foreground">Chat History</h3>
            <Button 
              onClick={onNewChat}
              variant="ghost" 
              size="sm"
              className="text-xs text-sidebar-foreground hover:bg-sidebar-accent"
            >
              New Chat
            </Button>
          </div>
          
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-sidebar-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-sidebar-foreground/60">No chat history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistory.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => onThreadSelect(thread)}
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-sidebar-foreground truncate font-medium">
                      {thread.title}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 mt-1">
                      {formatDate(thread.updatedAt)}
                    </p>
                  </div>
                  <Button
                    onClick={(e) => deleteThread(thread.id, e)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground/60 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}