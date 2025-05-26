import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.API_URL || "http://localhost:5000";

export async function fetchWithAuth(endpoint, options = {}) {
  const session = await getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await axios({
      url: `${API_URL}${endpoint}`,
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
        ...options.headers,
      },
      data: options.body,
      params: options.params,
    });

    return response.data;
  } catch (error) {
    throw new Error("Api request failed");
  }
}
