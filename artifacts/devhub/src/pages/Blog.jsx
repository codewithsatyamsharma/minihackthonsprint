import { useState } from "react";
import { Link } from "wouter";
import { useListPosts, getListPostsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { PostCard } from "@/features/blog/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Tag } from "lucide-react";
export default function Blog() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const { data, isLoading } = useListPosts(
    { search: search || undefined, tag: tagFilter || undefined },
    { query: { queryKey: getListPostsQueryKey({ search: search || undefined, tag: tagFilter || undefined }) } }
  );
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Blog</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Technical articles by developers, for developers
            </p>
          </div>
          {user && (
            <Link href="/blog/new">
              <button
                data-testid="button-new-post"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" /> Write Article
              </button>
            </Link>
          )}
        </div>
        {/* Filters */}
        <div className="flex gap-3 bg-white p-3 rounded-xl border border-border card-shadow">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              data-testid="input-search"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              data-testid="input-tag-filter"
              placeholder="Filter by tag..."
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-44 pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
        {tagFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tag:</span>
            <button
              onClick={() => setTagFilter("")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              {tagFilter} ×
            </button>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : data?.posts?.length ? (
          <div className="space-y-3">
            {data.posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onTagClick={setTagFilter}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium">No articles found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
