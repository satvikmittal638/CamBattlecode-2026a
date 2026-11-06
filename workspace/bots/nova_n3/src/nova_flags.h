#pragma once
// nova: squad-based opening (analysis/meta_fm_2026-10-25). Reference winners spend 20% of their first 100 rounds
// hitting camps (v62 13-15%), die half as often and capture 4.0-4.5 camps by r100 (v62 2.9-3.1). Nova farms in fixed
// squads, only on its own side during the opening, only camps the squad can clear without losing its tank, and never
// starts a camp before enough of the squad stands next to it.
constexpr int NOVA = 1;                 // 0 = plain v62m behaviour
constexpr int NOVA_OPEN = 150;          // opening ends at this round (afterwards the v62 scorer chooses camps)
constexpr int NOVA_ZONE = 2;            // opening camps need dOwn <= dEnemy - NOVA_ZONE (clearly our side)
constexpr float NOVA_TANKFRAC = 0.6f;   // feasible when projected camp damage on the tank <= this x tank HP
constexpr float NOVA_GOLDW = 0.5f;      // gem-equivalents per gold in the opening score
constexpr int NOVA_JOINT = 0;           // before this round all champions form one squad
constexpr int NOVA_WAIT = 14;           // rounds a squad waits for members at a camp before dropping it
constexpr int NOVA_SQUADS = 3;          // squads for 4+ champions: 2 (5 picks: 3+2) or 3 (5 picks: 2+2+1)
