#pragma once
// v62m: switchable changes learned from the reference wins against Intercontinental Fish and Mite
// (analysis/meta_fm_2026-10-25). Every switch defaults to v62 behaviour; build_v62m.mjs overrides them.
constexpr int M62_SHARE = 0;            // tactical danger: an enemy closer to (or as close and weaker than us to) a healthy ally counts x M62_SHAREW
constexpr float M62_SHAREW = 0.35f;
constexpr int M62_COMMIT = 0;           // local HP share >= M62_COMMITSHARE: risk limit x M62_COMMITRISK, 3 target choices, no idle veto
constexpr float M62_COMMITSHARE = 0.55f;
constexpr float M62_COMMITRISK = 1.6f;
constexpr int M62_FLEE = 0;             // local HP share < M62_FLEESHARE with an enemy within 5 and no kill: step toward allies / away
constexpr float M62_FLEESHARE = 0.35f;
constexpr int M62_FOCUS = 0;            // tactical target order: distance weight 30 -> 8 (allies converge on the weakest enemy)
constexpr int M62_WARD = 0;             // re-place the ward every charge 2-4 tiles ahead toward the enemy side (v62: bushes only, >=7 away)
constexpr int M62_DRAFT = 1;            // 1: Vesper Vale, Heart of Ruin, Vendetta, Tavi, Marcella (4: Vesper, Vendetta, Heart, Tavi; 3: Vesper, Vendetta, Heart)
constexpr int M62_NOLINK = 0;           // a partner going low does not send a healthy champion home
constexpr int M62_PRIO = 0;             // Fish/winner turn order (X_PRIO): champions near enemies act first, carriers and wounded last
