import { z } from "zod";

export const EnvironmentVariableSchema = z.object({
  type: z.string(),
  value: z.string(),
  target: z.array(z.string()).optional(),
  gitBranch: z.string().optional(),
});

export const CreateEnvironmentSchema = z.object({
  projectId: z.string(),
  key: z.string(),
  value: z.string(),
  target: z.array(z.string()).optional(),
  type: z.string().optional(),
  gitBranch: z.string().optional(),
});

export const CreateCustomEnvironmentSchema = z.object({
  idOrName: z.string(),
  name: z.string().refine((val) => val.toLowerCase() !== 'production' && val.toLowerCase() !== 'preview', {
    message: "Custom environment name cannot be 'Production' or 'Preview'",
  }),
  description: z.string().optional(),
  branchMatcher: z.object({
    type: z.enum(["startsWith", "endsWith", "contains", "exactMatch", "regex"]),
    pattern: z.string(),
  }).optional(),
  teamId: z.string().optional(),
  slug: z.string().optional(),
});
