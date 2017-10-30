//
//  u-sfml-types.hpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#ifndef u_sfml_types_hpp
#define u_sfml_types_hpp

#include <stdio.h>
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
namespace UL
{
    
#ifndef u8
    typedef unsigned char u8;
#endif
#ifndef u16
    typedef unsigned short int u16;
#endif
#ifndef u32
    typedef unsigned int u32;
#endif
#ifndef u64
    typedef unsigned long long int u64;
#endif
#ifndef s32
    typedef signed long int s32;
#endif
#ifndef s64
    typedef signed long long int s64;
#endif
#ifndef f32
    typedef float f32;
#endif
#ifndef f64
    typedef double f64;
#endif
#ifndef String
    typedef std::string String;
#endif
    
    struct Point2D {
        Point2D(): x(0), y(0) {};
        f64 x;
        f64 y;
    };
    
}

#endif /* u_sfml_types_hpp */
