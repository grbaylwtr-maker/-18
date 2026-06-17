import { Router } from "express";
import { db } from "@workspace/db";
import {
  taleCommentsTable,
  talesTable,
  expressionsTable,
  galaxyMessagesTable,
  galaxiesTable,
} from "@workspace/db";
import { desc, gte, sql } from "drizzle-orm";

const router = Router();

router.get("/activity", async (req, res) => {
  try {
    const sinceRaw = typeof req.query.since === "string" ? req.query.since : null;
    const since = sinceRaw ? new Date(sinceRaw) : new Date(Date.now() - 5 * 60 * 1000);

    const events: Array<{
      id: string;
      type: string;
      label: string;
      color: string;
      href: string;
      timestamp: string;
    }> = [];

    const [comments, expressions, messages] = await Promise.all([
      db
        .select({
          id: taleCommentsTable.id,
          taleId: taleCommentsTable.taleId,
          content: taleCommentsTable.content,
          spectralColor: taleCommentsTable.spectralColor,
          createdAt: taleCommentsTable.createdAt,
          taleTitle: talesTable.title,
        })
        .from(taleCommentsTable)
        .leftJoin(talesTable, sql`${taleCommentsTable.taleId} = ${talesTable.id}`)
        .where(gte(taleCommentsTable.createdAt, since))
        .orderBy(desc(taleCommentsTable.createdAt))
        .limit(10),

      db
        .select()
        .from(expressionsTable)
        .where(gte(expressionsTable.createdAt, since))
        .orderBy(desc(expressionsTable.createdAt))
        .limit(10),

      db
        .select({
          id: galaxyMessagesTable.id,
          galaxyId: galaxyMessagesTable.galaxyId,
          content: galaxyMessagesTable.content,
          spectralColor: galaxyMessagesTable.spectralColor,
          createdAt: galaxyMessagesTable.createdAt,
          galaxyName: galaxiesTable.name,
          galaxyColor: galaxiesTable.color,
        })
        .from(galaxyMessagesTable)
        .leftJoin(galaxiesTable, sql`${galaxyMessagesTable.galaxyId} = ${galaxiesTable.id}`)
        .where(gte(galaxyMessagesTable.createdAt, since))
        .orderBy(desc(galaxyMessagesTable.createdAt))
        .limit(10),
    ]);

    for (const c of comments) {
      events.push({
        id: `comment-${c.id}`,
        type: "comment",
        label: `تعليق جديد على "${c.taleTitle ?? "حكاية"}"`,
        color: c.spectralColor,
        href: `/tales`,
        timestamp: c.createdAt.toISOString(),
      });
    }

    for (const e of expressions) {
      events.push({
        id: `expression-${e.id}`,
        type: "expression",
        label: `تعبير جديد: "${e.title}"`,
        color: e.color,
        href: `/expression`,
        timestamp: e.createdAt.toISOString(),
      });
    }

    for (const m of messages) {
      events.push({
        id: `msg-${m.id}`,
        type: "galaxy_message",
        label: `رسالة في ${m.galaxyName ?? "مجرة"}`,
        color: m.galaxyColor ?? "#FDE047",
        href: `/galaxy/${m.galaxyId}`,
        timestamp: m.createdAt.toISOString(),
      });
    }

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ events: events.slice(0, 20), total: events.length });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch activity");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
