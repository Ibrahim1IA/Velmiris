import { getRequestConfig } from "next-intl/server";

// V1 : FR uniquement, sans segment de locale dans l'URL (PRD §2 / G1)
// V2 : ajouter EN = ajouter messages/en.json + activer le routing next-intl
export default getRequestConfig(async () => ({
  locale: "fr",
  messages: (await import("../../messages/fr.json")).default,
}));
