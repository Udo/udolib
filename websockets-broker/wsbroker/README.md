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

### Setting up a WSBroker

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

### Receiving messages from clients

Let's hook up some functionality to it by supplying an `onClientMessage`
handler that gets called every time the browser sends a message to the
broker:

```javascript
var broker = new require('wsbroker').Broker({
  port : 12345,
  log : true,
  onClientMessage : function(message, connection, broker) {
    console.log('MESSAGE RECEIVED!', message);
    broker.broadcast(JSON.stringify(message));
  },
});
```

For example, if you're using the test client provided in the repository
(`example-client-page.php`), you should then see your Node process outputting
something similar to this:

```
➥ websocket server listening on port 31002
↪ new connection 0aCw4LH5MR7bIacx5PtEtA== 28jg1m5ukf26ks4reinah80dngs2qk87eq8g73j93j89hckrnvh1
→ from client 0aCw4LH5MR7bIacx5PtEtA== { type: 'hello', content: 'there' }
MESSAGE RECEIVED! { type: 'hello', content: 'there' }
← sent to 1/1 clients {"type":"hello","content":"there"}
```

In this example, we took a message from a client and re-broadcast it to all clients.

### Sending events to a backend server

Now instead of having `onClientMessage` take client messages, let's hook up a backend
server:

```javascript
var broker = new require('wsbroker').Broker({
  port : 12345,
  log : true,
  backend : {
    type : 'http',
    url : 'http://localhost/mybackend/',
    }
});
```

In this configuration, WSBroker will pass event notifications to
the backend server every time a client connects, sends a message,
or disconnects.

### Interpreting requests on the backend server

The backend server receives these notifications in two POST parameters,
`message` and `connection`:

```PHP
  $message = json_decode($_POST['message'], true);
  $connection = json_decode($_POST['connection'], true);
```

`message` contains the actual message content. For connect notifications,
the message.type field will be `session-connect`, for disconnects it will be
`session-disconnect` and for all messages sent from the client, the broker
will prepend `client-` to the message.type, for example `client-hello` if the
message type was "hello".

# WSBroker API Documentation

## Setup

```javascript
require('wsbroker').Broker(options);
```

This sets up a new WSBroker with `options`.

### Setup Options

####`port : (number)` 
Mandatory. Set the port the websockets server listens to.

####`onBackendMessage : function(message, connection, broker)` 
Optional. Event handler that fires when the backend sends a message to the broker.

####`onClientConnect : function(connection, broker)` 
Optional. Event handler that fires when a websockets client connects.

####`onClientDisconnect : function(connection, broker)` 
Optional. Event handler that fires when a websockets client disconnects.

####`onClientMessage : function(message, connection, broker)` 
Optional. Event handler that fires when a websockets client send a message.

####`backend : { type : 'http', url : '(my backend server URL)' }` 
Optional. Set up WSBroker to use an upstream backend server.

####`server : require('http').createServer()` 
Optional. Use this instance of httpServer to create the Websockets server.

####`log : true|false` 
Optional. Output debug log messages to the console.

## Broker Fields

####`config : (options)` 
The options object passed into the WSBroker on creation.

####`websocketServer : (object)` 
Reference to the websockets server used by the broker.

####`httpServer : (object)` 
Reference to the HTTP server used by the broker.

####`broadcast : function(message, [filterCriteria])` 
Broadcasts the `message` to all connected clients. If `filterCriteria` is
supplied, each client's `sessionInfo` object will be compared to it
and only matching clients go get the message.

## Connection sessionInfo

### `sessionInfo` default values

When WSBroker accepts a websocket connection from a client, it fills the
`sessionInfo` object of that connection with the following fields:

`ip` : from the connection's "x-forwarded-for" header
`wskey` : a unique websockets connection key

Also, all cookies sent by the client will be filled into the `sessionInfo` field
automatically. `sessionInfo` is available in all API calls that give you
a connection object.

### Setting `sessionInfo` from the backend server

Backend servers can send a `session` message as part of their response
to a frontend event. If so, the `data` object of that message will become
part of the connection's `sessionInfo`:

```PHP
$response[] = array(
  'type' => 'session',
  'data' => array(
    'x' => 'y',
    'time' => time(),
    ),
  );
``` 

This sets the fields `x` and `time` of the current connection's `sessionInfo` object.

### Querying `sessionInfo`

The broker.broadcast() function uses an optional parameter `filterCriteria`
that can be used to broadcast a message only to matching connections.
The following example will send a message only to clients with the
pertinent `room` set to '42':

broker.broadcast({ type : 'hello' }, { room : '42' });






