#pragma once
// Parameters are provisional until the fresh fit-map evidence is processed.
namespace policy {
constexpr bool fitted=false;
constexpr float recallHp=.35f;
constexpr float escapeShare=.35f;
constexpr int recallGold=150;
constexpr int bankBag=60;
constexpr int safeBankBag=24;
constexpr float goldWeight=.15f;
constexpr float claimPenalty=.6f;
}
