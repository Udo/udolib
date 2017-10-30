//
//  u-sfml-stage.hpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#ifndef u_sfml_stage_hpp
#define u_sfml_stage_hpp

#include <stdio.h>
#include "u-sfml-types.hpp"
#include "u-sfml-gameobject.hpp"
#include "u-sfml-animation.hpp"
namespace UL
{
    
    class Stage
    {
    public:
        
        typedef std::function<void (GameObject&)> GameObjectCallback;
        typedef std::function<void (u32 button)> MouseButtonCallback;
        typedef std::function<void ()> Callback;
        typedef std::function<void ()> KeyCallback;

        struct Debug {
            f64 frameTimeCurrent = 0;
            f64 frameTimeLast = 0;
            f64 cpuTime = 0;
            f64 cpuUsage = 0;
            f64 fps = 0;
            u32 frameCounter = 0;
            u32 drawCount = 0;            
        } debug;

        struct Mouse {
            f64 x = 0;
            f64 y = 0;
        } mouse;
        
        struct Events {
            Callback mouse_move;
            Callback mouse_enter;
            Callback mouse_leave;
            MouseButtonCallback mouse_down;
            MouseButtonCallback mouse_up;
            Callback mouse_wheel;
            Callback focus;
            Callback blur;
            Callback resize;
            KeyCallback key_down;
            KeyCallback key_up;
            Callback unload;
            Callback frame;
        } on;
        
        sf::RenderWindow* _sf_window;
        GameObject* root;
        Animation* animation;
        sf::Event event;
        
        Stage(sf::RenderWindow& window);        
        ~Stage();
        bool isActive();
        void beginFrame();
        void processEvents();
        void renderFrame();
        f64 time();
        
    };
    
}


#endif /* u_sfml_stage_hpp */
