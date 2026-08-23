// Config Sanity — renseigner .env.local (voir .env.example)
// Projet Sanity : NEXT_PUBLIC_SANITY_PROJECT_ID à récupérer sur sanity.io/manage
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "missing-project-id";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-08-19";
