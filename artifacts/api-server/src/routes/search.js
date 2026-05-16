import { Router, IRouter } from "express";
import { db, usersTable, projectsTable, postsTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import { SearchQueryParams } from "@workspace/api-zod";
import { optionalAuth } from "../middlewares/auth";
import { formatUser } from "./users";
import { enrichProject } from "./projects";
import { enrichPost } from "./posts";
const router = Router();
router.get("/search", optionalAuth, async (req, res) => {
  const parsed = SearchQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { q, type = "all" } = parsed.data;
  const userId = req.user?.userId;
  let users = [];
  let projects = [];
  let posts = [];
  if (type === "all" || type === "users") {
    const rawUsers = await db
      .select()
      .from(usersTable)
      .where(
        or(
          ilike(usersTable.username, `%${q}%`),
          ilike(usersTable.displayName, `%${q}%`),
          sql`${usersTable.skills} && ARRAY[${q}]::text[]`
        )
      );
    users = rawUsers.map(formatUser);
  }
  if (type === "all" || type === "projects") {
    const rawProjects = await db
      .select()
      .from(projectsTable)
      .where(
        or(
          ilike(projectsTable.title, `%${q}%`),
          ilike(projectsTable.description, `%${q}%`),
          sql`${projectsTable.techStack} && ARRAY[${q}]::text[]`
        )
      )
      .orderBy(sql`${projectsTable.createdAt} desc`);
    projects = await Promise.all(rawProjects.slice(0, 20).map(p => enrichProject(p, userId)));
  }
  if (type === "all" || type === "posts") {
    const rawPosts = await db
      .select()
      .from(postsTable)
      .where(
        or(
          ilike(postsTable.title, `%${q}%`),
          ilike(postsTable.content, `%${q}%`),
          sql`${postsTable.tags} && ARRAY[${q}]::text[]`,
          eq(postsTable.published, true)
        )
      )
      .orderBy(sql`${postsTable.createdAt} desc`);
    posts = await Promise.all(
      rawPosts.filter(p => p.published).slice(0, 20).map(p => enrichPost(p, userId))
    );
  }
  res.json({ users, projects, posts });
});
export default router;