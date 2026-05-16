import { Link, useLocation } from "wouter";
import { useGetProject, getGetProjectQueryKey, useToggleLike, useToggleSave, useDeleteProject } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Bookmark, Github, ExternalLink, Pencil, Trash2, ArrowLeft, Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
export default function ProjectDetail({ id }) {
  const projectId = parseInt(id, 10);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const deleteProject = useDeleteProject();
  const { data, isLoading } = useGetProject(projectId, {
    query: { enabled: !isNaN(projectId), queryKey: getGetProjectQueryKey(projectId) }
  });
  const project = data;
  const handleLike = () => {
    if (!user) { setLocation("/login"); return; }
    toggleLike.mutate({ data: { targetType: "project", targetId: projectId } }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) }),
    });
  };
  const handleSave = () => {
    if (!user) { setLocation("/login"); return; }
    toggleSave.mutate({ data: { targetType: "project", targetId: projectId } }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) }),
    });
  };
  const handleDelete = () => {
    if (!confirm("Delete this project? This can't be undone.")) return;
    deleteProject.mutate({ id: projectId }, {
      onSuccess: () => { toast({ title: "Project deleted" }); setLocation("/projects"); },
    });
  };
  if (isLoading) {
    return (
      <Layout narrow>
        <Skeleton className="h-7 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/4 mb-6" />
        <Skeleton className="h-32 w-full" />
      </Layout>
    );
  }
  if (!project) {
    return (
      <Layout narrow>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Project not found.</p>
          <Link href="/projects">
            <button className="mt-4 px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors">
              Back to Projects
            </button>
          </Link>
        </div>
      </Layout>
    );
  }
  const isOwner = user?.id === project.userId;
  return (
    <Layout narrow>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to projects
        </Link>
        {/* Main card */}
        <div className="bg-white rounded-2xl border border-border card-shadow overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/40" />
          <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{project.title}</h1>
                {project.author && (
                  <Link href={`/profile/${project.author.username}`} className="inline-flex items-center gap-2 mt-2 group">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={project.author.avatarUrl ?? ""} />
                      <AvatarFallback className="text-[10px] bg-secondary font-semibold">
                        {project.author.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors font-medium">
                      {project.author.displayName ?? project.author.username}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(project.createdAt ?? Date.now()), { addSuffix: true })}
                    </span>
                  </Link>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2 shrink-0">
                  <Link href={`/projects/${project.id}/edit`}>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors">
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleteProject.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 bg-red-50 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
            {/* Description */}
            {project.description && (
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>
            )}
            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Actions */}
            <div className="flex items-center gap-4 pt-2 border-t border-border">
              <button
                data-testid="button-like"
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  project.isLiked
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-border bg-white text-muted-foreground hover:border-red-200 hover:text-red-400 hover:bg-red-50"
                }`}
              >
                <Heart className="h-4 w-4" fill={project.isLiked ? "currentColor" : "none"} />
                {project.likeCount} {project.likeCount === 1 ? "like" : "likes"}
              </button>
              <button
                data-testid="button-save"
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  project.isSaved
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Bookmark className="h-4 w-4" fill={project.isSaved ? "currentColor" : "none"} />
                {project.isSaved ? "Saved" : "Save"}
              </button>
              <div className="flex gap-2 ml-auto">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" /> Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
