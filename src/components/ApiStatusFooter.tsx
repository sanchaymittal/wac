import { useApiStatus } from "@/hooks/useApi";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function ApiStatusFooter() {
  const { apiAvailable } = useApiStatus();

  if (apiAvailable) {
    return null; // Don't show footer when API is working
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-50 border-t border-amber-200 px-4 py-2 z-50">
      <div className="flex items-center justify-center gap-2 text-sm text-amber-800">
        <WifiOff className="h-4 w-4" />
        <span>API not available - showing hardcoded demo data</span>
        <Badge variant="outline" className="text-amber-700 border-amber-300">
          Demo Mode
        </Badge>
      </div>
    </div>
  );
}