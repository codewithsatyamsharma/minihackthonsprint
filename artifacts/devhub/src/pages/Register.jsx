import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Invalid email"),
  username: z.string().min(3, "At least 3 characters").regex(/^[a-z0-9_-]+$/, "Lowercase, numbers, _ or - only"),
  displayName: z.string().optional(),
  password: z.string().min(6, "At least 6 characters"),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { setToken } = useAuth();
  const { toast } = useToast();
  const register = useRegister();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", username: "", displayName: "", password: "" },
  });

  const onSubmit = (data) => {
    register.mutate(
      { data: { ...data, displayName: data.displayName || undefined } },
      {
        onSuccess: (res) => {
          setToken(res.token);
          setLocation("/");
        },
        onError: (err) => {
          const description = err?.data?.error ?? "Registration failed";
          toast({ title: "Error", description, variant: "destructive" });
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
        <div className="space-y-6">
          {[
            { title: "Showcase Projects", desc: "Display your work with tech stack tags, live links, and GitHub repos." },
            { title: "Write Articles", desc: "Share your knowledge with the developer community through technical posts." },
            { title: "Get Discovered", desc: "Let other developers find your work and connect with you." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mt-0.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-white/30 text-xs">Free. No credit card required.</div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs font-mono">D</span>
            </div>
            <span className="font-bold text-lg tracking-tight">DevHub</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Create your profile</h1>
          <p className="text-muted-foreground text-sm mb-8">Join the developer community today</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: "email", label: "Email", type: "email", placeholder: "you@example.com", testId: "input-email" },
              { name: "username", label: "Username", placeholder: "yourhandle", testId: "input-username" },
              { name: "displayName", label: "Display name (optional)", placeholder: "Your Name", testId: "input-display-name" },
              { name: "password", label: "Password", type: "password", placeholder: "Min. 6 characters", testId: "input-password" },
            ].map((field) => (
              <label key={field.name} className="block space-y-1.5">
                <span className="text-sm font-medium">{field.label}</span>
                <Input
                  data-testid={field.testId}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  className="bg-white"
                  {...form.register(field.name)}
                />
                {form.formState.errors[field.name] && (
                  <span className="text-xs text-destructive">{form.formState.errors[field.name].message}</span>
                )}
              </label>
            ))}
            <button
              data-testid="button-register"
              type="submit"
              disabled={register.isPending}
              className="w-full py-2.5 px-4 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {register.isPending ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
