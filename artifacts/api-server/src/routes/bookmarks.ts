import { Router } from "express";
import { db } from "@workspace/db";
import { bookmarksTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { AddBookmarkBody } from "@workspace/api-zod";

const router = Router();

router.get("/bookmarks", async (req, res) => {
  const { spectralToken } = req.query;
  if (!spectralToken || typeof spectralToken !== "string") {
    return res.status(400).json({ error: "spectralToken required" });
  }
  try {
    const bookmarks = await db.select().from(bookmarksTable)
      .where(eq(bookmarksTable.spectralToken, spectralToken))
      .orderBy(sql`${bookmarksTable.createdAt} desc`)
      .limit(100);
    res.json(bookmarks.map(b => ({
      id: String(b.id),
      contentType: b.contentType,
      contentId: b.contentId,
      title: b.title ?? null,
      excerpt: b.excerpt ?? null,
      createdAt: b.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list bookmarks");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/bookmarks", async (req, res) => {
  const parse = AddBookmarkBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { contentType, contentId, spectralToken, title, excerpt } = parse.data;
  try {
    const [bookmark] = await db.insert(bookmarksTable).values({
      spectralToken,
      contentType,
      contentId,
      title: title ?? null,
      excerpt: excerpt ?? null,
    }).returning();
    res.status(201).json({
      id: String(bookmark.id),
      contentType: bookmark.contentType,
      contentId: bookmark.contentId,
      title: bookmark.title ?? null,
      excerpt: bookmark.excerpt ?? null,
      createdAt: bookmark.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to add bookmark");
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/bookmarks/:bookmarkId", async (req, res) => {
  const bookmarkId = parseInt(req.params.bookmarkId);
  if (isNaN(bookmarkId)) return res.status(400).json({ error: "Invalid bookmark id" });
  try {
    await db.delete(bookmarksTable).where(eq(bookmarksTable.id, bookmarkId));
    res.json({ deleted: true });
  } catch (err) {
    req.log.error({ err }, "Failed to remove bookmark");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
