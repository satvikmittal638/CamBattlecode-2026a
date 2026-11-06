// Fuel calibration bot (analysis harness only, never submitted): measures with fuel_remaining() what
// N calls of each host import cost, so the local turn host can match the official runner's host charges.
#include <cambc.h>
#include <cstdio>
#include <cstdint>
#include <cstring>
#include <vector>
namespace d = cambc::detail;

static void draft_turn() {
    static const cambc::champion_draft order[] = {cambc::champion_draft::heart_of_ruin, cambc::champion_draft::vesper_vale,
        cambc::champion_draft::ryth, cambc::champion_draft::marcella, cambc::champion_draft::vendetta};
    auto mine = cambc::draft::current_draft(cambc::team::ally);
    auto theirs = cambc::draft::current_draft(cambc::team::enemy);
    for (auto p : order) {
        bool used = false;
        for (auto m : mine) used |= m == p;
        for (auto m : theirs) used |= m == p;
        if (!used) { cambc::draft::pick(p); return; }
    }
}

template <class F> static void t(const char* name, int param, F f, int n = 5) {
    long long aux = 0;
    const auto a = cambc::fuel_remaining();
    for (int i = 0; i < n; ++i) aux = f();
    const auto b = cambc::fuel_remaining();
    std::printf("t %s %d %lld %lld\n", name, param, static_cast<long long>(a) - static_cast<long long>(b), aux);
}

int main() {
    int turns = 0;
    for (;;) {
        if (cambc::is_draft()) { draft_turn(); cambc::end_turn(); continue; }
        // One test group per turn (each turn has a fresh 100k budget), on the first champion's turns only.
        const int group = turns++;
        if (d::sdk_my_champion() != 5 && d::sdk_my_champion() != 0) { cambc::end_turn(); continue; }
        cambc::bitboard a, b, r, walls = cambc::map::walls() | cambc::map::holes();
        cambc::bitboard many;
        int k = 0;
        for (auto p : walls.positions()) { (void)p; ++k; }
        for (int y = 0; y < cambc::map::height(); y += 3) for (int x = 0; x < cambc::map::width(); x += 3) many.set({x, y});
        cambc::distance_field df;
        std::uint32_t u = 0; std::int32_t v = 0; std::uint16_t cnt = 0;
        std::vector<d::position> pos(8192);
        std::vector<std::uint8_t> lin(2 * 100 * 100 + 64);
        std::uint8_t sh[8];
        std::uint32_t ids[16];
        const int W = cambc::map::width(), H = cambc::map::height();
        int cx = W / 2, cy = H / 2;
        { d::champion_info me{}; if (d::sdk_champion(static_cast<std::uint32_t>(d::sdk_my_champion()), &me) == 0) { cx = me.x; cy = me.y; } }
        if (group == 0) {
            std::printf("map %d %d walls %d many %u\n", W, H, k, static_cast<unsigned>(many.count()));
            t("empty", 0, [&] { return 0LL; });
            t("Zero", 0, [&] { d::sdk_Bitboard_Zero(r.ptr()); return 0LL; });
            t("Set", 0, [&] { d::sdk_Bitboard_Set(r.ptr(), 3, 3, 1); return 0LL; });
            t("Test", 0, [&] { d::sdk_Bitboard_Test(a.ptr(), 3, 3, &v); return 0LL; });
            t("Union", 0, [&] { d::sdk_Bitboard_Union(a.ptr(), b.ptr(), r.ptr()); return 0LL; });
            t("Intersect", 0, [&] { d::sdk_Bitboard_Intersect(a.ptr(), b.ptr(), r.ptr()); return 0LL; });
            t("Not", 0, [&] { d::sdk_Bitboard_Not(a.ptr(), r.ptr()); return 0LL; });
            t("IsZero", 0, [&] { d::sdk_Bitboard_IsZero(a.ptr(), &v); return 0LL; });
            t("IsEqual", 0, [&] { d::sdk_Bitboard_IsEqual(a.ptr(), b.ptr(), &v); return 0LL; });
            t("NumSetBits", 0, [&] { d::sdk_Bitboard_NumSetBits(many.ptr(), &u); return (long long)u; });
            t("ShiftRight", 1, [&] { d::sdk_Bitboard_ShiftRight(many.ptr(), r.ptr(), 1); return 0LL; });
            t("ShiftUp", 1, [&] { d::sdk_Bitboard_ShiftUp(many.ptr(), r.ptr(), 1); return 0LL; });
            t("ShiftRight", -3, [&] { d::sdk_Bitboard_ShiftRight(many.ptr(), r.ptr(), -3); return 0LL; });
            t("ShiftUp", 9, [&] { d::sdk_Bitboard_ShiftUp(many.ptr(), r.ptr(), 9); return 0LL; });
            t("GetSetBits", 0, [&] { d::sdk_Bitboard_GetSetBits(b.ptr(), pos.data(), pos.size(), &u); return (long long)u; });
            t("GetSetBits", 1, [&] { d::sdk_Bitboard_GetSetBits(a.ptr(), pos.data(), pos.size(), &u); return (long long)u; });
            t("GetSetBits", 2, [&] { d::sdk_Bitboard_GetSetBits(many.ptr(), pos.data(), pos.size(), &u); return (long long)u; });
            t("GetSetBits", 3, [&] { d::sdk_Bitboard_GetSetBits(many.ptr(), pos.data(), 10, &u); return (long long)u; });
            t("ImportRaw", 0, [&] { d::sdk_Bitboard_ImportRawBuffer(r.ptr(), reinterpret_cast<const std::uint8_t*>(a.ptr()), d::layout().board_bytes); return 0LL; });
            t("ExportLinear", 0, [&] { d::sdk_Bitboard_ExportLinearBuffer(many.ptr(), lin.data(), (W * H + 7) / 8); return 0LL; });
            t("DFExportLinear", 0, [&] { d::sdk_DistanceField_ExportLinearBuffer(df.ptr(), lin.data(), W * H * 2); return 0LL; });
            t("DFGet", 0, [&] { std::uint16_t x; d::sdk_DistanceField_Get(df.ptr(), 4, 4, &x); return 0LL; });
            for (float rad : {0.f, 1.f, 2.f, 3.f, 5.f, 8.f, 12.f}) t("DrawCheb", static_cast<int>(rad), [&] { d::sdk_Bitboard_DrawChebyshev(r.ptr(), cx, cy, rad); return 0LL; });
            t("DrawCheb", 103, [&] { d::sdk_Bitboard_DrawChebyshev(r.ptr(), 1, 1, 3.f); return 0LL; });
        } else if (group >= 1 && group <= 12) {
            // One flood-fill measurement per turn (fresh budget), 2 calls each.
            static const int dists[6] = {1, 2, 4, 8, 16, 40};
            const int g = group - 1;
            const int dist = dists[g % 6];
            cambc::bitboard root; root.set({cx, cy});
            if (g < 6) t("Reach", dist, [&] { d::sdk_Bitboard_ReachableMask(walls.ptr(), cx, cy, r.ptr(), dist); u = 0; d::sdk_Bitboard_NumSetBits(r.ptr(), &u); return (long long)u; }, 2);
            else t("DF", dist, [&] { d::sdk_DistanceField_ComputeWithExpansionCount(walls.ptr(), root.ptr(), r.ptr(), df.ptr(), dist, &cnt); u = 0; d::sdk_Bitboard_NumSetBits(r.ptr(), &u); return (long long)u * 1000 + cnt; }, 2);
        } else if (group == 13) {
            cambc::bitboard dst; dst.set({cx + 5, cy});
            cambc::bitboard root1; root1.set({cx, cy});
            t("DFTo", 65535, [&] { d::sdk_DistanceField_ComputeToWithExpansionCount(walls.ptr(), root1.ptr(), dst.ptr(), r.ptr(), df.ptr(), 65535, &cnt); u = 0; d::sdk_Bitboard_NumSetBits(r.ptr(), &u); return (long long)u * 1000 + cnt; }, 2);
        } else if (group == 14) {
            cambc::bitboard root; root.set({cx, cy});
            t("DF", 65535, [&] { d::sdk_DistanceField_ComputeWithExpansionCount(walls.ptr(), root.ptr(), r.ptr(), df.ptr(), 65535, &cnt); u = 0; d::sdk_Bitboard_NumSetBits(r.ptr(), &u); return (long long)u * 1000 + cnt; }, 1);
        } else if (group == 15) {
            t("vision", 0, [&] { d::sdk_vision(r.ptr()); return 0LL; });
            t("ally_occ", 0, [&] { d::sdk_ally_occupancy(r.ptr()); return 0LL; });
            t("enemy_occ", 0, [&] { d::sdk_enemy_occupancy(r.ptr()); return 0LL; });
            t("camp_occ", 0, [&] { d::sdk_camp_occupancy(r.ptr()); return 0LL; });
            t("ward_occ", 0, [&] { d::sdk_ally_ward_occupancy(r.ptr()); return 0LL; });
            t("tp_occ", 0, [&] { d::sdk_teleport_occupancy(r.ptr()); return 0LL; });
            t("lock_occ", 0, [&] { d::sdk_enemy_altar_lock_occupancy(r.ptr()); return 0LL; });
            t("map_mask", 0, [&] { d::sdk_bc_map_mask(0, r.ptr()); return 0LL; });
            t("allies", 0, [&] { d::sdk_allies(ids, 16, &u); return (long long)u; });
            t("enemies", 0, [&] { d::sdk_enemies(ids, 16, &u); return (long long)u; });
            t("num_allies", 0, [&] { d::sdk_num_allies(&u); return (long long)u; });
            t("read_shared", 8, [&] { d::sdk_read_shared_memory(0, sh, 8); return 0LL; });
            t("read_shared", 1, [&] { d::sdk_read_shared_memory(0, sh, 1); return 0LL; });
            t("write_shared", 1, [&] { d::sdk_write_shared_memory(7, sh, 1); return 0LL; });
            t("read_draft", 64, [&] { d::sdk_read_draft_memory(0, lin.data(), 64); return 0LL; });
            t("read_draft", 1024, [&] { d::sdk_read_draft_memory(0, lin.data(), 1024); return 0LL; });
            d::champion_info ci{};
            t("champion", 0, [&] { d::sdk_champion(static_cast<std::uint32_t>(d::sdk_my_champion()), &ci); return 0LL; });
            std::vector<std::uint32_t> words(4096);
            t("camp_layout", 0, [&] { d::sdk_map_camp_layout(words.data(), words.size(), &u); return (long long)u; }, 1);
            std::vector<d::buff_data> bd(16);
            t("buffs", 0, [&] { d::sdk_champion_buff_data(static_cast<std::uint32_t>(d::sdk_my_champion()), bd.data(), bd.size(), &u); return (long long)u; });
            std::uint32_t items[64];
            t("items", 0, [&] { d::sdk_champion_items(static_cast<std::uint32_t>(d::sdk_my_champion()), items); return 0LL; });
            d::game_settings gs{};
            t("settings", 0, [&] { d::sdk_get_settings(&gs); return 0LL; });
            d::metadata md{};
            t("metadata", 0, [&] { d::sdk_bc_metadata(&md); return 0LL; });
            char buf[128];
            t("last_error", 0, [&] { d::sdk_bc_get_last_error(buf, sizeof buf); return 0LL; });
            t("fuel_remaining", 0, [&] { return (long long)d::sdk_fuel_remaining(); });
        }
        std::fflush(stdout);
        cambc::end_turn();
    }
}
