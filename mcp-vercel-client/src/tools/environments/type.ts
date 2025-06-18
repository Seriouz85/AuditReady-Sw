// Interface for the environment variables according to the Vercel v10 API
export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  target: string[];
  type: string;
  configurationId: string | null;
  createdAt: number;
  updatedAt: number;
  gitBranch?: string;
}

export interface EnvironmentVariablesResponse {
  envs: EnvironmentVariable[];
}

//  Interface for the input parameters
export interface GetEnvironmentsParams {
  arguments: {
    idOrName: string;
  };
}

// Interface for creating custom environment
export interface CreateCustomEnvironmentParams {
  idOrName: string;
  name: string;
  description?: string;
  branchMatcher?: {
    type: "startsWith" | "endsWith" | "contains" | "exactMatch" | "regex";
    pattern: string;
  };
  teamId?: string;
  slug?: string;
}

// Interface for custom environment response
export interface CustomEnvironmentResponse {
  id: string;
  slug: string;
  type: string;
  description: string;
  branchMatcher: {
    type: string;
    pattern: string;
  };
  domains: Array<{
    domain: string;
    redirect?: string;
    redirectStatusCode?: number;
  }>;
  createdAt: number;
  updatedAt: number;
}
