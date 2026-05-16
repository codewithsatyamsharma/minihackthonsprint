import { useState } from "react";
import { useListUsers, getListUsersQueryKey, useGetTrendingTags, getGetTrendingTagsQueryKey, useGetPlatformSummary, getGetPlatformSummaryQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/shared/Layout";
import { UserCard } from "@/features/explore/UserCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, Code2, BookOpen, TrendingUp } from "lucide-react";
export default function Explore() {
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const { data, isLoading } = useListUsers(
    { search: search || undefined, skill: skillFilter || undefined },
    { query: { queryKey: getListUsersQueryKey({ search: search || undefined, skill: skillFilter || undefined }) } }
  );
  const { data: trending } = useGetTrendingTags({ query: { queryKey: getGetTrendingTagsQueryKey() } });
  const { data: summary } = useGetPlatformSummary({ query: { queryKey: getGetPlatformSummaryQueryKey() } });
  const usersData = data;
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Explore</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Discover developers and what they're building</p>
        </div>
        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Users className="h-4 w-4" />, count: summary.userCount, label: "Developers" },
              { icon: <Code2 className="h-4 w-4" />, count: summary.projectCount, label: "Projects" },
              { icon: <BookOpen className="h-4 w-4" />, count: summary.postCount, label: "Articles" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-border card-shadow p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-3 bg-white p-3 rounded-xl border border-border card-shadow">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  data-testid="input-search"
                  placeholder="Search developers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <div className="relative">
                <input
                  data-testid="input-skill-filter"
                  placeholder="Filter by skill..."
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-40 pl-3 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>
            {skillFilter && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Skill:</span>
                <button
                  onClick={() => setSkillFilter("")}
                  className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  {skillFilter} ×
                </button>
              </div>
            )}
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-border p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : usersData?.users?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {usersData.users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onSkillClick={setSkillFilter}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="font-medium">No developers found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search</p>
              </div>
            )}
          </div>
          {/* Sidebar: Trending Tags */}
          <aside className="space-y-4">
            <div className="bg-white rounded-xl border border-border card-shadow p-4 sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Trending Tags</h3>
              </div>
              <div className="space-y-0.5">
                {trending?.map((tag) => (
                  <button
                    key={tag.tag}
                    data-testid={`tag-${tag.tag}`}
                    onClick={() => setSkillFilter(tag.tag)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors text-left group"
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{tag.tag}</span>
                    <span className="text-xs font-semibold text-primary">{tag.count}</span>
                  </button>
                ))}
                {!trending?.length && (
                  <p className="text-xs text-muted-foreground px-2 py-1">No tags yet</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
