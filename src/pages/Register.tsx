import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("密码至少需要6个字符");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("注册成功！");
      navigate("/choose-partner");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 left-20 w-36 h-36 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative border-primary/20 shadow-xl shadow-primary/5">
        <CardHeader className="text-center space-y-2">
          <div className="text-5xl mb-2">🌟</div>
          <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text" style={{ WebkitTextFillColor: 'transparent' }}>
            加入戒了么
          </CardTitle>
          <CardDescription className="text-base">开始你的自律之旅，遇见更好的自己 🌈</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
                placeholder="至少6个字符"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl text-base font-bold h-12" disabled={loading}>
              {loading ? "注册中..." : "注册 🎀"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            已有账号？{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              去登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
