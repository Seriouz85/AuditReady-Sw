import { z } from "zod";

export const ListTeamsArgumentsSchema = z.object({
  limit: z.number().optional(),
  since: z.number().optional(),
  until: z.number().optional(),
});

export const CreateTeamArgumentsSchema = z.object({
  slug: z.string().min(1).max(48).describe("A unique identifier for the team"),
  name: z.string().optional().describe("A display name for the team")
});
