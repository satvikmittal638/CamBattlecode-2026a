#pragma once
#include <cambc.h>
#include <cstdint>
#include <vector>

// KratosMessi mimic. Each champion runs its own instance: it farms its own half of the map
// alone (one capturer per camp), tributes when the bag is big or an altar is close,
// recalls at ~1/3 HP or to spend >=150 gold after a tribute, and fights only what is in reach.
class Bot {
public:
    void play_turn();

private:
    enum class Mode { farm, tribute, idle };
    enum class Known : std::uint8_t { alive, reward, respawning };

    struct Group {
        cambc::map::camp_group handle;
        std::vector<cambc::vec2> cells;
        int gems = 0, gold = 0, respawn = 0;
        bool monolith = false, gold_only = false, own_side = true;
        int capacity = 1;
        int own_dist = 0, enemy_dist = 0;
        // knowledge from this champion's own vision
        Known known = Known::alive;
        int respawn_at = 0;   // round it is expected back (if respawning)
        int seen_round = -1;
    };

    // ---- static data (initialised on first turn)
    bool init_done = false;
    int W = 0, H = 0, slot = 0, n_allies = 1;
    bool ranged = false, melee = true;
    cambc::champion_type type{};
    cambc::bitboard static_blocked;   // walls | holes | altars | enemy spawn
    std::vector<Group> groups;
    std::vector<std::int16_t> cell_group; // W*H, -1 = none
    std::vector<cambc::vec2> altars;
    std::vector<cambc::distance_field> altar_field; // distance to the tributing ring of each altar
    cambc::distance_field own_field;  // distance to own spawn

    // ---- dynamic state
    Mode mode = Mode::farm;
    int target = -1;          // group index
    int target_since = 0;
    int last_gems = 0;
    float last_hp = 0;
    bool was_submitting = false;
    bool was_recalling = false;
    bool going_home = false;
    int tribute_altar = -1;
    int lost_target_round = -1;
    bool need_reselect = true;
    int last_round = -1;

    void init();
    void update_knowledge();
    void write_claim(int group, bool capturing);
    int claim_of(int other_slot, bool* capturing) const;

    bool at_spawn() const;
    void shop();
    bool try_altar_lock();
    bool fight();
    void cast_on_enemy(const cambc::champion& enemy);
    void select_target();
    bool decide_tribute();
    bool do_tribute();
    bool do_farm();
    bool attack_camp_in_range(int group_only);
    bool move_to_goals(const cambc::bitboard& goals, bool allow_dash);
    bool flee();
    bool recall_safely(cambc::vec2 pos);
    bool escape_camps(const std::vector<cambc::camp>& camps);
    void varg_shield();
    int altar_dist(cambc::vec2 p, int* which) const;
    int group_eta(const Group& g, const cambc::distance_field& f) const;
};
