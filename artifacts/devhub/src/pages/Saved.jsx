import { Link, useLocation } from "wouter";
import { useGetSaved, getGetSavedQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Code2, BookOpen } from "lucide-react";
export default function Saved() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  if (!user) { setLocation("/login"); return null; }
  const { data, isLoading } = useGetSaved({ query: { queryKey: getGetSavedQueryKey() } });
  return (
    <Layout narrow>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Saved</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Projects and articles you've bookmarked
          </p>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : data?.items?.length ? (
          <div className="space-y-3">
            {data.items.map((item) => (
              <div
                key={item.id}
                data-testid={`card-saved-${item.id}`}
                className="bg-white rounded-xl border border-border card-shadow hover:border-primary/30 transition-all p-5"
              >
                {item.targetType === "project" && item.project ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Code2 className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Project</span>
                    </div>
                    <Link href={`/projects/${item.project.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                        {item.project.title}
                      </h3>
                    </Link>
                    {item.project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {item.project.techStack?.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{tech}</span>
                      ))}
                    </div>
                  </div>
                ) : item.targetType === "post" && item.post ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                        <BookOpen className="h-3.5 w-3.5 text-accent-foreground" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</span>
                    </div>
                    <Link href={`/blog/${item.post.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                        {item.post.title}
                      </h3>
                    </Link>
                    {item.post.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.post.content}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {item.post.tags?.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  Saved {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Bookmark className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium">Nothing saved yet</p>
            <p className="text-sm text-muted-foreground mt-1">Bookmark projects and articles to find them here</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/projects">
                <button className="px-4 py-2 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors">
                  Browse Projects
                </button>
              </Link>
              <Link href="/blog">
                <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                  Read Articles
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
