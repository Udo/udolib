//
//  u-cpp-hexgrid.cpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#include "u-hexgrid.hpp"
using namespace UL;

HexGrid::HexGrid(u32 width, u32 height,
        Options opt, HexCellCallback onCreateCell) {
    colCount = width;
    rowCount = height;
    cellCount = width*height;
    cells = new HexCell[cellCount];
    memset(cells, 0, cellCount*sizeof(HexCell));
    options = opt;
    auto i = 0;
    for(auto x = 0; x < colCount; x++) {
        for(auto y = 0; y < rowCount; y++) {
            i += 1;
            auto c = get(x, y);
            assert(c);
            c->id = i;
            c->x = x;
            c->y = y;
            projectHexToMap(x, y, c->xpos, c->ypos);
        }
    }
    each(onCreateCell);
}

void
HexGrid::call(u32 x, u32 y, HexCellCallback onCell) {
    auto c = get(x, y);
    if(c)
        onCell(*c);
}

void
HexGrid::each(HexCellCallback onCell) {
    if(!onCell)
        return;
    for (auto i = 0; i < cellCount; i += 1) {
        onCell(cells[i]);
    }
}

void
HexGrid::eachNeighborOf(HexCell& cell, HexCellCallback onCell) {
    auto x = cell.x;
    auto y = cell.y;
    switch(options.type) {
        case(HexType::POINTY_TOP): {
            auto offset = (y % 2 != 0 ? options.oddOffset : options.evenOffset);
            call(offset+x-1, y-1, onCell);
            call(offset+x+0, y-1, onCell);
            call(x+1, y+0, onCell);
            call(offset+x+0, y+1, onCell);
            call(offset+x-1, y+1, onCell);
            call(x-1, y+0, onCell);
        } break;
        case(HexType::FLAT_TOP): {
            auto offset = (x % 2 != 0 ? options.oddOffset : options.evenOffset);
            call(x+0, y-1, onCell);
            call(x+1, offset+y-1, onCell);
            call(x+1, offset+y+0, onCell);
            call(x+0, y+1, onCell);
            call(x-1, offset+y+0, onCell);
            call(x-1, offset+y-1, onCell);
        } break;
    }
}

void
HexGrid::createDrawPath(f64 cellSize, CoordinateCallback onPoint) {
    switch(options.type) {
        case(HexType::POINTY_TOP): {
            auto height = dimensionalRatio(cellSize);
            auto width = cellSize;
            onPoint( 0.00 * width,   -0.50 * height, 0);
            onPoint( 0.50 * width,   -0.25 * height, 1);
            onPoint( 0.50 * width,    0.25 * height, 2);
            onPoint( 0.00 * width,    0.50 * height, 3);
            onPoint(-0.50 * width,    0.25 * height, 4);
            onPoint(-0.50 * width,   -0.25 * height, 5);
            onPoint( 0.00 * width,   -0.50 * height, 6);
        } break;
        case(HexType::FLAT_TOP): {
            auto width = dimensionalRatio(cellSize);
            auto height = cellSize;
            onPoint(-0.50 * width,  0.00 * height, 0);
            onPoint(-0.25 * width,  0.50 * height, 1);
            onPoint( 0.25 * width,  0.50 * height, 2);
            onPoint( 0.50 * width,  0.00 * height, 3);
            onPoint( 0.25 * width, -0.50 * height, 4);
            onPoint(-0.25 * width, -0.50 * height, 5);
            onPoint(-0.50 * width,  0.00 * height, 6);
        } break;
    }
}

void
HexGrid::createDrawPath(CoordinateCallback onPoint) {
    createDrawPath(options.cellSize, onPoint);
}

HexCell*
HexGrid::get(u32 x, u32 y) {
    u32 ca = (y*colCount) + x;
    if(ca >= cellCount || y >= rowCount || x >= colCount) {
        return(NULL);
    }
    return(&cells[ca]);
}

void
HexGrid::projectHexToMap(u32 gridX, u32 gridY, f64& x, f64& y) {
    switch(options.type) {
        case(HexType::POINTY_TOP): {
            abstractHexToMap(gridY, gridX, options.cellSize, y, x);
        } break;
        case(HexType::FLAT_TOP): {
            abstractHexToMap(gridX, gridY, options.cellSize, x, y);
        } break;
    }
}

void
HexGrid::projectMapToHex(f64 cx, f64 cy, s32& gridX, s32& gridY) {
    switch(options.type) {
        case(HexType::POINTY_TOP): {
            abstractMapToHex(cx, cy, gridX, gridY);
        } break;
        case(HexType::FLAT_TOP): {
            abstractMapToHex(cy, cx, gridY, gridX);
        } break;
    }
}

HexCell*
HexGrid::projectMapToHex(f64 cx, f64 cy) {
    s32 x;
    s32 y;
    projectMapToHex(cx, cy, x, y);
    if(x >= 0 && y >= 0)
        return(get(x, y));
    return(NULL);
}

// ************** THE BASEMENT ***************************

f64
HexGrid::dimensionalRatio(f64 dim) {
    return(dim / (sqrt3/2.0));
}

f64
HexGrid::cellSizeToRowHeight(f64 cellSize) {
    return(cellSize / (sqrt3/2)) * 0.75;
}

bool
HexGrid::isEven(f64 i) {
    s32 xi = round(i);
    return(xi % 2 == 0);
}

void
HexGrid::abstractMapToHex(f64 cx, f64 cy, s32& gridX, s32& gridY) {
    auto cellDim = cellSizeToRowHeight(options.cellSize);
    f64 y = (cy / cellDim) + 1.0/6.0;
    f64 x = (cx / options.cellSize) -
    (isEven(y) ? options.evenOffset/2.0 : options.oddOffset/2.0);
    f64 fx = x - round(x);
    f64 fy = y - round(y);
    if(fy < hexpart && (abs(fx) - (fy+0.5)*(1.0+sqrt3_3) ) > 0) {
        y -= 1;
        x += (isEven(y) ? -options.evenOffset : -options.oddOffset) + (fx > 0 ? 1 : 0);
    }
    gridX = round(x);
    gridY = round(y);
}

void
HexGrid::abstractHexToMap(u32 h1, u32 h2, f64 cellSize, f64& u, f64& v) {
    auto offset = (h1 % 2 != 0) ? options.oddOffset/2.0 : options.evenOffset/2.0;
    u = h1 * cellSizeToRowHeight(cellSize);
    v = (h2 + offset) * cellSize;
}

