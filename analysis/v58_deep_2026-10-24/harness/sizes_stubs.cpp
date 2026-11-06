#include <cambc.h>
#include <cstring>
namespace cambc::detail { extern "C" {
std::int32_t sdk_get_settings(game_settings* o){ std::memset(o,0,sizeof(*o)); return 0; }
std::int32_t sdk_consumable_info(std::uint32_t, consumable_info* o){ std::memset(o,0,sizeof(*o)); return 0; }
std::int32_t sdk_item_info(std::uint32_t, item_info* o){ std::memset(o,0,sizeof(*o)); return 0; }
std::int32_t sdk_bc_metadata(metadata* o){ *o = {100,100,13,13,13,13*13*8,10000*2}; return 0; }
std::int32_t sdk_bc_get_last_error(char* b, std::uint32_t n){ if(n) b[0]=0; return 0; }
}}
