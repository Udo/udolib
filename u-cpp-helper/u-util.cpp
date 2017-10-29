#include <stdio.h>
#include <assert.h>
#include <string.h>
#include <chrono>

auto u_precision_timer_start = std::chrono::high_resolution_clock::now();

double u_precision_timer() {
    auto time = std::chrono::high_resolution_clock::now() - u_precision_timer_start;
    return(std::chrono::duration<double, std::micro>(time).count()/1000000.0);
}
