export interface Team {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  creatorId: string;
  created: string;
  updated: string;
}

export interface TeamsResponse {
  teams: Team[];
  pagination: {
    count: number;
    next: number | null;
    prev: number | null;
  };
}

export interface CreateTeamResponse {
  id: string;
  slug: string;
  billing: Record<string, any>;
}
