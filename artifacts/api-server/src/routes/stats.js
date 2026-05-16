import { Router, IRouter } from "express";
import { db, usersTable, projectsTable, postsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { enrichProject } from "./projects";
import { enrichPost } from "./posts";
const router = Router();
router.get("/stats/feed", async (_req, res) => {
  const recentProjects = await db
    .select()
    .from(projectsTable)
    .orderBy(sql`${projectsTable.createdAt} desc`)
    .limit(10);
  const recentPosts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.published, true))
    .orderBy(sql`${postsTable.createdAt} desc`)
    .limit(10);
  const projectItems = await Promise.all(recentProjects.map(async p => ({
    type: "project",
    project: await enrichProject(p),
    post,
    createdAt: p.createdAt,
  })));
  const postItems = await Promise.all(recentPosts.map(async p => ({
    type: "post",
    project,
    post: await enrichPost(p),
    createdAt: p.createdAt,
  })));
  const allItems = [...projectItems, ...postItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 20);
  res.json({ items: allItems });
});
router.get("/stats/trending-tags", async (_req, res) => {
  const projects = await db.select({ techStack: projectsTable.techStack }).from(projectsTable);
  const posts = await db.select({ tags: postsTable.tags }).from(postsTable).where(eq(postsTable.published, true));
  const tagCounts = {};
  for (const p of projects) {
    for (const t of (p.techStack ?? [])) {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    }
  }
  for (const p of posts) {
    for (const t of (p.tags ?? [])) {
      tagCounts[t] = (tagCounts[t] ?? 0) + 1;
    }
  }
  const sorted = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  res.json(sorted);
});
router.get("/stats/summary", async (_req, res) => {
  const [userCount] = await db.select({ count: sql`count(*)::int` }).from(usersTable);
  const [projectCount] = await db.select({ count: sql`count(*)::int` }).from(projectsTable);
  const [postCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(postsTable)
    .where(eq(postsTable.published, true));
  res.json({
    userCount: userCount?.count ?? 0,
    projectCount: projectCount?.count ?? 0,
    postCount: postCount?.count ?? 0,
  });
});
export default router;