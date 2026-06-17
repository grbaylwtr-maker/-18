import { Router } from "express";
import { db } from "@workspace/db";
import { talesTable, galaxiesTable, expressionsTable } from "@workspace/db";
import { ilike, or, sql } from "drizzle-orm";

const router = Router();

router.get("/search", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q || q.length < 2) return res.json({ tales: [], galaxies: [], expressions: [], total: 0 });
  const dim = typeof req.query.dimension === "string" ? req.query.dimension : null;
  const pattern = `%${q}%`;
  try {
    const [tales, galaxies, expressions] = await Promise.all([
      (!dim || dim === "tales")
        ? db.select().from(talesTable)
          .where(or(ilike(talesTable.title, pattern), ilike(talesTable.content, pattern)))
          .limit(10)
        : Promise.resolve([]),
      (!dim || dim === "galaxy")
        ? db.select().from(galaxiesTable)
          .where(or(ilike(galaxiesTable.name, pattern), ilike(galaxiesTable.description, pattern)))
          .limit(10)
        : Promise.resolve([]),
      (!dim || dim === "expression")
        ? db.select().from(expressionsTable)
          .where(or(ilike(expressionsTable.title, pattern), ilike(expressionsTable.description, pattern)))
          .limit(10)
        : Promise.resolve([]),
    ]);

    const mappedTales = tales.map((t) => ({
      id: String(t.id),
      title: t.title,
      content: t.content,
      genre: t.genre,
      pulseCount: t.pulseCount,
      commentCount: t.commentCount,
      excerpt: t.content.slice(0, 150) + (t.content.length > 150 ? "..." : ""),
      createdAt: t.createdAt.toISOString(),
    }));
    const mappedGalaxies = galaxies.map((g) => ({
      id: String(g.id),
      name: g.name,
      category: g.category,
      memberCount: g.memberCount,
      color: g.color,
      description: g.description,
      isLive: g.isLive,
    }));
    const mappedExpressions = expressions.map((e) => ({
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
    }));

    res.json({
      tales: mappedTales,
      galaxies: mappedGalaxies,
      expressions: mappedExpressions,
      total: mappedTales.length + mappedGalaxies.length + mappedExpressions.length,
    });
  } catch (err) {
    req.log.error({ err }, "Search failed");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
