import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/lib/auth";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Explore from "@/pages/Explore";
import SearchPage from "@/pages/SearchPage";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import ProjectForm from "@/pages/ProjectForm";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import BlogForm from "@/pages/BlogForm";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Saved from "@/pages/Saved";
import NotFound from "@/pages/not-found";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/explore" component={Explore} />
      <Route path="/search" component={SearchPage} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/new" component={() => <ProjectForm />} />
      <Route path="/projects/:id/edit" component={({ params }) => <ProjectForm id={params.id} />} />
      <Route path="/projects/:id" component={({ params }) => <ProjectDetail id={params.id} />} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/new" component={() => <BlogForm />} />
      <Route path="/blog/:id/edit" component={({ params }) => <BlogForm id={params.id} />} />
      <Route path="/blog/:id" component={({ params }) => <BlogDetail id={params.id} />} />
      <Route path="/profile/:username" component={({ params }) => <Profile username={params.username} />} />
      <Route path="/settings" component={Settings} />
      <Route path="/saved" component={Saved} />
      <Route component={NotFound} />
    </Switch>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;
