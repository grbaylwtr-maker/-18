import { Router } from "express";
import { db } from "@workspace/db";
import { pollsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateGalaxyPollBody, VoteOnPollBody } from "@workspace/api-zod";

interface PollOptionRow {
  id: string;
  text: string;
  votes: number;
}

const router = Router();

router.get("/galaxies/:galaxyId/polls", async (req, res) => {
  const galaxyId = parseInt(req.params.galaxyId);
  if (isNaN(galaxyId)) return res.status(400).json({ error: "Invalid galaxy id" });
  try {
    const polls = await db.select().from(pollsTable)
      .where(eq(pollsTable.galaxyId, galaxyId))
      .orderBy(sql`${pollsTable.createdAt} desc`)
      .limit(20);
    res.json(polls.map(p => ({
      id: String(p.id),
      galaxyId: String(p.galaxyId),
      question: p.question,
      options: (p.options as PollOptionRow[]) ?? [],
      totalVotes: p.totalVotes,
      endsAt: p.endsAt ? p.endsAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get polls");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/galaxies/:galaxyId/polls", async (req, res) => {
  const galaxyId = parseInt(req.params.galaxyId);
  if (isNaN(galaxyId)) return res.status(400).json({ error: "Invalid galaxy id" });
  const parse = CreateGalaxyPollBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { question, options, endsInHours } = parse.data;
  try {
    const optionRows: PollOptionRow[] = options.map((text, i) => ({
      id: `opt-${i + 1}`,
      text,
      votes: 0,
    }));
    const endsAt = endsInHours ? new Date(Date.now() + endsInHours * 3600000) : null;
    const [poll] = await db.insert(pollsTable).values({
      galaxyId,
      question,
      options: optionRows,
      endsAt,
    }).returning();
    res.status(201).json({
      id: String(poll.id),
      galaxyId: String(poll.galaxyId),
      question: poll.question,
      options: (poll.options as PollOptionRow[]) ?? [],
      totalVotes: poll.totalVotes,
      endsAt: poll.endsAt ? poll.endsAt.toISOString() : null,
      createdAt: poll.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create poll");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/polls/:pollId/vote", async (req, res) => {
  const pollId = parseInt(req.params.pollId);
  if (isNaN(pollId)) return res.status(400).json({ error: "Invalid poll id" });
  const parse = VoteOnPollBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { optionId } = parse.data;
  try {
    const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, pollId)).limit(1);
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    const options = (poll.options as PollOptionRow[]).map(o =>
      o.id === optionId ? { ...o, votes: o.votes + 1 } : o
    );
    const [updated] = await db.update(pollsTable)
      .set({ options, totalVotes: sql`${pollsTable.totalVotes} + 1` })
      .where(eq(pollsTable.id, pollId))
      .returning();
    res.json({
      id: String(updated.id),
      galaxyId: String(updated.galaxyId),
      question: updated.question,
      options: (updated.options as PollOptionRow[]) ?? [],
      totalVotes: updated.totalVotes,
      endsAt: updated.endsAt ? updated.endsAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to vote");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
