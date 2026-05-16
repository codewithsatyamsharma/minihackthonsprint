import { Router, IRouter } from "express";
import { db, usersTable, projectsTable, postsTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import { ListUsersQueryParams, UpdateProfileBody } from "@workspace/api-zod";
import { requireAuth, optionalAuth } from "../middlewares/auth";
const router = Router();
export function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    bannerUrl: user.bannerUrl,
    githubUsername: user.githubUsername,
    website: user.website,
    skills: user.skills ?? [],
    createdAt: user.createdAt,
  };
}
router.get("/users", async (req, res) => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { skill, search, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;
  let query = db.select().from(usersTable);
  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(usersTable.username, `%${search}%`),
        ilike(usersTable.displayName, `%${search}%`)
      )
    );
  }
  if (skill) {
    conditions.push(sql`${usersTable.skills} @> ARRAY[${skill}]::text[]`);
  }
  const allUsers = await (conditions.length > 0
    ? query.where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`)
    : query
  );
  const paginated = allUsers.slice(offset, offset + limit);
  res.json({
    users: paginated.map(formatUser),
    total: allUsers.length,
    page,
    limit,
  });
});
router.get("/users/:username", optionalAuth, async (req, res) => {
  const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const [projectCountResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(projectsTable)
    .where(eq(projectsTable.userId, user.id));
  const [postCountResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(postsTable)
    .where(eq(postsTable.userId, user.id));
  res.json({
    ...formatUser(user),
    projectCount: projectCountResult?.count ?? 0,
    postCount: postCountResult?.count ?? 0,
  });
});
router.get("/users/:username/projects", async (req, res) => {
  const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, user.id))
    .orderBy(sql`${projectsTable.createdAt} desc`);
  res.json(projects.map(p => ({
    ...p,
    techStack: p.techStack ?? [],
    likeCount,
    saveCount,
    isLiked,
    isSaved,
    author,
  })));
});
router.get("/users/:username/posts", async (req, res) => {
  const username = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
  const [user] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const posts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.userId, user.id))
    .orderBy(sql`${postsTable.createdAt} desc`);
  res.json(posts.map(p => ({
    ...p,
    tags: p.tags ?? [],
    likeCount,
    saveCount,
    isLiked,
    isSaved,
    author,
  })));
});
router.patch("/profile", requireAuth, async (req, res) => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData = {};
  const { displayName, bio, avatarUrl, bannerUrl, githubUsername, website, skills } = parsed.data;
  if (displayName !== undefined) updateData.displayName = displayName;
  if (bio !== undefined) updateData.bio = bio;
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
  if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl;
  if (githubUsername !== undefined) updateData.githubUsername = githubUsername;
  if (website !== undefined) updateData.website = website;
  if (skills !== undefined) updateData.skills = skills;
  const [user] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, req.user!.userId))
    .returning();
  res.json(formatUser(user));
});
export default router;