export type MediaFormat = {
  id: string;
  label: string;
  type: "video" | "audio";
  quality?: string;
  mime: string;
  size?: number;
};

export type MediaMetadata = {
  id: string;
  title: string;
  source: string;
  duration?: string;
  thumbnail?: string;
  formats: MediaFormat[];
  note?: string;
};
