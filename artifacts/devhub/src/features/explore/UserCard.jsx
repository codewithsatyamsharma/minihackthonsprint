import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export function UserCard({ user, onSkillClick }) {
  return (
    <div
      data-testid={`card-user-${user.id}`}
      className="bg-white rounded-xl border border-border card-shadow hover:border-primary/30 hover:card-shadow-md transition-all p-4"
    >
      <Link href={`/profile/${user.username}`} className="flex items-center gap-3 mb-2 group">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatarUrl ?? ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm group-hover:text-primary transition-colors">
            {user.displayName ?? user.username}
          </p>
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </Link>
      {user.bio && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
          {user.bio}
        </p>
      )}
      {user.skills && user.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {user.skills.slice(0, 5).map((skill) => (
            <button
              key={skill}
              onClick={() => onSkillClick?.(skill)}
              className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {skill}
            </button>
          ))}
          {user.skills.length > 5 && (
            <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
              +{user.skills.length - 5}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
