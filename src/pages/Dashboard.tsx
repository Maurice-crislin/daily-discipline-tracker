import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getDialogue, getRandomLine, type PartnerType } from "@/lib/partner-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { LogOut, Plus, Check, X, Flame, Star, Sparkles } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  active: boolean;
  streak: number;
  xp: number;
  level: number;
  created_at: string;
  checkedToday?: boolean;
}

interface FeedItem {
  id: string;
  message: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [partnerType, setPartnerType] = useState<PartnerType | null>(null);
  const [greeting, setGreeting] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [addingGoal, setAddingGoal] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    // Load profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("partner_type")
      .eq("user_id", user.id)
      .single();

    if (profile?.partner_type) {
      const pt = profile.partner_type as PartnerType;
      setPartnerType(pt);
      setGreeting(getRandomLine(getDialogue(pt).greeting));
    } else {
      navigate("/choose-partner");
      return;
    }

    // Load goals
    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Check today's check-ins
    const today = new Date().toISOString().split("T")[0];
    const { data: todayCheckins } = await supabase
      .from("check_ins")
      .select("goal_id")
      .eq("user_id", user.id)
      .eq("check_date", today);

    const checkedGoalIds = new Set(todayCheckins?.map((c) => c.goal_id) ?? []);

    setGoals(
      (goalsData ?? []).map((g) => ({
        ...g,
        checkedToday: checkedGoalIds.has(g.id),
      }))
    );

    // Load feed
    const { data: feedData } = await supabase
      .from("activity_feed")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    setFeed(feedData ?? []);
  }, [user, navigate]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) loadData();
  }, [user, authLoading, navigate, loadData]);

  const addGoal = async () => {
    if (!newGoalName.trim() || !user) return;
    setAddingGoal(true);
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      name: newGoalName.trim(),
    });
    if (error) {
      toast.error("创建失败");
    } else {
      await supabase.from("activity_feed").insert({
        user_id: user.id,
        message: `🎯 创建了新目标【${newGoalName.trim()}】`,
      });
      setNewGoalName("");
      toast.success("目标创建成功！加油 💪");
      loadData();
    }
    setAddingGoal(false);
  };

  const handleCheckIn = async (goal: Goal, success: boolean) => {
    if (!user || goal.checkedToday) return;

    const today = new Date().toISOString().split("T")[0];

    // Insert check-in
    const { error: checkInError } = await supabase.from("check_ins").insert({
      goal_id: goal.id,
      user_id: user.id,
      check_date: today,
      success,
    });

    if (checkInError) {
      toast.error("打卡失败，请重试");
      return;
    }

    // Calculate new values
    let newXp = goal.xp;
    let newStreak = goal.streak;
    let newLevel = goal.level;

    if (success) {
      newXp += 10;
      newStreak += 1;
      // Check level up
      const xpNeeded = newLevel * 30;
      while (newXp >= xpNeeded) {
        newXp -= newLevel * 30;
        newLevel += 1;
      }
    } else {
      newXp = 0;
      newStreak = 0;
    }

    // Update goal
    await supabase
      .from("goals")
      .update({ xp: newXp, streak: newStreak, level: newLevel })
      .eq("id", goal.id);

    // Add feed
    const feedMsg = success
      ? `✅ 成功打卡【${goal.name}】`
      : `❌ 失败了【${goal.name}】`;
    await supabase.from("activity_feed").insert({
      user_id: user.id,
      message: feedMsg,
    });

    // Show partner feedback
    if (partnerType) {
      const dialogue = getDialogue(partnerType);
      const line = getRandomLine(success ? dialogue.checkInSuccess : dialogue.checkInFail);
      toast(line);
    }

    loadData();
  };

  const xpProgress = (goal: Goal) => {
    const needed = goal.level * 30;
    return Math.min((goal.xp / needed) * 100, 100);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-2xl animate-pulse">🌸 加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
            🌸 戒了么
          </h1>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
            <LogOut className="w-4 h-4 mr-1" /> 退出
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
        {/* Partner greeting */}
        {partnerType && (
          <Card className="border-primary/20 bg-gradient-to-br from-card to-secondary/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-3xl shrink-0">
                  {partnerType === "boyfriend" ? "🧑‍💼" : "👩‍🎀"}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary">
                    你的{partnerType === "boyfriend" ? "男友" : "女友"}说：
                  </p>
                  <p className="text-foreground font-medium text-lg leading-relaxed">{greeting}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add goal */}
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="输入新的戒断目标，如：戒烟、戒熬夜..."
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                className="rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
              />
              <Button onClick={addGoal} disabled={addingGoal || !newGoalName.trim()} className="rounded-xl shrink-0">
                <Plus className="w-4 h-4 mr-1" /> 添加
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Goals list */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" /> 我的目标
          </h2>
          {goals.length === 0 ? (
            <Card className="border-primary/10">
              <CardContent className="p-8 text-center text-muted-foreground">
                <div className="text-4xl mb-3">🎯</div>
                <p>还没有目标呢，快来创建一个吧！</p>
              </CardContent>
            </Card>
          ) : (
            goals.map((goal) => (
              <Card key={goal.id} className="border-primary/10 overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-foreground">{goal.name}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                          <Sparkles className="w-3 h-3" /> Lv.{goal.level}
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Flame className="w-3 h-3 text-[hsl(var(--warning))]" /> {goal.streak}天连续
                        </span>
                      </div>
                    </div>

                    {!goal.checkedToday ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="rounded-xl bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-[hsl(var(--success-foreground))]"
                          onClick={() => handleCheckIn(goal, true)}
                        >
                          <Check className="w-4 h-4 mr-1" /> 成功
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
                          onClick={() => handleCheckIn(goal, false)}
                        >
                          <X className="w-4 h-4 mr-1" /> 失败
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-muted">
                        ✅ 已打卡
                      </span>
                    )}
                  </div>

                  {/* XP Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>XP: {goal.xp} / {goal.level * 30}</span>
                      <span>{Math.round(xpProgress(goal))}%</span>
                    </div>
                    <Progress value={xpProgress(goal)} className="h-3 bg-secondary" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Activity Feed */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> 最近动态
          </h2>
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无动态</p>
          ) : (
            <div className="space-y-2">
              {feed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border/50 text-sm"
                >
                  <span className="flex-1 text-foreground">{item.message}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(item.created_at).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
