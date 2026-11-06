// Independently implemented behavioral model. This is not Mite's recovered source.
#include <cambc.h>
#include <cstdio>
#include "bot.h"
int main() {
    Model bot;
    for (;;) {
        try { if (cambc::is_draft()) model_draft(); else bot.turn(); }
        catch (const cambc::error& e) { std::printf("model API error %d\n", static_cast<int>(e.code())); }
        catch (...) { std::printf("model unexpected error\n"); }
        cambc::end_turn();
    }
}
