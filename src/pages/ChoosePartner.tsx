import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

const ChoosePartner = () => {
  const [selected, setSelected] = useState<"boyfriend" | "girlfriend" | null>(null);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true); // 新增：正在检查登录状态
  const navigate = useNavigate();

  // 页面加载时，等待 Auth 状态就绪
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthChecking(false);
      if (!user) {
        toast.error("请先登录或完成邮箱验证");
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  const handleChoose = async () => {
    if (!selected) {
      toast.error("请先选择一个恋人类型");
      return;
    }

    setLoading(true);
    try {
      // 关键修复 1：直接从 API 获取当前 User，不依赖 useAuth Hook 的变量
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !currentUser) {
        toast.error("登录状态已过期，请尝试刷新页面或重新登录");
        navigate("/login");
        return;
      }

      // 关键修复 2：使用 upsert 并指定冲突列
      // 因为你的 profiles 表现在是空的，必须用 upsert 才能完成“第一次创建”
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: currentUser.id,
            partner_type: selected,
          },
          { onConflict: 'user_id' } // 确保根据 user_id 判断是插入还是更新
        );

      if (dbError) throw dbError;

      toast.success("选择成功！开始你的旅程吧 💖");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };


  if (authChecking) return <div>加载中...</div>; // 防止 user 为 null 时闪现错误



  const partners = [
    {
      type: "boyfriend" as const,
      emoji: "🧑‍💼",
      label: "男友型",
      desc: "温柔坚定的他，会在你身边默默守护",
      gradient: "from-blue-200 to-indigo-200",
    },
    {
      type: "girlfriend" as const,
      emoji: "👩‍🎀",
      label: "女友型",
      desc: "可爱温暖的她，用甜蜜的话语陪伴你",
      gradient: "from-pink-200 to-rose-200",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-56 h-56 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative space-y-8">
        <div className="text-center space-y-3">
          <div className="text-5xl">💕</div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
            选择你的电子恋人
          </h1>
          <p className="text-muted-foreground text-base">Ta 会在你的自律之旅中一直陪伴着你</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {partners.map((p) => (
            <Card
              key={p.type}
              className={`cursor-pointer transition-all duration-300 border-2 hover:scale-105 ${
                selected === p.type
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : "border-transparent hover:border-primary/30"
              }`}
              onClick={() => setSelected(p.type)}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-5xl`}>
                  {p.emoji}
                </div>
                <h3 className="text-xl font-bold text-foreground">{p.label}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
                {selected === p.type && (
                  <div className="text-primary font-semibold text-sm">✓ 已选择</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleChoose}
          className="w-full rounded-xl text-base font-bold h-12"
          disabled={!selected || loading}
        >
          {loading ? "保存中..." : "确认选择 💖"}
        </Button>
      </div>
    </div>
  );
};

export default ChoosePartner;
