import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Collection")
    .items([
      S.documentTypeListItem("artwork").title("Objects"),
      S.documentTypeListItem("mediaAsset").title("Photography (cleared web images)"),
      S.divider(),
      S.documentTypeListItem("creator").title("Makers"),
      S.documentTypeListItem("glasshouse").title("Glasshouses"),
      S.documentTypeListItem("technique").title("Techniques"),
      S.documentTypeListItem("source").title("Sources"),
      S.divider(),
      S.documentTypeListItem("redirect").title("Redirects (migration)"),
    ]);
