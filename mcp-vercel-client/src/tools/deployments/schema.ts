import { z } from "zod";

export const ListDeploymentsArgumentsSchema = z.object({
  app: z.string().optional(),
  limit: z.number().optional(),
  projectId: z.string().optional(),
  state: z.string().optional(),
  target: z.string().optional(),
  teamId: z.string().optional(),
});

export const GetDeploymentArgumentsSchema = z.object({
  idOrUrl: z.string(),
  teamId: z.string().optional(),
});

export const ListDeploymentFilesArgumentsSchema = z.object({
  id: z.string().describe("The unique deployment identifier"),
  teamId: z.string().optional().describe("Team identifier to perform the request on behalf of"),
  slug: z.string().optional().describe("Team slug to perform the request on behalf of"),
});

export const GitSourceSchema = z.object({
  type: z.literal("github").or(z.literal("gitlab").or(z.literal("bitbucket"))),
  repoId: z.number().or(z.string()).optional(),
  ref: z.string().optional(),
  sha: z.string().optional(),
  prId: z.number().or(z.string()).optional(),
});

export const GitMetadataSchema = z.object({
  commitAuthorName: z.string().optional(),
  commitMessage: z.string().optional(),
  commitRef: z.string().optional(),
  commitSha: z.string().optional(),
  repoId: z.number().or(z.string()).optional(),
  remoteUrl: z.string().optional(),
  dirty: z.boolean().optional(),
});

export const ProjectSettingsSchema = z.object({
  buildCommand: z.string().optional(),
  devCommand: z.string().optional(),
  framework: z.string().optional(),
  installCommand: z.string().optional(),
  outputDirectory: z.string().optional(),
  rootDirectory: z.string().optional(),
  nodeVersion: z.string().optional(),
  commandForIgnoringBuildStep: z.string().optional(),
  serverlessFunctionRegion: z.string().optional(),
  skipGitConnectDuringLink: z.boolean().optional(),
  sourceFilesOutsideRootDirectory: z.boolean().optional(),
});

export const FileSchema = z.object({
  file: z.string(),
  data: z.string(),
  encoding: z.enum(["base64", "utf-8"]).optional(),
});

/**
 * Schéma de validation pour la création de déploiements Vercel
 * Compatible avec l'API Vercel v13/deployments
 */
export const CreateDeploymentArgumentsSchema = z.record(z.any()).transform((data) => {
  // Transforme tous les paramètres en un objet utilisable
  const result: Record<string, any> = {};
  
  // Nettoyage des accents graves (backticks) dans les clés
  const cleanedData: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    const cleanKey = key.replace(/`/g, '');
    cleanedData[cleanKey] = data[key];
  });
  
  // Identification et projet
  if (cleanedData.name) result.name = String(cleanedData.name);
  if (cleanedData.project) result.project = String(cleanedData.project);
  if (cleanedData.deploymentId) result.deploymentId = String(cleanedData.deploymentId);
  if (cleanedData.slug) result.slug = String(cleanedData.slug);
  if (cleanedData.teamId) result.teamId = String(cleanedData.teamId);
  if (cleanedData.customEnvironmentSlugOrId) result.customEnvironmentSlugOrId = String(cleanedData.customEnvironmentSlugOrId);
  
  // Configuration du déploiement
  result.target = cleanedData.target ? String(cleanedData.target) : 'production';
  if (cleanedData.regions) result.regions = cleanedData.regions;
  if (cleanedData.functions) result.functions = cleanedData.functions;
  if (cleanedData.routes) result.routes = cleanedData.routes;
  if (cleanedData.cleanUrls !== undefined) result.cleanUrls = Boolean(cleanedData.cleanUrls);
  if (cleanedData.trailingSlash !== undefined) result.trailingSlash = Boolean(cleanedData.trailingSlash);
  if (cleanedData.public !== undefined) result.public = Boolean(cleanedData.public);
  if (cleanedData.ignoreCommand) result.ignoreCommand = String(cleanedData.ignoreCommand);
  
  // Métadonnées et contrôle de source
  if (cleanedData.gitSource) result.gitSource = cleanedData.gitSource;
  if (cleanedData.gitMetadata) result.gitMetadata = cleanedData.gitMetadata;
  if (cleanedData.projectSettings) result.projectSettings = cleanedData.projectSettings;
  if (cleanedData.meta) result.meta = cleanedData.meta;
  if (cleanedData.monorepoManager) result.monorepoManager = String(cleanedData.monorepoManager);
  
  // Fichiers (pour les déploiements instantanés)
  if (cleanedData.files) result.files = cleanedData.files;
  
  // Flags et options
  if (cleanedData.forceNew) result.forceNew = Boolean(cleanedData.forceNew) ? 1 : undefined;
  if (cleanedData.withCache !== undefined) result.withCache = Boolean(cleanedData.withCache);
  if (cleanedData.autoAssignCustomDomains !== undefined) result.autoAssignCustomDomains = Boolean(cleanedData.autoAssignCustomDomains);
  if (cleanedData.withLatestCommit !== undefined) result.withLatestCommit = Boolean(cleanedData.withLatestCommit);
  
  return result;
});
