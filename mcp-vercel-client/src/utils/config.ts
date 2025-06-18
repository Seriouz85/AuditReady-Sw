import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export function getVercelApiToken(): string {
  const vercelApiToken = process.env.VERCEL_API_TOKEN;
  if (!vercelApiToken) {
    console.error("VERCEL_API_TOKEN environment variable is not set");
    process.exit(1);
  }
  return vercelApiToken;
}

export const VERCEL_API_TOKEN = getVercelApiToken();
export const VERCEL_API = "https://api.vercel.com/";
