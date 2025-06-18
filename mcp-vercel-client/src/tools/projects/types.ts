export interface Project {
  id: string;
  name: string;
  accountId: string;
  framework: string | null;
  latestDeployments: {
    alias: string[];
  }[];
  targets: {
    production: {
      alias: string[];
    };
  };
  createdAt: number;
  updatedAt: number;
}

export interface EnvironmentVariable {
  key: string;
  value: string;
  target: string[];
  type: string;
  gitBranch?: string;
  createdAt: number;
  updatedAt: number;
}

export interface EnvironmentVariablesResponse {
  created: EnvironmentVariable[];
  skipped: {
    key: string;
    code: string;
    message: string;
  }[];
}

export interface ListProjectsResponse {
  projects: Project[];
  pagination: {
    count: number;
    next: number | null;
    prev: number | null;
  };
}

export interface ProjectResponse {
  id: string;
  name: string;
  accountId: string;
  createdAt: number;
  updatedAt: number;
  framework: string | null;
}
