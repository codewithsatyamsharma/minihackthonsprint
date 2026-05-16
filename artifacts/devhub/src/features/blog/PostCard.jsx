import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
export function PostCard({ post, onTagClick }) {
  return (
    <article
      data-testid={`card-post-${post.id}`}
      className="bg-white rounded-xl border border-border card-shadow hover:border-primary/30 hover:card-shadow-md transition-all p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {post.author && (
              <Link
                href={`/profile/${post.author.username}`}
                className="flex items-center gap-1.5 group"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.author.avatarUrl ?? ""} />
                  <AvatarFallback className="text-[9px] bg-secondary font-semibold">
                    {post.author.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  {post.author.displayName ?? post.author.username}
                </span>
              </Link>
            )}
            <span className="text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
            {post.category && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-xs font-medium text-primary">{post.category}</span>
              </>
            )}
          </div>
          {/* Title */}
          <Link href={`/blog/${post.id}`}>
            <h3 className="font-semibold text-foreground hover:text-primary transition-colors mb-1.5 leading-snug">
              {post.title}
            </h3>
          </Link>
          {/* Excerpt */}
          {post.content && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
              {post.content}
            </p>
          )}
          {/* Tags + Stats */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap gap-1">
              {post.tags?.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick?.(tag)}
                  className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                {post.likeCount}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Bookmark className="h-3.5 w-3.5" />
                {post.saveCount ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
