import { Router, IRouter } from "express";
import { db, postsTable, usersTable, likesTable, savesTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import {
  ListPostsQueryParams,
  CreatePostBody,
  UpdatePostBody,
  GetPostParams,
  UpdatePostParams,
  DeletePostParams,
} from "@workspace/api-zod";
import { requireAuth, optionalAuth } from "../middlewares/auth";
import { formatUser } from "./users";
const router = Router();
async function enrichPost(post: typeof postsTable.$inferSelect, userId?) {
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, post.userId));
  const [likeCountResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(likesTable)
    .where(and(eq(likesTable.targetType, "post"), eq(likesTable.targetId, post.id)));
  const [saveCountResult] = await db
    .select({ count: sql`count(*)::int` })
    .from(savesTable)
    .where(and(eq(savesTable.targetType, "post"), eq(savesTable.targetId, post.id)));
  let isLiked = null;
  let isSaved = null;
  if (userId) {
    const [like] = await db
      .select()
      .from(likesTable)
      .where(and(eq(likesTable.userId, userId), eq(likesTable.targetType, "post"), eq(likesTable.targetId, post.id)));
    isLiked = !!like;
    const [save] = await db
      .select()
      .from(savesTable)
      .where(and(eq(savesTable.userId, userId), eq(savesTable.targetType, "post"), eq(savesTable.targetId, post.id)));
    isSaved = !!save;
  }
  return {
    ...post,
    tags: post.tags ?? [],
    likeCount: likeCountResult?.count ?? 0,
    saveCount: saveCountResult?.count ?? 0,
    isLiked,
    isSaved,
    author: author ? formatUser(author) : null,
  };
}
router.get("/posts", optionalAuth, async (req, res) => {
  const parsed = ListPostsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { tag, search, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;
  let allPosts = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.published, true))
    .orderBy(sql`${postsTable.createdAt} desc`);
  if (tag) {
    allPosts = allPosts.filter(p => (p.tags ?? []).some(t => t.toLowerCase() === tag.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    allPosts = allPosts.filter(p =>
      p.title.toLowerCase().includes(q) || (p.content ?? "").toLowerCase().includes(q)
    );
  }
  const paginated = allPosts.slice(offset, offset + limit);
  const enriched = await Promise.all(paginated.map(p => enrichPost(p, req.user?.userId)));
  res.json({ posts, total: allPosts.length, page, limit });
});
router.post("/posts", requireAuth, async (req, res) => {
  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [post] = await db
    .insert(postsTable)
    .values({ ...parsed.data, userId: req.user!.userId, tags: parsed.data.tags ?? [] })
    .returning();
  res.status(201).json(await enrichPost(post, req.user!.userId));
});
router.get("/posts/:id", optionalAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetPostParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }
  const [post] = await db
    .select()
    .from(postsTable)
    .where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  res.json(await enrichPost(post, req.user?.userId));
});
router.patch("/posts/:id", requireAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdatePostParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }
  const parsed = UpdatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (existing.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const updateData = {};
  const { title, content, tags, category, published } = parsed.data;
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (tags !== undefined) updateData.tags = tags;
  if (category !== undefined) updateData.category = category;
  if (published !== undefined) updateData.published = published;
  const [updated] = await db
    .update(postsTable)
    .set(updateData)
    .where(eq(postsTable.id, params.data.id))
    .returning();
  res.json(await enrichPost(updated, req.user!.userId));
});
router.delete("/posts/:id", requireAuth, async (req, res) => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePostParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid post ID" });
    return;
  }
  const [existing] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }
  if (existing.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(postsTable).where(eq(postsTable.id, params.data.id));
  res.sendStatus(204);
});
export { enrichPost };
export default router;