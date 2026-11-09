# MURANIQ — Claude implementation handoff

Prepared 9 November 2026. Run the first architecture and implementation passes with **Claude Opus 5.5 at `xhigh` effort**, the chosen interpretation of “Extra.” Claude Code documents `claude-opus-5-5` and `xhigh`. Verify model access and effort limits in the actual session. [Claude Code model configuration](https://code.claude.com/docs/en/model-config).

## 1. Start from the decisions

You are implementing an English-language private art gallery for MURANIQ. Read these documents in order:

1. `01-BRONAUDIT-EN-MIGRATIE.md` — observed website, preserved routes and migration limits.
2. `02-ARCHITECTUUR.md` — architecture, visual system, content contracts and acceptance criteria.
3. `04-GOALS.md` — bounded goals, dependencies and completion evidence.

Use the original master prompt for context. Follow subsequent user corrections where they differ. Begin with a short inventory, then implement the next achievable increment. Do not reopen the entire architecture or generate another enormous plan. Record a concrete reason when changing an architectural decision.

The existing website stays intact until an authorized production release. Do not delete working content, alter production DNS, publish externally or incur new service costs without the relevant authorization. Prepare a concrete, reviewable result before requesting a final decision.

## 2. Discover the actual working environment

Inspect repository instructions, current changes, assets, package configuration, installed tools and existing deployment settings. Preserve unrelated work. Verify supported stable dependency combinations when implementation starts; pin the selected versions and retain one lockfile. Never claim a build or test ran if it did not.

The requested **/alchemy** library is `l-gevity/l-gevity-skills`, with a lowercase L. Its package metadata reported `@l-gevity/skills` version `4.0.0` on 9 November 2026. At implementation time, verify the installed revision and read its instructions. If absent, continue independent work while preparing an inspected, version-pinned project setup for the authorized build. [Repository](https://github.com/l-gevity/l-gevity-skills) · [Package metadata](https://github.com/l-gevity/l-gevity-skills/blob/main/package.json).

Follow the real [Alchemy skill](https://github.com/l-gevity/l-gevity-skills/blob/main/.claude/skills/alchemy/SKILL.md): classify the change before loading deeper instructions. `SKIP` covers routine local work; `DIRECT` addresses one engineering question; `ADAPTIVE` selects the necessary ordered stages; `FULL` requires an explicit request. Load skills when their stage is reached, and report stages actually executed. MURANIQ's normal request is `/alchemy implement the next ready MURANIQ increment`. Use `/alchemy M assess the 360-degree viewer` for a focused value decision. These examples use verified command grammar; no special MURANIQ subcommands exist.

Use `alchemy-orchestrate` only when justified independent work or a separate risk review warrants agents, with its actual runtime adapter available. Otherwise keep execution with one agent. The library's [pipeline specification](https://github.com/l-gevity/l-gevity-skills/blob/main/ALCHEMY-PIPELINE-DESIGN.md) separates engineering routing from orchestration; neither is a reason to create a permanent team.

Use Claude Code's built-in `/goal` to run one measurable phase at a time. Keep `04-GOALS.md` as the persistent record across sessions, and as the manual fallback if the command is disabled. A goal starts work immediately and a new goal replaces the active one. Include observable evidence and the scope boundary in the condition. Surface command results and screenshots in the transcript because the evaluator judges the evidence there. Record token use only when reported. [Claude Code Goals](https://code.claude.com/docs/en/goal).

## 3. Implement the agreed platform

Use Next.js App Router, React Server Components, strict TypeScript, Tailwind CSS, GitHub and Vercel. Keep domain and content processing server-side. Add client components only for interactive controls: menu, viewer, filters where needed, comparison and local selections. Do not turn the root layout into a client application.

Follow the architecture's coherent Cache Components strategy: explicit cached public reads, meaningful tags and controlled invalidation. Keep draft preview separate and uncached; do not mix incompatible caching examples. Search uses a compact server-side public index and bounded responses, not the entire collection downloaded into the browser.

The final editorial target is a hosted Sanity Studio, with a private publication dataset containing **only publishable collection material**. Private collection records, ownership details, valuations and confidential documents belong outside this system. The proposed private-dataset plan requires a paid service decision: prepare schema and local demonstrations first, then request the specific external setup/budget approval when reviewable.

Repository JSON fixtures support local development only. They must not silently replace the requested editorial CMS in the final product. If credentials or approvals are missing, continue UI, schema, validation and tests; mark the live editorial integration incomplete.

## 4. Protect historical accuracy and media

Give every object a stable ID. Model makers, techniques, categories, media, sources and attribution explicitly. A signature reading is not proof of authorship. Distinguish verified facts, documented attribution, probable attribution, hypotheses and unknown values. Never derive one artwork per image or invent provenance to make a page look complete.

Publish through validated field allowlists. Keep drafts, private fields and confidential sources out of public HTML, API responses and search indexes. Dataset media can be retrieved by URL from upload time, including during draft editing. Upload only images already cleared for public distribution. Inspect EXIF, filenames and derivatives before upload. [Sanity asset handling](https://www.sanity.io/docs/content-lake/manage-assets).

Use authentic authorized collection photography. Local placeholders must be visibly identified. Unsupported 360-degree or lighting controls remain absent. Do not generate alternate views of real artworks and present them as documentation.

## 5. Establish the two reference pages

Build the homepage and one object page as the quality standard. Use obsidian and charcoal, restrained champagne gold, warm beige reading sections, editorial serif titles and highly readable sans-serif interface text. The artwork receives the largest visual emphasis.

The homepage has one monumental photographic hero, readable HTML introduction, three featured works when three approved works exist, a warm editorial section, collection discovery and a concise invitation. If fewer works are ready, present only those works and record the missing content. Never manufacture records to satisfy a layout quota.

The object page combines complete object photography, a usable detail viewer, exact attribution wording, specifications, documented marks, sources and relevant related works. Mobile receives a deliberate stacked composition with visible controls. Fullscreen viewing supports keyboard operation, focus restoration, touch alternatives and reduced motion. Gold text on beige is not an acceptable default; use the tested color combinations in the architecture.

Preserve the four existing collection categories, including Collectible Objects. Use `/collection/objects/[slug]/` for object records and `/glass-guide/makers/[slug]/` for maker pages. Implement root-level artist redirects only with the actual migration and verified destination content.

## 6. Work through bounded goals

Follow G0–G6 in the goal map. Each goal records inputs, output, completion evidence, dependencies and the next bounded action. Missing external access blocks only dependent work. A goal is complete when its output is verified, not when its code looks finished or a tool budget is nearly exhausted.

Where useful and consistent with Alchemy's execution choice, divide work into design/UI, content/CMS, and QA/SEO packages. These are optional responsibilities, not three mandatory agents. Assign owned files; the coordinator controls shared architecture, dependencies, lockfile and integration. Avoid overlapping writes and request evidence rather than independent project rewrites.

Keep progress updates brief: what now works, what evidence supports it, and which dependency remains. Stop repeating unchanged audits. Finish one complete path before opening several advanced features.

## 7. Verify the actual visitor experience

Run checks appropriate to each change, including schema and publication validation, type checking, lint, build, critical navigation and filter tests, viewer accessibility and contact errors. Test that drafts stay private and that withdrawal clears the record from pages, metadata, sitemap and search after cache invalidation. Handle asset withdrawal separately and verify direct media URLs.

Inspect rendered homepage and object pages at mobile, tablet and desktop sizes. Check 320-pixel reflow, text enlargement, focus visibility, image cropping, empty results and missing media. Measure representative loading performance; report actual results separately from targets. A Lighthouse score is not a guarantee of field Core Web Vitals.

Before launch, verify redirects, canonical URLs, language metadata, structured data, sitemap, robots behavior, contact delivery and recovery. Do not show a successful contact submission unless delivery or durable acceptance was genuinely confirmed. Keep preview access protected and review the selected hosting plan's actual eligibility and costs.

End each increment with changed behavior, checks actually run, remaining limitations and the next step. Production release is G6 and requires explicit user authorization. Until then, provide the reviewable local result and clearly distinguish implemented, connected, tested and deployed work.
