#pragma once
// Experiment switches for the health-management study (defaults = v62r). Resolved and removed before shipping.
// H_LOWHP: retreat home (low mode) below this health share (v62: .35; band teams head home at a median ~.40).
constexpr float H_LOWHP = 0.35f;
// H_HEALRECALL: recall to heal below this health share when it is safe (shopping-recall checks); 0 = off.
constexpr float H_HEALRECALL = 0.0f;
