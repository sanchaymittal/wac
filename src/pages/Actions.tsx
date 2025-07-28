import { AppSidebar } from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

const Actions = () => {
  const transactions = [
    {
      id: "1",
      timestamp: "2024-01-22 14:30:25",
      status: "completed",
      sourceChain: "Ethereum",
      destinationChain: "Polygon",
      tokenFrom: "ETH",
      tokenTo: "MATIC",
      amount: "0.5 ETH",
      txHash: "0x1234...abcd"
    },
    {
      id: "2",
      timestamp: "2024-01-22 13:15:10",
      status: "in-progress",
      sourceChain: "BSC",
      destinationChain: "Avalanche",
      tokenFrom: "BNB",
      tokenTo: "AVAX",
      amount: "2.1 BNB",
      txHash: "0x5678...efgh"
    },
    {
      id: "3",
      timestamp: "2024-01-22 12:45:33",
      status: "completed",
      sourceChain: "Arbitrum",
      destinationChain: "Optimism",
      tokenFrom: "ARB",
      tokenTo: "OP",
      amount: "150 ARB",
      txHash: "0x9abc...ijkl"
    },
    {
      id: "4",
      timestamp: "2024-01-22 11:20:18",
      status: "failed",
      sourceChain: "Ethereum",
      destinationChain: "Base",
      tokenFrom: "USDC",
      tokenTo: "ETH",
      amount: "1000 USDC",
      txHash: "0xdef0...mnop"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="ml-20 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">⚡ Actions</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source Chain</TableHead>
                    <TableHead>Destination Chain</TableHead>
                    <TableHead>From → To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {tx.timestamp}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.sourceChain}</TableCell>
                      <TableCell>{tx.destinationChain}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {tx.tokenFrom} → {tx.tokenTo}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{tx.amount}</TableCell>
                      <TableCell>
                        <a
                          href={`https://etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          {tx.txHash}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Actions;