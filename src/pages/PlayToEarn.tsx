import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, BookOpen, Gamepad2 } from "lucide-react";

const PlayToEarn = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="ml-20 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">🎮 Play to Earn</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <CardTitle>Learn & Earn</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Master blockchain concepts through interactive challenges and earn rewards for your progress.
                </p>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Educational Content
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-6 h-6 text-primary" />
                  <CardTitle>Transaction Stages</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Play through new stages generated via real transactions and unlock rewards.
                </p>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  Dynamic Gameplay
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-primary" />
                <CardTitle>Free Starter Package</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Get started with our free tier and unlock earning potential:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🆓 First 10 Stages FREE</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete the first 10 transaction-based stages at no cost and earn up to <span className="font-medium text-green-600">$10 in transaction credits</span>.
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      No Cost Entry
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      $10 Credits
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Coming Soon:</strong> Full play-to-earn mechanics with unlimited stages and higher earning potential.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayToEarn;