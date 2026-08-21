import type { SchemaTypeDefinition } from "sanity";
import { product, productVariant } from "./product";
import { cardDesign } from "./cardDesign";
import { siteSettings } from "./siteSettings";
import { pageContent } from "./pageContent";

export const schemaTypes: SchemaTypeDefinition[] = [
  product,
  productVariant,
  cardDesign,
  siteSettings,
  pageContent,
];
