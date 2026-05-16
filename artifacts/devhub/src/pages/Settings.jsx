import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useUpdateProfile, getGetMeQueryKey, getGetUserByUsernameQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { TagInput } from "@/components/shared/TagInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  bannerUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUsername: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
});

export default function Settings() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const updateProfile = useUpdateProfile();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", bio: "", avatarUrl: "", bannerUrl: "", githubUsername: "", website: "", skills: [] },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName ?? "",
        bio: user.bio ?? "",
        avatarUrl: user.avatarUrl ?? "",
        bannerUrl: user.bannerUrl ?? "",
        githubUsername: user.githubUsername ?? "",
        website: user.website ?? "",
        skills: user.skills ?? [],
      });
    }
  }, [user, form]);

  if (!user) {
    setLocation("/login");
    return null;
  }

  const avatarUrl = form.watch("avatarUrl");
  const skills = form.watch("skills");
  const onSubmit = (data) => {
    updateProfile.mutate(
      {
        data: {
          displayName: data.displayName || undefined,
          bio: data.bio || undefined,
          avatarUrl: data.avatarUrl || undefined,
          bannerUrl: data.bannerUrl || undefined,
          githubUsername: data.githubUsername || undefined,
          website: data.website || undefined,
          skills: data.skills,
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
          qc.invalidateQueries({ queryKey: getGetUserByUsernameQueryKey(user.username) });
          toast({ title: "Profile updated" });
        },
        onError: () => toast({ title: "Error", description: "Failed to update profile", variant: "destructive" }),
      },
    );
  };

  return (
    <Layout narrow>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Update your developer profile</p>
        </div>

        <div className="bg-white rounded-xl border border-border card-shadow p-4 flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarUrl || user.avatarUrl || ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{form.watch("displayName") || user.displayName || user.username}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-border card-shadow p-6 md:p-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Display Name</span>
              <Input data-testid="input-display-name" placeholder="Your Name" className="bg-background" {...form.register("displayName")} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">GitHub Username</span>
              <Input data-testid="input-github" placeholder="yourusername" className="bg-background" {...form.register("githubUsername")} />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Bio</span>
            <Textarea data-testid="input-bio" placeholder="Tell the world what you're building..." rows={3} className="resize-none bg-background" {...form.register("bio")} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Skills & Tech Stack</span>
            <TagInput value={skills} onChange={(value) => form.setValue("skills", value, { shouldDirty: true })} placeholder="TypeScript, React, Rust, PostgreSQL..." />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Website</span>
            <Input data-testid="input-website" placeholder="https://yoursite.dev" className="bg-background" {...form.register("website")} />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Avatar URL</span>
              <Input data-testid="input-avatar-url" placeholder="https://..." className="bg-background" {...form.register("avatarUrl")} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Banner URL</span>
              <Input data-testid="input-banner-url" placeholder="https://..." className="bg-background" {...form.register("bannerUrl")} />
            </label>
          </div>
          <button
            data-testid="button-save"
            type="submit"
            disabled={updateProfile.isPending}
            className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
