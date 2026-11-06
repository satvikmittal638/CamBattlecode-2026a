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
constexpr int M62_NOAPPROACH = 1;       // local HP share < M62_NAPSHARE with a visible enemy within 6: routed steps/dashes may not reduce the distance to the nearest enemy
constexpr float M62_NAPSHARE = 0.5f;
