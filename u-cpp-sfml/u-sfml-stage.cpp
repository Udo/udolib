//
//  u-sfml-stage.cpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#include "u-sfml-stage.hpp"
using namespace UL;

auto u_precision_timer_start = std::chrono::high_resolution_clock::now();

double u_precision_timer() {
    auto time = std::chrono::high_resolution_clock::now() - u_precision_timer_start;
    return(std::chrono::duration<double, std::micro>(time).count()/1000000.0);
}

Stage::Stage(sf::RenderWindow& window)
{
    animations = NULL;
    _sf_window = &window;
    _sf_window->setVerticalSyncEnabled(true);
    root = new GameObject();
}

Stage::~Stage()
{
    if(on.unload)
        on.unload();
    root->removeChildren();
    delete root;
}

bool
Stage::isActive()
{
    return(_sf_window->isOpen());
}

void
Stage::beginFrame()
{
    debug.frameCounter += 1;
    debug.frameTimeCurrent = u_precision_timer();
    debug.fps = (debug.fps*0.95) + (1.0 / (debug.frameTimeCurrent - debug.frameTimeLast)) * 0.05;
}

void
Stage::processEvents()
{
    sf::Vector2i position = sf::Mouse::getPosition(*_sf_window);
    mouse.x = position.x;
    mouse.y = position.y;
    while (_sf_window->pollEvent(event))
    {
        switch(event.type)
        {
            case(sf::Event::Closed):
            {
                _sf_window->close();
            } break;
            case sf::Event::Resized: {
                _sf_window->setView(sf::View(sf::FloatRect(0, 0, event.size.width, event.size.height)));
                if(on.resize)
                    on.resize();
            } break;
            case sf::Event::LostFocus: {
                if(on.blur)
                    on.blur();
            } break;
            case sf::Event::GainedFocus: {
                if(on.focus)
                    on.focus();
            } break;
            case sf::Event::TextEntered: {
            } break;
            case(sf::Event::KeyPressed):
            {
                if(on.key_down)
                    on.key_down();
            } break;
            case sf::Event::KeyReleased: {
                if(on.key_up)
                    on.key_up();
            } break;
            case sf::Event::MouseWheelMoved: {
                if(on.mouse_wheel)
                    on.mouse_wheel();
            } break;
            case sf::Event::MouseWheelScrolled: {
            } break;
            case sf::Event::MouseButtonPressed: {
                if(on.mouse_down)
                    on.mouse_down(0);
            } break;
            case sf::Event::MouseButtonReleased: {
                if(on.mouse_up)
                    on.mouse_up(0);
            } break;
            case sf::Event::MouseMoved: {
                if(on.mouse_move)
                    on.mouse_move();
            } break;
            case sf::Event::MouseEntered: {
                if(on.mouse_enter)
                    on.mouse_enter();
            } break;
            case sf::Event::MouseLeft: {
                if(on.mouse_leave)
                    on.mouse_leave();
            } break;
            case sf::Event::JoystickButtonPressed: {
            } break;
            case sf::Event::JoystickButtonReleased: {
            } break;
            case sf::Event::JoystickMoved: {
            } break;
            case sf::Event::JoystickConnected: {
            } break;
            case sf::Event::JoystickDisconnected: {
            } break;
            case sf::Event::TouchBegan: {
            } break;
            case sf::Event::TouchMoved: {
            } break;
            case sf::Event::TouchEnded: {
            } break;
            case sf::Event::SensorChanged: {
            } break;
            case sf::Event::Count: {
            } break;
        }
    }
}

f64
Stage::time()
{
    return(u_precision_timer());
}

void
Stage::addAnimation(AnimationCallback c)
{
    auto a = new AnimationEntry();
    a->animationFunction = c;
    a->next = NULL;
    if(!animations)
    {
        animations = a;
    }
    else
    {
        auto aLast = animations;
        while(aLast->next)
            aLast = aLast->next;
        aLast->next = a;
    }
}

void
Stage::animate()
{
    AnimationEntry* prev = NULL;
    auto a = animations;
    while(a)
    {
        auto res = a->animationFunction(u_precision_timer() - debug.frameTimeLast);
        if(!res)
        {
            if(prev)
            {
                prev->next = a->next;
                delete a;
                a = prev->next;
            }
            else
            {
                animations = a->next;
                delete a;
                a = animations;
            }
        }
        else
        {
            prev = a;
            a = a->next;
        }
    }
}

void
Stage::renderFrame()
{
    _sf_window->clear(sf::Color::Black);
    debug.drawCount = root->draw(_sf_window, sf::FloatRect(0, 0, 1920, 900));
    debug.cpuTime = u_precision_timer() - debug.frameTimeCurrent;
    debug.cpuUsage = (100.0 * debug.cpuTime / (debug.frameTimeCurrent - debug.frameTimeLast))*0.05 + debug.cpuUsage*0.95;
    _sf_window->display();
    debug.frameTimeLast = debug.frameTimeCurrent;
}
