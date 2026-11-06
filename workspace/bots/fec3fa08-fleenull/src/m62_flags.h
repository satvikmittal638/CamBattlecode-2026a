#pragma once
// v62m: switchable changes learned from the reference wins against Intercontinental Fish and Mite
// (analysis/meta_fm_2026-10-25). Every switch defaults to v62 behaviour; build_v62m.mjs overrides them.
constexpr int M62_SHARE = 0;            // tactical danger: an enemy closer to (or as close and weaker than us to) a healthy ally counts x M62_SHAREW
constexpr float M62_SHAREW = 0.35f;
constexpr int M62_COMMIT = 0;           // local HP share >= M62_COMMITSHARE: risk limit x M62_COMMITRISK, 3 target choices, no idle veto
constexpr float M62_COMMITSHARE = 0.55f;
constexpr float M62_COMMITRISK = 1.6f;
constexpr int M62_FLEE = 1;             // local HP share < M62_FLEESHARE with an enemy within 5 and no kill: step toward allies / away
constexpr float M62_FLEESHARE = 0.35f;
constexpr int M62_FOCUS = 0;            // tactical target order: distance weight 30 -> 8 (allies converge on the weakest enemy)
constexpr int M62_WARD = 0;             // re-place the ward every charge 2-4 tiles ahead toward the enemy side (v62: bushes only, >=7 away)
constexpr int M62_DRAFT = 0;            // 1: Vesper Vale, Heart of Ruin, Vendetta, Tavi, Marcella (4: Vesper, Vendetta, Heart, Tavi; 3: Vesper, Vendetta, Heart)
constexpr int M62_NOLINK = 0;           // a partner going low does not send a healthy champion home
constexpr int M62_PRIO = 0;             // Fish/winner turn order (X_PRIO): champions near enemies act first, carriers and wounded last
constexpr int M62_CHASE = 0;            // local HP share >= M62_CHASESHARE and healthy: converge on the weakest visible enemy within 6 instead of farming
constexpr float M62_CHASESHARE = 0.6f;
constexpr int M62_RECALLFAKE = 0;       // an enemy shown recalling that has not acted this round is assumed able to cancel and act (Mite & co. recall every turn end)
constexpr int M62_EVAC = 0;             // 2+ visible enemies within 8 and HP share (allies within 6) < M62_EVACSHARE, no kill: leave the camp toward allies
constexpr float M62_EVACSHARE = 0.45f;
constexpr int M62_FORM = 0;             // front champion alone (no ally within 2, allies 2+ tiles further from the enemy), 2+ enemies within 6, share < .6: fall back onto the nearest ally
constexpr int M62_BALL = 0;             // team ball: every champion takes the camp target of the lowest-slot healthy ally (status byte), so the team farms and fights as one group
constexpr float M62_LOWHP = 0.35f;      // low-HP retreat threshold (v62 .35); leaving low mode at max(.6, this + .25)
constexpr int M62_LOWALLY = 0;          // a low champion under threat retreats onto the nearest healthy ally when that ally is not nearer the threats
constexpr int M62_FINISH = 0;           // healthy champion pursues a visible enemy below 35% HP within 5 unless its pack (healthy enemies within 4 of it) outnumbers our helpers
constexpr int M62_NOAPPROACH = 0;       // local HP share < M62_NAPSHARE with a visible enemy within 6: routed steps/dashes may not reduce the distance to the nearest enemy
constexpr float M62_NAPSHARE = 0.5f;
constexpr int M62_SAFEOPEN = 0;         // before this round, camp groups not clearly on our side (dOwn > dEnemy - 2) score x0.1 (winners take their first lethal fight at r133, v62 at r70)
constexpr int M62_BALLR = 100000;       // M62_BALL applies before this round only
constexpr float M62_NOSOLO = 0.0f;      // >0: skip a camp group whose projected incoming damage exceeds this x usable HP unless allies are arriving (v62 solos Elks in the opening)
constexpr float M62_PACKHP = 0.0f;      // >0: replaces X_PACKMINHP (pack bonus threshold) so pairs form on Elk-size groups
constexpr int M62_CI = 0;               // Cassi & Issac die together: target value uses the pair's lower HP minus 150, a kill on either pays both bags
// ---- v62x (2026-10-26, attempt-1 analysis: analysis/v62_attempt1_2026-10-26/NOTES.md). Defaults = v62. ----
constexpr int M62_GATEUNION = 0;     // gate detection also when an altar is sealed by SEVERAL boss groups (02guardians)
constexpr int M62_GATEDRAFT = 0;     // gated maps: normal draft and builds instead of the spell gate team (opponents win them that way)
constexpr int M62_GATEASSAULT = 0;   // gated maps: from round M62_ASSAULTR healthy champions hit the gate together, then capture it
constexpr int M62_ASSAULTR = 600;
constexpr int M62_BANKSTALL = 0;     // a bank route with no reachable altar tile does not consume the turn (20-round back-off)
constexpr int M62_WATCHDOG = 1;      // 1: any stall; 2: only on the target's own tile with none of its camps visible. M62_IDLEN turns without any action (no enemy within 8, no live capture): drop the target, leave camp tiles
constexpr int M62_IDLEN = 1000000;
constexpr int M62_NOTREASURE = 0;    // Tung build without the opening Treasure emblem (2.0.0: Treasure gold 20% -> 10%)
constexpr int M62_MONSTER = 0;       // Tung build: Monster emblem (2.0.0: +15% damage to camps) in place of Treasure
constexpr int M62_DRAFTV = 0;        // 1: Varg instead of Vesper Vale in the meta draft (2.0.0: Vesper Strength 55->45, Varg 40->45)
