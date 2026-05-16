import { useState } from "react";
import { Link } from "wouter";
import {
  useListProjects, getListProjectsQueryKey,
  useToggleLike, useToggleSave, getGetProjectQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { ProjectCard } from "@/features/projects/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
export default function Projects() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const qc = useQueryClient();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const { data, isLoading } = useListProjects(
    { search: search || undefined, tech: techFilter || undefined },
    { query: { queryKey: getListProjectsQueryKey({ search: search || undefined, tech: techFilter || undefined }) } }
  );
  const handleLike = (id) => {
    if (!user) return;
    toggleLike.mutate({ data: { targetType: "project", targetId: id } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
        qc.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
      },
    });
  };
  const handleSave = (id) => {
    if (!user) return;
    toggleSave.mutate({ data: { targetType: "project", targetId: id } }, {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListProjectsQueryKey() }),
    });
  };
  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {data?.projects?.length ?? 0} projects from the community
            </p>
          </div>
          {user && (
            <Link href="/projects/new">
              <button
                data-testid="button-new-project"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" /> New Project
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
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              data-testid="input-tech-filter"
              placeholder="Filter by tech..."
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="w-44 pl-9 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
        {techFilter && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filtered by:</span>
            <button
              onClick={() => setTechFilter("")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              {techFilter} ×
            </button>
          </div>
        )}
        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-border p-5 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-5 w-14 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.projects?.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onLike={handleLike}
                onSave={handleSave}
                onTechClick={setTechFilter}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">No projects found</p>
            <p className="text-sm text-muted-foreground mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
