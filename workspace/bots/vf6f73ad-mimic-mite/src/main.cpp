// Dispatch draft and gameplay; a failed turn is logged and still yields.
#include <cambc.h>
#include <iostream>
#include "bot.h"
#include "draft.h"

int main() {
    Bot bot;
    while (true) {
        try {
            if (cambc::is_draft())
                play_draft();
            else {
                const auto f0 = cambc::fuel_remaining();
                bot.play_turn();
                const auto f1 = cambc::fuel_remaining();
                if (f0 > f1 && f0 - f1 > 70000)
                    std::cout << "fuel " << cambc::round_number() << " " << static_cast<int>(cambc::self().champion_name()) << " " << (f0 - f1) << " " << bot.where() << std::endl;
            }
        } catch (const std::exception& error) {
            std::cout << "bot error: " << error.what() << " round " << cambc::round_number() << " type " << (cambc::is_draft() ? -1 : static_cast<int>(cambc::self().champion_name())) << " at " << bot.where() << std::endl;
        } catch (...) {
            std::cout << "bot error: unknown exception" << std::endl;
        }

        cambc::end_turn();
    }
}
