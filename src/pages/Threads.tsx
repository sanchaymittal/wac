import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";

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

export default function Threads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    setThreads(chatHistory);
  }, []);

  const startNewThread = () => {
    localStorage.removeItem('currentChatThread');
    navigate("/");
  };

  const openThread = (thread: ChatThread) => {
    navigate(`/?thread=${thread.id}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const threadDate = new Date(date);
    const diffInMs = now.getTime() - threadDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return threadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return threadDate.toLocaleDateString();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col pl-20">
      {/* Import and include sidebar */}
      <div className="absolute left-0 top-0 h-full">
        <AppSidebar />
      </div>
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Chat Threads</h1>
        </div>
        <Button onClick={startNewThread} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Thread</span>
        </Button>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {threads.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No chat threads yet</h3>
              <p className="text-muted-foreground mb-4">Start a conversation to see your chat history here</p>
              <Button onClick={startNewThread}>
                <Plus className="h-4 w-4 mr-2" />
                Start New Thread
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => openThread(thread)}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground truncate flex-1 mr-4">
                      {thread.title}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(thread.updatedAt)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
                  </div>
                  
                  {thread.messages.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground truncate">
                      {thread.messages[thread.messages.length - 1].content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}