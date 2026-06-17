import { Router } from "express";
import { db } from "@workspace/db";
import { taleCommentsTable, talesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { AddTaleCommentBody } from "@workspace/api-zod";

const router = Router();

router.get("/tales/:taleId/comments", async (req, res) => {
  const taleId = parseInt(req.params.taleId);
  if (isNaN(taleId)) return res.status(400).json({ error: "Invalid tale id" });
  try {
    const comments = await db.select().from(taleCommentsTable)
      .where(eq(taleCommentsTable.taleId, taleId))
      .orderBy(taleCommentsTable.createdAt)
      .limit(100);
    res.json(comments.map(c => ({
      id: String(c.id),
      taleId: String(c.taleId),
      content: c.content,
      spectralColor: c.spectralColor,
      createdAt: c.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get tale comments");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/tales/:taleId/comments", async (req, res) => {
  const taleId = parseInt(req.params.taleId);
  if (isNaN(taleId)) return res.status(400).json({ error: "Invalid tale id" });
  const parse = AddTaleCommentBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { content, spectralColor } = parse.data;
  try {
    const [comment] = await db.insert(taleCommentsTable).values({
      taleId,
      content,
      spectralColor: spectralColor ?? "#C4B5FD",
    }).returning();
    await db.update(talesTable)
      .set({ commentCount: sql`${talesTable.commentCount} + 1` })
      .where(eq(talesTable.id, taleId));
    res.status(201).json({
      id: String(comment.id),
      taleId: String(comment.taleId),
      content: comment.content,
      spectralColor: comment.spectralColor,
      createdAt: comment.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to add comment");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
