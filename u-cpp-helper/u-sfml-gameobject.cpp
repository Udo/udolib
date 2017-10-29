//
//  u-sfml-gameobject.cpp
//  HexTest
//
//  Created by Udo Schroeter on 28.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#include <stdio.h>
#include <SFML/Audio.hpp>
#include <SFML/Graphics.hpp>

struct Point2D {
    Point2D(): x(0), y(0) {};
    double x;
    double y;
};

class Transform
{
public:
    
    double rotation = 0;
    Point2D position;
    Point2D pivot;
    Point2D scale;
    Transform* parent = NULL;

    void calculate() {
        if(parent) {
            _sf_combined = parent->_sf_combined * _sf_transform;
        } else {
            _sf_combined = _sf_transform;
        }
    }
    
    void update() {
        _sf_transform = sf::Transform::Identity;
        _sf_transform
          .translate(position.x, position.y)
          .rotate(rotation)
          .translate(-pivot.x, -pivot.y)
          .scale(scale.x, scale.y);
    }
    
    Transform() {
        scale.x = 1.0;
        scale.y = 1.0;
    }

    sf::Transform _sf_transform;
    sf::Transform _sf_combined;
    
};

class GameObject
{
public:
    
    sf::Drawable* graphics = NULL;
    sf::SoundSource* audioSource = NULL;
    Transform* transform = NULL;
    GameObject* parent = NULL;
    GameObject* nextSibling = NULL;
    GameObject* firstChild = NULL;
    
    bool enabled = true;
    bool visible = true;

    GameObject() {
        transform = new Transform();
    }
    
    ~GameObject() {
        delete transform;
        if(graphics) delete graphics;
        if(audioSource) delete audioSource;
    }
    
    unsigned int draw(sf::RenderTarget* target, sf::Rect<float>* crop = NULL) {
        if(!enabled)
            return(0);
        unsigned int result = 0;
        transform->calculate();
        if(graphics) {
            if(visible) {
                target->draw(*graphics, transform->_sf_combined);
                result++;
            }
        }
        if(firstChild) {
            GameObject* c = firstChild;
            while(c) {
                result += c->draw(target, crop);
                c = c->nextSibling;
            }
        }
        return(result);
    }
    
    void addChild(GameObject* child) {
        GameObject* pc = firstChild;
        child->nextSibling = pc;
        child->parent = this;
        firstChild = child;
        child->transform->parent = this->transform;
    }
    
    GameObject* addChild() {
        auto result = new GameObject();
        addChild(result);
        return(result);
    }
    
    void remove() {
        if(parent->firstChild == this) {
            parent->firstChild = this->nextSibling;
        } else {
            GameObject* previousSibling = parent->firstChild;
            while(previousSibling && previousSibling->nextSibling != this) {
                previousSibling = previousSibling->nextSibling;
            }
            if(previousSibling) {
                previousSibling->nextSibling = this->nextSibling;
            }
        }
        removeChildren();
    }
    
    void removeChildren() {
        GameObject* c = this->firstChild;
        this->firstChild = NULL;
        while(c) {
            c->removeChildren();
            GameObject* d = c;
            c = c->nextSibling;
            delete d;
        }
    }
    
};
