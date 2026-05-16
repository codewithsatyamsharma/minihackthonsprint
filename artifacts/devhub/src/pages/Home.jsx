import { Link } from "wouter";
import { useGetFeed, getGetFeedQueryKey, useGetTrendingTags, getGetTrendingTagsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/shared/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, TrendingUp } from "lucide-react";
import { PostCard } from "@/features/blog/PostCard";
import { ProjectCard } from "@/features/projects/ProjectCard";
export default function Home() {
  const { user } = useAuth();
  const { data, isLoading } = useGetFeed({ query: { queryKey: getGetFeedQueryKey() } });
  const { data: trending } = useGetTrendingTags({ query: { queryKey: getGetTrendingTagsQueryKey() } });
  const feed = data;
  return (
    <Layout>
      {/* Hero */}
      {!user && (
        <section className="mb-10 py-12 px-8 rounded-2xl bg-white border border-border card-shadow text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Developer Social Platform
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
            Build your developer presence.
          </h1>
          <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto leading-relaxed">
            Showcase projects, write technical articles, and connect with developers who build things that matter.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register">
              <button className="px-5 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors">
                Get started free
              </button>
            </Link>
            <Link href="/explore">
              <button className="px-5 py-2.5 rounded-lg border border-border bg-white text-foreground font-semibold text-sm hover:bg-muted transition-colors flex items-center gap-2">
                Explore community <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>
      )}
      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Latest Activity</h2>
            <div className="flex gap-2">
              <Link href="/projects">
                <span className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">Projects →</span>
              </Link>
              <span className="text-muted-foreground/30">·</span>
              <Link href="/blog">
                <span className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">Blog →</span>
              </Link>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-5">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/3 mb-3" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {feed?.items?.map((item, i) =>
                item.type === "post" && item.post ? (
                  <PostCard key={`post-${item.post.id}-${i}`} post={item.post} />
                ) : item.type === "project" && item.project ? (
                  <ProjectCard key={`project-${item.project.id}-${i}`} project={item.project} />
                ) : null
              )}
              {!feed?.items?.length && (
                <div className="bg-white rounded-xl border border-border p-10 text-center text-muted-foreground">
                  <p className="font-medium">No activity yet</p>
                  <p className="text-sm mt-1">Be the first to share something.</p>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="bg-white rounded-xl border border-border card-shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Trending Tags</h3>
            </div>
            <div className="space-y-1">
              {trending?.slice(0, 10).map((tag) => (
                <Link key={tag.tag} href={`/projects?tech=${tag.tag}`}>
                  <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted transition-colors cursor-pointer group">
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {tag.tag}
                    </span>
                    <span className="text-xs font-medium text-primary">{tag.count}</span>
                  </div>
                </Link>
              ))}
              {!trending?.length && (
                <p className="text-xs text-muted-foreground px-2">No trending tags yet</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border card-shadow p-4">
            <h3 className="text-sm font-semibold mb-2">Quick Links</h3>
            <div className="space-y-1">
              {[
                { href: "/explore", label: "Discover Developers" },
                { href: "/projects", label: "Browse Projects" },
                { href: "/blog", label: "Read Articles" },
                { href: "/search", label: "Search Everything" },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className="py-1.5 px-2 rounded-md hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-between group">
                    {link.label}
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
