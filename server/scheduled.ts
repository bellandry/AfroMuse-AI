import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { processPendingGenerations } from "./services/generations";

export async function processGenerationsHeartbeat(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const result = await processPendingGenerations(10);
    return res.json({ ok: true, taskUid: user.taskUid, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Scheduled:generations]", error);
    return res.status(500).json({ error: message, timestamp: new Date().toISOString() });
  }
}
