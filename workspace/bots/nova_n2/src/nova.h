// nova squad brain: included in bot.cpp inside namespace mm (after the v1 kit helpers).
// Squads are fixed from the roster; the first healthy member of a squad (tank first) chooses the camp, the others
// follow its published target. Vision is personal, so members converge on the leader's camp, not its position.

static float novaBaseHp(int type) { return v1KitForType(type).base_stats.base_health; }
static float novaCampDps(int type) {
    const auto& s = v1KitForType(type).base_stats;
    return s.base_strength * std::max(0.5f, s.camp_damage_multiplier) + 0.25f * s.base_focus;
}

void Bot::novaInit() {
    if (novaReady) return;
    novaReady = true;
    for (int i = 0; i < 8; ++i) novaSquad[i] = -1;
    const int n = std::min(nAllies, 6);
    std::vector<int> order(n);
    for (int i = 0; i < n; ++i) order[i] = i;
    std::stable_sort(order.begin(), order.end(), [&](int a, int b) { return novaBaseHp(slotType[a]) > novaBaseHp(slotType[b]); });
    // Snake by health: the two healthiest lead different squads.
    static constexpr int snake[6] = {0, 1, 1, 0, 0, 1};
    static constexpr int snake3[6] = {0, 1, 2, 1, 0, 2};
    const bool split = n >= 4;
    for (int k = 0; k < n; ++k) novaSquad[order[k]] = split ? (NOVA_SQUADS >= 3 ? snake3[k] : snake[k]) : 0;
    // Cassi and Issac die together: keep them in one squad.
    int cassi = -1, issac = -1;
    for (int i = 0; i < n; ++i) { if (slotType[i] == static_cast<int>(bc::champion_type::cassi)) cassi = i; if (slotType[i] == static_cast<int>(bc::champion_type::issac)) issac = i; }
    if (split && cassi >= 0 && issac >= 0 && novaSquad[cassi] != novaSquad[issac]) {
        for (int k = n - 1; k >= 0; --k) { const int s = order[k]; if (s != cassi && s != issac && novaSquad[s] == novaSquad[cassi]) { novaSquad[s] = novaSquad[issac]; novaSquad[issac] = novaSquad[cassi]; break; } }
    }
    novaOrder.assign(order.begin(), order.end());
}

int Bot::novaSquadOf(int s) const { return (round < NOVA_JOINT || s < 0 || s >= 8) ? 0 : novaSquad[s]; }

// Leader: first member (health order) that is not low and either is this champion or publishes a target (alive).
int Bot::novaLeader() const {
    const int mine = novaSquadOf(slot);
    for (int s : novaOrder) {
        if (novaSquadOf(s) != mine) continue;
        if (s == slot) return s;
        if (shared[s] & 0x80) continue;
        const int g = (shared[s] & 63) - 1;
        if (g >= 0 && g < static_cast<int>(groups.size())) return s;
    }
    return slot;
}

// Healthy members of my squad that are available (not low; alive = me or publishing a target).
void Bot::novaMembers(std::vector<int>& out) const {
    out.clear();
    const int mine = novaSquadOf(slot);
    for (int s : novaOrder) {
        if (novaSquadOf(s) != mine) continue;
        if (s == slot) { out.push_back(s); continue; }
        if (shared[s] & 0x80) continue;
        const int g = (shared[s] & 63) - 1;
        if (g >= 0 && g < static_cast<int>(groups.size())) out.push_back(s);
    }
}

// Smallest number of the given members (strongest first) that clears the group without losing the tank.
int Bot::novaNeed(const Group& g, const std::vector<int>& members) const {
    if (g.state == 2) return 1;
    const float hp = (g.state == 1 && round - g.seenRound < 30) ? g.hpLeft : g.totalHp;
    if (hp <= 0 || g.totalStr <= 0) return 1;
    std::vector<float> dps; float tank = 0;
    for (int s : members) { dps.push_back(novaCampDps(slotType[s])); }
    std::sort(dps.begin(), dps.end(), std::greater<float>());
    for (int s : members) tank = std::max(tank, novaBaseHp(slotType[s]));
    if (tank <= 0) tank = 1000;
    float sum = 0;
    for (int k = 0; k < static_cast<int>(dps.size()); ++k) {
        sum += dps[k];
        const float clear = hp / std::max(1.0f, sum);
        if (clear * g.totalStr * 0.6f <= NOVA_TANKFRAC * tank) return k + 1;
    }
    return 99;
}

int Bot::novaTarget() {
    novaInit();
    const int lead = novaLeader();
    const int mineSq = novaSquadOf(slot);
    if (lead != slot) {
        const int g = (shared[lead] & 63) - 1;
        if (g >= 0 && g < static_cast<int>(groups.size()) && stalledUntil[g] <= round) { stage = "nova-follow"; return g; }
    }
    std::vector<int> members; novaMembers(members);
    // Camps other squads are working on.
    std::vector<char> taken(groups.size(), 0);
    for (int s = 0; s < nAllies && s < 6; ++s) {
        if (s == slot || novaSquadOf(s) == mineSq || (shared[s] & 0x80)) continue;
        const int g = (shared[s] & 63) - 1; if (g >= 0 && g < static_cast<int>(groups.size())) taken[g] = 1;
    }
    const vec2 pos = bc::self().position();
    int best = -1; float bestScore = 0;
    for (auto& g : groups) {
        if (!enough(43000)) break;
        if (g.monolith || (g.gems <= 0 && g.gold <= 0) || g.dOwn == UNR || g.dEnemy == UNR) continue;
        if (g.dOwn > g.dEnemy - NOVA_ZONE) continue;
        if (taken[g.id] || stalledUntil[g.id] > round || allyCapturing(g.id)) continue;
        const int d = gdist(g, pos); if (d == UNR) continue;
        const int wait = g.state == 3 ? std::max(0, g.respawnAt - round - d) : 0; if (wait > 6) continue;
        const int need = novaNeed(g, members); if (need > static_cast<int>(members.size())) continue;
        float sum = 0; std::vector<float> dps; for (int s : members) dps.push_back(novaCampDps(slotType[s]));
        std::sort(dps.begin(), dps.end(), std::greater<float>()); for (float v : dps) sum += v;
        const float hp = g.state == 2 ? 0 : ((g.state == 1 && round - g.seenRound < 30) ? g.hpLeft : g.totalHp);
        const float clear = hp / std::max(1.0f, sum);
        float score = (g.gems + NOVA_GOLDW * g.gold) / (d + wait + clear + 9.0f);
        if (g.id == target) score *= 1.2f;
        if (score > bestScore) { bestScore = score; best = g.id; }
    }
    if (best >= 0) { stage = "nova-lead"; return best; }
    return -2;  // nothing suitable on our side: fall back to the v62 scorer
}

// May this champion start hitting the group? Only when enough squad members stand next to it, or when it is already awake.
bool Bot::novaGate(int gid) {
    if (!NOVA || round >= NOVA_OPEN || gid < 0 || gid >= static_cast<int>(groups.size()) || !enough(36000)) return true;
    auto& g = groups[gid];
    for (auto p : (bc::vision::camp_tiles() & g.tilesBB).positions()) {
        try { if (bc::vision::camp_at(p).is_awake()) return true; } catch (const TurnAbort&) { throw; } catch (...) {}
    }
    std::vector<int> members; novaMembers(members);
    const int need = novaNeed(g, members);
    if (need <= 1) return true;
    int present = 0;
    for (auto p : bc::vision::champion_tiles(team::ally).positions()) {
        if (!enough(30000)) break;
        int near = 99; for (auto t : g.tiles) near = std::min(near, cheb(p, t));
        if (near > 4) continue;
        unsigned id = 0; if (bc::detail::sdk_champion_at(p.x, p.y, &id)) continue;
        int s = -1; for (int j = 0; j < nAllies; ++j) if (rosterHandles[j] == id) s = j;
        if (s >= 0 && novaSquadOf(s) == novaSquadOf(slot)) ++present;
    }
    if (present >= need) { novaWaitTarget = -1; return true; }
    if (novaWaitTarget != gid) { novaWaitTarget = gid; novaWaitSince = round; }
    if (round - novaWaitSince > NOVA_WAIT) { stalledUntil[gid] = round + 20; novaWaitTarget = -1; target = -1; }
    stage = "nova-wait";
    return false;
}
