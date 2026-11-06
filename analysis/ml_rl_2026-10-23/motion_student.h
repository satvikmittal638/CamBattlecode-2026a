// Research model only; not enabled in v57. Input order: features.json base + history.
#pragma once
inline int motion_student_predict(const float* x) {
  if (x[19] <= 1.5) {
    if (x[20] <= 0.43349999189376831) {
      if (x[56] <= 0.28599999845027924) {
        return 1;
      } else {
        if (x[51] <= -0.027500000782310963) {
          if (x[36] <= 160000) {
            return 2;
          } else {
            if (x[3] <= 0.6574999988079071) {
              if (x[21] <= 681) {
                return 1;
              } else {
                if (x[28] <= 2.5) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              return 2;
            }
          }
        } else {
          if (x[20] <= 0.33750000596046448) {
            if (x[36] <= 506922.5) {
              return 2;
            } else {
              return 2;
            }
          } else {
            return 2;
          }
        }
      }
    } else {
      if (x[3] <= 0.3254999965429306) {
        if (x[51] <= -0.083499997854232788) {
          if (x[7] <= 95) {
            return 1;
          } else {
            if (x[6] <= 111) {
              if (x[49] <= -0.5) {
                return 1;
              } else {
                if (x[20] <= 0.61100000143051147) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              return 1;
            }
          }
        } else {
          if (x[48] <= 0.5) {
            if (x[31] <= 15.5) {
              return 0;
            } else {
              if (x[55] <= 3.5260000228881836) {
                return 1;
              } else {
                if (x[50] <= -0.5) {
                  return 0;
                } else {
                  return 0;
                }
              }
            }
          } else {
            if (x[17] <= 15.5) {
              return 0;
            } else {
              return 1;
            }
          }
        }
      } else {
        if (x[21] <= 760.5) {
          if (x[56] <= 0.54450002312660217) {
            if (x[20] <= 0.56549999117851257) {
              if (x[51] <= -0.048499999567866325) {
                return 1;
              } else {
                return 2;
              }
            } else {
              if (x[56] <= 0.32299999892711639) {
                return 1;
              } else {
                return 1;
              }
            }
          } else {
            return 2;
          }
        } else {
          if (x[4] <= 3704.5) {
            if (x[58] <= 0.3684999942779541) {
              if (x[20] <= 0.49549999833106995) {
                if (x[51] <= -0.013500000350177288) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                if (x[51] <= -0.00050000002374872565) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              if (x[4] <= 1594) {
                return 1;
              } else {
                return 2;
              }
            }
          } else {
            return 2;
          }
        }
      }
    }
  } else {
    if (x[20] <= 0.53150001168251038) {
      if (x[3] <= 0.3879999965429306) {
        if (x[21] <= 597) {
          if (x[56] <= 0.32000000774860382) {
            return 1;
          } else {
            if (x[12] <= 0.5) {
              if (x[13] <= 2.5) {
                return 2;
              } else {
                return 2;
              }
            } else {
              if (x[56] <= 0.51649999618530273) {
                return 2;
              } else {
                return 2;
              }
            }
          }
        } else {
          if (x[56] <= 0.27750000357627869) {
            return 1;
          } else {
            if (x[35] <= 290783) {
              if (x[4] <= 828.5) {
                if (x[20] <= 0.44900000095367432) {
                  return 0;
                } else {
                  return 0;
                }
              } else {
                return 1;
              }
            } else {
              if (x[38] <= 1.5) {
                return 1;
              } else {
                return 2;
              }
            }
          }
        }
      } else {
        if (x[29] <= 0.5) {
          if (x[58] <= 0.030499999411404133) {
            if (x[10] <= 5.5) {
              if (x[31] <= 17.5) {
                return 1;
              } else {
                return 2;
              }
            } else {
              return 1;
            }
          } else {
            if (x[52] <= 1.5) {
              if (x[32] <= 1.5) {
                if (x[39] <= 2.5) {
                  return 1;
                } else {
                  return 2;
                }
              } else {
                if (x[52] <= -1.5) {
                  return 2;
                } else {
                  return 2;
                }
              }
            } else {
              return 1;
            }
          }
        } else {
          if (x[52] <= -0.5) {
            return 2;
          } else {
            if (x[10] <= 34.5) {
              if (x[32] <= 7.5) {
                if (x[26] <= 13.5) {
                  return 1;
                } else {
                  return 1;
                }
              } else {
                if (x[35] <= 297500) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              return 2;
            }
          }
        }
      }
    } else {
      if (x[56] <= 0.35950000584125519) {
        if (x[53] <= -0.5) {
          if (x[53] <= -1.5) {
            return 1;
          } else {
            if (x[38] <= 1.5) {
              if (x[20] <= 0.72849997878074646) {
                return 0;
              } else {
                if (x[25] <= 12.5) {
                  return 0;
                } else {
                  return 0;
                }
              }
            } else {
              if (x[55] <= 2.25) {
                return 2;
              } else {
                if (x[4] <= 1343) {
                  return 0;
                } else {
                  return 0;
                }
              }
            }
          }
        } else {
          if (x[53] <= 0.5) {
            if (x[54] <= -0.001500000013038516) {
              if (x[3] <= 0.37299999594688416) {
                if (x[58] <= 0.08449999988079071) {
                  return 1;
                } else {
                  return 0;
                }
              } else {
                if (x[54] <= -0.10850000008940697) {
                  return 1;
                } else {
                  return 1;
                }
              }
            } else {
              if (x[29] <= 0.5) {
                if (x[39] <= 12.5) {
                  return 1;
                } else {
                  return 0;
                }
              } else {
                if (x[32] <= 6.5) {
                  return 1;
                } else {
                  return 1;
                }
              }
            }
          } else {
            if (x[53] <= 1.5) {
              if (x[58] <= 0.14200000464916229) {
                if (x[4] <= 1177.5) {
                  return 0;
                } else {
                  return 0;
                }
              } else {
                return 2;
              }
            } else {
              return 1;
            }
          }
        }
      } else {
        if (x[3] <= 0.41449999809265137) {
          if (x[52] <= 1.5) {
            if (x[54] <= -0.035499999299645424) {
              if (x[35] <= 171754) {
                if (x[23] <= 49.5) {
                  return 0;
                } else {
                  return 0;
                }
              } else {
                if (x[36] <= 362571) {
                  return 2;
                } else {
                  return 0;
                }
              }
            } else {
              if (x[53] <= -1.5) {
                return 1;
              } else {
                if (x[29] <= 0.5) {
                  return 0;
                } else {
                  return 0;
                }
              }
            }
          } else {
            return 1;
          }
        } else {
          if (x[38] <= 1.5) {
            if (x[58] <= 0.33249999582767487) {
              if (x[21] <= 830.5) {
                if (x[19] <= 4.5) {
                  return 2;
                } else {
                  return 0;
                }
              } else {
                if (x[29] <= 0.5) {
                  return 0;
                } else {
                  return 1;
                }
              }
            } else {
              if (x[19] <= 6.5) {
                if (x[3] <= 0.77750000357627869) {
                  return 2;
                } else {
                  return 2;
                }
              } else {
                if (x[56] <= 0.59450000524520874) {
                  return 2;
                } else {
                  return 0;
                }
              }
            }
          } else {
            if (x[21] <= 2594) {
              if (x[58] <= 0.099500000476837158) {
                if (x[2] <= 122.5) {
                  return 2;
                } else {
                  return 1;
                }
              } else {
                if (x[52] <= 1.5) {
                  return 2;
                } else {
                  return 1;
                }
              }
            } else {
              if (x[35] <= 749093.25) {
                if (x[54] <= -0.0084999999962747097) {
                  return 1;
                } else {
                  return 0;
                }
              } else {
                if (x[53] <= 0.5) {
                  return 0;
                } else {
                  return 2;
                }
              }
            }
          }
        }
      }
    }
  }
}
