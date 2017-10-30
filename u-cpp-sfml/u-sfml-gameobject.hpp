//
//  u-sfml-gameobject.hpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#ifndef u_sfml_gameobject_hpp
#define u_sfml_gameobject_hpp

#include <stdio.h>
#include <SFML/Audio.hpp>
#include "u-sfml-types.hpp"
#include "u-sfml-transform.hpp"
namespace UL
{
    
    class GameObject
    {
    public:
        
        typedef std::function<void (GameObject&)> GameObjectCallback;
        
        static u32 idCounter;
        
        sf::Drawable* graphics = NULL;
        sf::SoundSource* audioSource = NULL;
        Transform* transform = NULL;
        GameObject* parent = NULL;
        GameObject* nextSibling = NULL;
        GameObject* firstChild = NULL;
        bool enabled = true;
        bool visible = true;
        String name = "";
        u32 id;
        
        struct Events {
            GameObjectCallback destroy;
            GameObjectCallback manager_destroy;
            GameObjectCallback draw;
            GameObjectCallback add_child;
            GameObjectCallback remove;
        } on;
        
        GameObject();
        ~GameObject();
        unsigned int draw(sf::RenderTarget* target);
        void addChild(GameObject* child, bool addInFront = false);
        GameObject* addChild(bool addInFront = false);
        void remove();
        void removeChildren();
        
    };
    
}


#endif /* u_sfml_gameobject_hpp */
