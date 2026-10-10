import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { providers } from "./integrations/index.js";
import { assertSafeUrl } from "./security.js";
import type { MediaFormat } from "./types.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const origin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin }));
app.use(express.json({ limit: "50kb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }));

const analyses = new Map<string, { url: string; provider: typeof providers[number]; formats: MediaFormat[]; expires: number }>();

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "MediaFlow API" }));

app.post("/api/analyze", async (req, res) => {
  try {
    const { url } = z.object({ url: z.string().url().max(2048) }).parse(req.body);
    const parsed = new URL(url);
    const provider = providers.find(p => p.canHandle(parsed));
    if (!provider) return res.status(400).json({ message: "This source isn't currently supported." });

    await assertSafeUrl(url, [parsed.hostname]);
    const metadata = await provider.getMetadata(parsed);
    const formats = await provider.getFormats(parsed);
    const id = metadata.id;
    analyses.set(id, { url, provider, formats, expires: Date.now() + 5 * 60_000 });
    return res.json({ ...metadata, formats });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unable to analyze this URL.";
    return res.status(400).json({ message });
  }
});

app.post("/api/download", async (req, res) => {
  try {
    const { analysisId, formatId } = z.object({
      analysisId: z.string().uuid(),
      formatId: z.string().min(1).max(100)
    }).parse(req.body);
    const analysis = analyses.get(analysisId);
    if (!analysis || analysis.expires < Date.now()) return res.status(410).json({ message: "This download request has expired. Please analyze the URL again." });
    const format = analysis.formats.find(f => f.id === formatId);
    if (!format) return res.status(400).json({ message: "That format is no longer available." });

    const result = await analysis.provider.requestAuthorizedDownload(new URL(analysis.url), format);
    res.download(result.path, result.filename, { headers: { "Content-Type": result.mime } }, () => {
      import("node:fs/promises").then(fs => fs.unlink(result.path).catch(() => {}));
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Download could not be prepared.";
    return res.status(400).json({ message });
  }
});

app.post("/api/report", (req, res) => {
  const schema = z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(200),
    url: z.string().url().max(2048),
    reason: z.string().min(1).max(120),
    description: z.string().min(1).max(3000)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Please check the report fields." });
  // In production, persist to a protected admin system or ticketing provider.
  return res.status(202).json({ message: "Report received." });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled request error");
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

app.listen(port, () => console.log(`MediaFlow API listening on :${port}`));
