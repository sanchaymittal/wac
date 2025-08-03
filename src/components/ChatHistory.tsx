import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";
import { useChatThreads, useDeleteChatThread } from "@/hooks/useApi";
import { useAppKitAccount } from "@reown/appkit/react";
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
  wallet_address?: string;
  created_at: number;
  updated_at: number;
  message_count: number;
  last_message: string;
  category?: string;
}

interface ChatHistoryProps {
  isVisible: boolean;
  onThreadSelect: (threadId: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function ChatHistory({ isVisible, onThreadSelect, onNewChat, onClose }: ChatHistoryProps) {
  const { address } = useAppKitAccount();
  const { toast } = useToast();
  
  // Use API-based thread management
  const { data: threadsData, isLoading, error, refetch } = useChatThreads();
  const deleteThreadMutation = useDeleteChatThread();

  const threads = threadsData?.threads || [];

  // Refetch when visibility changes
  useEffect(() => {
    if (isVisible) {
      refetch();
    }
  }, [isVisible, refetch]);

  const deleteThread = async (threadId: string) => {
    try {
      await deleteThreadMutation.mutateAsync(threadId);
      toast({
        title: "Thread deleted",
        description: "Chat thread has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete thread. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteAllThreads = async () => {
    try {
      // Delete all threads one by one
      const deletePromises = threads.map(thread => deleteThreadMutation.mutateAsync(thread.id));
      await Promise.all(deletePromises);
      
      toast({
        title: "All threads deleted",
        description: `Successfully deleted ${threads.length} chat threads`,
      });
      
      // Navigate to new chat
      onNewChat();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete all threads. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(timestamp).toLocaleDateString();
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
            <div className="flex items-center gap-2">
              <Button 
                onClick={onNewChat}
                variant="ghost" 
                size="sm"
                className="text-xs text-sidebar-foreground hover:bg-sidebar-accent"
              >
                New Chat
              </Button>
            </div>
          </div>
          
          {threads.length > 0 && (
            <div className="mb-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete All Threads
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
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-3 rounded-lg bg-sidebar-accent/50 animate-pulse">
                  <div className="h-4 bg-sidebar-foreground/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-sidebar-foreground/10 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error || threads.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-sidebar-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-sidebar-foreground/60">
                {error ? 'Failed to load threads' : 'No chat history yet'}
              </p>
              {error && (
                <Button 
                  onClick={() => refetch()} 
                  variant="ghost" 
                  size="sm"
                  className="mt-2 text-xs"
                >
                  Retry
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => onThreadSelect(thread.id)}
                  className="group flex items-center justify-between p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-sidebar-foreground truncate font-medium">
                      {thread.title}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 mt-1">
                      {formatDate(thread.updated_at)} • {thread.message_count} messages
                    </p>
                    {thread.last_message && (
                      <p className="text-xs text-sidebar-foreground/40 mt-1 truncate">
                        {thread.last_message}
                      </p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-sidebar-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                        disabled={deleteThreadMutation.isPending}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}