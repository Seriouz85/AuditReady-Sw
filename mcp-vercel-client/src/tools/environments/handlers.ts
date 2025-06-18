import { vercelFetch } from "../../utils/api.js";
import { GetEnvironmentsParams, CustomEnvironmentResponse } from "./type.js";
import { CreateCustomEnvironmentSchema } from "./schema.js";

/**
 * Retrieves environment variables for a Vercel project specified by ID or name
 * @param params - Parameters containing the ID or name of the project
 * @returns A formatted response containing the environment variables or an error message
 */
export async function handleGetEnvironments(params: GetEnvironmentsParams) {
  try {
    // Validation des paramètres d'entrée
    if (!params || !params.arguments) {
      const errorMsg = "Invalid request: Missing required arguments";
      console.error(errorMsg);
      return {
        content: [{ type: "text", text: errorMsg }],
      };
    }

    const { idOrName } = params.arguments;

    if (!idOrName || typeof idOrName !== "string") {
      const errorMsg = `Invalid request: idOrName parameter must be a non-empty string, received: ${JSON.stringify(
        idOrName,
      )}`;
      console.error(errorMsg);
      return {
        content: [{ type: "text", text: errorMsg }],
      };
    }

    console.log(`Fetching environment variables for project: ${idOrName}`);

    // Appel à l'API Vercel v10
    const data = await vercelFetch<any>(
      `v10/projects/${encodeURIComponent(idOrName)}/env`,
      { method: "GET" },
    );

    // Validation de la réponse
    if (!data || !data.envs || !Array.isArray(data.envs)) {
      const errorMsg = `Failed to retrieve environment variables for project: ${idOrName}`;
      console.error(errorMsg, { data });
      return {
        content: [{ type: "text", text: errorMsg }],
      };
    }

    // Formatage de la réponse réussie
    const envCount = data.envs.length;
    return {
      content: [
        {
          type: "text",
          text: `Retrieving ${envCount} environment variable${
            envCount !== 1 ? "s" : ""
          } for project: ${idOrName}`,
        },
        {
          type: "text",
          text: JSON.stringify(data.envs, null, 2),
        },
      ],
    };
  } catch (error) {
    // Gestion des erreurs
    const errorMsg =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    console.error("Error retrieving environment variables:", error);

    return {
      content: [
        {
          type: "text",
          text: `Error retrieving environment variables: ${errorMsg}`,
        },
      ],
    };
  }
}

/**
 * Creates a custom environment for a Vercel project
 * @param params - Parameters containing the project ID/name and environment configuration
 * @returns A formatted response containing the created custom environment or an error message
 */
export async function handleCreateCustomEnvironment(params: any) {
  try {
    // Validate input parameters
    const validationResult = CreateCustomEnvironmentSchema.safeParse(params);
    
    if (!validationResult.success) {
      const errorMsg = `Invalid request: ${validationResult.error.issues.map(issue => issue.message).join(", ")}`;
      console.error(errorMsg);
      return {
        content: [{ type: "text", text: errorMsg }],
      };
    }

    const { idOrName, name, description, branchMatcher, teamId, slug } = validationResult.data;

    console.log(`Creating custom environment '${name}' for project: ${idOrName}`);

    // Build request body
    const requestBody: any = {
      name,
    };

    if (description) {
      requestBody.description = description;
    }

    if (branchMatcher) {
      requestBody.branchMatcher = branchMatcher;
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (teamId) {
      queryParams.append("teamId", teamId);
    }
    if (slug) {
      queryParams.append("slug", slug);
    }

    const queryString = queryParams.toString();
    const endpoint = `v9/projects/${encodeURIComponent(idOrName)}/custom-environments${queryString ? `?${queryString}` : ""}`;

    // Call Vercel API v9
    const data = await vercelFetch<CustomEnvironmentResponse>(
      endpoint,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    // Validate response
    if (!data || !data.id) {
      const errorMsg = `Failed to create custom environment for project: ${idOrName}`;
      console.error(errorMsg, { data });
      return {
        content: [{ type: "text", text: errorMsg }],
      };
    }

    // Format successful response
    return {
      content: [
        {
          type: "text",
          text: `Successfully created custom environment '${name}' for project: ${idOrName}`,
        },
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  } catch (error) {
    // Handle errors
    const errorMsg =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);

    console.error("Error creating custom environment:", error);

    return {
      content: [
        {
          type: "text",
          text: `Error creating custom environment: ${errorMsg}`,
        },
      ],
    };
  }
}
