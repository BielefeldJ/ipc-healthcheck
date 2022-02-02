# IPC-HealthCheck
Health Check server and client for nodejs applications using ipc via unix and windows sockets.

![Version](https://img.shields.io/badge/version-v1.2.0-blue) ![NodeJS Version](https://img.shields.io/badge/node%3E%3D-14-brightgreen) ![GitHub license](https://img.shields.io/github/license/BielefeldJ/ipc-healthcheck) ![open issues](https://img.shields.io/github/issues/BielefeldJ/ipc-healthcheck)

----
#### Contents
1. [Install](#install)
2. [Server](#server)
    1. [Create Server](#create-server)
     2. [Server Methods](#server-methods)
    3. [Events](#events)
3. [Client](#client)
    1. [Create Client](#create-client)
    2. [Client Methods](#client-methods)
4. [Examples](#examples)  

----
## Install
NodeJS version >=14 is required for this module.

Install via npm:

`npm install git+https://github.com/BielefeldJ/ipc-healthcheck.git`

----
## Server
Include the server 
```javascript
//commonjs
const HealthcheckServer = require('ipc-healthcheck/healthcheck-server');
```
----
## Create Server
Creating a new server object
**Parameter:**

- ``namespace``: _String_ - Health check server name clients can connect to.
- ``respondTime`` : _int_ -  Time in ms the server gives the client to respond
- ``intervalTime`` : _int_ - Time in ms the server waits between every request
- ``silent`` : _boolean_ - Turns debug messages on or off. true = no debug messages

```javascript
const server = new HealthcheckServer(namespace, respondTime, intervalTime, silent);
```

----
## Server Methods
#### startServer()
Start the socket server and starts sending requests to all connected clients. (_void_)
```javascript
server.startServer()
```

#### stopServer()
Stops sending requests and stops the server. (_void_)
```javascript
server.stopServer()
```

----
## Events
The Server does fire the following events:
- [serviceCrashed](#servicecrashed) - A service didn't answer the health check request
- [serviceError](#serviceerror) - A service send a message to the server

#### serviceCrashed
A client that registered at the Server did not answer the last 3 health check requests and might be crashed.

**Parameters:**
- ``name``: _String_ - Name with which the client is registered


```javascript
server.on('serviceCrashed', (name) => {
    //do suff
});
```

#### serviceError
This event triggers, when a client sends an message to the server.

- ``msg`` : _String_ - Message the client send to the Server
- ``service``: _Object_ - Service object
    - ``name``: _String_ - Name with which the service is registered
    - ``id``: _String_ - ID the Server has given this service

```javascript
server.on('serviceError', (msg, service) => {
    //do stuff here
})
----
#### Client
