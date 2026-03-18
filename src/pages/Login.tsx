import { useState,useEffect } from "react";
import { Link, useNavigate,useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  

  useEffect(() => {
    // 检查 URL 参数
    if (searchParams.get("verified") === "true") {
      // 1. 弹出专业提示
      toast.success("账号验证成功！✨", {
        description: "欢迎加入！现在你可以使用邮箱登录开启旅程了。",
        duration: 6000,
      });
    
      // 2. 这里的代码能让用户觉得这是个专门的确认页
      // 如果你以后想做得更高级，可以加一个 Modal 弹窗
    
      // 3. 清理 URL，把后缀去掉，只留下 localhost:8080/login
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-secondary/30 blur-2xl" />
      </div>

      <Card className="w-full max-w-md relative border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="text-center space-y-2">
          <div className="text-5xl mb-2">🌸</div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
            戒了么
          </CardTitle>
          <CardDescription className="text-base">欢迎回来，继续你的成长之旅 ✨</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">邮箱</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">密码</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl text-base font-bold h-12" disabled={loading}>
              {loading ? "登录中..." : "登录 💖"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            还没有账号？{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              立即注册
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
