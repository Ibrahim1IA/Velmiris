import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { projectId, dataset } from "./src/sanity/env";

// Studio embarqué sur /studio — PRD §9.1
export default defineConfig({
  name: "velmirys",
  title: "VELMIRYS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Contenu")
          .items([
            S.listItem()
              .title("Page d'accueil")
              .id("homeSettings")
              .child(S.document().schemaType("homeSettings").documentId("homeSettings").title("Page d'accueil")),
            S.listItem()
              .title("Réglages du site")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Réglages du site")),
            S.divider(),
            // Reste des types en liste auto, sans les singletons déjà listés
            ...S.documentTypeListItems().filter((item) => !["homeSettings", "siteSettings"].includes(item.getId() ?? "")),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
