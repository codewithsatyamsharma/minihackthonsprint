import { Router, IRouter } from "express";
import { db, projectsTable, usersTable, likesTable, savesTable } from "@workspace/db";
import { eq, ilike, sql, and } from "drizzle-orm";
import {
  ListProjectsQueryParams,
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import { formatUser } from "./users";
const router = Router();
async function enrichProject(project: typeof projectsTable.$inferSelect, userId?) {
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, project.userId));
  const [likeCountResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(likesTable)
    .where(and(eq(likesTable.targetType, "project"), eq(likesTable.targetId, project.id)));
  const [saveCountResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(savesTable)
    .where(and(eq(savesTable.targetType, "project"), eq(savesTable.targetId, project.id)));
  let isLiked = null;
  let isSaved = null;
  if (userId) {
    const [like] = await db
      .select()
      .from(likesTable)
      .where(and(eq(likesTable.userId, userId), eq(likesTable.targetType, "project"), eq(likesTable.targetId, project.id)));
    isLiked = !!like;
    const [save] = await db
      .select()
      .from(savesTable)
      .where(and(eq(savesTable.userId, userId), eq(savesTable.targetType, "project"), eq(savesTable.targetId, project.id)));
    isSaved = !!save;
  }
  return {
    ...project,
    techStack: project.techStack ?? [],
    likeCount: likeCountResult?.count ?? 0,
    saveCount: saveCountResult?.count ?? 0,
    isLiked,
    isSaved,
    author: author ? formatUser(author) : null,
  };
}
router.get("/projects", optionalAuth, async (req, res) => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { tech, search, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;
  let allProjects = await db.select().from(projectsTable).orderBy(sql`${projectsTable.createdAt} desc`);
  if (tech) {
    allProjects = allProjects.filter(p => (p.techStack ?? []).some(t => t.toLowerCase() === tech.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    allProjects = allProjects.filter(p =>
      p.title.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
    );
  }
  const paginated = allProjects.slice(offset, offset + limit);
  const enriched = await Promise.all(paginated.map(p => enrichProject(p, req.user?.userId)));
  res.json({ projects, total: allProjects.length, page, limit });
});
router.post("/projects", requireAuth, async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [project] = await db
    .insert(projectsTable)
    .values({ ...parsed.data, userId: req.user!.userId, techStack: parsed.data.techStack ?? [] })
    .returning();
  res.status(201).json(await enrichProject(project, req.user!.userId));
});
router.get("/projects/:id", optionalAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProjectParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, params.data.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(await enrichProject(project, req.user?.userId));
});
router.patch("/projects/:id", requireAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateProjectParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  if (existing.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const updateData = {};
  const { title, description, techStack, githubUrl, liveUrl, imageUrl } = parsed.data;
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (techStack !== undefined) updateData.techStack = techStack;
  if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
  if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  const [updated] = await db
    .update(projectsTable)
    .set(updateData)
    .where(eq(projectsTable.id, params.data.id))
    .returning();
  res.json(await enrichProject(updated, req.user!.userId));
});
router.delete("/projects/:id", requireAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProjectParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }
  const [existing] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  if (existing.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id));
  res.sendStatus(204);
});
export { enrichProject };
export default router;