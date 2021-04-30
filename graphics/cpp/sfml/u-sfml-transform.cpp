//
//  u-sfml-transform.cpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#include "u-sfml-transform.hpp"
using namespace UL;

void Transform::calculate() {
    if(parent) {
        _sf_combined = parent->_sf_combined * _sf_transform;
    } else {
        _sf_combined = _sf_transform;
    }    
}

void Transform::update() {
    _sf_transform = sf::Transform::Identity;
    _sf_transform
    .translate(position.x, position.y)
    .rotate(rotation)
    .translate(-pivot.x, -pivot.y)
    .scale(scale.x, scale.y);
}

Transform::Transform() {
    scale.x = 1.0;
    scale.y = 1.0;
}


