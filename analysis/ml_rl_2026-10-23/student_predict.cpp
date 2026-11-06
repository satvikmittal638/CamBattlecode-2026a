#include <iostream>
#include "motion_student.h"
#include "action_student.h"
int main(){int mode;float x[60];while(std::cin>>mode){for(float &v:x)if(!(std::cin>>v))return 2;std::cout<<(mode==0?motion_student_predict(x):action_student_predict(x))<<"\n";}}
