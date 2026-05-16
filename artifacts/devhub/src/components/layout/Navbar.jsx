import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Code2, Compass, BookOpen, Bookmark, User, Settings, LogOut, Search } from "lucide-react";
export function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight">
              DevHub
            </span>
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/explore" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <Compass className="h-4 w-4" /> Explore
            </Link>
            <Link href="/projects" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <Code2 className="h-4 w-4" /> Projects
            </Link>
            <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Blog
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/search">
              <Button variant="outline" className="w-full justify-start text-sm text-muted-foreground md:w-40 lg:w-64">
                <Search className="mr-2 h-4 w-4" />
                Search...
              </Button>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            {user ? (
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                      {user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.username}`} className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved" className="flex items-center cursor-pointer">
                      <Bookmark className="mr-2 h-4 w-4" />
                      Saved</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
}