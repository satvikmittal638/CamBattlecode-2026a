# Competition documentation

Refetched from the [official website](https://2026a.battlecode.co.uk/game/docs/agents) and verified on **21 October 2026 at 18:50 IST (13:20 UTC)**. The latest published patch in this fetch is **1.0.2**.

- [Game rules and champion specifications](official/GameRules.md)
- [C++ API](official/BotAPICpp.md), [Python API](official/BotAPIPython.md), [Rust API](official/BotAPIRust.md), [OCaml API](official/BotAPIOCaml.md)
- [Handbook](pages/docs.md) and [champion roster](pages/docs_champions.md)
- Latest patch: [1.0.2](pages/patch-notes_e251fa42-fb2a-4d9b-ab8c-2e044f21d599.md). Official patch history: [1.0.1](pages/patch-notes_7a4caf45-afc3-49d0-838a-9eb9657bafc6.md), [1.0.0 / Week 2](pages/patch-notes_2e172875-28d7-4152-9483-54a3db6d2663.md).
- [Changes found in this refresh](CHANGES_2026-10-21.md)
- [Fetch manifest: sources, timestamps and SHA-256 checksums](FETCH_MANIFEST.json)

`docs/` is the single canonical documentation directory. It contains 5 official Markdown exports, 46 rendered handbook/download/patch-index pages and 3 full patch-note articles: **54 source files**. Old snapshots, superseded summaries and the duplicate Week 2 plain-text article have been removed. Relative website links and image URLs in fetched Markdown retain their original website paths; image binaries are not mirrored.

## Versions and experiment interpretation

The website advertises **CLI 3.0.4**. The locally installed CLI and workspace SDK are still **3.0.2**; this documentation refresh does not upgrade them. The available decoder engines in `tools/engines/` stop at `v1_0_1.wasm` at this check.

The v42 Heart Health local evaluation at `local_eval/v41_live/l3_horhealth_full/provenance.json` records engine **1.0.1**. Treat its results as evidence on that engine. The fetched 1.0.2 rules change champion balance, so performance on the new balance requires its own verification. A published patch number alone does not establish the engine used by an individual live match; inspect that match's replay header or patch metadata.

## Refresh workflow

Use the established scraper with a new output directory:

```sh
node tools/scrape_docs.js <new-snapshot-directory>
```

It downloads the five official exports from `/game/docs/agents`, discovers handbook pages from the handbook home and champion roster, and renders the language-specific guides with Playwright, Turndown and GFM. It also renders the download page and patch-note index.

Follow every article link on `/game/patch-notes` and fetch its full main content with the same conversion workflow: the index contains shortened previews. This refresh fetched all three linked articles. Keep one Markdown copy of each article.

Validate the complete staged snapshot before replacing the current source files in `docs/`. Compare the source files and write checksums and fetch times, then remove staging directories and obsolete copies after verification. Keep `docs/` as the only retained documentation tree. Among the 54 retained source files in this refresh, **15 changed, 3 were added and 36 were unchanged**.

Official exports and rendered pages are stored as fetched. Commentary belongs in dated change summaries so it remains distinguishable from the organisers' text.
