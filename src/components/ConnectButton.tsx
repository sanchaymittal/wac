import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

interface ConnectButtonProps {
  className?: string;
}

export function ConnectButton({ className }: ConnectButtonProps) {
  return (
    <Button variant="ghost" size="sm" className={`px-4 py-2 bg-sidebar border border-sidebar-border rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors ${className}`}>
      <Wallet className="h-4 w-4 mr-2" />
      <appkit-button />
    </Button>
  )
}
