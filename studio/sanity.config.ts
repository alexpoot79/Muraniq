import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

/**
 * MURANIQ Studio. Fill SANITY_STUDIO_PROJECT_ID / SANITY_STUDIO_DATASET in
 * studio/.env once the project exists. The dataset must be PRIVATE and contain
 * only publishable material; uploaded assets are public on the CDN, so upload
 * only cleared, EXIF-stripped web derivatives — never originals.
 */
export default defineConfig({
  name: "muraniq",
  title: "MURANIQ Collection",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "replace-me",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
