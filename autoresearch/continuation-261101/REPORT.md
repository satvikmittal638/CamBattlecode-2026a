# 1 November bot continuation and deadline decision

**The original v114 is active, selected and pinned for Sprint 3.** It became active at 02:41:32 IST on 1 November, more than 2 hours 47 minutes before the official 05:29 IST deadline. No further selection change is planned before the deadline. The platform lock is released.

## Paired platform results

All four arms played the same 50 opponent/map/side cases. Opponent bots were pinned with `sourceGroupId`. The plan was frozen at our rank99:25 games per arm near rank99 and25 near rank49–50;35 historically weak maps and15 strong maps. Across all arms,200 games/40 challenges completed with zero bot errors or wrong-version games.

| Version | Wins / 50 | Change |
|---|---:|---|
| v114 | 11 | Requested deadline fallback, original submission |
| v135 | 14 | Previous incumbent |
| v140 | 15 | General defense instead of camp-only defense when all camps are harmless |
| v141 | 17 | v140 plus Marcella instead of Vesper on three-pick maps with zero camp gold |

v141 versus v114 gained8 wins and lost2, net+6/50. The descriptive paired test gives p=.109; the opponent-block95% interval for the win-rate difference includes zero (0 to+22 percentage points). These are promising results, not strong enough evidence to replace the user's deadline fallback. The unresolved regressions are Monolith versus the rank97 opponent and Gemcombat2 versus rank48.

Against v140, v141 gained2 wins and lost none on the10 Gemcombat1 cases (2/10→4/10). **All40 other matches have identical final scores and outcomes.** This is a useful isolated strategy result, although ten targeted cases provide little statistical certainty.

## What the replay analysis established

- v140 executes its intended item change: zero target Jungle emblems versus38 under v135. It produces no targeted win flips (7/25 in both arms), and aggregate target round300 economy and deaths are identical. Defense arrives too late: only38 of80 target champions reach an emblem; median first defense is round521, and163/212 deaths happen before defense.
- Three-pick pure-gem drafts lack camp income and omit Marcella. Adding her supplies tribute income. In local controlled tests she averaged982 gold of equipment versus Vesper92. In the platform target cases, mean final team equipment rises294→606 and round300 wealth156.5→222.2. Captured gems barely change722.4→730.1, while deaths rise10.9→12.0: the lineup has real trade-offs.
- The new draft also changes kit, range and stun immunity, so these observations do not isolate the passive as the sole cause of the two wins.
- The visual review finds two persistent classes: low resource throughput without early deaths (for example Lanes/Tangle/Big World), and repeated early combat deaths with little income (Hooks/Swirl). One generic survival rule does not address both.
- In the Gemcombat2 regression against v114, round300 captured gems are similar301 versus308, but banked gems280 versus126 and wealth354 versus112. This suggests testing whether the inherited small-bag holding rule delays Marcella's tribute income. It remains a hypothesis, not an implemented or validated fix.
- In the Monolith regression, v141 has more early wealth and fewer deaths yet loses later. Early economy/safety metrics alone are insufficient acceptance criteria.

Full statistical decoding covered150 candidate/incumbent replays, plus the two v114 regression replays. I actually inspected11 atlas pages: all35 v140 losses in36 paired opening cases, all10 v141 targeted pairs, and both v114 regressions. Atlases show the opening through round300; I do not claim to have visually inspected every later turn.

## Local work and retained artifacts

The contact-order, optimistic target-order and altar-lock experiments failed weak-map or archived-layout guards and were reverted. The severe planner starvation seen in the separate Mite reconstruction was not established as a dominant current v135 failure: the fresh online log audit found few combat aborts.

The isolated income draft passed the96-game guard at60wins and the24 archived-layout guard at14wins, matching the cleaned incumbent. Its36-case targeted test kept14wins while nearly doubling equipment income. With v140's defense rule, the targeted result was15/36 versus16/36, with better score margin and slightly fewer deaths; that small local difference was treated as inconclusive before the platform screen.

Both uploaded candidates were audited: all21 source files exactly matched the tested files. The income prototype remains in `workspace/bots/ar-gem-income-1101`; its full frozen upload is in `autoresearch/sources/v141`. The main `ar-v121` working tree was returned to the accepted cleanup source. No unconfirmed candidate is the deadline entry.

The installed Claude autoresearch skill/protocol and existing local match, official replay decoder and platform tools were reused. Turnhost is already installed. No browser automation was used. REA was not needed for ordinary source analysis; its earlier replay inventory had established that Mite's binary/source was absent.

Two challenge POSTs returned503. Before retrying either, both teams' histories and shared quota proved that no group had been created. The original intents were marked `confirmed_not_created`, with evidence retained. Final receipts remain10 groups per arm; no blind POST retries were used. Challenge writes now have five-second pacing.

Detailed paired results: `comparison.json`. Mechanism and visual evidence: `../s19_analysis/`, `../s20_analysis/`, `../v114_regression_analysis/`. The final active/selected/tournament identity readback is saved as `fallback_status.json`.
