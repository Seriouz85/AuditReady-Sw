import { vercelFetch } from "../../utils/api.js";
import {
  ListTeamsArgumentsSchema,
  CreateTeamArgumentsSchema,
} from "./schema.js";
import type { TeamsResponse, CreateTeamResponse } from "./types.js";

export async function handleListTeams(params: any = {}) {
  try {
    const { limit, since, until } = ListTeamsArgumentsSchema.parse(params);

    let url = "v2/teams";
    const queryParams = new URLSearchParams();

    if (limit) queryParams.append("limit", limit.toString());
    if (since) queryParams.append("since", since.toString());
    if (until) queryParams.append("until", until.toString());

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const data = await vercelFetch<TeamsResponse>(url);

    return {
      content: [
        {
          type: "text",
          text: `Found ${data?.teams.length} teams`,
        },
        {
          type: "text",
          text: JSON.stringify(data?.teams, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : "Failed to list teams"
          }`,
          isError: true,
        },
      ],
    };
  }
}

/**
 * Creates a new team.
 * @param params The parameters for creating a team
 * @returns The created team details
 */
export async function handleCreateTeam(params: any = {}) {
  try {
    const { slug, name } = CreateTeamArgumentsSchema.parse(params);

    const url = "v1/teams";
    const teamData = {
      slug,
      ...(name && { name }),
    };

    const data = await vercelFetch<CreateTeamResponse>(url, {
      method: "POST",
      body: JSON.stringify(teamData),
    });

    console.log("data", data);
    if (!data) {
      return {
        content: [
          { type: "text", text: "Failed to create team", isError: true },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Team created successfully: ${data.slug} (${data.id})`,
        },
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error creating team: ${
            error instanceof Error ? error.message : String(error)
          }`,
          isError: true,
        },
      ],
    };
  }
}
