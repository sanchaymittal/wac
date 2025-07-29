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
    <Button variant="outline" size="sm" className={className}>
      <Wallet className="h-4 w-4 mr-2" />
      <appkit-button />
    </Button>
  )
}
