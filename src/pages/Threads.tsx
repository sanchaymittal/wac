import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Clock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const { toast } = useToast();

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

  const deleteThread = (threadId: string) => {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const updatedHistory = chatHistory.filter((t: ChatThread) => t.id !== threadId);
    localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    setThreads(updatedHistory);
    
    // If the deleted thread is the current thread, clear it
    const currentThread = localStorage.getItem('currentChatThread');
    if (currentThread) {
      const current = JSON.parse(currentThread);
      if (current.id === threadId) {
        localStorage.removeItem('currentChatThread');
      }
    }
    
    toast({
      title: "Thread deleted",
      description: "Chat thread has been successfully deleted",
    });
  };

  const deleteAllThreads = () => {
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('currentChatThread');
    setThreads([]);
    
    toast({
      title: "All threads deleted",
      description: `Successfully deleted ${threads.length} chat threads`,
    });
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
        <div className="flex items-center gap-3">
          {threads.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete All</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Threads</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all chat threads? This will permanently delete all {threads.length} conversations and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteAllThreads}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={startNewThread} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Thread</span>
          </Button>
        </div>
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
                  className="bg-card border border-border rounded-lg p-4 hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div 
                      className="flex-1 mr-4 cursor-pointer"
                      onClick={() => openThread(thread)}
                    >
                      <h3 className="font-medium text-foreground truncate">
                        {thread.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(thread.updatedAt)}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                            title="Delete thread"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{thread.title}"? This action cannot be undone and will permanently delete all messages in this conversation.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteThread(thread.id)}
                              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  <div 
                    className="cursor-pointer"
                    onClick={() => openThread(thread)}
                  >
                    <div className="text-sm text-muted-foreground">
                      {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
                    </div>
                    
                    {thread.messages.length > 0 && (
                      <div className="mt-2 text-sm text-muted-foreground truncate">
                        {thread.messages[thread.messages.length - 1].content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}