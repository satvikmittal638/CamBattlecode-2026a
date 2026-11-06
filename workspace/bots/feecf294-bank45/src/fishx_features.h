#pragma once
// fishx: tm30 (team v30) plus switchable elements of Intercontinental Fish's play
// (analysis/fish_meta/FISH_META.md). Every switch defaults to tm30 behaviour (false) until a
// both-side local evaluation shows it helps; tools/variant.mjs flips them per variant.
constexpr bool X_PRIO = false;        // Fish turn order: near enemies act first, wounded gem carriers last
constexpr bool X_CAMPSTUN = true;    // stun armed camps (Cassi/Tavi/Prism) when no enemy champion is near
constexpr bool X_BUILD = false;       // Fish emblem orders per champion, then Power in the scaling stat
constexpr bool X_CARRYCAP = true;    // captures go to the carries (Stellar > Ren > Issac > Varg > Cassi > Ryth)
constexpr bool X_SHOPRECALL = true;  // recall to shop with X_SHOPGOLD+ gold when no enemy is within 8
constexpr int X_SHOPGOLD = 150;
constexpr bool X_BANK = true;        // keep farming small bags: tribute below X_BANKMIN only with an altar within X_BANKNEAR
constexpr int X_BANKMIN = 45;
constexpr int X_BANKNEAR = 8;
constexpr bool X_DRAFT4 = true;      // fourth pick Ryth instead of Varg (Fish's 4-pick team)
constexpr bool X_CARRYEQ = false;     // with X_CARRYCAP: Stellar and Ren share the top capture rank
constexpr bool X_BUILDSTELLAR = false; // Fish's Stellar build only (Power Focus first); other champions keep tm30 builds
constexpr bool X_THREAT = false;       // isolated and outgunned (or 2x outgunned): leave before the fight, drop the task
constexpr float X_THREATRATIO = 1.3f;
constexpr bool X_RECALLGUARD = true;  // do not reissue a recall cancelled by damage; walk home first
constexpr bool X_BOSSTRIB = true;     // boss maps: no 100+ gem tribute with an enemy within 6; step away instead
constexpr int X_CARRYMODE = 2;          // with X_CARRYCAP: 0 Fish order, 1 casters first (Stellar=Cassi>Ren>Issac>Varg>Ryth), 2 poorest ally first
constexpr float X_GOLDW = 0.3f;       // gem-equivalents per gold in camp scoring (tm30: 0.15)
constexpr bool X_GOLDGROUPS = true;   // gold-only groups on our side compete in the main camp scoring
constexpr bool X_GATEDRAFT = false;    // gated-altar maps: normal draft and builds instead of the spell gate team
constexpr bool X_GATESTEAL = true;    // gated-altar maps: only finish a gate observed at or below X_STEALFRAC health
constexpr bool X_BOSSSTEAL = true;    // boss-only maps: casters only finish a monolith at or below X_STEALFRAC health
constexpr float X_STEALFRAC = 0.3f;
constexpr bool X_RALLY = false;        // healthy champions within X_RALLYRANGE converge on an engaged ally when our local power matches theirs
constexpr int X_RALLYRANGE = 12;
constexpr bool X_MELEEHIT = true;     // melee hits the weakest adjacent enemy champion before any retreat step
// --- v43x experiment switches ---
constexpr bool X_PACK = true;     // converge on ally-claimed camp groups (1 ally x1.6, 2 allies x1.2, 3+ x0.6) instead of v43 penalty x0.6
constexpr float X_PACKMINHP = 4000.0f;  // pack bonus only for groups with at least this total HP (0 = all groups, as in v43x-A)
constexpr int X_BRUISER = 2;      // 0 v43 builds; 1 Bruiser Health -> Bruiser damage stat -> Power (v43x-A); 2 Jungle -> Bruiser Health -> Power
// --- v43x-C: the procless / EMPEROR Tung meta (analysis/v43x/V43XC.md) ---
constexpr bool X_META = true;     // draft Heart, Vesper Vale, Ryth, Marcella, Vendetta (3 picks: Heart, Vesper Vale, Vendetta)
constexpr bool X_TBUILD = true;   // Tung builds: Treasure -> Jungle -> Bruiser Health -> Durability Health -> Bruiser damage, then Bruiser Health/damage alternating
constexpr float X_FIGHTRISK = 0.95f;  // tactical plans: reject a non-kill plan whose 2-turn incoming estimate reaches this share of HP (v43: .95)
constexpr float X_ESCAPERISK = 0.55f; // no plan: burst-escape when staying would take this share of HP (v43: .55)
constexpr bool X_TACTREACH = true;    // skip the tactical plan search when no enemy is within one step plus our reach (fuel standoff fix)
constexpr bool X_BIGCOMMIT = false;   // big groups (>= X_PACKMINHP): visible healthy uncommitted allies within X_BIGRANGE count as arriving helpers
constexpr int X_BIGRANGE = 10;
constexpr bool X_OUTNUM = false;      // with outgunnedIsolated: leave when enemies within 6 >= allies within 6 (incl. self) + X_OUTNUMBY
constexpr int X_OUTNUMBY = 2;
constexpr int X_GOLDRICH = 25;        // own shards at which gold weight drops (1000 = off; v43x-D: 25, gold_rush -189 -> +93 local mean margin)
constexpr float X_GOLDRICHW = 0.3f;   // multiplier on X_GOLDW once rich
constexpr int X_GROUPR = 0;           // cohesion: groups farther than this from every ally / ally claim score x X_GROUPF (0 = off)
constexpr float X_GROUPF = 0.5f;
constexpr int X_GROUPTEAM = 5;        // cohesion applies when our team has at most this many champions
constexpr bool X_LOCKATK = false;     // lock an altar where a visible enemy is tributing (cancels the channel; 5 hits to clear)
constexpr bool X_LOCKDEF = false;     // lock our tribute altar first (an altar with a lock cannot be locked again; enemy cannot use it)
constexpr int X_LOCKDEFMIN = 30;      // X_LOCKDEF only for bags of at least this many gems
constexpr int X_SIDESLACK = 4;        // camp groups are ours if our spawn distance <= enemy spawn distance + this (v43: 4)
constexpr bool X_HOME = false;        // X_TBUILD: Home Health emblem third (recall 3 turn ends instead of 5)
constexpr int X_RECALLSAFE = 6;       // low HP: recall only with no visible enemy within this range, else walk home (6 = v43 behaviour)
constexpr bool X_SAFEDASH = false;    // retreat (moveAway) dashes home only to tiles no nearer any visible threat
constexpr int X_FOEMEM = 0;           // low-HP retreat: enemies seen within this many rounds still count as threats unless their tile is visibly empty (0 = off)
constexpr float X_LOWENTER = 0.35f;   // low-HP retreat starts below this HP fraction (v43: .35)
constexpr float X_LOWEXIT = 0.6f;     // and ends at or above this (v43: .6)
constexpr bool X_BOSSRAID = false;    // boss-only maps: meta draft + Tung builds; raid monoliths as a team once ready
constexpr int X_RAIDROUND = 400;      // raid from this round ...
constexpr float X_RAIDHP = 1600.0f;   // ... or once this champion has this much max HP (and is above 60% HP)
constexpr bool X_FOCUS = false;       // shared focus target (byte 5): allies prefer the enemy a teammate just committed to
constexpr float X_FOCUSBONUS = 80.0f;
constexpr int X_GOLDT = 250;          // from this round gold weight is multiplied by X_GOLDTW (100000 = off)
constexpr float X_GOLDTW = 0.5f;
constexpr bool X_FIGHTSHIELD = false; // after a fight action with no cast, raise a ready self-shield when an enemy is within 2
constexpr float X_HEALRECALL = 0.7f;  // recall (shopping-recall safety checks, or during a capture) below this HP fraction (0 = off)
constexpr float X_STICKY = 1.25f;     // score multiplier for the current target (hysteresis; v43: 1.25)
constexpr int X_COMMITDIST = 12;      // keep a still-valid target once within this route distance (0 = off)
constexpr bool X_BANKFIRST = false;   // shopping recall with >= 15 gems: tribute first if an altar is within spawn->altar distance + 5
