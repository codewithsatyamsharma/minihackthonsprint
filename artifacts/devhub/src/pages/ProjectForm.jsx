import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateProject, useUpdateProject, useGetProject, getGetProjectQueryKey, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { TagInput } from "@/components/shared/TagInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
export default function ProjectForm({ id }) {
  const isEdit = !!id;
  const projectId = id ? parseInt(id, 10) : undefined;
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: existing } = useGetProject(projectId, {
    query: { enabled: isEdit && Number.isFinite(projectId), queryKey: getGetProjectQueryKey(projectId) }
  });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", techStack: [], githubUrl: "", liveUrl: "", imageUrl: "" },
  });
  const techStack = form.watch("techStack");
  useEffect(() => {
    if (existing) {
      form.reset({
        title: existing.title,
        description: existing.description ?? "",
        techStack: existing.techStack ?? [],
        githubUrl: existing.githubUrl ?? "",
        liveUrl: existing.liveUrl ?? "",
        imageUrl: existing.imageUrl ?? "",
      });
    }
  }, [existing, form]);
  if (!user) { setLocation("/login"); return null; }
  const onSubmit = (data) => {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      techStack: data.techStack,
      githubUrl: data.githubUrl || undefined,
      liveUrl: data.liveUrl || undefined,
      imageUrl: data.imageUrl || undefined,
    };
    if (isEdit && projectId) {
      updateProject.mutate({ id: projectId, data: payload }, {
        onSuccess: (p) => {
          qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast({ title: "Project updated" });
          setLocation(`/projects/${p.id}`);
        },
        onError: () => toast({ title: "Error", description: "Failed to update project", variant: "destructive" }),
      });
    } else {
      createProject.mutate({ data: payload }, {
        onSuccess: (p) => {
          qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          toast({ title: "Project created" });
          setLocation(`/projects/${p.id}`);
        },
        onError: () => toast({ title: "Error", description: "Failed to create project", variant: "destructive" }),
      });
    }
  };
  const isPending = createProject.isPending || updateProject.isPending;
  return (
    <Layout narrow>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Project" : "New Project"}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEdit ? "Update your project details" : "Share what you're building with the community"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-border card-shadow p-6 md:p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Project name</span>
              <Input data-testid="input-title" placeholder="e.g. Quantum Cache" className="bg-background" {...form.register("title")} />
              {form.formState.errors.title && <span className="text-xs text-destructive">{form.formState.errors.title.message}</span>}
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Description</span>
              <Textarea
                data-testid="input-description"
                placeholder="What does it do? What problem does it solve?"
                rows={4}
                className="bg-background resize-none"
                {...form.register("description")}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Tech stack</span>
              <TagInput
                value={techStack}
                onChange={(value) => form.setValue("techStack", value, { shouldDirty: true })}
                placeholder="TypeScript, React, PostgreSQL - press Enter to add"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">GitHub URL (optional)</span>
                <Input data-testid="input-github-url" placeholder="https://github.com/..." className="bg-background" {...form.register("githubUrl")} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Live URL (optional)</span>
                <Input data-testid="input-live-url" placeholder="https://..." className="bg-background" {...form.register("liveUrl")} />
              </label>
            </div>
              <div className="flex gap-3 pt-2">
                <button
                  data-testid="button-submit"
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {isPending ? "Saving..." : isEdit ? "Save changes" : "Create project"}
                </button>
                <button
                  type="button"
                  onClick={() => setLocation(isEdit ? `/projects/${projectId}` : "/projects")}
                  className="px-5 py-2.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
