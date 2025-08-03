import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConnectButton } from "@/components/ConnectButton";
import { useToast } from "@/hooks/use-toast";
import { 
  Gift, 
  BookOpen, 
  Gamepad2, 
  Trophy, 
  Star, 
  Zap, 
  Target,
  Calendar,
  Crown,
  CheckCircle,
  Lock,
  Play,
  Loader2
} from "lucide-react";
import {
  useUserProgress,
  useChallenges,
  useCompleteChallenge,
  useClaimDailyReward,
  useLeaderboard
} from "@/hooks/useApi";
import { useAppKitAccount } from "@reown/appkit/react";

const PlayToEarn = () => {
  const { address } = useAppKitAccount();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>('challenges');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('beginner');
  
  // API hooks
  const { data: userProgress, isLoading: progressLoading } = useUserProgress();
  const { data: challengesData, isLoading: challengesLoading } = useChallenges({
    difficulty: selectedDifficulty
  });
  const { data: leaderboardData, isLoading: leaderboardLoading } = useLeaderboard('xp', 10);
  const completeChallengeMutation = useCompleteChallenge();
  const claimDailyRewardMutation = useClaimDailyReward();

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      await completeChallengeMutation.mutateAsync({ challengeId });
      toast({
        title: "Challenge Completed!",
        description: "You've earned rewards for completing this challenge.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClaimDailyReward = async () => {
    try {
      await claimDailyRewardMutation.mutateAsync();
      toast({
        title: "Daily Reward Claimed!",
        description: "You've received your daily XP and rewards.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim daily reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatWalletAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AppSidebar />
        <div className="ml-20 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Connect Wallet to Play & Earn</h1>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect your wallet to access challenges, track your progress, and start earning rewards through our gamified learning platform.
              </p>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="ml-20 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎮 Play to Earn</h1>
              <p className="text-muted-foreground">Learn, complete challenges, and earn rewards</p>
            </div>
            <ConnectButton />
          </div>

          {/* User Progress Card */}
          {progressLoading ? (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Loading your progress...</p>
                </div>
              </CardContent>
            </Card>
          ) : userProgress?.progress ? (
            <Card className="mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Crown className="h-8 w-8 text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold">{userProgress.progress.level}</p>
                    <p className="text-sm text-muted-foreground">Level</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">{userProgress.progress.xp.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">XP</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Gift className="h-8 w-8 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">${userProgress.progress.totalRewards}</p>
                    <p className="text-sm text-muted-foreground">Total Rewards</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="h-8 w-8 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold">{userProgress.progress.streakDays}</p>
                    <p className="text-sm text-muted-foreground">Day Streak</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Progress to Level {userProgress.progress.level + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {userProgress.progress.xp} / {userProgress.nextLevelXp} XP
                    </p>
                  </div>
                  <Progress value={userProgress.currentLevelProgress} className="h-2" />
                </div>

                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={handleClaimDailyReward}
                    disabled={claimDailyRewardMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {claimDailyRewardMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Calendar className="h-4 w-4 mr-2" />
                    )}
                    Claim Daily Reward
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="space-y-6">
            <div className="grid w-full grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={selectedTab === 'challenges' ? "default" : "ghost"}
                className="h-10"
                onClick={() => setSelectedTab('challenges')}
              >
                <Target className="h-4 w-4 mr-2" />
                Challenges
              </Button>
              <Button
                variant={selectedTab === 'leaderboard' ? "default" : "ghost"}
                className="h-10"
                onClick={() => setSelectedTab('leaderboard')}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
              <Button
                variant={selectedTab === 'achievements' ? "default" : "ghost"}
                className="h-10"
                onClick={() => setSelectedTab('achievements')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Achievements
              </Button>
            </div>

            {selectedTab === 'challenges' && (
              <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <p className="font-medium">Filter by difficulty:</p>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={selectedDifficulty === difficulty ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className="capitalize"
                    >
                      {difficulty}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challengesLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-full mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : challengesData?.challenges.map((challenge) => (
                  <Card key={challenge.id} className={`relative ${challenge.completed ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {challenge.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : challenge.unlockLevel && userProgress?.progress?.level < challenge.unlockLevel ? (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Play className="h-5 w-5 text-blue-500" />
                          )}
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        </div>
                        <Badge 
                          variant={challenge.difficulty === 'beginner' ? 'secondary' : challenge.difficulty === 'intermediate' ? 'default' : 'destructive'}
                          className="capitalize"
                        >
                          {challenge.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Gift className="h-4 w-4 text-green-500" />
                            Reward: {challenge.reward}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-blue-500" />
                            {challenge.xpReward} XP
                          </span>
                        </div>

                        {challenge.requirements.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">Requirements:</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {challenge.requirements.map((req, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Button
                          onClick={() => handleCompleteChallenge(challenge.id)}
                          disabled={
                            challenge.completed || 
                            completeChallengeMutation.isPending ||
                            (challenge.unlockLevel && userProgress?.progress?.level < challenge.unlockLevel)
                          }
                          className="w-full"
                          size="sm"
                        >
                          {completeChallengeMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : challenge.completed ? (
                            "Completed"
                          ) : challenge.unlockLevel && userProgress?.progress?.level < challenge.unlockLevel ? (
                            `Unlock at Level ${challenge.unlockLevel}`
                          ) : (
                            "Start Challenge"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </div>
            )}

            {selectedTab === 'leaderboard' && (
              <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Top Players
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leaderboardLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center space-x-4 animate-pulse">
                          <div className="h-8 w-8 bg-muted rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {leaderboardData?.leaderboard.map((player, index) => (
                        <div key={player.walletAddress} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-yellow-500 text-white' :
                              index === 1 ? 'bg-gray-400 text-white' :
                              index === 2 ? 'bg-amber-600 text-white' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              <span className="text-sm font-bold">{player.rank}</span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {player.walletAddress === address ? 'You' : formatWalletAddress(player.walletAddress)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Level {player.level} • {player.challengesCompleted} challenges
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{player.xp.toLocaleString()} XP</p>
                            <p className="text-sm text-green-600">${player.totalRewards}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              </div>
            )}

            {selectedTab === 'achievements' && (
              <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProgress?.progress?.achievements.map((achievement, index) => (
                  <Card key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                    <CardContent className="p-6 text-center">
                      <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">{achievement}</h3>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Unlocked
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Placeholder for locked achievements */}
                <Card className="opacity-50">
                  <CardContent className="p-6 text-center">
                    <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Master Trader</h3>
                    <Badge variant="secondary">Locked</Badge>
                  </CardContent>
                </Card>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayToEarn;