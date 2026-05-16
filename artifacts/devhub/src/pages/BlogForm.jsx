import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreatePost, useUpdatePost, useGetPost, getGetPostQueryKey, getListPostsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { TagInput } from "@/components/shared/TagInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  published: z.boolean().default(false),
});
export default function BlogForm({ id }) {
  const isEdit = !!id;
  const postId = id ? parseInt(id, 10) : undefined;
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const { data: existing } = useGetPost(postId, {
    query: { enabled: isEdit && Number.isFinite(postId), queryKey: getGetPostQueryKey(postId) }
  });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "", tags: [], category: "", published: false },
  });
  useEffect(() => {
    if (existing) {
      form.reset({
        title: existing.title,
        content: existing.content ?? "",
        tags: existing.tags ?? [],
        category: existing.category ?? "",
        published: existing.published,
      });
    }
  }, [existing, form]);
  if (!user) { setLocation("/login"); return null; }
  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      content: data.content || undefined,
      tags: data.tags,
      category: data.category || undefined,
      published: data.published,
    };
    if (isEdit && postId) {
      updatePost.mutate({ id: postId, data: payload }, {
        onSuccess: (p) => { qc.invalidateQueries({ queryKey: getListPostsQueryKey() }); toast({ title: "Article updated" }); setLocation(`/blog/${p.id}`); },
        onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
      });
    } else {
      createPost.mutate({ data: payload }, {
        onSuccess: (p) => { qc.invalidateQueries({ queryKey: getListPostsQueryKey() }); toast({ title: "Article created" }); setLocation(`/blog/${p.id}`); },
        onError: () => toast({ title: "Error", description: "Failed to create", variant: "destructive" }),
      });
    }
  };
  const isPending = createPost.isPending || updatePost.isPending;
  const isPublished = form.watch("published");
  const tags = form.watch("tags");
  return (
    <Layout narrow>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Article" : "Write Article"}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEdit ? "Update your article" : "Share your technical knowledge with the community"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-border card-shadow p-6 md:p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Title</span>
              <Input
                data-testid="input-title"
                placeholder="Your article title"
                className="text-lg font-semibold bg-background border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
                {...form.register("title")}
              />
              {form.formState.errors.title && <span className="text-xs text-destructive">{form.formState.errors.title.message}</span>}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Category (optional)</span>
                <Input data-testid="input-category" placeholder="Backend, Frontend, AI/ML..." className="bg-background" {...form.register("category")} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Tags</span>
                <TagInput value={tags} onChange={(value) => form.setValue("tags", value, { shouldDirty: true })} placeholder="TypeScript, React..." />
              </label>
            </div>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Content</span>
              <Textarea
                data-testid="input-content"
                placeholder="Write your article here..."
                rows={22}
                className="font-mono text-sm resize-none bg-background"
                {...form.register("content")}
              />
            </label>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <label className="flex items-center gap-3">
                <Switch
                  data-testid="switch-published"
                  checked={isPublished}
                  onCheckedChange={(value) => form.setValue("published", value, { shouldDirty: true })}
                />
                <span>
                  <span className="block text-sm font-medium">{isPublished ? "Published" : "Draft"}</span>
                  <span className="block text-xs text-muted-foreground">
                    {isPublished ? "Visible to everyone" : "Only visible to you"}
                  </span>
                </span>
              </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLocation(isEdit ? `/blog/${postId}` : "/blog")}
                    className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="button-submit"
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {isPending ? "Saving..." : isEdit ? "Save changes" : isPublished ? "Publish" : "Save draft"}
                  </button>
                </div>
              </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
