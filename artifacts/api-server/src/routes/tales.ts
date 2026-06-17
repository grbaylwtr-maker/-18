import { Router } from "express";
import { db } from "@workspace/db";
import { talesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateTaleBody, AddTaleCommentBody } from "@workspace/api-zod";

const router = Router();

router.get("/tales", async (req, res) => {
  try {
    const tales = await db.select().from(talesTable).orderBy(sql`${talesTable.createdAt} desc`).limit(20);
    res.json({
      items: tales.map(t => ({
        id: String(t.id),
        title: t.title,
        content: t.content,
        genre: t.genre,
        pulseCount: t.pulseCount,
        commentCount: t.commentCount,
        excerpt: t.content.slice(0, 150) + (t.content.length > 150 ? "..." : ""),
        createdAt: t.createdAt.toISOString(),
      })),
      nextCursor: null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list tales");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/tales", async (req, res) => {
  const parse = CreateTaleBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { title, content, genre } = parse.data;
  try {
    const [tale] = await db.insert(talesTable).values({ title, content, genre }).returning();
    res.status(201).json({
      id: String(tale.id),
      title: tale.title,
      content: tale.content,
      genre: tale.genre,
      pulseCount: tale.pulseCount,
      commentCount: tale.commentCount,
      excerpt: tale.content.slice(0, 150),
      createdAt: tale.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create tale");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/tales/:taleId/pulse", async (req, res) => {
  const taleId = parseInt(req.params.taleId);
  if (isNaN(taleId)) return res.status(400).json({ error: "Invalid tale id" });
  try {
    const [updated] = await db.update(talesTable)
      .set({ pulseCount: sql`${talesTable.pulseCount} + 1` })
      .where(eq(talesTable.id, taleId))
      .returning({ pulseCount: talesTable.pulseCount });
    if (!updated) return res.status(404).json({ error: "Tale not found" });
    res.json({ newCount: updated.pulseCount });
  } catch (err) {
    req.log.error({ err }, "Failed to pulse tale");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
