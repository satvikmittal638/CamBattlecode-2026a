// Research model only; not enabled in v57. Input order: features.json base + history.
#pragma once
inline int action_student_predict(const float* x) {
  if (x[17] <= 0.5) {
    if (x[8] <= 29.5) {
      if (x[48] <= 5.5) {
        if (x[50] <= -0.5) {
          if (x[18] <= 19.5) {
            return 3;
          } else {
            return 5;
          }
        } else {
          if (x[2] <= 1.5) {
            return 7;
          } else {
            return 5;
          }
        }
      } else {
        if (x[8] <= 9.5) {
          if (x[51] <= 0.29000000655651093) {
            return 7;
          } else {
            return 5;
          }
        } else {
          if (x[40] <= 427.5) {
            return 4;
          } else {
            return 7;
          }
        }
      }
    } else {
      if (x[8] <= 53.5) {
        return 4;
      } else {
        if (x[33] <= 1.5) {
          return 4;
        } else {
          return 4;
        }
      }
    }
  } else {
    if (x[19] <= 3.5) {
      if (x[16] <= 0.5) {
        return 7;
      } else {
        if (x[12] <= 0.5) {
          if (x[0] <= 0.5) {
            return 6;
          } else {
            return 0;
          }
        } else {
          if (x[19] <= 2.5) {
            return 0;
          } else {
            return 0;
          }
        }
      }
    } else {
      if (x[48] <= 1.5) {
        if (x[39] <= 3.5) {
          if (x[48] <= 0.5) {
            return 3;
          } else {
            return 1;
          }
        } else {
          if (x[18] <= 2.5) {
            return 2;
          } else {
            return 3;
          }
        }
      } else {
        if (x[18] <= 2.5) {
          if (x[9] <= 3) {
            return 3;
          } else {
            return 2;
          }
        } else {
          if (x[48] <= 5.5) {
            return 5;
          } else {
            return 7;
          }
        }
      }
    }
  }
}
