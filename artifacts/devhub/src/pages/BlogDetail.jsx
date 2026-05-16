import { Link, useLocation } from "wouter";
import { useGetPost, getGetPostQueryKey, useToggleLike, useToggleSave, useDeletePost } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Bookmark, Pencil, Trash2, ArrowLeft, Clock, Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
export default function BlogDetail({ id }) {
  const postId = parseInt(id, 10);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const deletePost = useDeletePost();
  const { data, isLoading } = useGetPost(postId, {
    query: { enabled: !isNaN(postId), queryKey: getGetPostQueryKey(postId) }
  });
  const post = data;
  const handleLike = () => {
    if (!user) { setLocation("/login"); return; }
    toggleLike.mutate({ data: { targetType: "post", targetId: postId } }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetPostQueryKey(postId) }),
    });
  };
  const handleSave = () => {
    if (!user) { setLocation("/login"); return; }
    toggleSave.mutate({ data: { targetType: "post", targetId: postId } }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetPostQueryKey(postId) }),
    });
  };
  const handleDelete = () => {
    if (!confirm("Delete this article? This can't be undone.")) return;
    deletePost.mutate({ id: postId }, {
      onSuccess: () => { toast({ title: "Article deleted" }); setLocation("/blog"); },
    });
  };
  if (isLoading) {
    return (
      <Layout narrow>
        <Skeleton className="h-8 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/3 mb-6" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Layout>
    );
  }
  if (!post) {
    return (
      <Layout narrow>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Article not found.</p>
          <Link href="/blog">
            <button className="mt-4 px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors">
              Back to Blog
            </button>
          </Link>
        </div>
      </Layout>
    );
  }
  const isOwner = user?.id === post.userId;
  const wordCount = post.content ? post.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));
  return (
    <Layout narrow>
      <div className="space-y-6">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to blog
        </Link>
        <article className="bg-white rounded-2xl border border-border card-shadow overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/60" />
          <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              {post.category && (
                <span className="inline-flex px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {post.category}
                </span>
              )}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{post.title}</h1>
                {isOwner && (
                  <div className="flex gap-2 shrink-0">
                    <Link href={`/blog/${post.id}/edit`}>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 bg-red-50 text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              {/* Author & Meta */}
              <div className="flex items-center gap-4 flex-wrap">
                {post.author && (
                  <Link href={`/profile/${post.author.username}`} className="flex items-center gap-2 group">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.avatarUrl ?? ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {post.author.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold group-hover:text-primary transition-colors">
                        {post.author.displayName ?? post.author.username}
                      </p>
                      <p className="text-xs text-muted-foreground">@{post.author.username}</p>
                    </div>
                  </Link>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {readTime} min read
                  </span>
                </div>
              </div>
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Content */}
            {post.content && (
              <div className="prose prose-sm max-w-none border-t border-border pt-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-foreground bg-transparent p-0 border-0 m-0">
                  {post.content}
                </pre>
              </div>
            )}
            {/* Footer Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                data-testid="button-like"
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  post.isLiked
                    ? "bg-red-50 border-red-200 text-red-500"
                    : "border-border bg-white text-muted-foreground hover:border-red-200 hover:text-red-400 hover:bg-red-50"
                }`}
              >
                <Heart className="h-4 w-4" fill={post.isLiked ? "currentColor" : "none"} />
                {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
              </button>
              <button
                data-testid="button-save"
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  post.isSaved
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Bookmark className="h-4 w-4" fill={post.isSaved ? "currentColor" : "none"} />
                {post.isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
}
