import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Lecture catalogue côté serveur (SSG/ISR) — PRD §9.2
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
