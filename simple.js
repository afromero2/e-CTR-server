
// Dependencias:
// 1. WebSocket
// 2. Node-Static

// Caracteristicas:
// 1. Conexión Websocket sobre nodejs
// 2. Ahora habitaciones <rooms>; se trata de una aplicacion sencilla!
// Version: 0.0.1

var fs = require('fs');

var _static = require('node-static');
var file = new _static.Server('./public');

// HTTP server
var app = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        file.serve(request, response);
    }).resume();
});

var WebSocketServer = require('websocket').server;

new WebSocketServer({
    httpServer: app,
    autoAcceptConnections: false
}).on('request', onRequest);

// Material compartido

var clients = [];

function onRequest(socket) {
    var origin = socket.origin + socket.resource;
    console.log('origin', origin);

    var websocket = socket.accept(null, origin);
    clients.push(websocket);

    websocket.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('utf8', message.utf8Data);
            clients.forEach(function(previousSocket) {
                if (previousSocket != websocket) previousSocket.sendUTF(message.utf8Data);
            });
        } else if (message.type === 'binary') {
            console.log('binary', message.binaryData);
            clients.forEach(function(previousSocket) {
                if (previousSocket != websocket) previousSocket.sendBytes(message.binaryData);
            });
        }
    });

    websocket.on('close', function() {
        removeUser(websocket);
    });
}


function removeUser(websocket) {
    var newClientsArray = [];
    for (var i = 0; i < clients.length; i++) {
        var previousSocket = clients[i];
        if (previousSocket != websocket) newClientsArray.push(previousSocket);
    }
    clients = newClientsArray;
}

app.listen(8080);

console.log('Por favor, abra la URL NON-SSL: http://localhost:8080/');
