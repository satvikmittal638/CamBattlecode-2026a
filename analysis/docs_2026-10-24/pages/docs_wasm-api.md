<!-- source: https://2026a.battlecode.co.uk/game/docs/wasm-api (language: cpp) -->

[◇ Game handbook](/game/docs)[Patch notes ↗](/game/patch-notes)

Bot APIWASM API referenceClose

Find a rule or champion

Code language

# WASM API reference

These are the bot-facing imports registered by the runner under module `env`. Import names are case-sensitive and identical in every guest language.

Find a WASM import, record or constant

330 of 330 declarations

Expand allCollapse all

*   module`env`240
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_game_settings(`[`Game_Settings`](/game/docs/wasm-api#wasm-ABI-Records-Game_Settings) `*ptr);`
        
        WASM ABI: `i32 game_settings(i32 ptr);`
        
        Read the immutable engine tuning (timers, ranges and memory capacities). This query does not require game initialization.
        
        *   `@param ptr`: Address of a 120-byte [`Game_Settings`](/game/docs/wasm-api#wasm-ABI-Records-Game_Settings) record, aligned to 8 bytes. Memory: at least 120 bytes in exported linear memory; 8-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("game_settings")))
        int32_t host_game_settings(Game_Settings *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_game_settings(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_item_info(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `item,` [`Game_ItemInfo`](/game/docs/wasm-api#wasm-ABI-Records-Game_ItemInfo) `*ptr);`
        
        WASM ABI: `i32 item_info(i32 item, i32 ptr);`
        
        Read an item's price, stat points, passive and automatic-combination recipe, indexed by [`Item`](/game/docs/wasm-api#wasm-ABI-Constants-Item).
        
        *   `@param item`: [`Item`](/game/docs/wasm-api#wasm-ABI-Constants-Item) ID identifying the item to query.
        *   `@param ptr`: Address of the [`Game_ItemInfo`](/game/docs/wasm-api#wasm-ABI-Records-Game_ItemInfo) output. Memory: at least 40 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("item_info")))
        int32_t host_item_info(int32_t item, Game_ItemInfo *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_item_info(item, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_consumable_info(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `consumable,` [`Game_ConsumableInfo`](/game/docs/wasm-api#wasm-ABI-Records-Game_ConsumableInfo) `*ptr);`
        
        WASM ABI: `i32 consumable_info(i32 consumable, i32 ptr);`
        
        Invalid consumable IDs return `e_ErrorCode_invalidAction_buyConsumable_invalidType`, leaving the output unchanged. Null outputs return `e_ErrorCode_nullptr`.
        
        *   `@param consumable`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_ConsumableInfo`](/game/docs/wasm-api#wasm-ABI-Records-Game_ConsumableInfo) output. Memory: at least 8 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("consumable_info")))
        int32_t host_consumable_info(int32_t consumable, Game_ConsumableInfo *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_consumable_info(consumable, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_my_team();`
        
        WASM ABI: `i32 my_team();`
        
        Return this bot's fixed team: 0 for A, 1 for B.
        
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — The team directly, not a status code.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("my_team")))
        int32_t host_my_team();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_my_team();
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_my_champion();`
        
        WASM ABI: `i32 my_champion();`
        
        Return the physical champion handle controlled by this bot. A draft bot has no champion and receives -1 ([`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `0xffffffff`).
        
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — The handle directly, not a status code.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("my_champion")))
        int32_t host_my_champion();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_my_champion();
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_type();`
        
        WASM ABI: `i32 champion_type();`
        
        Return the controlled physical [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion) design ID, or -1 for a draft bot. [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion) and [`ChampionDraft`](/game/docs/wasm-api#wasm-ABI-Constants-ChampionDraft) have different numbering after Cassi & Issac.
        
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — The design ID directly, not a status code.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_type")))
        int32_t host_champion_type();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_type();
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_width();`
        
        WASM ABI: `i32 map_width();`
        
        Return the map width in tiles.
        
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — The width directly, not a status code.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_width")))
        int32_t host_map_width();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_width();
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_height();`
        
        WASM ABI: `i32 map_height();`
        
        Return the map height in tiles.
        
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — The height directly, not a status code.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_height")))
        int32_t host_map_height();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_height();
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_is_visible(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 is_visible(i32 x, i32 y, i32 ptr);`
        
        Test an in-bounds tile against individual vision; neutral always sees it.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("is_visible")))
        int32_t host_is_visible(int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_is_visible(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_has_camp(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 has_camp(i32 x, i32 y, i32 ptr);`
        
        Test for a visible camp on a visible tile.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("has_camp")))
        int32_t host_has_camp(int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_has_camp(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_has_champion(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 has_champion(i32 x, i32 y, i32 ptr);`
        
        Test for a visible champion on a visible tile.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("has_champion")))
        int32_t host_has_champion(int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_has_champion(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_has_ward(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 has_ward(i32 x, i32 y, i32 ptr);`
        
        Test for a ward within the observer's effective vision.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("has_ward")))
        int32_t host_has_ward(int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_has_ward(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_has_control_ward(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 has_control_ward(i32 x, i32 y, i32 ptr);`
        
        Test whether the tile contains a control ward known to the observer.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("has_control_ward")))
        int32_t host_has_control_ward(int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_has_control_ward(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_is_alive(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 champion_is_alive(i32 handle, i32 ptr);`
        
        Read public champion life state without requiring vision.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_is_alive")))
        int32_t host_champion_is_alive(int32_t handle, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_is_alive(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_charges(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `ability,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_charges(i32 handle, i32 ability, i32 ptr);`
        
        Read actual charges for slot 0 or 1; hidden champions return `api_notInVision`.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ability`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_charges")))
        int32_t host_champion_charges(int32_t handle, int32_t ability, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_charges(handle, ability, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_cooldown(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `ability,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_cooldown(i32 handle, i32 ability, i32 ptr);`
        
        Read actual cooldown for slot 0 or 1; hidden champions return `api_notInVision`. Positive cooldowns tick at the end of this champion's turn, including the casting turn.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ability`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_cooldown")))
        int32_t host_champion_cooldown(int32_t handle, int32_t ability, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_cooldown(handle, ability, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_submitted_gems(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 submitted_gems(i32 ptr);`
        
        Read submitted gems for team A or B; neutral returns their sum.
        
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("submitted_gems")))
        int32_t host_submitted_gems(uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_submitted_gems(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_spawn_region(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `team,` [`Aabb`](/game/docs/wasm-api#wasm-ABI-Records-Aabb) `*ptr);`
        
        WASM ABI: `i32 spawn_region(i32 team, i32 ptr);`
        
        Read the spawn region for team A or B, including during draft. Maximum bounds are exclusive.
        
        *   `@param team`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Aabb`](/game/docs/wasm-api#wasm-ABI-Records-Aabb) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("spawn_region")))
        int32_t host_spawn_region(int32_t team, Aabb *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_spawn_region(team, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_draft_current_round(`[`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*ptr);`
        
        draft
        
        WASM ABI: `i32 draft_current_round(i32 ptr);`
        
        Read the zero-based current draft round; returns `draft_notDrafting` outside drafting.
        
        *   `@param ptr`: Address of the [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("draft_current_round")))
        int32_t host_draft_current_round(uint8_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_draft_current_round(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_draft_num_rounds(`[`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*ptr);`
        
        WASM ABI: `i32 draft_num_rounds(i32 ptr);`
        
        Read the map's number of draft rounds, available as soon as the map is loaded.
        
        *   `@param ptr`: Address of the [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("draft_num_rounds")))
        int32_t host_draft_num_rounds(uint8_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_draft_num_rounds(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_draft_champion(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion);`
        
        draft
        
        WASM ABI: `i32 draft_champion(i32 champion);`
        
        Submit a [`ChampionDraft`](/game/docs/wasm-api#wasm-ABI-Constants-ChampionDraft) choice for this team's current draft round. Only the scheduled draft instance may pick. This takes a draft choice ID, not a physical [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion) type or champion handle; selecting Cassi & Issac once creates two bodies.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("draft_champion")))
        int32_t host_draft_champion(int32_t champion);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_draft_champion(champion);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_draft_get(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `of_team,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `round,` [`ChampionDraft`](/game/docs/wasm-api#wasm-ABI-Identifiers-ChampionDraft) `*ptr);`
        
        WASM ABI: `i32 draft_get(i32 of_team, i32 round, i32 ptr);`
        
        Read a completed draft round. Pending and unsubmitted picks return `draft_unavailable`.
        
        *   `@param of_team`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param round`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`ChampionDraft`](/game/docs/wasm-api#wasm-ABI-Constants-ChampionDraft) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("draft_get")))
        int32_t host_draft_get(int32_t of_team, int32_t round, ChampionDraft *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_draft_get(of_team, round, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_state(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_CampState`](/game/docs/wasm-api#wasm-ABI-Identifiers-Game_CampState) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 camp_state(i32 handle, i32 ptr);`
        
        Query life/wake state. The current tile (last occupied tile when dead) must be in vision. Observer queries bypass vision. Invalid/hidden queries leave the output unchanged.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_CampState`](/game/docs/wasm-api#wasm-ABI-Constants-Game_CampState) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_state")))
        int32_t host_camp_state(int32_t handle, Game_CampState *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_state(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_group_state(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `group,` [`Game_CampGroupState`](/game/docs/wasm-api#wasm-ABI-Identifiers-Game_CampGroupState) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 camp_group_state(i32 group, i32 ptr);`
        
        Any original spawn tile in the champion's effective vision reveals the group. A positive observed timer persists outside vision until due, then becomes unknown. Neutral perspective returns authoritative state. On success, writes `e_Game_CampGroupState_unknown`, `e_Game_CampGroupState_hasCamps`, `e_Game_CampGroupState_waitingForRewardClaim` or `e_Game_CampGroupState_waitingToRespawn` to `out_campState`. The return value is an `ErrorCode`; the output is unchanged on failure.
        
        *   `@param group`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_CampGroupState`](/game/docs/wasm-api#wasm-ABI-Constants-Game_CampGroupState) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_group_state")))
        int32_t host_camp_group_state(int32_t group, Game_CampGroupState *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_group_state(group, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_group_cooldown(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `group,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 camp_group_cooldown(i32 group, i32 ptr);`
        
        Read future camp-respawn phases until due; zero means visibly blocked. Returns `api_campGroupNotWaitingToRespawn` unless the observed state is `waitingToRespawn`.
        
        *   `@param group`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_group_cooldown")))
        int32_t host_camp_group_cooldown(int32_t group, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_group_cooldown(group, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_num_camp_groups(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        WASM ABI: `i32 map_num_camp_groups(i32 ptr);`
        
        Return the number of runtime camp groups, including mirrored groups.
        
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_num_camp_groups")))
        int32_t host_map_num_camp_groups(uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_num_camp_groups(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_camp_group_num_camps(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `group,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        WASM ABI: `i32 map_camp_group_num_camps(i32 group, i32 ptr);`
        
        Return the number of spawn tiles in this runtime group.
        
        *   `@param group`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_camp_group_num_camps")))
        int32_t host_map_camp_group_num_camps(int32_t group, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_camp_group_num_camps(group, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_num_buffs(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 camp_num_buffs(i32 handle, i32 ptr);`
        
        Count active buffs on a visible camp.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_num_buffs")))
        int32_t host_camp_num_buffs(int32_t handle, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_num_buffs(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_num_buffs(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_num_buffs(i32 handle, i32 ptr);`
        
        Count active buffs on a visible champion.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_num_buffs")))
        int32_t host_champion_num_buffs(int32_t handle, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_num_buffs(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_num_allies(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 num_allies(i32 ptr);`
        
        Count the public roster, including dead champions and additional Cassi & Issac bodies.
        
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("num_allies")))
        int32_t host_num_allies(uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_num_allies(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_num_enemies(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 num_enemies(i32 ptr);`
        
        Count the public roster, including dead champions and additional Cassi & Issac bodies.
        
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("num_enemies")))
        int32_t host_num_enemies(uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_num_enemies(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_camp_group(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_CampGroup`](/game/docs/wasm-api#wasm-ABI-Records-Game_CampGroup) `*ptr);`
        
        WASM ABI: `i32 map_camp_group(i32 handle, i32 ptr);`
        
        Read the public capture rewards for this runtime group.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_CampGroup`](/game/docs/wasm-api#wasm-ABI-Records-Game_CampGroup) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_camp_group")))
        int32_t host_map_camp_group(int32_t handle, Game_CampGroup *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_camp_group(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_camp_info(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_CampInfo`](/game/docs/wasm-api#wasm-ABI-Records-Game_CampInfo) `*ptr);`
        
        WASM ABI: `i32 map_camp_info(i32 handle, i32 ptr);`
        
        Read a public spawn position and camp design, regardless of whether the camp is alive.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_CampInfo`](/game/docs/wasm-api#wasm-ABI-Records-Game_CampInfo) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_camp_info")))
        int32_t host_map_camp_info(int32_t handle, Game_CampInfo *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_camp_info(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_camp_layout(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        WASM ABI: `i32 map_camp_layout(i32 ptr, i32 capacity, i32 count);`
        
        Read the complete static camp layout as [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) words. For each group: group ID, gold reward, gem reward, maximum respawn rounds, camp count; then for each camp: camp ID, [`Camp`](/game/docs/wasm-api#wasm-ABI-Constants-Camp) design ID, x, y. Groups are concatenated with no leading group count.
        
        *   `@param ptr`: Array of [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) words, aligned to 4 bytes.
        *   `@param capacity`: Maximum number of words to copy. A short buffer receives a prefix.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) total word count, even when truncated. Capacity zero queries this total.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_camp_layout")))
        int32_t host_map_camp_layout(uint32_t *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_camp_layout(ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_camp_group_of(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Handle_CampGroup`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_CampGroup) `*ptr);`
        
        WASM ABI: `i32 map_camp_group_of(i32 handle, i32 ptr);`
        
        Read the camp group a camp spawn belongs to.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Handle_CampGroup`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_CampGroup) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_camp_group_of")))
        int32_t host_map_camp_group_of(int32_t handle, Handle_CampGroup *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_camp_group_of(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_camp_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_CampInfo`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_CampInfo) `*ptr);`
        
        WASM ABI: `i32 map_camp_at(i32 x, i32 y, i32 ptr);`
        
        Find the camp that spawns on a tile, regardless of vision or whether the camp is alive.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Handle_CampInfo`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_CampInfo) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_camp_at")))
        int32_t host_map_camp_at(int32_t x, int32_t y, Handle_CampInfo *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_camp_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_Camp`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Camp) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 camp_at(i32 x, i32 y, i32 ptr);`
        
        Find the lowest visible camp handle on a visible tile; error if absent.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Handle_Camp`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Camp) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_at")))
        int32_t host_camp_at(int32_t x, int32_t y, Handle_Camp *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_Camp`](/game/docs/wasm-api#wasm-ABI-Records-Game_Camp) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 camp(i32 handle, i32 ptr);`
        
        Read current camp state; hidden entities return `api_notInVision`.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_Camp`](/game/docs/wasm-api#wasm-ABI-Records-Game_Camp) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp")))
        int32_t host_camp(int32_t handle, Game_Camp *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_Champion`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Champion) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_at(i32 x, i32 y, i32 ptr);`
        
        Find the lowest visible champion handle on a visible tile; error if absent.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Handle_Champion`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Champion) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_at")))
        int32_t host_champion_at(int32_t x, int32_t y, Handle_Champion *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_Champion`](/game/docs/wasm-api#wasm-ABI-Records-Game_Champion) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion(i32 handle, i32 ptr);`
        
        Read current champion state; hidden entities return `api_notInVision`.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_Champion`](/game/docs/wasm-api#wasm-ABI-Records-Game_Champion) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion")))
        int32_t host_champion(int32_t handle, Game_Champion *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_identity(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_ChampionIdentity`](/game/docs/wasm-api#wasm-ABI-Records-Game_ChampionIdentity) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 champion_identity(i32 handle, i32 ptr);`
        
        Read a champion's immutable team and type; no vision restriction, including dead champions.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_ChampionIdentity`](/game/docs/wasm-api#wasm-ABI-Records-Game_ChampionIdentity) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_identity")))
        int32_t host_champion_identity(int32_t handle, Game_ChampionIdentity *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_identity(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_ward_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_Ward`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Ward) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 ward_at(i32 x, i32 y, i32 ptr);`
        
        Read a visible ordinary ward handle at (x, y), considering both teams. If both teams have a ward there, return the smaller packed handle. No visible ward returns `api_notFound`.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of a [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) [`Handle_Ward`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Ward).
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("ward_at")))
        int32_t host_ward_at(int32_t x, int32_t y, Handle_Ward *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_ward_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_ally_ward_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_Ward`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Ward) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 ally_ward_at(i32 x, i32 y, i32 ptr);`
        
        Find the visible ally ward at a tile; error if absent. Neutral observers include both teams.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Handle_Ward`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Ward) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("ally_ward_at")))
        int32_t host_ally_ward_at(int32_t x, int32_t y, Handle_Ward *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_ally_ward_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_enemy_ward_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_Ward`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Ward) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 enemy_ward_at(i32 x, i32 y, i32 ptr);`
        
        Find the visible enemy ward at a tile; error if absent. Neutral observers include both teams.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Handle_Ward`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Ward) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("enemy_ward_at")))
        int32_t host_enemy_ward_at(int32_t x, int32_t y, Handle_Ward *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_enemy_ward_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_ward(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_Ward`](/game/docs/wasm-api#wasm-ABI-Records-Game_Ward) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 ward(i32 handle, i32 ptr);`
        
        Read current ward state; hidden entities return `api_notInVision`. Both allied and enemy wards require effective vision. Ward vision is owner-only.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_Ward`](/game/docs/wasm-api#wasm-ABI-Records-Game_Ward) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("ward")))
        int32_t host_ward(int32_t handle, Game_Ward *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_ward(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_control_ward_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_ControlWard`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_ControlWard) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 control_ward_at(i32 x, i32 y, i32 ptr);`
        
        Read a visible control ward handle at (x, y), considering both teams. If both teams have one there, return the smaller packed handle. No visible control ward returns `api_notFound`.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of a [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) [`Handle_ControlWard`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_ControlWard).
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("control_ward_at")))
        int32_t host_control_ward_at(int32_t x, int32_t y, Handle_ControlWard *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_control_ward_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_ally_control_ward_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_ControlWard`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_ControlWard) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 ally_control_ward_at(i32 x, i32 y, i32 ptr);`
        
        Find the visible ally control ward at a tile; error if absent. Neutral observers include both teams.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Handle_ControlWard`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_ControlWard) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("ally_control_ward_at")))
        int32_t host_ally_control_ward_at(int32_t x, int32_t y, Handle_ControlWard *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_ally_control_ward_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_enemy_control_ward_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Handle_ControlWard`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_ControlWard) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 enemy_control_ward_at(i32 x, i32 y, i32 ptr);`
        
        Find the visible enemy control ward at a tile; error if absent. Neutral observers include both teams.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Handle_ControlWard`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_ControlWard) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("enemy_control_ward_at")))
        int32_t host_enemy_control_ward_at(int32_t x, int32_t y, Handle_ControlWard *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_enemy_control_ward_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_control_ward(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_ControlWard`](/game/docs/wasm-api#wasm-ABI-Records-Game_ControlWard) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 control_ward(i32 handle, i32 ptr);`
        
        Read a control ward by handle, subject to placement visibility.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_ControlWard`](/game/docs/wasm-api#wasm-ABI-Records-Game_ControlWard) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("control_ward")))
        int32_t host_control_ward(int32_t handle, Game_ControlWard *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_control_ward(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_gold(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 champion_gold(i32 handle, i32 ptr);`
        
        Read team gold regardless of visibility; enemies return `api_notTeammate`.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_gold")))
        int32_t host_champion_gold(int32_t handle, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_gold(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_gems(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_gems(i32 handle, i32 ptr);`
        
        Read carried gems for self or a visible champion; otherwise `api_notInVision`.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_gems")))
        int32_t host_champion_gems(int32_t handle, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_gems(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_items(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_items(i32 handle, i32 ptr);`
        
        Write `e_Item_numTypes` item counts for yourself or another visible champion. `in_size` is the capacity in [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) entries, not bytes. Returns `api_bufferTooSmall` without writing if insufficient.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Array of exactly 42 [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) counts (168 bytes), indexed by [`Item`](/game/docs/wasm-api#wasm-ABI-Constants-Item). This is an array of counts, not item IDs.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_items")))
        int32_t host_champion_items(int32_t handle, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_items(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_consumables(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_consumables(i32 handle, i32 ptr);`
        
        Write `e_Game_Consumable_numTypes` consumable counts for yourself or another visible champion. `in_size` is the capacity in [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) entries, not bytes. Returns `api_bufferTooSmall` without writing if insufficient.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Array of exactly 4 [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) counts (16 bytes), indexed by [`Game_Consumable`](/game/docs/wasm-api#wasm-ABI-Constants-Game_Consumable).
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_consumables")))
        int32_t host_champion_consumables(int32_t handle, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_consumables(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_respawn_timer(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 champion_respawn_timer(i32 handle, i32 ptr);`
        
        Read the public respawn countdown; living champions return `api_championAlive`.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_respawn_timer")))
        int32_t host_champion_respawn_timer(int32_t handle, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_respawn_timer(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_can_sell(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_can_sell(i32 handle, i32 ptr);`
        
        Sale eligibility: Tavi on her own spawn tiles, subject to shopping restrictions/channels. Independent of inventory, gold, turn ownership and previous sales. Output is unchanged on failure.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_can_sell")))
        int32_t host_champion_can_sell(int32_t handle, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_can_sell(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_champion_channel_time(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 bc_champion_channel_time(i32 handle, i32 ptr);`
        
        Read the remaining turns of a visible champion's recall, gem submission or teleport channel. Flashing reports zero; a champion that is not channeling fails with `invalidAction_cancelChannel_notChanneling`.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_champion_channel_time")))
        int32_t host_bc_champion_channel_time(int32_t handle, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_champion_channel_time(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_camp_group_max_respawn(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `group,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        WASM ABI: `i32 bc_camp_group_max_respawn(i32 group, i32 ptr);`
        
        Read the longest configured respawn duration among this runtime group's camps.
        
        *   `@param group`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_camp_group_max_respawn")))
        int32_t host_bc_camp_group_max_respawn(int32_t group, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_camp_group_max_respawn(group, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_champion_ward_positions(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_Position`](/game/docs/wasm-api#wasm-ABI-Records-Game_Position) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplay
        
        WASM ABI: `i32 bc_champion_ward_positions(i32 handle, i32 ptr, i32 capacity, i32 count);`
        
        List a champion's placed ward positions. Private to the owner and the neutral observer; zero size counts.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of an output array of [`Game_Position`](/game/docs/wasm-api#wasm-ABI-Records-Game_Position) records.
        *   `@param capacity`: Maximum number of records, not bytes. Zero queries the required count. A nonzero buffer must hold every result or the call fails with `api_bufferTooSmall`.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count output; read it on success.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_champion_ward_positions")))
        int32_t host_bc_champion_ward_positions(int32_t handle, Game_Position *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_champion_ward_positions(handle, ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_camp_groups(`[`Handle_CampGroup`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_CampGroup) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        WASM ABI: `i32 map_camp_groups(i32 ptr, i32 capacity, i32 count);`
        
        Write at most `in_size` group IDs and return the number written.
        
        *   `@param ptr`: Address of an output array of [`Handle_CampGroup`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_CampGroup) records.
        *   `@param capacity`: Maximum number of elements, not bytes. The list truncates to this capacity; zero writes no elements and reports zero. Use `map_num_camp_groups` to size the allocation.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number of elements written.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_camp_groups")))
        int32_t host_map_camp_groups(Handle_CampGroup *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_camp_groups(ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_camp_group_camps(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `group,` [`Handle_CampInfo`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_CampInfo) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        WASM ABI: `i32 map_camp_group_camps(i32 group, i32 ptr, i32 capacity, i32 count);`
        
        Write at most `in_size` camp spawn IDs and return the number written.
        
        *   `@param group`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of an output array of [`Handle_CampInfo`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_CampInfo) records.
        *   `@param capacity`: Maximum number of elements, not bytes. The list truncates to this capacity; zero writes no elements and reports zero. Use `map_camp_group_num_camps` to size the allocation.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number of elements written.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_camp_group_camps")))
        int32_t host_map_camp_group_camps(int32_t group, Handle_CampInfo *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_camp_group_camps(group, ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_buffs(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_Buff`](/game/docs/wasm-api#wasm-ABI-Records-Game_Buff) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplayvision
        
        WASM ABI: `i32 camp_buffs(i32 handle, i32 ptr, i32 capacity, i32 count);`
        
        Write at most `in_size` active buffs and return the number written.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of an output array of [`Game_Buff`](/game/docs/wasm-api#wasm-ABI-Records-Game_Buff) records.
        *   `@param capacity`: Maximum number of elements, not bytes. The list truncates to this capacity; zero writes no elements and reports zero. Use `camp_num_buffs` to size the allocation.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number of elements written.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_buffs")))
        int32_t host_camp_buffs(int32_t handle, Game_Buff *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_buffs(handle, ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_buffs(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`Game_Buff`](/game/docs/wasm-api#wasm-ABI-Records-Game_Buff) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_buffs(i32 handle, i32 ptr, i32 capacity, i32 count);`
        
        Write at most `in_size` active buffs and return the number written.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of an output array of [`Game_Buff`](/game/docs/wasm-api#wasm-ABI-Records-Game_Buff) records.
        *   `@param capacity`: Maximum number of elements, not bytes. The list truncates to this capacity; zero writes no elements and reports zero. Use `champion_num_buffs` to size the allocation.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number of elements written.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_buffs")))
        int32_t host_champion_buffs(int32_t handle, Game_Buff *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_buffs(handle, ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_allies(`[`Handle_Champion`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Champion) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplay
        
        WASM ABI: `i32 allies(i32 ptr, i32 capacity, i32 count);`
        
        Write at most `in_size` public roster IDs, including dead champions and Cassi & Issac bodies; neutral lists both teams.
        
        *   `@param ptr`: Address of an output array of [`Handle_Champion`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Champion) records.
        *   `@param capacity`: Maximum number of elements, not bytes. The list truncates to this capacity; zero writes no elements and reports zero. Use `num_allies` to size the allocation.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number of elements written.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("allies")))
        int32_t host_allies(Handle_Champion *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_allies(ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_enemies(`[`Handle_Champion`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Champion) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplay
        
        WASM ABI: `i32 enemies(i32 ptr, i32 capacity, i32 count);`
        
        Write at most `in_size` public roster IDs, including dead champions and Cassi & Issac bodies; neutral lists both teams.
        
        *   `@param ptr`: Address of an output array of [`Handle_Champion`](/game/docs/wasm-api#wasm-ABI-Identifiers-Handle_Champion) records.
        *   `@param capacity`: Maximum number of elements, not bytes. The list truncates to this capacity; zero writes no elements and reports zero. Use `num_enemies` to size the allocation.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number of elements written.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("enemies")))
        int32_t host_enemies(Handle_Champion *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_enemies(ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_wards(`[`Game_Ward`](/game/docs/wasm-api#wasm-ABI-Records-Game_Ward) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplay
        
        WASM ABI: `i32 wards(i32 ptr, i32 capacity, i32 count);`
        
        List visible ordinary wards.
        
        *   `@param ptr`: Address of an output array of [`Game_Ward`](/game/docs/wasm-api#wasm-ABI-Records-Game_Ward) records.
        *   `@param capacity`: Maximum number of records, not bytes. Zero queries the required count. A nonzero buffer must hold every result or the call fails with `api_bufferTooSmall`.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count output; read it on success.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("wards")))
        int32_t host_wards(Game_Ward *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_wards(ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_control_wards(`[`Game_ControlWard`](/game/docs/wasm-api#wasm-ABI-Records-Game_ControlWard) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplay
        
        WASM ABI: `i32 control_wards(i32 ptr, i32 capacity, i32 count);`
        
        List visible control wards.
        
        *   `@param ptr`: Address of an output array of [`Game_ControlWard`](/game/docs/wasm-api#wasm-ABI-Records-Game_ControlWard) records.
        *   `@param capacity`: Maximum number of records, not bytes. Zero queries the required count. A nonzero buffer must hold every result or the call fails with `api_bufferTooSmall`.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count output; read it on success.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("control_wards")))
        int32_t host_control_wards(Game_ControlWard *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_control_wards(ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bitboard_test(int64_t handle,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        WASM ABI: `i32 bitboard_test(i64 handle, i32 x, i32 y, i32 ptr);`
        
        Test a logical bit in a caller-owned bitboard.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) — Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) boolean (0 or 1).
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bitboard_test")))
        int32_t host_bitboard_test(int64_t handle, int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bitboard_test(handle, x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bitboard_num_set_bits(int64_t handle,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        WASM ABI: `i32 bitboard_num_set_bits(i64 handle, i32 ptr);`
        
        Count set logical tiles, ignoring padding.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@param ptr`: Address of a [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bitboard_num_set_bits")))
        int32_t host_bitboard_num_set_bits(int64_t handle, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bitboard_num_set_bits(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bitboard_get_set_bits(int64_t handle,` [`Game_Position`](/game/docs/wasm-api#wasm-ABI-Records-Game_Position) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        WASM ABI: `i32 bitboard_get_set_bits(i64 handle, i32 ptr, i32 capacity, i32 count);`
        
        List set tiles as [`Game_Position`](/game/docs/wasm-api#wasm-ABI-Records-Game_Position) (x, y) pairs, up to capacity.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@param ptr`: Array of [`Game_Position`](/game/docs/wasm-api#wasm-ABI-Records-Game_Position) records.
        *   `@param capacity`: Maximum number of elements, not bytes. The list truncates to this capacity; zero writes no elements and reports zero. Use `bitboard_num_set_bits` to size the allocation.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number of elements written.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bitboard_get_set_bits")))
        int32_t host_bitboard_get_set_bits(int64_t handle, Game_Position *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bitboard_get_set_bits(handle, ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bitboard_num_chunks(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        WASM ABI: `i32 bitboard_num_chunks(i32 ptr);`
        
        Read the raw bitboard word count, including padded chunks: `chunk_stride` \* `chunked_height`.
        
        *   `@param ptr`: Address of a [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bitboard_num_chunks")))
        int32_t host_bitboard_num_chunks(uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bitboard_num_chunks(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bitboard_copy_to_guest(int64_t handle,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        WASM ABI: `i32 bitboard_copy_to_guest(i64 handle, i32 ptr, i32 capacity, i32 count);`
        
        Copy up to capacity [`uint64`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) words from the raw bitboard, including padding.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@param ptr`: Array of [`uint64`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) words, aligned to 8 bytes.
        *   `@param capacity`: Maximum number of elements, not bytes. The list truncates to this capacity; zero writes no elements and reports zero. Use `bitboard_num_chunks` to size the allocation.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number of elements written.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bitboard_copy_to_guest")))
        int32_t host_bitboard_copy_to_guest(int64_t handle, uint64_t *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bitboard_copy_to_guest(handle, ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_bushes(int64_t handle);`
        
        WASM ABI: `i32 map_bushes(i64 handle);`
        
        Copy immutable bush tiles into a caller-owned bitboard; available before initialization.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_bushes")))
        int32_t host_map_bushes(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_bushes(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_walls(int64_t handle);`
        
        WASM ABI: `i32 map_walls(i64 handle);`
        
        Copy immutable wall tiles into a caller-owned bitboard; available before initialization.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_walls")))
        int32_t host_map_walls(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_walls(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_altars(int64_t handle);`
        
        WASM ABI: `i32 map_altars(i64 handle);`
        
        Copy immutable altar tiles into a caller-owned bitboard; available before initialization.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_altars")))
        int32_t host_map_altars(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_altars(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_map_holes(int64_t handle);`
        
        WASM ABI: `i32 map_holes(i64 handle);`
        
        Copy immutable hole tiles into a caller-owned bitboard; available before initialization.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("map_holes")))
        int32_t host_map_holes(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_map_holes(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_vision_mask(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y, int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 vision_mask(i32 champion, i32 x, i32 y, i64 handle);`
        
        Compute a champion design's vision at a hypothetical tile, including bush and wall occlusion.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("vision_mask")))
        int32_t host_vision_mask(int32_t champion, int32_t x, int32_t y, int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_vision_mask(champion, x, y, handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_ward_vision_mask(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y, int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 ward_vision_mask(i32 x, i32 y, i64 handle);`
        
        Compute a ward's vision at a hypothetical tile.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("ward_vision_mask")))
        int32_t host_ward_vision_mask(int32_t x, int32_t y, int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_ward_vision_mask(x, y, handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_control_ward_vision_mask(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y, int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 control_ward_vision_mask(i32 x, i32 y, i64 handle);`
        
        Write the vision mask of a control ward owned by the observer.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("control_ward_vision_mask")))
        int32_t host_control_ward_vision_mask(int32_t x, int32_t y, int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_control_ward_vision_mask(x, y, handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_vision(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 vision(i64 handle);`
        
        Copy current individual vision, including owned wards and tile reveals; neutral fills the output with ones.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("vision")))
        int32_t host_vision(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_vision(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 camp_occupancy(i64 handle);`
        
        Copy visible camp occupancy; neutral includes all teams without visibility filtering.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_occupancy")))
        int32_t host_camp_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_awake_camp_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 awake_camp_occupancy(i64 handle);`
        
        Like `Game_API_GetCampOccupancy`, but includes only awake camps. Dead camps are excluded.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("awake_camp_occupancy")))
        int32_t host_awake_camp_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_awake_camp_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_asleep_camp_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 asleep_camp_occupancy(i64 handle);`
        
        Like `Game_API_GetCampOccupancy`, but includes only asleep camps. Dead camps are excluded.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("asleep_camp_occupancy")))
        int32_t host_asleep_camp_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_asleep_camp_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_ally_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 ally_occupancy(i64 handle);`
        
        Copy visible ally occupancy; neutral includes all teams without visibility filtering.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("ally_occupancy")))
        int32_t host_ally_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_ally_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_enemy_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 enemy_occupancy(i64 handle);`
        
        Copy visible enemy occupancy; neutral includes all teams without visibility filtering.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("enemy_occupancy")))
        int32_t host_enemy_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_enemy_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_ally_ward_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 ally_ward_occupancy(i64 handle);`
        
        Copy allied ward placements in effective vision; neutral includes both teams.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("ally_ward_occupancy")))
        int32_t host_ally_ward_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_ally_ward_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_ally_control_ward_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 ally_control_ward_occupancy(i64 handle);`
        
        Write allied control-ward placements within the observer's effective vision.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("ally_control_ward_occupancy")))
        int32_t host_ally_control_ward_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_ally_control_ward_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_enemy_ward_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 enemy_ward_occupancy(i64 handle);`
        
        Copy enemy ward occupancy in individual effective vision. Neutral includes all teams without visibility filtering.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("enemy_ward_occupancy")))
        int32_t host_enemy_ward_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_enemy_ward_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_enemy_control_ward_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 enemy_control_ward_occupancy(i64 handle);`
        
        Write enemy control-ward placements within the observer's effective vision.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("enemy_control_ward_occupancy")))
        int32_t host_enemy_control_ward_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_enemy_control_ward_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_teleport_occupancy(int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 teleport_occupancy(i64 handle);`
        
        Write visible teleport reservations, always including the observer's own destination.
        
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("teleport_occupancy")))
        int32_t host_teleport_occupancy(int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_teleport_occupancy(handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_is_occupied_by_teleport(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 is_occupied_by_teleport(i32 x, i32 y, i32 ptr);`
        
        Reservations are visible in effective vision; the caster always knows their own destination.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("is_occupied_by_teleport")))
        int32_t host_is_occupied_by_teleport(int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_is_occupied_by_teleport(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_altar_lock(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `lock_team,` [`Game_AltarLock`](/game/docs/wasm-api#wasm-ABI-Records-Game_AltarLock) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 altar_lock(i32 x, i32 y, i32 lock_team, i32 ptr);`
        
        Read one team's lock on a visible altar tile.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param lock_team`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_AltarLock`](/game/docs/wasm-api#wasm-ABI-Records-Game_AltarLock) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("altar_lock")))
        int32_t host_altar_lock(int32_t x, int32_t y, int32_t lock_team, Game_AltarLock *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_altar_lock(x, y, lock_team, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_altar_locks(`[`Game_AltarLock`](/game/docs/wasm-api#wasm-ABI-Records-Game_AltarLock) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplay
        
        WASM ABI: `i32 altar_locks(i32 ptr, i32 capacity, i32 count);`
        
        List visible altar locks from both teams, including their entity handles, positions and remaining hits.
        
        *   `@param ptr`: Array of [`Game_AltarLock`](/game/docs/wasm-api#wasm-ABI-Records-Game_AltarLock) records.
        *   `@param capacity`: Maximum number of records, not bytes. Zero queries the required count. A nonzero buffer must hold every result or the call fails with `api_bufferTooSmall`.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count output; read it on success.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("altar_locks")))
        int32_t host_altar_locks(Game_AltarLock *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_altar_locks(ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_teleports(`[`Game_Teleport`](/game/docs/wasm-api#wasm-ABI-Records-Game_Teleport) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplay
        
        WASM ABI: `i32 teleports(i32 ptr, i32 capacity, i32 count);`
        
        List visible teleport reservations, including the observer's own channel.
        
        *   `@param ptr`: Address of an output array of [`Game_Teleport`](/game/docs/wasm-api#wasm-ABI-Records-Game_Teleport) records.
        *   `@param capacity`: Maximum number of records, not bytes. Zero queries the required count. A nonzero buffer must hold every result or the call fails with `api_bufferTooSmall`.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count output; read it on success.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("teleports")))
        int32_t host_teleports(Game_Teleport *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_teleports(ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_teleport_at(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`Game_Teleport`](/game/docs/wasm-api#wasm-ABI-Records-Game_Teleport) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 teleport_at(i32 x, i32 y, i32 ptr);`
        
        Read the visible teleport reservation on a tile, including the observer's own channel.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_Teleport`](/game/docs/wasm-api#wasm-ABI-Records-Game_Teleport) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("teleport_at")))
        int32_t host_teleport_at(int32_t x, int32_t y, Game_Teleport *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_teleport_at(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_teleport(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`Game_Teleport`](/game/docs/wasm-api#wasm-ABI-Records-Game_Teleport) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 champion_teleport(i32 champion, i32 ptr);`
        
        The caster's own channel, independent of destination visibility.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_Teleport`](/game/docs/wasm-api#wasm-ABI-Records-Game_Teleport) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_teleport")))
        int32_t host_champion_teleport(int32_t champion, Game_Teleport *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_teleport(champion, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_shared_memory_size(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        WASM ABI: `i32 shared_memory_size(i32 ptr);`
        
        Configured capacity of each team's persistent memory buffers, in bytes.
        
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("shared_memory_size")))
        int32_t host_shared_memory_size(uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_shared_memory_size(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_draft_memory_size(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        WASM ABI: `i32 draft_memory_size(i32 ptr);`
        
        Return the configured draft-memory capacity per team, in bytes.
        
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("draft_memory_size")))
        int32_t host_draft_memory_size(uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_draft_memory_size(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_design(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind,` [`Game_ChampionDesign`](/game/docs/wasm-api#wasm-ABI-Records-Game_ChampionDesign) `*ptr);`
        
        WASM ABI: `i32 champion_design(i32 kind, i32 ptr);`
        
        Copy immutable type designs. Valid before draft/game initialization; no team visibility restriction. Failure leaves the output unchanged. [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion) uses physical body types, not draft choices.
        
        *   `@param kind`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_ChampionDesign`](/game/docs/wasm-api#wasm-ABI-Records-Game_ChampionDesign) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_design")))
        int32_t host_champion_design(int32_t kind, Game_ChampionDesign *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_design(kind, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_design(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind,` [`Game_CampDesign`](/game/docs/wasm-api#wasm-ABI-Records-Game_CampDesign) `*ptr);`
        
        WASM ABI: `i32 camp_design(i32 kind, i32 ptr);`
        
        Copy the immutable camp design without requiring vision or a completed draft.
        
        *   `@param kind`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_CampDesign`](/game/docs/wasm-api#wasm-ABI-Records-Game_CampDesign) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_design")))
        int32_t host_camp_design(int32_t kind, Game_CampDesign *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_design(kind, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_restrictions(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`BuffRestriction`](/game/docs/wasm-api#wasm-ABI-Identifiers-BuffRestriction) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_restrictions(i32 champion, i32 ptr);`
        
        Union of `e_BuffRestriction_`\* flags from active buffs. Uses the same visibility rules as `GetBuffs`. Death and channel state are not included. Output is unchanged on failure.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`BuffRestriction`](/game/docs/wasm-api#wasm-ABI-Constants-BuffRestriction) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_restrictions")))
        int32_t host_champion_restrictions(int32_t champion, BuffRestriction *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_restrictions(champion, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_can_shop(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `consumable,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_can_shop(i32 champion, i32 consumable, i32 ptr);`
        
        Shopping location/passive eligibility, including dead champions and active restrictions/channels.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param consumable`: Zero tests item shopping; nonzero tests consumable shopping.
        *   `@param ptr`: Address of the [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_can_shop")))
        int32_t host_champion_can_shop(int32_t champion, int32_t consumable, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_can_shop(champion, consumable, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_wards(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`Game_TrinketState`](/game/docs/wasm-api#wasm-ABI-Records-Game_TrinketState) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 champion_wards(i32 champion, i32 ptr);`
        
        Ward resources are private to the owning champion and the neutral observer. This query works while dead. Other champions receive `api_notOwner`, even with vision.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_TrinketState`](/game/docs/wasm-api#wasm-ABI-Records-Game_TrinketState) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_wards")))
        int32_t host_champion_wards(int32_t champion, Game_TrinketState *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_wards(champion, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_ability_damage(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_ability_damage(i32 champion, i32 slot, i32 ptr);`
        
        Query the ability slot's damage amount without performing an action. The amount is written as [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32); vision and ability-type checks still apply.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_ability_damage")))
        int32_t host_champion_ability_damage(int32_t champion, int32_t slot, float *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_ability_damage(champion, slot, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_ability_damage_against(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `target,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_ability_damage_against(i32 champion, i32 slot, i32 target, i32 ptr);`
        
        Query the ability slot's damage amount without performing an action, accounting for the target champion. The amount is written as [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32); vision and ability-type checks still apply.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param target`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_ability_damage_against")))
        int32_t host_champion_ability_damage_against(int32_t champion, int32_t slot, int32_t target, float *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_ability_damage_against(champion, slot, target, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_ability_heal(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_ability_heal(i32 champion, i32 slot, i32 ptr);`
        
        Query the ability slot's heal amount without performing an action. The amount is written as [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32); vision and ability-type checks still apply.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_ability_heal")))
        int32_t host_champion_ability_heal(int32_t champion, int32_t slot, float *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_ability_heal(champion, slot, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_ability_heal_against(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `target,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_ability_heal_against(i32 champion, i32 slot, i32 target, i32 ptr);`
        
        Query the ability slot's heal amount without performing an action, accounting for the target champion. The amount is written as [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32); vision and ability-type checks still apply.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param target`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_ability_heal_against")))
        int32_t host_champion_ability_heal_against(int32_t champion, int32_t slot, int32_t target, float *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_ability_heal_against(champion, slot, target, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_ability_shield(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_ability_shield(i32 champion, i32 slot, i32 ptr);`
        
        Query the ability slot's shield amount without performing an action. The amount is written as [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32); vision and ability-type checks still apply.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_ability_shield")))
        int32_t host_champion_ability_shield(int32_t champion, int32_t slot, float *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_ability_shield(champion, slot, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_ability_shield_against(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `target,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_ability_shield_against(i32 champion, i32 slot, i32 target, i32 ptr);`
        
        Query the ability slot's shield amount without performing an action, accounting for the target champion. The amount is written as [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32); vision and ability-type checks still apply.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param target`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_ability_shield_against")))
        int32_t host_champion_ability_shield_against(int32_t champion, int32_t slot, int32_t target, float *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_ability_shield_against(champion, slot, target, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_ability_props(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`Game_AbilityProps`](/game/docs/wasm-api#wasm-ABI-Records-Game_AbilityProps) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 champion_ability_props(i32 champion, i32 slot, i32 ptr);`
        
        Read slot configuration for a champion; no vision restriction, since the design never changes.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_AbilityProps`](/game/docs/wasm-api#wasm-ABI-Records-Game_AbilityProps) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_ability_props")))
        int32_t host_champion_ability_props(int32_t champion, int32_t slot, Game_AbilityProps *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_ability_props(champion, slot, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_camp_ability_props(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `camp,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`Game_AbilityProps`](/game/docs/wasm-api#wasm-ABI-Records-Game_AbilityProps) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 camp_ability_props(i32 camp, i32 slot, i32 ptr);`
        
        Read the selected ability design of a camp; no vision restriction.
        
        *   `@param camp`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`Game_AbilityProps`](/game/docs/wasm-api#wasm-ABI-Records-Game_AbilityProps) output.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("camp_ability_props")))
        int32_t host_camp_ability_props(int32_t camp, int32_t slot, Game_AbilityProps *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_camp_ability_props(camp, slot, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_read_shared_memory(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `offset,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 read_shared_memory(i32 offset, i32 ptr, i32 size);`
        
        [`Team`](/game/docs/wasm-api#wasm-ABI-Constants-Team) communication buffers are unrecorded and require the owning team's live turn. Shared memory is writable during draft and gameplay. Draft memory freezes after the final pick. Ranges must fit the configured capacity. Nonempty operations require a buffer of at least `in_size` bytes. A zero-length operation permits a null pointer and an offset at the end of the buffer.
        
        *   `@param offset`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer; copy size bytes from team memory at byte offset offset.
        *   `@param size`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("read_shared_memory")))
        int32_t host_read_shared_memory(int32_t offset, uint8_t *ptr, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_read_shared_memory(offset, ptr, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_write_shared_memory(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `offset,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 write_shared_memory(i32 offset, i32 ptr, i32 size);`
        
        Write a team-memory buffer without recording a gameplay action.
        
        *   `@param offset`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer; copy size bytes into team memory at byte offset offset.
        *   `@param size`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("write_shared_memory")))
        int32_t host_write_shared_memory(int32_t offset, uint8_t *ptr, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_write_shared_memory(offset, ptr, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_read_draft_memory(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `offset,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 read_draft_memory(i32 offset, i32 ptr, i32 size);`
        
        Read draft memory without recording a gameplay action.
        
        *   `@param offset`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer; copy size bytes from team memory at byte offset offset.
        *   `@param size`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("read_draft_memory")))
        int32_t host_read_draft_memory(int32_t offset, uint8_t *ptr, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_read_draft_memory(offset, ptr, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_write_draft_memory(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `offset,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        draft
        
        WASM ABI: `i32 write_draft_memory(i32 offset, i32 ptr, i32 size);`
        
        Write draft memory during the team's draft input; reject writes during gameplay.
        
        *   `@param offset`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer; copy size bytes into team memory at byte offset offset.
        *   `@param size`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("write_draft_memory")))
        int32_t host_write_draft_memory(int32_t offset, uint8_t *ptr, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_write_draft_memory(offset, ptr, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_debug_dot(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `rgb);`
        
        WASM ABI: `i32 debug_dot(i32 x, i32 y, i32 rgb);`
        
        Draw a debug dot on the current turn's replay overlay. Coordinates must be within the map and 0..255; `rgb` is 0xRRGGBB (0..`0xffffff`). Requires an active logged turn.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param rgb`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("debug_dot")))
        int32_t host_debug_dot(int32_t x, int32_t y, int32_t rgb);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_debug_dot(x, y, rgb);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_debug_line(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x0,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y0,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x1,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y1,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `rgb);`
        
        WASM ABI: `i32 debug_line(i32 x0, i32 y0, i32 x1, i32 y1, i32 rgb);`
        
        Draw a debug line between two tiles on the current turn's replay overlay. Both endpoints must be within the map and 0..255; `rgb` is 0xRRGGBB. Requires an active logged turn.
        
        *   `@param x0`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y0`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param x1`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y1`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param rgb`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("debug_line")))
        int32_t host_debug_line(int32_t x0, int32_t y0, int32_t x1, int32_t y1, int32_t rgb);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_debug_line(x0, y0, x1, y1, rgb);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_movement_mask(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion, int64_t handle);`
        
        gameplay
        
        WASM ABI: `i32 champion_movement_mask(i32 champion, i64 handle);`
        
        Replace the output with legal movement destinations from this champion's perspective. Hidden occupants remain valid destinations; the query never consumes actions.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param handle`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A guest bitboard address widened to `i64`, not an opaque host handle. It must fit a positive `i32`, be aligned to 16 bytes, and span `board_bytes` bytes.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_movement_mask")))
        int32_t host_champion_movement_mask(int32_t champion, int64_t handle);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_movement_mask(champion, handle);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_move_to_with_result(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 move_to_with_result(i32 x, i32 y, i32 ptr);`
        
        [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion) actions require explicit cancellation of an active recall or gem submission. Priority updates and cancellation remain available while channelling. These destination actions require `out_successful`. Successful actions set it to `ENGINE_TRUE`. A hidden blocked destination reveals the tile, spends nothing, and returns success with `ENGINE_FALSE`. Known blocked destinations and other invalid actions return their error code with `ENGINE_FALSE`.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) — Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) successful flag: 1 when completed, 0 when an unseen blocker was revealed. A 0 flag with status 0 is a committed action; do not interpret it as an engine error.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("move_to_with_result")))
        int32_t host_move_to_with_result(int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_move_to_with_result(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_cast_with_result(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `index,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 cast_with_result(i32 slot, i32 kind, i32 index, i32 x, i32 y, i32 ptr);`
        
        Cast one of the scheduled champion's two abilities; both slots share one successful cast per turn. A hidden blocked dash reveals the tile and returns success with `out_successful` = `ENGINE_FALSE`, without spending charges or cooldown. Known blocked landings return `spellCast_badDestination`. Completed casts set `ENGINE_TRUE`.
        
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param kind`: [`Game_EntityKind`](/game/docs/wasm-api#wasm-ABI-Constants-Game_EntityKind) tag.
        *   `@param index`: [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion)/camp ID or packed entity handle. For ground casts, use kind = 0 and index = 0; supply (x, y). Entity casts use the target kind/index. Ability slot is zero-based (0 or 1).
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) — Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) successful flag: 1 when completed, 0 when an unseen blocker was revealed. A 0 flag with status 0 is a committed action; do not interpret it as an engine error.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("cast_with_result")))
        int32_t host_cast_with_result(int32_t slot, int32_t kind, int32_t index, int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_cast_with_result(slot, kind, index, x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_use_consumable_with_result(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 use_consumable_with_result(i32 kind, i32 x, i32 y, i32 ptr);`
        
        Scrolls and crystals reserve destinations while channeling; neither can be manually cancelled. Occupied scroll destinations return `invalidAction_tpScroll_occupied`; crystals use `move_badDestination`. Rejected destinations do not consume the item. Hidden collisions reveal the tile and return success with `out_successful` = `ENGINE_FALSE` without consuming the item. Successfully used consumables (including starting teleport channels) set `out_successful` = `ENGINE_TRUE`.
        
        *   `@param kind`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) — Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) successful flag: 1 when completed, 0 when an unseen blocker was revealed. A 0 flag with status 0 is a committed action; do not interpret it as an engine error.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("use_consumable_with_result")))
        int32_t host_use_consumable_with_result(int32_t kind, int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_use_consumable_with_result(kind, x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_place_ward_with_result(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 place_ward_with_result(i32 x, i32 y, i32 ptr);`
        
        Place a ward using the scheduled champion's trinket charge. An existing allied ordinary or control ward returns `e_ErrorCode_invalidAction_placeWard_allyWardPresent`. Enemy wards may share the tile. A hidden allied ward reveals only the destination, recorded like a blocked hidden move. Hidden collisions return success with `out_successful` = `ENGINE_FALSE`; completed placements set `ENGINE_TRUE`. Rejected placements spend no charges; known occupied tiles return `allyWardPresent` without another reveal.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool) — Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) successful flag: 1 when completed, 0 when an unseen blocker was revealed. A 0 flag with status 0 is a committed action; do not interpret it as an engine error.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` If exported, `champion_query_memory` receives this output instead of memory (the OCaml bridge convention).
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("place_ward_with_result")))
        int32_t host_place_ward_with_result(int32_t x, int32_t y, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_place_ward_with_result(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_move_to(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y);`
        
        gameplay
        
        WASM ABI: `i32 move_to(i32 x, i32 y);`
        
        [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion) actions require explicit cancellation of an active recall or gem submission. Priority updates and cancellation remain available while channelling. These destination actions require `out_successful`. Successful actions set it to `ENGINE_TRUE`. A hidden blocked destination reveals the tile, spends nothing, and returns success with `ENGINE_FALSE`. Known blocked destinations and other invalid actions return their error code with `ENGINE_FALSE`.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Compatibility form. Prefer `move_to_with_result` to distinguish a committed hidden-blocker reveal from an invalid action. This form translates a successful reveal with successful = 0 into a legacy blocked-destination error.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("move_to")))
        int32_t host_move_to(int32_t x, int32_t y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_move_to(x, y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_attack(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `index);`
        
        gameplayvision
        
        WASM ABI: `i32 attack(i32 kind, i32 index);`
        
        Attack a visible target with the scheduled champion.
        
        *   `@param kind`: [`Game_EntityKind`](/game/docs/wasm-api#wasm-ABI-Constants-Game_EntityKind) tag.
        *   `@param index`: [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion)/camp ID or packed entity handle. For ground casts, use kind = 0 and index = 0; supply (x, y). Entity casts use the target kind/index. Ability slot is zero-based (0 or 1).
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("attack")))
        int32_t host_attack(int32_t kind, int32_t index);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_attack(kind, index);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_cast(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `slot,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `index,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y);`
        
        gameplayvision
        
        WASM ABI: `i32 cast(i32 slot, i32 kind, i32 index, i32 x, i32 y);`
        
        Cast one of the scheduled champion's two abilities; both slots share one successful cast per turn. A hidden blocked dash reveals the tile and returns success with `out_successful` = `ENGINE_FALSE`, without spending charges or cooldown. Known blocked landings return `spellCast_badDestination`. Completed casts set `ENGINE_TRUE`.
        
        *   `@param slot`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param kind`: [`Game_EntityKind`](/game/docs/wasm-api#wasm-ABI-Constants-Game_EntityKind) tag.
        *   `@param index`: [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion)/camp ID or packed entity handle. For ground casts, use kind = 0 and index = 0; supply (x, y). Entity casts use the target kind/index. Ability slot is zero-based (0 or 1).
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Compatibility form. Prefer `cast_with_result` to distinguish a committed hidden-blocker reveal from an invalid action. This form translates a successful reveal with successful = 0 into a legacy blocked-destination error.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("cast")))
        int32_t host_cast(int32_t slot, int32_t kind, int32_t index, int32_t x, int32_t y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_cast(slot, kind, index, x, y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_recall();`
        
        gameplay
        
        WASM ABI: `i32 recall();`
        
        Start a recall countdown; damage or interrupting crowd control cancels it. Can start once per champion turn; repeated starts return `e_ErrorCode_invalidAction_recall_alreadyUsed`.
        
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("recall")))
        int32_t host_recall();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_recall();
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_submit_gems(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y);`
        
        gameplay
        
        WASM ABI: `i32 submit_gems(i32 x, i32 y);`
        
        Channel at an altar using the initial gem count for duration, then submit all carried gems. Requires at least one carried gem; otherwise returns `e_ErrorCode_invalidAction_submitGems_noGems` without starting a channel or recording an action. Can start once per champion turn; repeated starts return `e_ErrorCode_invalidAction_submitGems_alreadyUsed`.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("submit_gems")))
        int32_t host_submit_gems(int32_t x, int32_t y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_submit_gems(x, y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_cancel_channel();`
        
        gameplay
        
        WASM ABI: `i32 cancel_channel();`
        
        Cancel either channel without spending gems; legal even while crowd controlled. Each channel type can be cancelled once per champion turn. A repeated cancellation returns `e_ErrorCode_invalidAction_cancelChannel_alreadyUsed`; no active channel returns `e_ErrorCode_invalidAction_cancelChannel_notChanneling`. The runner resets these limits when it ends the turn.
        
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("cancel_channel")))
        int32_t host_cancel_channel();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_cancel_channel();
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_sell(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `item);`
        
        gameplay
        
        WASM ABI: `i32 sell(i32 item);`
        
        Buy equipment for the scheduled champion and apply automatic upgrades. Sell one owned item at full value from your own spawn tiles; Tavi only, no per-round limit.
        
        *   `@param item`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("sell")))
        int32_t host_sell(int32_t item);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_sell(item);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_buy_item(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `item,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `count);`
        
        gameplay
        
        WASM ABI: `i32 buy_item(i32 item, i32 count);`
        
        Buy count copies of [`Item`](/game/docs/wasm-api#wasm-ABI-Constants-Item) for the scheduled champion. The host checks shopping eligibility, gold and automatic combinations.
        
        *   `@param item`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param count`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("buy_item")))
        int32_t host_buy_item(int32_t item, int32_t count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_buy_item(item, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_buy_consumable(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind);`
        
        gameplay
        
        WASM ABI: `i32 buy_consumable(i32 kind);`
        
        Buy one consumable for the scheduled champion.
        
        *   `@param kind`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("buy_consumable")))
        int32_t host_buy_consumable(int32_t kind);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_buy_consumable(kind);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_use_consumable(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y);`
        
        gameplay
        
        WASM ABI: `i32 use_consumable(i32 kind, i32 x, i32 y);`
        
        Scrolls and crystals reserve destinations while channeling; neither can be manually cancelled. Occupied scroll destinations return `invalidAction_tpScroll_occupied`; crystals use `move_badDestination`. Rejected destinations do not consume the item. Hidden collisions reveal the tile and return success with `out_successful` = `ENGINE_FALSE` without consuming the item. Successfully used consumables (including starting teleport channels) set `out_successful` = `ENGINE_TRUE`.
        
        *   `@param kind`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Compatibility form. Prefer `use_consumable_with_result` to distinguish a committed hidden-blocker reveal from an invalid action. This form translates a successful reveal with successful = 0 into a legacy blocked-destination error.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("use_consumable")))
        int32_t host_use_consumable(int32_t kind, int32_t x, int32_t y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_use_consumable(kind, x, y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_place_ward(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y);`
        
        gameplay
        
        WASM ABI: `i32 place_ward(i32 x, i32 y);`
        
        Place a ward using the scheduled champion's trinket charge. An existing allied ordinary or control ward returns `e_ErrorCode_invalidAction_placeWard_allyWardPresent`. Enemy wards may share the tile. A hidden allied ward reveals only the destination, recorded like a blocked hidden move. Hidden collisions return success with `out_successful` = `ENGINE_FALSE`; completed placements set `ENGINE_TRUE`. Rejected placements spend no charges; known occupied tiles return `allyWardPresent` without another reveal.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Compatibility form. Prefer `place_ward_with_result` to distinguish a committed hidden-blocker reveal from an invalid action. This form translates a successful reveal with successful = 0 into a legacy blocked-destination error.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("place_ward")))
        int32_t host_place_ward(int32_t x, int32_t y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_place_ward(x, y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_set_priority(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `next_round_priority);`
        
        gameplay
        
        WASM ABI: `i32 set_priority(i32 next_round_priority);`
        
        Set the scheduled champion's priority for the next round without ending its current turn. If omitted, its previously submitted priority is retained (initially zero).
        
        *   `@param next_round_priority`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("set_priority")))
        int32_t host_set_priority(int32_t next_round_priority);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_set_priority(next_round_priority);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_camp_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_camp_occupancy(i32 ptr);`
        
        Copy visible camp occupancy; neutral includes all teams without visibility filtering.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_camp_occupancy")))
        int32_t host_board_camp_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_camp_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_awake_camp_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_awake_camp_occupancy(i32 ptr);`
        
        Like `Game_API_GetCampOccupancy`, but includes only awake camps. Dead camps are excluded.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_awake_camp_occupancy")))
        int32_t host_board_awake_camp_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_awake_camp_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_asleep_camp_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_asleep_camp_occupancy(i32 ptr);`
        
        Like `Game_API_GetCampOccupancy`, but includes only asleep camps. Dead camps are excluded.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_asleep_camp_occupancy")))
        int32_t host_board_asleep_camp_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_asleep_camp_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_ally_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_ally_occupancy(i32 ptr);`
        
        Copy visible ally occupancy; neutral includes all teams without visibility filtering.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_ally_occupancy")))
        int32_t host_board_ally_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_ally_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_enemy_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_enemy_occupancy(i32 ptr);`
        
        Copy visible enemy occupancy; neutral includes all teams without visibility filtering.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_enemy_occupancy")))
        int32_t host_board_enemy_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_enemy_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_ally_ward_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_ally_ward_occupancy(i32 ptr);`
        
        Copy allied ward placements in effective vision; neutral includes both teams.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_ally_ward_occupancy")))
        int32_t host_board_ally_ward_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_ally_ward_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_enemy_ward_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_enemy_ward_occupancy(i32 ptr);`
        
        Copy enemy ward occupancy in individual effective vision. Neutral includes all teams without visibility filtering.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_enemy_ward_occupancy")))
        int32_t host_board_enemy_ward_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_enemy_ward_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_ally_control_ward_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_ally_control_ward_occupancy(i32 ptr);`
        
        Write allied control-ward placements within the observer's effective vision.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_ally_control_ward_occupancy")))
        int32_t host_board_ally_control_ward_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_ally_control_ward_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_enemy_control_ward_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_enemy_control_ward_occupancy(i32 ptr);`
        
        Write enemy control-ward placements within the observer's effective vision.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_enemy_control_ward_occupancy")))
        int32_t host_board_enemy_control_ward_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_enemy_control_ward_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_ally_altar_lock_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_ally_altar_lock_occupancy(i32 ptr);`
        
        Write allied altar-lock occupancy within effective vision; neutral includes both teams.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_ally_altar_lock_occupancy")))
        int32_t host_board_ally_altar_lock_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_ally_altar_lock_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_enemy_altar_lock_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_enemy_altar_lock_occupancy(i32 ptr);`
        
        Write enemy altar-lock occupancy within effective vision; neutral includes both teams.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_enemy_altar_lock_occupancy")))
        int32_t host_board_enemy_altar_lock_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_enemy_altar_lock_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_teleport_occupancy(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_teleport_occupancy(i32 ptr);`
        
        Write visible teleport reservations, always including the observer's own destination.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_teleport_occupancy")))
        int32_t host_board_teleport_occupancy(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_teleport_occupancy(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_vision(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_vision(i32 ptr);`
        
        Copy current individual vision, including owned wards and tile reveals; neutral fills the output with ones.
        
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_vision")))
        int32_t host_board_vision(uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_vision(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_vision_mask(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_vision_mask(i32 champion, i32 x, i32 y, i32 ptr);`
        
        Compute a champion design's vision at a hypothetical tile, including bush and wall occlusion.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_vision_mask")))
        int32_t host_board_vision_mask(int32_t champion, int32_t x, int32_t y, uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_vision_mask(champion, x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_ward_vision_mask(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_ward_vision_mask(i32 x, i32 y, i32 ptr);`
        
        Compute a ward's vision at a hypothetical tile.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_ward_vision_mask")))
        int32_t host_board_ward_vision_mask(int32_t x, int32_t y, uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_ward_vision_mask(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_board_control_ward_vision_mask(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 board_control_ward_vision_mask(i32 x, i32 y, i32 ptr);`
        
        Write the vision mask of a control ward owned by the observer.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A caller-owned, 16-byte-aligned bitboard of `board_bytes` bytes; the host replaces its contents. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("board_control_ward_vision_mask")))
        int32_t host_board_control_ward_vision_mask(int32_t x, int32_t y, uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_board_control_ward_vision_mask(x, y, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_champion_buff_data(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `champion,` [`Game_BuffData`](/game/docs/wasm-api#wasm-ABI-Records-Game_BuffData) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        gameplayvision
        
        WASM ABI: `i32 champion_buff_data(i32 champion, i32 ptr, i32 capacity, i32 count);`
        
        Copy all active typed buffs; count-only calls use zero capacity.
        
        *   `@param champion`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of an output array of [`Game_BuffData`](/game/docs/wasm-api#wasm-ABI-Records-Game_BuffData) records. Memory: at least capacity \* 12 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param capacity`: Maximum number of records, not bytes. Zero queries the required count. A nonzero buffer must hold every result or the call fails with `api_bufferTooSmall`.
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count output; read it on success. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("champion_buff_data")))
        int32_t host_champion_buff_data(int32_t champion, Game_BuffData *ptr, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_champion_buff_data(champion, ptr, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_get_last_error(`[`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity);`
        
        WASM ABI: `i32 bc_get_last_error(i32 ptr, i32 capacity);`
        
        Read the engine's latest diagnostic message. Call immediately after an engine error; runner-only -1 failures do not set an engine diagnostic.
        
        *   `@param ptr`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Byte buffer for the message. Capacity is in bytes; zero queries the full length without accessing `ptr`. Copies min(capacity, length) bytes without a terminating NUL. Memory: at least capacity bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param capacity`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — Full message length in bytes (even when truncated), or -1 for invalid guest memory. This is not a status-returning function.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_get_last_error")))
        int32_t host_bc_get_last_error(uint8_t *ptr, int32_t capacity);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_get_last_error(ptr, capacity);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_resign();`
        
        WASM ABI: `i32 resign();`
        
        Resign for the currently scheduled bot's team, ending the game.
        
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — On success, execution stops immediately without returning to the bot. On failure, returns an engine error code.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("resign")))
        int32_t host_resign();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_resign();
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_round_number(`[`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        WASM ABI: `i32 bc_round_number(i32 ptr);`
        
        Read the current round counter; available during the draft.
        
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_round_number")))
        int32_t host_bc_round_number(uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_round_number(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_submitted_gems(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `side,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*ptr);`
        
        gameplay
        
        WASM ABI: `i32 bc_submitted_gems(i32 side, i32 ptr);`
        
        Read submitted gems for team A or B; neutral returns their sum.
        
        *   `@param side`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_submitted_gems")))
        int32_t host_bc_submitted_gems(int32_t side, uint32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_submitted_gems(side, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_champion_priority(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `next,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 bc_champion_priority(i32 handle, i32 next, i32 ptr);`
        
        Read a visible champion's current turn priority, or the priority queued for next round.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param next`: Zero reads the current round's priority; nonzero reads the next round's priority.
        *   `@param ptr`: Address of the [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_champion_priority")))
        int32_t host_bc_champion_priority(int32_t handle, int32_t next, int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_champion_priority(handle, next, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_metadata(`[`Runner_Metadata`](/game/docs/wasm-api#wasm-ABI-Records-Runner_Metadata) `*ptr);`
        
        WASM ABI: `i32 bc_metadata(i32 ptr);`
        
        Read the current map dimensions, chunk layout and required buffer sizes.
        
        *   `@param ptr`: Address of a 28-byte [`Runner_Metadata`](/game/docs/wasm-api#wasm-ABI-Records-Runner_Metadata) record, aligned to 4 bytes. Memory: at least 28 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_metadata")))
        int32_t host_bc_metadata(Runner_Metadata *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_metadata(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_map_symmetry(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*ptr);`
        
        WASM ABI: `i32 bc_map_symmetry(i32 ptr);`
        
        Read the loaded map's symmetry.
        
        *   `@param ptr`: [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — Address of the [`Symmetry`](/game/docs/wasm-api#wasm-ABI-Constants-Symmetry) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_map_symmetry")))
        int32_t host_bc_map_symmetry(int32_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_map_symmetry(ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_champion_vision(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `handle,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        gameplayvision
        
        WASM ABI: `i32 bc_champion_vision(i32 handle, i32 ptr);`
        
        Write the current champion's effective vision; for another observable champion, compute its design's vision mask at its current position. A dead champion produces an empty board.
        
        *   `@param handle`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A 16-byte-aligned bitboard of `board_bytes` bytes. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_champion_vision")))
        int32_t host_bc_champion_vision(int32_t handle, uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_champion_vision(handle, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_map_mask(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `kind,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*ptr);`
        
        WASM ABI: `i32 bc_map_mask(i32 kind, i32 ptr);`
        
        Write static map terrain: kind 0 = walls, 1 = bushes, 2 = holes, 3 = altars. Other values return `invalidAction`.
        
        *   `@param kind`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param ptr`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — A 16-byte-aligned bitboard of `board_bytes` bytes. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_map_mask")))
        int32_t host_bc_map_mask(int32_t kind, uint64_t *ptr);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_map_mask(kind, ptr);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_submit_draft_memory(`[`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*ptr,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        draft
        
        WASM ABI: `i32 bc_submit_draft_memory(i32 ptr, i32 size);`
        
        During your team's draft input, copy a prefix of guest bytes to draft memory at offset zero. Copies min(size, `draft_memory_size`) bytes; leaves the remaining draft memory unchanged. This does not submit a champion pick or yield.
        
        *   `@param ptr`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer, not an output; size is in bytes. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_submit_draft_memory")))
        int32_t host_bc_submit_draft_memory(uint8_t *ptr, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_submit_draft_memory(ptr, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Zero(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer);`
        
        WASM ABI: `i32 bc_Bitboard_Zero(i32 buffer);`
        
        Fill all storage bits, including padding, with zero.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Zero")))
        int32_t host_bc_Bitboard_Zero(uint64_t *buffer);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Zero(buffer);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_One(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer);`
        
        WASM ABI: `i32 bc_Bitboard_One(i32 buffer);`
        
        Fill all storage bits, including padding, with one.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_One")))
        int32_t host_bc_Bitboard_One(uint64_t *buffer);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_One(buffer);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ImportRawBuffer(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*bytes,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_Bitboard_ImportRawBuffer(i32 buffer, i32 bytes, i32 size);`
        
        Load physical storage, including padding.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: Byte capacity, not element count. Raw storage includes padding and requires `board_bytes` bytes. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied. Buffer and bytes must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ImportRawBuffer")))
        int32_t host_bc_Bitboard_ImportRawBuffer(uint64_t *buffer, uint8_t *bytes, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ImportRawBuffer(buffer, bytes, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ImportLinearBuffer(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*bytes,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_Bitboard_ImportLinearBuffer(i32 buffer, i32 bytes, i32 size);`
        
        Load packed row-major bits, LSB first.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: Byte capacity, not element count. Linear storage is ceil(width \* height / 8) bytes of packed row-major bits, least-significant bit first. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied. Buffer and bytes must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ImportLinearBuffer")))
        int32_t host_bc_Bitboard_ImportLinearBuffer(uint64_t *buffer, uint8_t *bytes, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ImportLinearBuffer(buffer, bytes, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ExportRawBuffer(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*bytes,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_Bitboard_ExportRawBuffer(i32 buffer, i32 bytes, i32 size);`
        
        Copy physical storage, including padding.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: Byte capacity, not element count. Raw storage includes padding and requires `board_bytes` bytes. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied. Buffer and bytes must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ExportRawBuffer")))
        int32_t host_bc_Bitboard_ExportRawBuffer(uint64_t *buffer, uint8_t *bytes, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ExportRawBuffer(buffer, bytes, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ExportLinearBuffer(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*bytes,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_Bitboard_ExportLinearBuffer(i32 buffer, i32 bytes, i32 size);`
        
        Copy packed row-major bits, LSB first.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: Byte capacity, not element count. Linear storage is ceil(width \* height / 8) bytes of packed row-major bits, least-significant bit first. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied. Buffer and bytes must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ExportLinearBuffer")))
        int32_t host_bc_Bitboard_ExportLinearBuffer(uint64_t *buffer, uint8_t *bytes, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ExportLinearBuffer(buffer, bytes, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Print(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer);`
        
        WASM ABI: `i32 bc_Bitboard_Print(i32 buffer);`
        
        Print logical tile values.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Print")))
        int32_t host_bc_Bitboard_Print(uint64_t *buffer);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Print(buffer);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Test(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*value);`
        
        WASM ABI: `i32 bc_Bitboard_Test(i32 buffer, i32 x, i32 y, i32 value);`
        
        Test one logical tile.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param value`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) boolean output (0 or 1). Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Test")))
        int32_t host_bc_Bitboard_Test(uint64_t *buffer, int32_t x, int32_t y, int32_t *value);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Test(buffer, x, y, value);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Set(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_Bitboard_Set(i32 buffer, i32 x, i32 y, i32 value);`
        
        Set one logical tile.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param value`: The value to write, passed directly (not an address).
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Set")))
        int32_t host_bc_Bitboard_Set(uint64_t *buffer, int32_t x, int32_t y, int32_t value);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Set(buffer, x, y, value);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Toggle(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y);`
        
        WASM ABI: `i32 bc_Bitboard_Toggle(i32 buffer, i32 x, i32 y);`
        
        Toggle one logical tile.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Toggle")))
        int32_t host_bc_Bitboard_Toggle(uint64_t *buffer, int32_t x, int32_t y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Toggle(buffer, x, y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_IsZero(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*value);`
        
        WASM ABI: `i32 bc_Bitboard_IsZero(i32 buffer, i32 value);`
        
        Inspect logical tiles, ignoring padding.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param value`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) boolean output: 1 if every logical bit is zero. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_IsZero")))
        int32_t host_bc_Bitboard_IsZero(uint64_t *buffer, int32_t *value);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_IsZero(buffer, value);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_NumSetBits(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*value);`
        
        WASM ABI: `i32 bc_Bitboard_NumSetBits(i32 buffer, i32 value);`
        
        Inspect logical tiles, ignoring padding.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param value`: Address of a [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_NumSetBits")))
        int32_t host_bc_Bitboard_NumSetBits(uint64_t *buffer, uint32_t *value);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_NumSetBits(buffer, value);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_GetSetBits(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`Game_Position`](/game/docs/wasm-api#wasm-ABI-Records-Game_Position) `*positions,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`uint32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) `*count);`
        
        WASM ABI: `i32 bc_Bitboard_GetSetBits(i32 buffer, i32 positions, i32 capacity, i32 count);`
        
        Write up to `in_capacity` (x, y) pairs into 2 \* `in_capacity` [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) slots; zero capacity permits null.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param positions`: Address of capacity [`Game_Position`](/game/docs/wasm-api#wasm-ABI-Records-Game_Position) records (8 bytes each). Capacity counts positions, not [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) words. Memory: at least capacity \* 8 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param capacity`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number written. Truncates to capacity; use `bc_Bitboard_NumSetBits` to obtain the full count. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` The positions array must not overlap the input bitboard. Keep count in a separate 4-byte-aligned [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) slot.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_GetSetBits")))
        int32_t host_bc_Bitboard_GetSetBits(uint64_t *buffer, Game_Position *positions, int32_t capacity, uint32_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_GetSetBits(buffer, positions, capacity, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Not(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result);`
        
        WASM ABI: `i32 bc_Bitboard_Not(i32 buffer, i32 result);`
        
        Not logical tiles; exact input/output aliasing is permitted.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Not")))
        int32_t host_bc_Bitboard_Not(uint64_t *buffer, uint64_t *result);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Not(buffer, result);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Union(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*a,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*b,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result);`
        
        WASM ABI: `i32 bc_Bitboard_Union(i32 a, i32 b, i32 result);`
        
        Combine logical bits using OR. The result may exactly alias either input; a and b may also be identical. Partial overlap is invalid.
        
        *   `@param a`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param b`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Union")))
        int32_t host_bc_Bitboard_Union(uint64_t *a, uint64_t *b, uint64_t *result);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Union(a, b, result);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Intersect(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*a,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*b,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result);`
        
        WASM ABI: `i32 bc_Bitboard_Intersect(i32 a, i32 b, i32 result);`
        
        Combine logical bits using AND. The result may exactly alias either input; a and b may also be identical. Partial overlap is invalid.
        
        *   `@param a`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param b`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Intersect")))
        int32_t host_bc_Bitboard_Intersect(uint64_t *a, uint64_t *b, uint64_t *result);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Intersect(a, b, result);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Xor(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*a,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*b,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result);`
        
        WASM ABI: `i32 bc_Bitboard_Xor(i32 a, i32 b, i32 result);`
        
        Combine logical bits using XOR. The result may exactly alias either input; a and b may also be identical. Partial overlap is invalid.
        
        *   `@param a`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param b`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Xor")))
        int32_t host_bc_Bitboard_Xor(uint64_t *a, uint64_t *b, uint64_t *result);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Xor(a, b, result);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_IsEqual(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*a,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*b,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*value);`
        
        WASM ABI: `i32 bc_Bitboard_IsEqual(i32 a, i32 b, i32 value);`
        
        Compare logical tiles, ignoring padding. Inputs may be identical or disjoint; partial overlap is invalid.
        
        *   `@param a`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param b`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param value`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) boolean output: 1 if logical tiles match. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_IsEqual")))
        int32_t host_bc_Bitboard_IsEqual(uint64_t *a, uint64_t *b, int32_t *value);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_IsEqual(a, b, value);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ShiftRight(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `count);`
        
        WASM ABI: `i32 bc_Bitboard_ShiftRight(i32 buffer, i32 result, i32 count);`
        
        `ShiftRight` logical tiles; exact input/output aliasing is permitted.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param count`: Signed horizontal shift: positive moves right, negative moves left; bits shifted beyond the map are discarded.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ShiftRight")))
        int32_t host_bc_Bitboard_ShiftRight(uint64_t *buffer, uint64_t *result, int32_t count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ShiftRight(buffer, result, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ShiftUp(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `count);`
        
        WASM ABI: `i32 bc_Bitboard_ShiftUp(i32 buffer, i32 result, i32 count);`
        
        `ShiftUp` logical tiles; exact input/output aliasing is permitted.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param count`: Signed vertical shift: positive increases y, negative decreases y; bits shifted beyond the map are discarded.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ShiftUp")))
        int32_t host_bc_Bitboard_ShiftUp(uint64_t *buffer, uint64_t *result, int32_t count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ShiftUp(buffer, result, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Reflect(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `symmetry);`
        
        WASM ABI: `i32 bc_Bitboard_Reflect(i32 buffer, i32 result, i32 symmetry);`
        
        Apply symmetry 0 = horizontal, 1 = vertical, 2 = rotation by 180 degrees.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param symmetry`: [`Symmetry`](/game/docs/wasm-api#wasm-ABI-Constants-Symmetry) enum: 0 = horizontal reflection, 1 = vertical reflection, 2 = rotate 180 degrees. Input and output must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Reflect")))
        int32_t host_bc_Bitboard_Reflect(uint64_t *buffer, uint64_t *result, int32_t symmetry);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Reflect(buffer, result, symmetry);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_DrawCircle(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `radius);`
        
        WASM ABI: `i32 bc_Bitboard_DrawCircle(i32 buffer, i32 x, i32 y, f32 radius);`
        
        Add the shape around an in-bounds center, preserving existing logical bits.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param radius`: Euclidean radius as `f32`; adds tiles within the circle without clearing existing bits.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_DrawCircle")))
        int32_t host_bc_Bitboard_DrawCircle(uint64_t *buffer, int32_t x, int32_t y, float radius);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_DrawCircle(buffer, x, y, radius);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_DrawManhattan(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `radius);`
        
        WASM ABI: `i32 bc_Bitboard_DrawManhattan(i32 buffer, i32 x, i32 y, f32 radius);`
        
        Add the shape around an in-bounds center, preserving existing logical bits.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param radius`: Manhattan radius as `f32`; adds tiles within the diamond without clearing existing bits.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_DrawManhattan")))
        int32_t host_bc_Bitboard_DrawManhattan(uint64_t *buffer, int32_t x, int32_t y, float radius);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_DrawManhattan(buffer, x, y, radius);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_DrawChebyshev(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`float`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `radius);`
        
        WASM ABI: `i32 bc_Bitboard_DrawChebyshev(i32 buffer, i32 x, i32 y, f32 radius);`
        
        Add the shape around an in-bounds center, preserving existing logical bits.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param radius`: Chebyshev radius as `f32`; adds tiles within the square without clearing existing bits.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_DrawChebyshev")))
        int32_t host_bc_Bitboard_DrawChebyshev(uint64_t *buffer, int32_t x, int32_t y, float radius);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_DrawChebyshev(buffer, x, y, radius);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ReflectHorizontalPosition(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*out_x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*out_y);`
        
        WASM ABI: `i32 bc_Bitboard_ReflectHorizontalPosition(i32 x, i32 y, i32 out_x, i32 out_y);`
        
        Transform a logical coordinate using the map dimensions.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param out_x`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param out_y`: Address of a separate [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ReflectHorizontalPosition")))
        int32_t host_bc_Bitboard_ReflectHorizontalPosition(int32_t x, int32_t y, int32_t *out_x, int32_t *out_y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ReflectHorizontalPosition(x, y, out_x, out_y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ReflectVerticalPosition(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*out_x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*out_y);`
        
        WASM ABI: `i32 bc_Bitboard_ReflectVerticalPosition(i32 x, i32 y, i32 out_x, i32 out_y);`
        
        Transform a logical coordinate using the map dimensions.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param out_x`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param out_y`: Address of a separate [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ReflectVerticalPosition")))
        int32_t host_bc_Bitboard_ReflectVerticalPosition(int32_t x, int32_t y, int32_t *out_x, int32_t *out_y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ReflectVerticalPosition(x, y, out_x, out_y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_Rotate180Position(`[`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*out_x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `*out_y);`
        
        WASM ABI: `i32 bc_Bitboard_Rotate180Position(i32 x, i32 y, i32 out_x, i32 out_y);`
        
        Transform a logical coordinate using the map dimensions.
        
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param out_x`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param out_y`: Address of a separate [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_Rotate180Position")))
        int32_t host_bc_Bitboard_Rotate180Position(int32_t x, int32_t y, int32_t *out_x, int32_t *out_y);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_Rotate180Position(x, y, out_x, out_y);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ReachableMask(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*walls,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `distance);`
        
        WASM ABI: `i32 bc_Bitboard_ReachableMask(i32 walls, i32 x, i32 y, i32 result, i32 distance);`
        
        Compute king-move reachability; all buffers must be disjoint.
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param distance`: Integer range in 0..65535. Scratch variants also require separate frontier and scratch bitboards.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ReachableMask")))
        int32_t host_bc_Bitboard_ReachableMask(uint64_t *walls, int32_t x, int32_t y, uint64_t *result, int32_t distance);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ReachableMask(walls, x, y, result, distance);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ShadowCast(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*walls,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `distance);`
        
        WASM ABI: `i32 bc_Bitboard_ShadowCast(i32 walls, i32 x, i32 y, i32 result, i32 distance);`
        
        Compute visibility from a non-opaque origin; all buffers must be disjoint.
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param distance`: Integer range in 0..65535. Scratch variants also require separate frontier and scratch bitboards.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ShadowCast")))
        int32_t host_bc_Bitboard_ShadowCast(uint64_t *walls, int32_t x, int32_t y, uint64_t *result, int32_t distance);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ShadowCast(walls, x, y, result, distance);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_Bitboard_ReachableMaskWithScratch(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*walls,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*result,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `distance,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*frontier,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*scratch);`
        
        WASM ABI: `i32 bc_Bitboard_ReachableMaskWithScratch(i32 walls, i32 x, i32 y, i32 result, i32 distance, i32 frontier, i32 scratch);`
        
        Compute king-move reachability; all buffers must be disjoint.
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param distance`: Integer range in 0..65535. Scratch variants also require separate frontier and scratch bitboards.
        *   `@param frontier`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param scratch`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_Bitboard_ReachableMaskWithScratch")))
        int32_t host_bc_Bitboard_ReachableMaskWithScratch(uint64_t *walls, int32_t x, int32_t y, uint64_t *result, int32_t distance, uint64_t *frontier, uint64_t *scratch);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_Bitboard_ReachableMaskWithScratch(walls, x, y, result, distance, frontier, scratch);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_ImportRawBuffer(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*buffer,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*bytes,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_DistanceField_ImportRawBuffer(i32 buffer, i32 bytes, i32 size);`
        
        Load physical storage, including padding.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: Byte capacity, not element count. Raw storage includes padding and requires `field_bytes` bytes. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied. Buffer and bytes must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_ImportRawBuffer")))
        int32_t host_bc_DistanceField_ImportRawBuffer(uint16_t *buffer, uint8_t *bytes, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_ImportRawBuffer(buffer, bytes, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_ImportLinearBuffer(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*buffer,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*bytes,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_DistanceField_ImportLinearBuffer(i32 buffer, i32 bytes, i32 size);`
        
        Load row-major [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) values in native byte order (little-endian on WASM).
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: Byte capacity, not element count. Linear storage is width \* height little-endian [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) values (2 bytes each), row-major. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied. Buffer and bytes must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_ImportLinearBuffer")))
        int32_t host_bc_DistanceField_ImportLinearBuffer(uint16_t *buffer, uint8_t *bytes, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_ImportLinearBuffer(buffer, bytes, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_ExportRawBuffer(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*buffer,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*bytes,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_DistanceField_ExportRawBuffer(i32 buffer, i32 bytes, i32 size);`
        
        Copy physical storage, including padding.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: Byte capacity, not element count. Raw storage includes padding and requires `field_bytes` bytes. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied. Buffer and bytes must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_ExportRawBuffer")))
        int32_t host_bc_DistanceField_ExportRawBuffer(uint16_t *buffer, uint8_t *bytes, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_ExportRawBuffer(buffer, bytes, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_ExportLinearBuffer(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*buffer,` [`uint8_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) `*bytes,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_DistanceField_ExportLinearBuffer(i32 buffer, i32 bytes, i32 size);`
        
        Copy row-major [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) values in native byte order (little-endian on WASM).
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer. Memory: at least size bytes in exported linear memory; 1-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param size`: Byte capacity, not element count. Linear storage is width \* height little-endian [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) values (2 bytes each), row-major. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied. Buffer and bytes must be disjoint.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_ExportLinearBuffer")))
        int32_t host_bc_DistanceField_ExportLinearBuffer(uint16_t *buffer, uint8_t *bytes, int32_t size);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_ExportLinearBuffer(buffer, bytes, size);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_Print(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*buffer);`
        
        WASM ABI: `i32 bc_DistanceField_Print(i32 buffer);`
        
        Print logical tile values.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_Print")))
        int32_t host_bc_DistanceField_Print(uint16_t *buffer);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_Print(buffer);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_Copy(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*source,` [`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*destination);`
        
        WASM ABI: `i32 bc_DistanceField_Copy(i32 source, i32 destination);`
        
        Copy physical storage, including padding. Exact self-copy is allowed; partial overlap is invalid.
        
        *   `@param source`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param destination`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_Copy")))
        int32_t host_bc_DistanceField_Copy(uint16_t *source, uint16_t *destination);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_Copy(source, destination);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_CopyWithMask(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*source,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*mask,` [`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*destination);`
        
        WASM ABI: `i32 bc_DistanceField_CopyWithMask(i32 source, i32 mask, i32 destination);`
        
        Copy only logical tiles selected by `in_mask`, preserving every unselected destination value. Mask padding is ignored and destination padding is preserved. Mask must not overlap either field. Fields may exactly alias; partial overlap is invalid. Fields require [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) alignment.
        
        *   `@param source`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param mask`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param destination`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Initialize destination before copying: unselected logical tiles and destination padding keep their previous values.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_CopyWithMask")))
        int32_t host_bc_DistanceField_CopyWithMask(uint16_t *source, uint64_t *mask, uint16_t *destination);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_CopyWithMask(source, mask, destination);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_Get(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*value);`
        
        WASM ABI: `i32 bc_DistanceField_Get(i32 buffer, i32 x, i32 y, i32 value);`
        
        Read one logical distance.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param value`: Address of a [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) output (2 bytes, aligned to 2). Memory: at least 2 bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_Get")))
        int32_t host_bc_DistanceField_Get(uint16_t *buffer, int32_t x, int32_t y, uint16_t *value);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_Get(buffer, x, y, value);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_Set(`[`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*buffer,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_DistanceField_Set(i32 buffer, i32 x, i32 y, i32 value);`
        
        Write one logical distance.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param value`: The value to write, passed directly (not an address). An integer in 0..65535; 65535 represents unreachable/uncomputed.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Set preserves other tiles. Initialize the full field with a compute or import operation before reading those tiles.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_Set")))
        int32_t host_bc_DistanceField_Set(uint16_t *buffer, int32_t x, int32_t y, int32_t value);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_Set(buffer, x, y, value);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_ComputeWithExpansionCount(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*walls,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*roots,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*visited,` [`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*distances,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `max_distance,` [`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*count);`
        
        WASM ABI: `i32 bc_DistanceField_ComputeWithExpansionCount(i32 walls, i32 roots, i32 visited, i32 distances, i32 max_distance, i32 count);`
        
        Compute king-move distances using reusable thread-local scratch. All buffers must be disjoint. Count attempted expansions, including the final empty one.
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param roots`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input seed bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param visited`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output visited bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param distances`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Output distance field. Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param max_distance`: Integer limit in 0..65535.
        *   `@param count`: Address of a [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) expansion count, not [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32). Unreachable/uncomputed tiles have distance 65535. All participating buffers must be disjoint. Memory: at least 2 bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_ComputeWithExpansionCount")))
        int32_t host_bc_DistanceField_ComputeWithExpansionCount(uint64_t *walls, uint64_t *roots, uint64_t *visited, uint16_t *distances, int32_t max_distance, uint16_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_ComputeWithExpansionCount(walls, roots, visited, distances, max_distance, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_ComputeToWithExpansionCount(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*walls,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*roots,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*destinations,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*visited, ui…`
        
        Collapse
        
        [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `host_bc_DistanceField_ComputeToWithExpansionCount(`[`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*walls,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*roots,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*destinations,` [`uint64_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `*visited,` [`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*distances,` [`int32_t`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `max_distance,` [`uint16_t`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `*count);`
        
        WASM ABI: `i32 bc_DistanceField_ComputeToWithExpansionCount(i32 walls, i32 roots, i32 destinations, i32 visited, i32 distances, i32 max_distance, i32 count);`
        
        Compute until all destinations are reached or the frontier stops using reusable thread-local scratch. All buffers must be disjoint. Count attempted expansions, including the final empty one.
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param roots`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input seed bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param destinations`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input target bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param visited`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output visited bitboard. Memory: at least `board_bytes` bytes in exported linear memory; 16-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param distances`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Output distance field. Memory: at least `field_bytes` bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param max_distance`: Integer limit in 0..65535.
        *   `@param count`: Address of a [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) expansion count, not [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32). Unreachable/uncomputed tiles have distance 65535. All participating buffers must be disjoint. Memory: at least 2 bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("bc_DistanceField_ComputeToWithExpansionCount")))
        int32_t host_bc_DistanceField_ComputeToWithExpansionCount(uint64_t *walls, uint64_t *roots, uint64_t *destinations, uint64_t *visited, uint16_t *distances, int32_t max_distance, uint16_t *count);
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        auto return_value = host_bc_DistanceField_ComputeToWithExpansionCount(walls, roots, destinations, visited, distances, max_distance, count);
        // Interpret return_value using this binding's return contract before reading outputs.
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Zero_gc(arrayref buffer);`
        
        WASM ABI: `i32 bc_Bitboard_Zero_gc(arrayref buffer);`
        
        Fill all storage bits, including padding, with zero.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Zero) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Zero_gc" (func $host (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_One_gc(arrayref buffer);`
        
        WASM ABI: `i32 bc_Bitboard_One_gc(arrayref buffer);`
        
        Fill all storage bits, including padding, with one.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_One) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_One_gc" (func $host (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ImportRawBuffer_gc(arrayref buffer, arrayref bytes,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_Bitboard_ImportRawBuffer_gc(arrayref buffer, arrayref bytes, i32 size);`
        
        Load physical storage, including padding.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer. Memory: a non-null mutable WasmGC i8 array of exactly size bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param size`: Byte capacity, not element count. Raw storage includes padding and requires `board_bytes` bytes. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        `@note` Use the required transfer size. The GC bridge limits size to `round_up`(max(`board_bytes`, `field_bytes`), 16); larger scratch requests return `api_valueOutOfRange`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ImportRawBuffer) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ImportRawBuffer_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ImportLinearBuffer_gc(arrayref buffer, arrayref bytes,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_Bitboard_ImportLinearBuffer_gc(arrayref buffer, arrayref bytes, i32 size);`
        
        Load packed row-major bits, LSB first.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer. Memory: a non-null mutable WasmGC i8 array of exactly size bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param size`: Byte capacity, not element count. Linear storage is ceil(width \* height / 8) bytes of packed row-major bits, least-significant bit first. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        `@note` Use the required transfer size. The GC bridge limits size to `round_up`(max(`board_bytes`, `field_bytes`), 16); larger scratch requests return `api_valueOutOfRange`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ImportLinearBuffer) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ImportLinearBuffer_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ExportRawBuffer_gc(arrayref buffer, arrayref bytes,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_Bitboard_ExportRawBuffer_gc(arrayref buffer, arrayref bytes, i32 size);`
        
        Copy physical storage, including padding.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer. Memory: a non-null mutable WasmGC i8 array of exactly size bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param size`: Byte capacity, not element count. Raw storage includes padding and requires `board_bytes` bytes. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Use the required transfer size. The GC bridge limits size to `round_up`(max(`board_bytes`, `field_bytes`), 16); larger scratch requests return `api_valueOutOfRange`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ExportRawBuffer) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ExportRawBuffer_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ExportLinearBuffer_gc(arrayref buffer, arrayref bytes,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_Bitboard_ExportLinearBuffer_gc(arrayref buffer, arrayref bytes, i32 size);`
        
        Copy packed row-major bits, LSB first.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer. Memory: a non-null mutable WasmGC i8 array of exactly size bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param size`: Byte capacity, not element count. Linear storage is ceil(width \* height / 8) bytes of packed row-major bits, least-significant bit first. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Use the required transfer size. The GC bridge limits size to `round_up`(max(`board_bytes`, `field_bytes`), 16); larger scratch requests return `api_valueOutOfRange`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ExportLinearBuffer) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ExportLinearBuffer_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Print_gc(arrayref buffer);`
        
        WASM ABI: `i32 bc_Bitboard_Print_gc(arrayref buffer);`
        
        Print logical tile values.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Print) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Print_gc" (func $host (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Test_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_Bitboard_Test_gc(arrayref buffer, i32 x, i32 y, i32 value);`
        
        Test one logical tile.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param value`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) boolean output (0 or 1). Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Test) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Test_gc" (func $host (param (ref null array)) (param i32) (param i32) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Set_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_Bitboard_Set_gc(arrayref buffer, i32 x, i32 y, i32 value);`
        
        Set one logical tile.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param value`: The value to write, passed directly (not an address).
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Set) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Set_gc" (func $host (param (ref null array)) (param i32) (param i32) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Toggle_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y);`
        
        WASM ABI: `i32 bc_Bitboard_Toggle_gc(arrayref buffer, i32 x, i32 y);`
        
        Toggle one logical tile.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Toggle) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Toggle_gc" (func $host (param (ref null array)) (param i32) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_IsZero_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_Bitboard_IsZero_gc(arrayref buffer, i32 value);`
        
        Inspect logical tiles, ignoring padding.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param value`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) boolean output: 1 if every logical bit is zero. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_IsZero) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_IsZero_gc" (func $host (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_NumSetBits_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_Bitboard_NumSetBits_gc(arrayref buffer, i32 value);`
        
        Inspect logical tiles, ignoring padding.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param value`: Address of a [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) count output. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_NumSetBits) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_NumSetBits_gc" (func $host (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_GetSetBits_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `positions,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `capacity,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `count);`
        
        WASM ABI: `i32 bc_Bitboard_GetSetBits_gc(arrayref buffer, i32 positions, i32 capacity, i32 count);`
        
        Write up to `in_capacity` (x, y) pairs into 2 \* `in_capacity` [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) slots; zero capacity permits null.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param positions`: Address of capacity [`Game_Position`](/game/docs/wasm-api#wasm-ABI-Records-Game_Position) records (8 bytes each). Capacity counts positions, not [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) words. Memory: at least capacity \* 8 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@param capacity`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param count`: Address of the [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) number written. Truncates to capacity; use `bc_Bitboard_NumSetBits` to obtain the full count. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` The positions array must not overlap the input bitboard. Keep count in a separate 4-byte-aligned [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32) slot.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_GetSetBits) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_GetSetBits_gc" (func $host (param (ref null array)) (param i32) (param i32) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Not_gc(arrayref buffer, arrayref result);`
        
        WASM ABI: `i32 bc_Bitboard_Not_gc(arrayref buffer, arrayref result);`
        
        Not logical tiles; exact input/output aliasing is permitted.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Not) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Not_gc" (func $host (param (ref null array)) (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Union_gc(arrayref a, arrayref b, arrayref result);`
        
        WASM ABI: `i32 bc_Bitboard_Union_gc(arrayref a, arrayref b, arrayref result);`
        
        Combine logical bits using OR.
        
        *   `@param a`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param b`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Union) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Union_gc" (func $host (param (ref null array)) (param (ref null array)) (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Intersect_gc(arrayref a, arrayref b, arrayref result);`
        
        WASM ABI: `i32 bc_Bitboard_Intersect_gc(arrayref a, arrayref b, arrayref result);`
        
        Combine logical bits using AND.
        
        *   `@param a`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param b`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Intersect) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Intersect_gc" (func $host (param (ref null array)) (param (ref null array)) (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Xor_gc(arrayref a, arrayref b, arrayref result);`
        
        WASM ABI: `i32 bc_Bitboard_Xor_gc(arrayref a, arrayref b, arrayref result);`
        
        Combine logical bits using XOR.
        
        *   `@param a`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param b`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Xor) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Xor_gc" (func $host (param (ref null array)) (param (ref null array)) (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_IsEqual_gc(arrayref a, arrayref b,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_Bitboard_IsEqual_gc(arrayref a, arrayref b, i32 value);`
        
        Compare logical tiles, ignoring padding.
        
        *   `@param a`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param b`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param value`: Address of an [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) boolean output: 1 if logical tiles match. Memory: at least 4 bytes in exported linear memory; 4-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_IsEqual) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_IsEqual_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ShiftRight_gc(arrayref buffer, arrayref result,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `count);`
        
        WASM ABI: `i32 bc_Bitboard_ShiftRight_gc(arrayref buffer, arrayref result, i32 count);`
        
        `ShiftRight` logical tiles; exact input/output aliasing is permitted.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param count`: Signed horizontal shift: positive moves right, negative moves left; bits shifted beyond the map are discarded.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ShiftRight) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ShiftRight_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ShiftUp_gc(arrayref buffer, arrayref result,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `count);`
        
        WASM ABI: `i32 bc_Bitboard_ShiftUp_gc(arrayref buffer, arrayref result, i32 count);`
        
        `ShiftUp` logical tiles; exact input/output aliasing is permitted.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param count`: Signed vertical shift: positive increases y, negative decreases y; bits shifted beyond the map are discarded.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ShiftUp) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ShiftUp_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_Reflect_gc(arrayref buffer, arrayref result,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `symmetry);`
        
        WASM ABI: `i32 bc_Bitboard_Reflect_gc(arrayref buffer, arrayref result, i32 symmetry);`
        
        Apply symmetry 0 = horizontal, 1 = vertical, 2 = rotation by 180 degrees.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param symmetry`: [`Symmetry`](/game/docs/wasm-api#wasm-ABI-Constants-Symmetry) enum: 0 = horizontal reflection, 1 = vertical reflection, 2 = rotate 180 degrees.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_Reflect) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_Reflect_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_DrawCircle_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`f32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `radius);`
        
        WASM ABI: `i32 bc_Bitboard_DrawCircle_gc(arrayref buffer, i32 x, i32 y, f32 radius);`
        
        Add the shape around an in-bounds center, preserving existing logical bits.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param radius`: Euclidean radius as `f32`; adds tiles within the circle without clearing existing bits.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_DrawCircle) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_DrawCircle_gc" (func $host (param (ref null array)) (param i32) (param i32) (param f32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_DrawManhattan_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`f32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `radius);`
        
        WASM ABI: `i32 bc_Bitboard_DrawManhattan_gc(arrayref buffer, i32 x, i32 y, f32 radius);`
        
        Add the shape around an in-bounds center, preserving existing logical bits.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param radius`: Manhattan radius as `f32`; adds tiles within the diamond without clearing existing bits.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_DrawManhattan) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_DrawManhattan_gc" (func $host (param (ref null array)) (param i32) (param i32) (param f32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_DrawChebyshev_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`f32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32) `radius);`
        
        WASM ABI: `i32 bc_Bitboard_DrawChebyshev_gc(arrayref buffer, i32 x, i32 y, f32 radius);`
        
        Add the shape around an in-bounds center, preserving existing logical bits.
        
        *   `@param buffer`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param radius`: Chebyshev radius as `f32`; adds tiles within the square without clearing existing bits.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` This operation modifies existing storage; initialize the full buffer first. For a new empty bitboard, call `bc_Bitboard_Zero`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_DrawChebyshev) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_DrawChebyshev_gc" (func $host (param (ref null array)) (param i32) (param i32) (param f32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ReachableMask_gc(arrayref walls,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y, arrayref result,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `distance);`
        
        WASM ABI: `i32 bc_Bitboard_ReachableMask_gc(arrayref walls, i32 x, i32 y, arrayref result, i32 distance);`
        
        Compute king-move reachability;
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param distance`: Integer range in 0..65535. Scratch variants also require separate frontier and scratch bitboards.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ReachableMask) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ReachableMask_gc" (func $host (param (ref null array)) (param i32) (param i32) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ShadowCast_gc(arrayref walls,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y, arrayref result,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `distance);`
        
        WASM ABI: `i32 bc_Bitboard_ShadowCast_gc(arrayref walls, i32 x, i32 y, arrayref result, i32 distance);`
        
        Compute visibility from a non-opaque origin;
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param distance`: Integer range in 0..65535. Scratch variants also require separate frontier and scratch bitboards.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ShadowCast) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ShadowCast_gc" (func $host (param (ref null array)) (param i32) (param i32) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_Bitboard_ReachableMaskWithScratch_gc(arrayref walls,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y, arrayref result,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `distance, arrayref frontier, arrayref scratch);`
        
        WASM ABI: `i32 bc_Bitboard_ReachableMaskWithScratch_gc(arrayref walls, i32 x, i32 y, arrayref result, i32 distance, arrayref frontier, arrayref scratch);`
        
        Compute king-move reachability;
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param result`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param distance`: Integer range in 0..65535. Scratch variants also require separate frontier and scratch bitboards.
        *   `@param frontier`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param scratch`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Bitboards-bc_Bitboard_ReachableMaskWithScratch) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_Bitboard_ReachableMaskWithScratch_gc" (func $host (param (ref null array)) (param i32) (param i32) (param (ref null array)) (param i32) (param (ref null array)) (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_ImportRawBuffer_gc(arrayref buffer, arrayref bytes,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_DistanceField_ImportRawBuffer_gc(arrayref buffer, arrayref bytes, i32 size);`
        
        Load physical storage, including padding.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer. Memory: a non-null mutable WasmGC i8 array of exactly size bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param size`: Byte capacity, not element count. Raw storage includes padding and requires `field_bytes` bytes. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        `@note` Use the required transfer size. The GC bridge limits size to `round_up`(max(`board_bytes`, `field_bytes`), 16); larger scratch requests return `api_valueOutOfRange`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_ImportRawBuffer) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_ImportRawBuffer_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_ImportLinearBuffer_gc(arrayref buffer, arrayref bytes,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_DistanceField_ImportLinearBuffer_gc(arrayref buffer, arrayref bytes, i32 size);`
        
        Load row-major [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) values in native byte order (little-endian on WASM).
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Source byte buffer. Memory: a non-null mutable WasmGC i8 array of exactly size bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param size`: Byte capacity, not element count. Linear storage is width \* height little-endian [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) values (2 bytes each), row-major. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        `@note` Use the required transfer size. The GC bridge limits size to `round_up`(max(`board_bytes`, `field_bytes`), 16); larger scratch requests return `api_valueOutOfRange`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_ImportLinearBuffer) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_ImportLinearBuffer_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_ExportRawBuffer_gc(arrayref buffer, arrayref bytes,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_DistanceField_ExportRawBuffer_gc(arrayref buffer, arrayref bytes, i32 size);`
        
        Copy physical storage, including padding.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer. Memory: a non-null mutable WasmGC i8 array of exactly size bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param size`: Byte capacity, not element count. Raw storage includes padding and requires `field_bytes` bytes. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Use the required transfer size. The GC bridge limits size to `round_up`(max(`board_bytes`, `field_bytes`), 16); larger scratch requests return `api_valueOutOfRange`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_ExportRawBuffer) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_ExportRawBuffer_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_ExportLinearBuffer_gc(arrayref buffer, arrayref bytes,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `size);`
        
        WASM ABI: `i32 bc_DistanceField_ExportLinearBuffer_gc(arrayref buffer, arrayref bytes, i32 size);`
        
        Copy row-major [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) values in native byte order (little-endian on WASM).
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param bytes`: [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8) — Destination byte buffer. Memory: a non-null mutable WasmGC i8 array of exactly size bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param size`: Byte capacity, not element count. Linear storage is width \* height little-endian [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) values (2 bytes each), row-major. The complete size-byte guest range must be valid. Too little capacity returns `api_bufferTooSmall`; extra capacity is not copied.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Use the required transfer size. The GC bridge limits size to `round_up`(max(`board_bytes`, `field_bytes`), 16); larger scratch requests return `api_valueOutOfRange`.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_ExportLinearBuffer) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_ExportLinearBuffer_gc" (func $host (param (ref null array)) (param (ref null array)) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_Print_gc(arrayref buffer);`
        
        WASM ABI: `i32 bc_DistanceField_Print_gc(arrayref buffer);`
        
        Print logical tile values.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_Print) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_Print_gc" (func $host (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_Get_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_DistanceField_Get_gc(arrayref buffer, i32 x, i32 y, i32 value);`
        
        Read one logical distance.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param value`: Address of a [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) output (2 bytes, aligned to 2). Memory: at least 2 bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_Get) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_Get_gc" (func $host (param (ref null array)) (param i32) (param i32) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_Set_gc(arrayref buffer,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `x,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `y,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `value);`
        
        WASM ABI: `i32 bc_DistanceField_Set_gc(arrayref buffer, i32 x, i32 y, i32 value);`
        
        Write one logical distance.
        
        *   `@param buffer`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param x`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param y`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
        *   `@param value`: The value to write, passed directly (not an address). An integer in 0..65535; 65535 represents unreachable/uncomputed.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Set preserves other tiles. Initialize the full field with a compute or import operation before reading those tiles.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_Set) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_Set_gc" (func $host (param (ref null array)) (param i32) (param i32) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_Copy_gc(arrayref source, arrayref destination);`
        
        WASM ABI: `i32 bc_DistanceField_Copy_gc(arrayref source, arrayref destination);`
        
        Copy physical storage, including padding.
        
        *   `@param source`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param destination`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_Copy) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_Copy_gc" (func $host (param (ref null array)) (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_CopyWithMask_gc(arrayref source, arrayref mask, arrayref destination);`
        
        WASM ABI: `i32 bc_DistanceField_CopyWithMask_gc(arrayref source, arrayref mask, arrayref destination);`
        
        Copy only logical tiles selected by `in_mask`, preserving every unselected destination value. Mask padding is ignored and destination padding is preserved.
        
        *   `@param source`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param mask`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param destination`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Initialize destination before copying: unselected logical tiles and destination padding keep their previous values.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_CopyWithMask) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_CopyWithMask_gc" (func $host (param (ref null array)) (param (ref null array)) (param (ref null array)) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_ComputeWithExpansionCount_gc(arrayref walls, arrayref roots, arrayref visited, arrayref distances,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `max_distance,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `count);`
        
        WASM ABI: `i32 bc_DistanceField_ComputeWithExpansionCount_gc(arrayref walls, arrayref roots, arrayref visited, arrayref distances, i32 max_distance, i32 count);`
        
        Compute king-move distances using reusable thread-local scratch. Count attempted expansions, including the final empty one.
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param roots`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input seed bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param visited`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output visited bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param distances`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Output distance field. Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param max_distance`: Integer limit in 0..65535.
        *   `@param count`: Address of a [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) expansion count, not [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32). Unreachable/uncomputed tiles have distance 65535. Memory: at least 2 bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_ComputeWithExpansionCount) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_ComputeWithExpansionCount_gc" (func $host (param (ref null array)) (param (ref null array)) (param (ref null array)) (param (ref null array)) (param i32) (param i32) (result i32)))
        ```
        
    *   ### [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `bc_DistanceField_ComputeToWithExpansionCount_gc(arrayref walls, arrayref roots, arrayref destinations, arrayref visited, arrayref distances,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `max_distance,` [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) `count);`
        
        WASM ABI: `i32 bc_DistanceField_ComputeToWithExpansionCount_gc(arrayref walls, arrayref roots, arrayref destinations, arrayref visited, arrayref distances, i32 max_distance, i32 count);`
        
        Compute until all destinations are reached or the frontier stops using reusable thread-local scratch. Count attempted expansions, including the final empty one.
        
        *   `@param walls`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input obstacle bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param roots`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input seed bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param destinations`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Input target bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param visited`: [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) — Output visited bitboard. Memory: a non-null mutable WasmGC i8 array of exactly `board_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param distances`: [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) — Output distance field. Memory: a non-null mutable WasmGC i8 array of exactly `field_bytes` bytes. It is an array reference, not a linear-memory address; the host supplies aligned scratch storage.
        *   `@param max_distance`: Integer limit in 0..65535.
        *   `@param count`: Address of a [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) expansion count, not [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32). Unreachable/uncomputed tiles have distance 65535. Memory: at least 2 bytes in exported linear memory; 2-byte alignment. Nonempty ranges must start at a positive address.
        *   `@return`: [`i32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32) — 0 on success; an engine error code on failure, or -1 for invalid guest memory. Read outputs only on success.
        
        `@note` Output storage need not be initialized before this call. Import operations require initialized source bytes.
        
        `@note` WasmGC variant: `arrayref` means (ref null array). Each array parameter is staged in a separate aligned host buffer, so input/output array references may be identical. Use distinct arrays for independent outputs: later write-backs would overwrite an earlier result in a shared array. Scalar and position outputs still use linear memory. See Bitboards, distance fields and WasmGC above.
        
        Import and use in C++
        
        These imports require actual WasmGC arrays. Ordinary C++ buffers and linear pointers cannot satisfy `arrayref`. Use the corresponding [linear-memory binding](/game/docs/wasm-api#wasm-env-Distance fields-bc_DistanceField_ComputeToWithExpansionCount) in this language, or supply a GC-aware WAT bridge as demonstrated in the OCaml view.
        
        WasmGC import (requires a GC-aware bridge)
        
        ```wat
        (import "env" "bc_DistanceField_ComputeToWithExpansionCount_gc" (func $host (param (ref null array)) (param (ref null array)) (param (ref null array)) (param (ref null array)) (param (ref null array)) (param i32) (param i32) (result i32)))
        ```
        
    *   ### `void host_yield();`
        
        WASM ABI: `void yield();`
        
        End this bot's turn voluntarily. Execution suspends at the call and resumes immediately after it when this bot next receives input; stack and memory persist. A draft and each physical champion use separate instances. Returning from `_start` exits the instance instead of yielding.
        
        *   `@return`: `void`
        
        Import and use in C++
        
        Import and call (inside your WASM guest)
        
        ```cpp
        #include <stdint.h>
        // Define the linked ABI record types before this declaration.
        extern "C" __attribute__((import_module("env"), import_name("yield")))
        void host_yield();
        
        // Inside your bot, with the arguments prepared:
        // Pointer arguments must refer to the documented aligned storage.
        host_yield();
        // Execution resumes after the host call.
        ```
        
*   group`ABI`90
    *   group`Records`34
        
    *   group`Identifiers`26
        
    *   group`Constants`20
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Champion_State`](/game/docs/wasm-api#wasm-ABI-Constants-Champion_State) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { e_Game_CampState_dead, e_Game_CampState_alive, e_Game_CampState_asleep, };`
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_CampState`](/game/docs/wasm-api#wasm-ABI-Constants-Game_CampState) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { e_Game_Vision_Type_shadowCast, e_Game_Vision_Type_xray };`
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_Vision_Type`](/game/docs/wasm-api#wasm-ABI-Constants-Game_Vision_Type) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_Passive_Type`](/game/docs/wasm-api#wasm-ABI-Constants-Game_Passive_Type) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { e_Game_AttackType_melee, e_Game_AttackType_ranged };`
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_AttackType`](/game/docs/wasm-api#wasm-ABI-Constants-Game_AttackType) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { e_Game_CampGroupState_unknown, e_Game_CampGroupState_hasCamps, e_Game_CampGroupState_waitingForRewardClaim, e_Game_CampGroupState_waitingToRespawn };`
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_CampGroupState`](/game/docs/wasm-api#wasm-ABI-Constants-Game_CampGroupState) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_EntityKind`](/game/docs/wasm-api#wasm-ABI-Constants-Game_EntityKind) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_Consumable`](/game/docs/wasm-api#wasm-ABI-Constants-Game_Consumable) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_Ability_Type`](/game/docs/wasm-api#wasm-ABI-Constants-Game_Ability_Type) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_Ability_Attributes`](/game/docs/wasm-api#wasm-ABI-Constants-Game_Ability_Attributes) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_Ability_Target`](/game/docs/wasm-api#wasm-ABI-Constants-Game_Ability_Target) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`ChampionDraft`](/game/docs/wasm-api#wasm-ABI-Constants-ChampionDraft) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Champion`](/game/docs/wasm-api#wasm-ABI-Constants-Champion) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { e_Camp_none = -1, e_Camp_wolf = 0, e_Camp_elk, e_Camp_gemCluster, e_Camp_goldCluster, e_Camp_monolith, e_Camp_golem, e_Camp_mapSize };`
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Camp`](/game/docs/wasm-api#wasm-ABI-Constants-Camp) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { e_Team_a = 0, e_Team_b, e_Team_neutral };`
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Team`](/game/docs/wasm-api#wasm-ABI-Constants-Team) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Item`](/game/docs/wasm-api#wasm-ABI-Constants-Item) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Game_ItemPassive`](/game/docs/wasm-api#wasm-ABI-Constants-Game_ItemPassive) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { e_Buff_shield, e_Buff_stun, e_Buff_enhancedAuto, e_Buff_numTypes };`
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Buff`](/game/docs/wasm-api#wasm-ABI-Constants-Buff) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`BuffRestriction`](/game/docs/wasm-api#wasm-ABI-Constants-BuffRestriction) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
        *   ### `enum { … }`
            
            Expand
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Numeric [`Symmetry`](/game/docs/wasm-api#wasm-ABI-Constants-Symmetry) constants. Omitted values increment from the preceding value; an initial omitted value is zero.
            
    *   group`Scalars`8
        *   ### [`uint8`](/game/docs/wasm-api#wasm-ABI-Scalars-uint8)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            1-byte unsigned integer, aligned to 1 bytes. Multibyte values are little-endian. This is the width in memory, which can differ from the `i32` address passed to the host.
            
        *   ### [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            2-byte unsigned integer, aligned to 2 bytes. Multibyte values are little-endian. This is the width in memory, which can differ from the `i32` address passed to the host.
            
        *   ### [`uint32`](/game/docs/wasm-api#wasm-ABI-Scalars-uint32)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            4-byte unsigned integer, aligned to 4 bytes. Multibyte values are little-endian. This is the width in memory, which can differ from the `i32` address passed to the host.
            
        *   ### [`uint64`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            8-byte unsigned integer, aligned to 8 bytes. Multibyte values are little-endian. This is the width in memory, which can differ from the `i32` address passed to the host.
            
        *   ### [`int32`](/game/docs/wasm-api#wasm-ABI-Scalars-int32)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            4-byte signed integer, aligned to 4 bytes. Multibyte values are little-endian. This is the width in memory, which can differ from the `i32` address passed to the host.
            
        *   ### [`float32`](/game/docs/wasm-api#wasm-ABI-Scalars-float32)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            4-byte IEEE-754 float, aligned to 4 bytes. Multibyte values are little-endian. This is the width in memory, which can differ from the `i32` address passed to the host.
            
        *   ### [`float64`](/game/docs/wasm-api#wasm-ABI-Scalars-float64)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            8-byte IEEE-754 float, aligned to 8 bytes. Multibyte values are little-endian. This is the width in memory, which can differ from the `i32` address passed to the host.
            
        *   ### [`cbool`](/game/docs/wasm-api#wasm-ABI-Scalars-cbool)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            4-byte signed integer boolean (0 = false, nonzero = true), aligned to 4 bytes. Multibyte values are little-endian. This is the width in memory, which can differ from the `i32` address passed to the host.
            
    *   group`Buffers`2
        *   ### [`uint64`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64) `words[board_bytes / 8]; // 16-byte-aligned base address`
            
            Referenced types: [`Runner_Metadata`](/game/docs/wasm-api#wasm-ABI-Records-Runner_Metadata), [`uint64`](/game/docs/wasm-api#wasm-ABI-Scalars-uint64)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Caller-owned raw bitboard storage; [`BitboardBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-BitboardBuffer) is a documentation label, not a C typedef. Query [`Runner_Metadata`](/game/docs/wasm-api#wasm-ABI-Records-Runner_Metadata) using `bc_metadata` before allocating `board_bytes` bytes at 16-byte alignment. Chunk word index = (y / 8) \* `chunk_stride` + (x / 8); bit = (y % 8) \* 8 + x % 8. Initialize with `bc_Bitboard_Zero`. Every scratch board needs a separate complete allocation unless the method permits aliasing. WasmGC variants use exactly `board_bytes` mutable i8 elements instead of a linear address.
            
        *   ### [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) `cells[field_bytes / 2]; // 2-byte-aligned base address`
            
            Referenced types: [`Runner_Metadata`](/game/docs/wasm-api#wasm-ABI-Records-Runner_Metadata), [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16)
            
            Canonical C ABI layout. Preserve field sizes, alignment and padding when mapping this layout to C++ types.
            
            Caller-owned raw distance storage; [`DistanceFieldBuffer`](/game/docs/wasm-api#wasm-ABI-Buffers-DistanceFieldBuffer) is a documentation label, not a C typedef. Query [`Runner_Metadata`](/game/docs/wasm-api#wasm-ABI-Records-Runner_Metadata) using `bc_metadata` before allocating `field_bytes` bytes at 2-byte alignment. Element index = ((y / 8) \* `chunked_width` + x / 8) \* 64 + (y % 8) \* 8 + x % 8. Unreachable = 65535. Linear transfers instead use width \* height [`uint16`](/game/docs/wasm-api#wasm-ABI-Scalars-uint16) cells. WasmGC variants use exactly `field_bytes` mutable i8 elements.
