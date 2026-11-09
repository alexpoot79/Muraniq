# MURANIQ Studio

Sanity Studio for the collection. A separate bundle: never deployed with the public site.

```bash
cd studio
npm install
cp .env.example .env   # fill in the project ID once the Sanity project exists
npm run dev            # http://localhost:3333
npm run deploy         # hosted Studio at <name>.sanity.studio (browser-based editing)
```

Rules for editors

- One **Object** per physical work. A photograph is a **Photograph** document linked to it.
- Upload only **cleared, EXIF-stripped web images**. Sanity assets are public on the CDN even in a
  private dataset. Originals and confidential records stay in the separate private archive.
- Every claim gets a certainty level. "Verified" needs named evidence and a review date.
- Use **Publish** to publish. "In editorial review" is only a workflow label.
