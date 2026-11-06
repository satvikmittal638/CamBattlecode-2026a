/// @file
/// Raw Runner imports and C-compatible engine records; prefer the checked cambc.h wrappers.
/// Buffer addresses refer to guest linear memory and must satisfy the recorded sizes and alignment.
#pragma once

#include <cstddef>
#include <cstdint>
#include <new>
#include <stdexcept>
#include <string>

#if defined(__wasm__)
#define BC_IMPORT(name) __attribute__((import_module("env"), import_name(name)))
#else
#define BC_IMPORT(name)
#endif

namespace cambc
{
/// Camp design stats and growth parameters; layout matches Game_CampStats.
struct camp_stats
{
	float vision_radius;
	std::int32_t base_move_speed, base_attack_range;
	float base_health, health_growth, base_strength, strength_growth;
	float base_focus, focus_growth;
	friend bool operator==(const camp_stats&, const camp_stats&) = default;
};

/// Champion design stats and growth values.
struct champion_stats
{
	std::int32_t vision_radius, base_move_speed, base_attack_range;
	float		 base_health, health_growth, base_strength, strength_growth;
	float		 base_focus, focus_growth, camp_damage_multiplier;
	friend bool operator==(const champion_stats&, const champion_stats&) = default;
};
} // namespace cambc

/// Low-level host ABI. Buffer addresses refer to guest linear memory.
namespace cambc::detail
{

/// Map dimensions and byte sizes for engine-chunked buffers.
struct metadata
{
	/// Map dimensions in tiles.
	std::int32_t  width, height;
	/// Counts of 8-by-8 chunks and padded bitboard chunk stride.
	std::uint32_t chunked_width, chunked_height, chunk_stride;
	/// Required bitboard and distance-field raw storage sizes in bytes.
	std::uint32_t board_bytes, field_bytes;
};

/// Tile bounds with an exclusive maximum corner.
struct aabb
{
	std::int32_t min_x, min_y, max_x, max_y;
};

/// Runtime camp-group capture rewards.
struct camp_group_info
{
	std::uint32_t gems, gold;
};

/// Physical camp type and spawn tile.
struct camp_info
{
	std::int32_t x, y, type;
};

/// Visible camp combat state.
struct camp_state
{
	std::int32_t x, y;
	float health, max_health, strength, focus;
	std::int32_t cooldowns[2];
};

using camp_base_stats = cambc::camp_stats;

/// Champion properties visible to the current perspective.
struct champion_info
{
	std::int32_t team, type, x, y;
	float		 health, max_health, strength, focus;
	std::int32_t move_speed, attack_range, state;
};

/// Immutable champion team and design, readable without vision.
struct champion_identity
{
	std::int32_t team, type;
};

using champion_base_stats = cambc::champion_stats;

inline constexpr std::uint32_t ability_target_camps = 1u << 0;
inline constexpr std::uint32_t ability_target_enemies = 1u << 1;
inline constexpr std::uint32_t ability_target_allies = 1u << 2;
inline constexpr std::uint32_t ability_target_self = 1u << 3;
inline constexpr std::uint32_t ability_target_ground = 1u << 4;

/// Ability-specific data selected by ability_props::kind.
union ability_payload
{
	std::uint32_t enhanced_attack;

	struct
	{
		float range, modifier;
	} damage, heal;

	struct
	{
		float		 range, radius, modifier;
		std::int32_t duration;
	} aoe_damage;

	struct
	{
		float		 range, modifier;
		std::int32_t duration;
	} cc, shield;

	struct
	{
		float range, radius, modifier;
		std::int32_t duration;
	} dash;
};

/// Ability properties with a tagged payload.
struct ability_props
{
	std::uint32_t	kind;
	std::int32_t	cooldown;
	/// ABI-mandated storage and target/attribute masks; public metadata exposes only the masks.
	std::uint32_t	max_charges, targets, attributes;
	ability_payload payload;
};

/// Engine unit definition with tagged ability slots and explicit ABI padding.
struct unit_definition
{
	std::int32_t type;
	std::uint32_t vision_type;
	std::uint8_t passive_type;
	std::byte padding[3];
	ability_props abilities[2];
	std::uint8_t attack_type;
	std::byte tail_padding[3];
};

/// Engine camp definition followed by its base stats; preserves the raw ABI layout.
struct camp_design
{
	unit_definition definition;
	camp_base_stats base_stats;
};


}
#include <cstdio>
int main(){printf("%zu %zu\n",offsetof(cambc::detail::camp_design,base_stats),offsetof(cambc::camp_stats,base_attack_range));}
