//
//  u-sfml-gameobject.cpp
//  HexTest
//
//  Created by Udo Schroeter on 30.10.17.
//  Copyright © 2017 Udo Schroeter. All rights reserved.
//

#include "u-sfml-gameobject.hpp"
#include <mutex>
#include <thread>
using namespace UL;

u32 GameObject::idCounter = 0;

GameObject::GameObject()
{
    idCounter += 1;
    id = idCounter;
    transform = new Transform();
    memset(&on, 0, sizeof(on));
}

GameObject::~GameObject()
{
    if(on.destroy)
        on.destroy(*this);
    if(on.manager_destroy)
        on.manager_destroy(*this);
    delete transform;
    if(graphics) delete graphics;
    if(audioSource) delete audioSource;
}

unsigned int GameObject::draw(sf::RenderTarget* target, sf::FloatRect crop)
{
    if(!enabled)
        return(0);
    unsigned int result = 0;
    if(on.draw)
        on.draw(*this);
    transform->calculate();
    if(graphics)
    {
        auto dim = transform->_sf_combined.transformRect(sf::FloatRect(0, 0, transform->size.x+1, transform->size.y+1));
        visible = crop.intersects(dim);
        if(visible)
        {
            target->draw(*graphics, transform->_sf_combined);
            result++;
        }
    }
    if(firstChild)
    {
        GameObject* c = firstChild;
        while(c)
        {
            result += c->draw(target, crop);
            c = c->nextSibling;
        }
    }
    return(result);
}

void GameObject::addChild(GameObject* child, bool addInFront) {
    GameObject* pc = firstChild;
    if(addInFront && pc)
    {
        while(pc->nextSibling)
            pc = pc->nextSibling;
        pc->nextSibling = child;
        child->nextSibling = NULL;
    }
    else
    {
        child->nextSibling = pc;
        firstChild = child;
    }
    child->parent = this;
    child->transform->parent = this->transform;
    if(on.draw)
        on.draw(*child);
}

void GameObject::eachChild(GameObjectCallback g)
{
    auto o = firstChild;
    while(o)
    {
        g(*o);
        if(o->firstChild)
            o->eachChild(g);
        o = o->nextSibling;
    }
}

GameObject* GameObject::addChild(bool addInFront) {
    auto result = new GameObject();
    addChild(result, addInFront);
    return(result);
}

void GameObject::remove()
{
    if(on.remove)
        on.remove(*this);
    if(parent->firstChild == this)
    {
        parent->firstChild = this->nextSibling;
    } else
    {
        GameObject* previousSibling = parent->firstChild;
        while(previousSibling && previousSibling->nextSibling != this)
        {
            previousSibling = previousSibling->nextSibling;
        }
        if(previousSibling)
        {
            previousSibling->nextSibling = this->nextSibling;
        }
    }
    removeChildren();
}

void GameObject::removeChildren()
{
    GameObject* c = this->firstChild;
    this->firstChild = NULL;
    while(c)
    {
        c->removeChildren();
        GameObject* d = c;
        c = c->nextSibling;
        delete d;
    }
}
