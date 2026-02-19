import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

const ChoosePartner = () => {
  const [selected, setSelected] = useState<"boyfriend" | "girlfriend" | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChoose = async () => {
    if (!selected || !user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ partner_type: selected })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error("保存失败，请重试");
    } else {
      toast.success("选择成功！开始你的旅程吧 💖");
      navigate("/dashboard");
    }
  };

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
