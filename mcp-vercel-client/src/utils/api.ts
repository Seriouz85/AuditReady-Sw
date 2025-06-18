import fetch from "node-fetch";
import { VERCEL_API, VERCEL_API_TOKEN } from "./config.js";

export async function vercelFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T | null> {
  try {
    const headers = {
      Authorization: `Bearer ${VERCEL_API_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(`${VERCEL_API}${endpoint}`, {
      ...options,
      headers,
    } as any);

    if (!response.ok) {
      throw new Error(`Vercel API error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("Vercel API error:", error);
    return null;
  }
}
