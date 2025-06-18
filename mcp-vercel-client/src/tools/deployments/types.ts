export interface DeploymentGitSource {
  type: "github" | "gitlab" | "bitbucket";
  repoId?: number | string;
  ref?: string;
  sha?: string;
  prId?: number | string;
}

export interface DeploymentGitMetadata {
  commitAuthorName?: string;
  commitMessage?: string;
  commitRef?: string;
  commitSha?: string;
  repoId?: number | string;
}

export interface DeploymentProjectSettings {
  buildCommand?: string;
  devCommand?: string;
  framework?: string;
  installCommand?: string;
  outputDirectory?: string;
  rootDirectory?: string;
  nodeVersion?: string;
}

export interface DeploymentFile {
  file: string;
  data: string;
  encoding?: "base64" | "utf-8";
}

export interface Deployment {
  uid: string;
  id: string;
  name?: string;
  state: string;
  target: string;
  url: string;
  inspectorUrl: string;
  createdAt: number;
  alias: string[];
  regions: string[];
  builds?: {
    src: string;
    use: string;
    config?: Record<string, any>;
  }[];
  meta?: {
    githubCommitAuthorName?: string;
    githubCommitMessage?: string;
    githubRepoId?: string;
    githubRepo?: string;
  };
  creator?: {
    uid: string;
    email: string;
    username: string;
  };
  readyState?: string;
  projectId?: string;
  buildingAt?: number;
  readyAt?: number;
}

export interface DeploymentsResponse {
  deployments: Deployment[];
}

export interface DeploymentFile {
  name: string;
  type: string;
  uid: string;
  contentType: string;
  mode: number;
  size?: number;
  symlink?: string;
  children?: DeploymentFile[];
}

export interface DeploymentFilesResponse {
  files: DeploymentFile[];
}
