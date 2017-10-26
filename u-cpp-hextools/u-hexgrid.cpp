//
//  u-hextools.cpp
//  SFMLTest
//
//  Created by Udo on 10/26/17.
//  Copyright © 2017 Udo. All rights reserved.
//

#include <stdio.h>

class HexGrid
{
public:
    
    typedef unsigned int u32;
    typedef double f64;

    struct HexCell {
        u32 x;
        u32 y;
        f64 xpos;
        f64 ypos;
        u32 userFlag;
        void* data;
    };
    
    HexCell* gridCells;
    
    u32 colCount;
    u32 rowCount;
    u32 cellCount;
    
    HexGrid(u32 width, u32 height) {
        colCount = width;
        rowCount = height;
        cellCount = width*height;
        gridCells = new HexCell[cellCount];
    }
    
    HexCell* get(u32 x, u32 y) {
        u32 ca = x*y;
        if(ca >= cellCount || ca < 0) {
            return(NULL);
        }
        return(&gridCells[ca]);
    }
    
    
    
};
