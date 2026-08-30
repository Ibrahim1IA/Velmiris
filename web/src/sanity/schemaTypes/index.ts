import type { SchemaTypeDefinition } from "sanity";
import { product, productVariant } from "./product";
import { cardDesign } from "./cardDesign";
import { siteSettings } from "./siteSettings";
import { pageContent } from "./pageContent";
import { homeSettings } from "./homeSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  productVariant,
  cardDesign,
  siteSettings,
  pageContent,
  homeSettings,
];
