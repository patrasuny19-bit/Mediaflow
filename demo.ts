import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { MediaProvider } from "./types.js";
import type { MediaFormat, MediaMetadata } from "../types.js";

const formats: MediaFormat[] = [
  { id: "demo-1080", label: "Demo Video · 1080p", type: "video", quality: "1080p", mime: "video/mp4" },
  { id: "demo-720", label: "Demo Video · 720p", type: "video", quality: "720p", mime: "video/mp4" },
  { id: "demo-audio", label: "Demo Audio", type: "audio", mime: "audio/mpeg" }
];

export const demoProvider: MediaProvider = {
  name: "Demo Provider",
  canHandle: (url) => url.hostname === "demo.mediaflow.local",
  async getMetadata(url): Promise<MediaMetadata> {
    return {
      id: randomUUID(),
      title: "MediaFlow Demo Media",
      source: url.hostname,
      duration: "02:35",
      formats,
      note: "Demo mode only. Connect an authorized provider adapter for real media."
    };
  },
  async getFormats() { return formats; },
  async requestAuthorizedDownload(_url, format) {
    const dir = path.resolve("tmp");
    await fs.mkdir(dir, { recursive: true });
    const ext = format.type === "audio" ? "mp3" : "mp4";
    const file = path.join(dir, `${randomUUID()}.${ext}`);
    await fs.writeFile(file, `MediaFlow demo file. Format: ${format.label}\n`);
    return { path: file, mime: format.mime, filename: `mediaflow-demo.${ext}` };
  }
};
