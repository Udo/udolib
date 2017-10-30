//
//  u-cpp-hexgrid.hpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#ifndef u_cpp_hexgrid_hpp
#define u_cpp_hexgrid_hpp

#include <stdio.h>
#include <assert.h>
#include <string.h>
#include <math.h>
#include <functional>
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

    struct HexCell {
        u32 id;
        u32 x;
        u32 y;
        f64 xpos;
        f64 ypos;
        u32 uFlag;
        void* uData;
        void* gameObject;
    };
    
    class HexGrid
    {
    public:
        
        enum class HexType { POINTY_TOP = 0, FLAT_TOP = 1 };
        
        struct Options {
            Options(): oddOffset(0), evenOffset(1), cellSize(1.0), type(HexType::POINTY_TOP) { };
            s32 oddOffset;
            s32 evenOffset;
            f64 cellSize;
            HexType type;
        };
        
        typedef std::function<void (HexCell&)> HexCellCallback;
        typedef std::function<void (f64 x, f64 y, u32 i)> CoordinateCallback;
        
        HexCell* cells;
        Options options;
        u32 colCount;
        u32 rowCount;
        u32 cellCount;
        void* uData = NULL;
        
        HexGrid(u32 width, u32 height,
                Options opt = Options(), HexCellCallback onCreateCell = NULL);
        void call(u32 x, u32 y, HexCellCallback onCell);
        void each(HexCellCallback onCell);
        void eachNeighborOf(HexCell& cell, HexCellCallback onCell);
        void createDrawPath(f64 cellSize, CoordinateCallback onPoint);
        void createDrawPath(CoordinateCallback onPoint);
        HexCell* get(u32 x, u32 y);
        void projectHexToMap(u32 gridX, u32 gridY, f64& x, f64& y);
        void projectMapToHex(f64 cx, f64 cy, s32& gridX, s32& gridY);
        HexCell* projectMapToHex(f64 cx, f64 cy);
        f64 dimensionalRatio(f64 dim);
        f64 cellSizeToRowHeight(f64 cellSize);
        
    private:
        f64 sqrt3 = sqrt(3.0);
        f64 sqrt3_3 = sqrt3/3.0;
        f64 hexpart = -0.5+sqrt3/5.0;
        f64 pi6th = M_PI / 6.0;
        f64 pi12th = M_PI / 12.0;
        
        bool isEven(f64 i);
        void abstractMapToHex(f64 cx, f64 cy, s32& gridX, s32& gridY);
        void abstractHexToMap(u32 h1, u32 h2, f64 cellSize, f64& u, f64& v);
        
    };
    
}


#endif /* u_cpp_hexgrid_hpp */
