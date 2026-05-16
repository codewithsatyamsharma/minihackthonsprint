import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, Github, ExternalLink } from "lucide-react";
export function ProjectCard({ project, onLike, onSave, onTechClick }) {
  return (
    <div
      data-testid={`card-project-${project.id}`}
      className="bg-white rounded-xl border border-border card-shadow hover:border-primary/30 hover:card-shadow-md transition-all group flex flex-col"
    >
      {/* Header */}
      <div className="p-5 pb-3 flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/projects/${project.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors leading-snug group-hover:text-primary line-clamp-1"
          >
            {project.title}
          </Link>
          <div className="flex gap-1 shrink-0">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
        {project.author && (
          <Link
            href={`/profile/${project.author.username}`}
            className="flex items-center gap-1.5 mb-3 group/author"
          >
            <Avatar className="h-5 w-5">
              <AvatarImage src={project.author.avatarUrl ?? ""} />
              <AvatarFallback className="text-[9px] bg-secondary font-semibold">
                {project.author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground group-hover/author:text-foreground transition-colors">
              {project.author.displayName ?? project.author.username}
            </span>
          </Link>
        )}
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {project.description}
          </p>
        )}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.techStack.map((tech) => (
              <button
                key={tech}
                onClick={() => onTechClick?.(tech)}
                className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tech}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="px-5 py-3 border-t border-border flex items-center gap-3">
        <button
          data-testid={`button-like-project-${project.id}`}
          onClick={() => onLike?.(project.id)}
          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
            project.isLiked
              ? "text-red-500"
              : "text-muted-foreground hover:text-red-400"
          }`}
        >
          <Heart
            className="h-3.5 w-3.5"
            fill={project.isLiked ? "currentColor" : "none"}
          />
          {project.likeCount}
        </button>
        <button
          data-testid={`button-save-project-${project.id}`}
          onClick={() => onSave?.(project.id)}
          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
            project.isSaved
              ? "text-primary"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Bookmark
            className="h-3.5 w-3.5"
            fill={project.isSaved ? "currentColor" : "none"}
          />
          {project.saveCount ?? 0}
        </button>
      </div>
    </div>
  );
}
