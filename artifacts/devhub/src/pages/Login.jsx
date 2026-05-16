import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const login = useLogin();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data) => {
    login.mutate(
      { data },
      {
        onSuccess: (res) => {
          setToken(res.token);
          setLocation("/");
        },
        onError: (err) => {
          const description = err?.data?.error ?? "Invalid credentials";
          toast({ title: "Login failed", description, variant: "destructive" });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-foreground text-white p-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs font-mono">D</span>
          </div>
          <span className="font-bold text-lg tracking-tight">DevHub</span>
        </div>
        <div>
          <blockquote className="text-white/80 text-base leading-relaxed italic mb-4">
            "The best place to showcase what you're building and discover developers who share your passion for craft."
          </blockquote>
          <p className="text-white/50 text-sm">DevHub Community</p>
        </div>
        <div className="text-white/30 text-xs">Join developers already on the platform.</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">D</span>
            </div>
            <span className="font-bold text-lg tracking-tight">DevHub</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Email</span>
              <Input data-testid="input-email" type="email" placeholder="you@example.com" className="bg-white" {...form.register("email")} />
              {form.formState.errors.email && <span className="text-xs text-destructive">{form.formState.errors.email.message}</span>}
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Password</span>
              <Input data-testid="input-password" type="password" placeholder="password123" className="bg-white" {...form.register("password")} />
              {form.formState.errors.password && <span className="text-xs text-destructive">{form.formState.errors.password.message}</span>}
            </label>
            <button
              data-testid="button-login"
              type="submit"
              disabled={login.isPending}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {login.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo accounts use password123</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {["alice@devhub.dev", "bob@devhub.dev", "carol@devhub.dev"].map((email) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => {
                    form.setValue("email", email);
                    form.setValue("password", "password123");
                  }}
                  className="text-xs px-2 py-0.5 rounded bg-secondary hover:bg-primary/10 hover:text-primary text-secondary-foreground transition-colors"
                >
                  {email.split("@")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
