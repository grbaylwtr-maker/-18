import { Router } from "express";
import { db } from "@workspace/db";
import { expressionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateExpressionBody } from "@workspace/api-zod";

const router = Router();

const mapExpression = (e: typeof expressionsTable.$inferSelect) => ({
  id: String(e.id),
  type: e.type,
  title: e.title,
  description: e.description ?? null,
  color: e.color,
  imageUrl: e.imageUrl ?? null,
  content: e.content ?? null,
  spectralAuthor: e.spectralAuthor ?? null,
  resonanceCount: e.resonanceCount,
  size: e.size ?? null,
  createdAt: e.createdAt.toISOString(),
});

router.get("/expressions", async (req, res) => {
  try {
    const type = typeof req.query.type === "string" ? req.query.type : null;
    let query = db.select().from(expressionsTable).orderBy(sql`${expressionsTable.createdAt} desc`).limit(30);
    const rows = await query;
    const filtered = type ? rows.filter(e => e.type === type) : rows;
    res.json({ items: filtered.map(mapExpression), nextCursor: null });
  } catch (err) {
    req.log.error({ err }, "Failed to list expressions");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/expressions", async (req, res) => {
  const parse = CreateExpressionBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { type, title, description, color, imageUrl, content, size } = parse.data;
  try {
    const SPECTRAL_AUTHORS = ["طيف ذهبي", "طيف وردي", "طيف بنفسجي", "طيف زمردي", "طيف مرجاني", "طيف فضي"];
    const spectralAuthor = SPECTRAL_AUTHORS[Math.floor(Math.random() * SPECTRAL_AUTHORS.length)];
    const [expr] = await db.insert(expressionsTable).values({
      type: type ?? "visual",
      title,
      description: description ?? null,
      color,
      imageUrl: imageUrl ?? null,
      content: content ?? null,
      spectralAuthor,
      size: size ?? "medium",
    }).returning();
    res.status(201).json(mapExpression(expr));
  } catch (err) {
    req.log.error({ err }, "Failed to create expression");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/expressions/:expressionId/resonate", async (req, res) => {
  const exprId = parseInt(req.params.expressionId);
  if (isNaN(exprId)) return res.status(400).json({ error: "Invalid expression id" });
  try {
    const [updated] = await db.update(expressionsTable)
      .set({ resonanceCount: sql`${expressionsTable.resonanceCount} + 1` })
      .where(eq(expressionsTable.id, exprId))
      .returning({ resonanceCount: expressionsTable.resonanceCount });
    if (!updated) return res.status(404).json({ error: "Expression not found" });
    res.json({ newCount: updated.resonanceCount });
  } catch (err) {
    req.log.error({ err }, "Failed to resonate expression");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
