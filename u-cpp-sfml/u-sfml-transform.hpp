//
//  u-sfml-transform.hpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#ifndef u_sfml_transform_hpp
#define u_sfml_transform_hpp

#include <stdio.h>
#include "u-sfml-types.hpp"
namespace UL
{
    
    class Transform
    {
    public:
        
        f64 rotation = 0;
        Point2D position;
        Point2D pivot;
        Point2D scale;
        Transform* parent = NULL;
        sf::Transform _sf_transform;
        sf::Transform _sf_combined;

        void calculate();
        void update();
        Transform();
        
    };
    
}

#endif /* u_sfml_transform_hpp */
