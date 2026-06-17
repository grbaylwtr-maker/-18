import { Router } from "express";
import { db } from "@workspace/db";
import { moodEntriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateMoodBody } from "@workspace/api-zod";

const router = Router();

router.get("/moods", async (req, res) => {
  const { spectralToken, limit } = req.query;
  if (!spectralToken || typeof spectralToken !== "string") {
    return res.status(400).json({ error: "spectralToken required" });
  }
  const limitNum = limit ? parseInt(String(limit)) : 30;
  try {
    const moods = await db.select().from(moodEntriesTable)
      .where(eq(moodEntriesTable.spectralToken, spectralToken))
      .orderBy(sql`${moodEntriesTable.createdAt} desc`)
      .limit(limitNum);
    res.json(moods.map(m => ({
      id: String(m.id),
      mood: m.mood,
      note: m.note ?? null,
      emotion: m.emotion ?? null,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list moods");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/moods", async (req, res) => {
  const parse = CreateMoodBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { mood, spectralToken, note, emotion } = parse.data;
  try {
    const [entry] = await db.insert(moodEntriesTable).values({
      mood,
      spectralToken,
      note: note ?? null,
      emotion: emotion ?? null,
    }).returning();
    res.status(201).json({
      id: String(entry.id),
      mood: entry.mood,
      note: entry.note ?? null,
      emotion: entry.emotion ?? null,
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create mood");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
