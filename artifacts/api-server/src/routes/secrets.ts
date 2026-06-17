import { Router } from "express";
import { db } from "@workspace/db";
import { secretsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { SendSecretBody } from "@workspace/api-zod";

const router = Router();

router.post("/secrets", async (req, res) => {
  const parse = SendSecretBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { content } = parse.data;
  try {
    await db.insert(secretsTable).values({ content });
    res.status(201).json({
      sent: true,
      message: "سرك أُطلق في الفراغ الكوني",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send secret");
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/secrets/receive", async (req, res) => {
  try {
    const [secret] = await db.select().from(secretsTable)
      .where(eq(secretsTable.isRead, false))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    if (!secret) {
      return res.json({
        id: "void",
        content: "الفراغ هادئ اليوم... لم يصل إليك أي سر بعد",
        receivedAt: new Date().toISOString(),
      });
    }
    await db.update(secretsTable).set({ isRead: true }).where(eq(secretsTable.id, secret.id));
    res.json({
      id: String(secret.id),
      content: secret.content,
      receivedAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to receive secret");
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
