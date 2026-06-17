import { Router } from "express";
import { db } from "@workspace/db";
import { echoSessionsTable, echoMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { StartEchoSessionBody, SendEchoMessageBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router = Router();

router.post("/messages/echo", async (req, res) => {
  const parse = StartEchoSessionBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { spectralColor, openingThought } = parse.data;
  try {
    const sessionToken = randomUUID();
    const [session] = await db.insert(echoSessionsTable).values({
      sessionToken,
      status: "active",
      spectralColorA: spectralColor,
      spectralColorB: "#FDE047",
    }).returning();

    if (openingThought) {
      await db.insert(echoMessagesTable).values({
        sessionId: session.id,
        content: openingThought,
        senderColor: spectralColor,
      });
    }

    res.json({
      sessionId: sessionToken,
      status: "active",
      partnerSpectralColor: "#FDE047",
      createdAt: session.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to start echo session");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/messages/echo/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  try {
    const [session] = await db.select().from(echoSessionsTable)
      .where(eq(echoSessionsTable.sessionToken, sessionId));
    if (!session) return res.status(404).json({ error: "Session not found" });

    const messages = await db.select().from(echoMessagesTable)
      .where(eq(echoMessagesTable.sessionId, session.id))
      .orderBy(echoMessagesTable.createdAt);

    res.json(messages.map(m => ({
      id: String(m.id),
      sessionId,
      content: m.content,
      isMine: m.senderColor === session.spectralColorA,
      spectralColor: m.senderColor,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get echo messages");
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/messages/echo/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  const parse = SendEchoMessageBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { content } = parse.data;
  try {
    const [session] = await db.select().from(echoSessionsTable)
      .where(eq(echoSessionsTable.sessionToken, sessionId));
    if (!session) return res.status(404).json({ error: "Session not found" });

    const userColor = session.spectralColorA;
    const [msg] = await db.insert(echoMessagesTable).values({
      sessionId: session.id,
      content,
      senderColor: userColor,
    }).returning();

    res.status(201).json({
      id: String(msg.id),
      sessionId,
      content: msg.content,
      isMine: true,
      spectralColor: msg.senderColor,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send echo message");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
