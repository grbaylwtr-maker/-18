import { Router } from "express";
import { db } from "@workspace/db";
import { galaxiesTable, galaxyMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateGalaxyBody, SendGalaxyMessageBody } from "@workspace/api-zod";

const router = Router();

router.get("/galaxies", async (req, res) => {
  try {
    const { category } = req.query;
    const galaxies = await db.select().from(galaxiesTable).orderBy(galaxiesTable.memberCount);
    const filtered = category
      ? galaxies.filter(g => g.category === category)
      : galaxies;
    res.json(filtered.map(g => ({
      id: String(g.id),
      name: g.name,
      category: g.category,
      memberCount: g.memberCount,
      color: g.color,
      description: g.description,
      isLive: g.isLive,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list galaxies");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/galaxies", async (req, res) => {
  const parse = CreateGalaxyBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { name, category, description, color } = parse.data;
  try {
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const [galaxy] = await db.insert(galaxiesTable).values({
      slug,
      name,
      category,
      description,
      color: color ?? "#C4B5FD",
      memberCount: 1,
      isLive: true,
    }).returning();
    res.status(201).json({
      id: String(galaxy.id),
      name: galaxy.name,
      category: galaxy.category,
      memberCount: galaxy.memberCount,
      color: galaxy.color,
      description: galaxy.description,
      isLive: galaxy.isLive,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create galaxy");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/galaxies/:galaxyId/messages", async (req, res) => {
  const galaxyId = parseInt(req.params.galaxyId);
  if (isNaN(galaxyId)) return res.status(400).json({ error: "Invalid galaxy id" });
  try {
    const messages = await db.select().from(galaxyMessagesTable)
      .where(eq(galaxyMessagesTable.galaxyId, galaxyId))
      .orderBy(galaxyMessagesTable.createdAt)
      .limit(50);
    res.json({ messages: messages.map(m => ({
      id: String(m.id),
      galaxyId: String(m.galaxyId),
      content: m.content,
      spectralColor: m.spectralColor,
      createdAt: m.createdAt.toISOString(),
    })) });
  } catch (err) {
    req.log.error({ err }, "Failed to get galaxy messages");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/galaxies/:galaxyId/messages", async (req, res) => {
  const galaxyId = parseInt(req.params.galaxyId);
  if (isNaN(galaxyId)) return res.status(400).json({ error: "Invalid galaxy id" });
  const parse = SendGalaxyMessageBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { content, spectralColor } = parse.data;
  try {
    const [msg] = await db.insert(galaxyMessagesTable).values({
      galaxyId,
      content,
      spectralColor: spectralColor ?? "#C4B5FD",
    }).returning();
    res.status(201).json({
      id: String(msg.id),
      galaxyId: String(msg.galaxyId),
      content: msg.content,
      spectralColor: msg.spectralColor,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
