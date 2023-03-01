import { z } from "zod";

export const videoSchema = z.object({
  description: z.string(),
  fileName: z.string(),
  pid: z.string().uuid().optional(),
  storageUri: z.string(),
  time: z.string(),
  videoUrl: z.string(),
});

export type VideoSchema = z.infer<typeof videoSchema>;

export type VideoObject = VideoSchema & {
  id: string;
};
