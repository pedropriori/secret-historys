import { z } from "zod";

export const StoryBaseSchema = z.object({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  language: z.enum(["es", "pt", "en"]).default("es"),
  status: z.enum(["ONGOING", "COMPLETED", "HIATUS"]),
  description: z.string().min(10),
  coverUrl: z.string().url().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  author: z.object({ penName: z.string().min(2) }),
  manualRating: z.number().min(0).max(5).optional(),
});
export type StoryBase = z.infer<typeof StoryBaseSchema>;

export const ChapterSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().optional(),
  contentMd: z.string().min(1),
  isPublished: z.boolean().default(true),
});

export const StoryImportSchema = StoryBaseSchema.omit({ slug: true }).extend({
  slug: z.string().optional(), // Slug será gerado automaticamente se não fornecido
  coverFile: z.string().optional(),
});


