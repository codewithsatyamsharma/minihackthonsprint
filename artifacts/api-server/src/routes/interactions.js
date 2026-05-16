import { Router, IRouter } from "express";
import { db, likesTable, savesTable, projectsTable, postsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { ToggleLikeBody, ToggleSaveBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { enrichProject } from "./projects";
import { enrichPost } from "./posts";
const router = Router();
router.post("/interactions/like", requireAuth, async (req, res) => {
  const parsed = ToggleLikeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { targetType, targetId } = parsed.data;
  const userId = req.user!.userId;
  const [existing] = await db
    .select()
    .from(likesTable)
    .where(and(
      eq(likesTable.userId, userId),
      eq(likesTable.targetType, targetType),
      eq(likesTable.targetId, targetId)
    ));
  let active;
  if (existing) {
    await db.delete(likesTable).where(eq(likesTable.id, existing.id));
    active = false;
  } else {
    await db.insert(likesTable).values({ userId, targetType, targetId });
    active = true;
  }
  const [countResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(likesTable)
    .where(and(eq(likesTable.targetType, targetType), eq(likesTable.targetId, targetId)));
  res.json({ active, count: countResult?.count ?? 0 });
});
router.post("/interactions/save", requireAuth, async (req, res) => {
  const parsed = ToggleSaveBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { targetType, targetId } = parsed.data;
  const userId = req.user!.userId;
  const [existing] = await db
    .select()
    .from(savesTable)
    .where(and(
      eq(savesTable.userId, userId),
      eq(savesTable.targetType, targetType),
      eq(savesTable.targetId, targetId)
    ));
  let active;
  if (existing) {
    await db.delete(savesTable).where(eq(savesTable.id, existing.id));
    active = false;
  } else {
    await db.insert(savesTable).values({ userId, targetType, targetId });
    active = true;
  }
  const [countResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(savesTable)
    .where(and(eq(savesTable.targetType, targetType), eq(savesTable.targetId, targetId)));
  res.json({ active, count: countResult?.count ?? 0 });
});
router.get("/interactions/saved", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const saves = await db
    .select()
    .from(savesTable)
    .where(eq(savesTable.userId, userId))
    .orderBy(sql`${savesTable.createdAt} desc`);
  const items = await Promise.all(saves.map(async (save) => {
    if (save.targetType === "project") {
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, save.targetId));
      return {
        id: save.id,
        targetType: save.targetType,
        targetId: save.targetId,
        project: project ? await enrichProject(project, userId) : null,
        post,
        createdAt: save.createdAt,
      };
    } else {
      const [post] = await db.select().from(postsTable).where(eq(postsTable.id, save.targetId));
      return {
        id: save.id,
        targetType: save.targetType,
        targetId: save.targetId,
        project,
        post: post ? await enrichPost(post, userId) : null,
        createdAt: save.createdAt,
      };
    }
  }));
  res.json({ items });
});
export default router;