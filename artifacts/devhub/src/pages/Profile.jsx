import { useState } from "react";
import { Link } from "wouter";
import {
  useGetUserByUsername, getGetUserByUsernameQueryKey,
  useGetUserProjects, getGetUserProjectsQueryKey,
  useGetUserPosts, getGetUserPostsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/shared/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, Globe, Calendar, Code2, BookOpen, Settings, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
export default function Profile({ username }) {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("projects");
  const { data, isLoading } = useGetUserByUsername(username, {
    query: { queryKey: getGetUserByUsernameQueryKey(username) }
  });
  const { data: projects } = useGetUserProjects(username, {
    query: { queryKey: getGetUserProjectsQueryKey(username) }
  });
  const { data: posts } = useGetUserPosts(username, {
    query: { queryKey: getGetUserPostsQueryKey(username) }
  });
  const profile = data;
  const isOwn = currentUser?.username === username;
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="flex gap-4 -mt-8 px-6">
            <Skeleton className="h-20 w-20 rounded-full border-4 border-white" />
            <div className="space-y-2 pt-6 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  if (!profile) {
    return (
      <Layout>
        <div className="py-20 text-center text-muted-foreground">
          <p className="text-lg font-semibold">User not found</p>
          <p className="text-sm mt-1">@{username} doesn't exist on DevHub</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-0">
        {/* Banner */}
        <div
          className="h-44 rounded-t-2xl overflow-hidden"
          style={
            profile.bannerUrl
              ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "linear-gradient(135deg, hsl(15 64% 58% / 0.15) 0%, hsl(15 64% 58% / 0.05) 50%, hsl(35 80% 92%) 100%)" }
          }
        />
        {/* Profile card */}
        <div className="bg-white border-x border-b border-border rounded-b-2xl card-shadow">
          <div className="px-6 md:px-8 pb-6">
            {/* Avatar + actions row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage src={profile.avatarUrl ?? ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {profile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwn && (
                <Link href="/settings">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-sm font-medium hover:bg-muted transition-colors">
                    <Settings className="h-3.5 w-3.5" /> Edit Profile
                  </button>
                </Link>
              )}
            </div>
            {/* Name & handle */}
            <h1 className="text-xl font-bold text-foreground">{profile.displayName ?? profile.username}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-foreground leading-relaxed mt-3 max-w-xl">{profile.bio}</p>
            )}
            {/* Links & meta */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {profile.githubUsername && (
                <a href={`https://github.com/${profile.githubUsername}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Github className="h-4 w-4" /> {profile.githubUsername}
                </a>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                  <Globe className="h-4 w-4" /> {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
              </span>
            </div>
            {/* Stats */}
            <div className="flex gap-5 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="font-semibold">{profile.projectCount}</span>
                <span className="text-muted-foreground">projects</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-semibold">{profile.postCount}</span>
                <span className="text-muted-foreground">articles</span>
              </div>
            </div>
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {profile.skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Tabs */}
          <div className="flex border-t border-border px-6 md:px-8">
            {(["projects", "posts"]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-1 py-3 mr-6 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "projects" ? `Projects (${profile.projectCount})` : `Articles (${profile.postCount})`}
              </button>
            ))}
          </div>
        </div>
        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "projects" ? (
            projects && projects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    data-testid={`card-project-${project.id}`}
                    className="bg-white rounded-xl border border-border card-shadow hover:border-primary/30 transition-all p-5"
                  >
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors mb-1.5">
                        {project.title}
                      </h3>
                    </Link>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.techStack?.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{tech}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {project.likeCount ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <Code2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isOwn ? "You haven't created any projects yet." : "No projects yet."}</p>
                {isOwn && (
                  <Link href="/projects/new">
                    <button className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                      Add your first project
                    </button>
                  </Link>
                )}
              </div>
            )
          ) : (
            posts && posts.length > 0 ? (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    data-testid={`card-post-${post.id}`}
                    className="bg-white rounded-xl border border-border card-shadow hover:border-primary/30 transition-all p-4"
                  >
                    <Link href={`/blog/${post.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{post.title}</h3>
                    </Link>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags?.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{isOwn ? "You haven't written any articles yet." : "No articles yet."}</p>
                {isOwn && (
                  <Link href="/blog/new">
                    <button className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                      Write your first article
                    </button>
                  </Link>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
