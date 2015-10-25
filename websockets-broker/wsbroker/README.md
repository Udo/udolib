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

To use the WSBroker component, either install with with `npm` or 
save the file `wsbroker/index.js` manually next to your node app.
You simply need to `require()` WSBroker and give it a few
parameters for initialization:

```javascript
var broker = new require('wsbroker').Broker({
  port : 12345,
  log : true,
  });
```
  
This will init a new Websockets server listening on port 12345, with
debug logging to the console enabled. By default it will simply listen
for new WS connections, accept them, and ignore any incoming messages.

Let's hook up some functionality to it by supplying an `onClientMessage`
handler that gets called every time the browser sends a message to the
broker:

```javascript
var broker = new require('wsbroker').Broker({
  port : 12345,
  log : true,
  onClientMessage : function(message, connection) {
    console.log('- MESSAGE RECEIVED!', message);
    // send an answer:
    connection.send(JSON.stringify({ 'type' : 42 }));
  },
  });
```

For example, if you're using the test client provided in the repository
(`example-client-page.php`), you should then see your Node process outputting
something similar to this:

```
➥ websocket server listening on port 31002
↪ new connection WpXdM1ydByUvmW4Vcriwrg== 28jg1m5ukf26ks4reinah80dngs2qk87eq8g73j93j89hckrnvh1
→ from client WpXdM1ydByUvmW4Vcriwrg== { type: 'hello', content: 'there' }
- MESSAGE RECEIVED! { type: 'hello', content: 'there' }
```