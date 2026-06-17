import { Router } from "express";
import { db } from "@workspace/db";
import { reelsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

router.get("/reels", async (req, res) => {
  try {
    const reels = await db.select().from(reelsTable).orderBy(sql`${reelsTable.createdAt} desc`).limit(15);
    res.json({
      items: reels.map(r => ({
        id: String(r.id),
        thumbnailUrl: r.thumbnailUrl,
        videoUrl: r.videoUrl ?? null,
        emotionTag: r.emotionTag,
        resonanceCount: r.resonanceCount,
        durationSeconds: r.durationSeconds,
        description: r.description ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
      nextCursor: null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list reels");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/reels/:reelId/resonate", async (req, res) => {
  const reelId = parseInt(req.params.reelId);
  if (isNaN(reelId)) return res.status(400).json({ error: "Invalid reel id" });
  try {
    const [updated] = await db.update(reelsTable)
      .set({ resonanceCount: sql`${reelsTable.resonanceCount} + 1` })
      .where(eq(reelsTable.id, reelId))
      .returning({ resonanceCount: reelsTable.resonanceCount });
    if (!updated) return res.status(404).json({ error: "Reel not found" });
    res.json({ newCount: updated.resonanceCount });
  } catch (err) {
    req.log.error({ err }, "Failed to resonate reel");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
