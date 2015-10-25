# Websockets Broker

## What is it?

The WSBroker is a Node.js component you can use to quickly
implement a Websockets server that acts as a message broker
between clients and a backend. The broker can talk to an
HTTP-based backend by exchanging JSON messages, or you can
implement an arbitrary backend logic right there in Node. 

## Why use it?

I developed WSBroker as a component for realtime web applications,
such as chat rooms or online games. The idea is to have a stable
and minimal kernel that only takes care of connection handling and
message passing. The rest of the application is implemented by the
backend server, which can be another Node, PHP, Python, Go, or Rails
app. Restarts, crashes, and updates, whatever happens to the backend,
the broker stays online and keeps every user's connection safe.
Besides this coupling for extra resilience and stability, 
another motivation to use WSBroker is the  freedom to use any kind of 
backend, even those that would otherwise be unsuitable to server 
persistent connections. WSBroker and PHP backend apps make especially
powerful allies.

## How to get started

