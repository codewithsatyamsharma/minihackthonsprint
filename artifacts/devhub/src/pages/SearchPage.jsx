import { useState, useEffect } from "react";
import { Link, useSearch as useLocationSearch } from "wouter";
import { useSearch as useSearchQuery, getSearchQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/shared/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Code2, BookOpen } from "lucide-react";
const TABS = [
  { value: "all", label: "All" },
  { value: "users", label: "Developers" },
  { value: "projects", label: "Projects" },
  { value: "posts", label: "Articles" },
];
export default function SearchPage() {
  const queryString = useLocationSearch();
  const params = new URLSearchParams(queryString);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [debounced, setDebounced] = useState(params.get("q") ?? "");
  const [type, setType] = useState("all");
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(t);
  }, [query]);
  const { data, isLoading } = useSearchQuery(
    { q: debounced, type: type === "all" ? undefined : type },
    { query: { enabled: debounced.length >= 2, queryKey: getSearchQueryKey({ q: debounced, type: type === "all" ? undefined : type }) } }
  );
  const total = (data?.users?.length ?? 0) + (data?.projects?.length ?? 0) + (data?.posts?.length ?? 0);
  return (
    <Layout narrow>
      <div className="space-y-6">
          <h1 className="text-2xl font-bold">Search</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Find developers, projects, and articles</p>
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            data-testid="input-search"
            placeholder="Search for anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-11 pr-4 py-3 text-base rounded-xl border border-input bg-white card-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>
        {/* Type tabs */}
        <div className="flex gap-1 border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              data-testid={`tab-${tab.value}`}
              onClick={() => setType(tab.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                type === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* States */}
        {debounced.length < 2 && (
          <div className="py-16 text-center text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>Type at least 2 characters to search</p>
          </div>
        )}
        {isLoading && debounced.length >= 2 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        )}
        {!isLoading && debounced.length >= 2 && total === 0 && (
          <div className="py-16 text-center text-muted-foreground">
            <p className="font-medium">No results for "{debounced}"</p>
            <p className="text-sm mt-1">Try different keywords</p>
          </div>
        )}
        {data && total > 0 && (
          <div className="space-y-6">
            {/* Developers */}
            {(type === "all" || type === "users") && (data.users?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Users className="h-3.5 w-3.5" /> Developers
                </div>
                {data.users.map((user) => (
                  <Link key={user.id} href={`/profile/${user.username}`}>
                    <div data-testid={`result-user-${user.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-border hover:border-primary/30 hover:card-shadow transition-all cursor-pointer">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl ?? ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{user.displayName ?? user.username}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end shrink-0">
                        {user.skills?.slice(0, 3).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </section>
            )}
            {/* Projects */}
            {(type === "all" || type === "projects") && (data.projects?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Code2 className="h-3.5 w-3.5" /> Projects
                </div>
                {data.projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div data-testid={`result-project-${project.id}`} className="p-3 rounded-xl bg-white border border-border hover:border-primary/30 hover:card-shadow transition-all cursor-pointer">
                      <p className="font-semibold text-sm">{project.title}</p>
                      {project.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{project.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {project.techStack?.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </section>
            )}
            {/* Articles */}
            {(type === "all" || type === "posts") && (data.posts?.length ?? 0) > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <BookOpen className="h-3.5 w-3.5" /> Articles
                </div>
                {data.posts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.id}`}>
                    <div data-testid={`result-post-${post.id}`} className="p-3 rounded-xl bg-white border border-border hover:border-primary/30 hover:card-shadow transition-all cursor-pointer">
                      <p className="font-semibold text-sm">{post.title}</p>
                      {post.author && <p className="text-xs text-muted-foreground mt-0.5">by {post.author.displayName ?? post.author.username}</p>}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {post.tags?.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
