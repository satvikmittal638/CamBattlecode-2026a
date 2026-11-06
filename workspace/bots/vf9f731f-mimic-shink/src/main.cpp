// Dispatch draft and gameplay; a failed turn is logged and still yields.
#include <cambc.h>
#include <iostream>
#include "bot.h"
#include "draft.h"
// #define SHINK_FUEL 1

int main() {
    while (true) {
        try {
            if (cambc::is_draft())
                play_draft();
            else
                play_turn();
        } catch (const std::exception& error) {
            std::cout << "bot error: " << error.what() << std::endl;
        } catch (...) {
            std::cout << "bot error: unknown exception" << std::endl;
        }
#ifdef SHINK_FUEL
        if (!cambc::is_draft()) {
            static std::uint64_t worst = 0;
            const std::uint64_t left = cambc::fuel_remaining();
            const std::uint64_t used = left < 1000000 ? 100000 - std::min<std::uint64_t>(100000, left) : 0;
            if (used > worst) { worst = used; std::cout << "FUEL r" << cambc::round_number() << " used " << used << " left " << left << std::endl; }
        }
#endif
        cambc::end_turn();
    }
}
