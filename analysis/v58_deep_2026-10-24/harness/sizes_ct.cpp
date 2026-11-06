#include <cambc.h>
namespace D = cambc::detail;
#define S(T) static_assert(sizeof(T) == 1 && alignof(T) == 1, #T);
S(D::champion_info) S(D::champion_identity) S(D::champion_design) S(D::ability_props) S(D::buff_data) S(D::camp_state) S(D::camp_info) S(D::camp_design) S(D::camp_buff_data) S(D::item_info) S(D::consumable_info) S(D::game_settings) S(D::metadata) S(D::aabb) S(D::ward_resources) S(D::position) S(D::altar_lock_info) S(D::teleport_info) S(D::camp_group_info) S(D::ward_info)
