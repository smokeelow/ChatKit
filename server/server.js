var ws = require('ws').Server,
    WebSocketServer = new ws({port: 8080});

console.log('server-started');
var clients = [];

WebSocketServer.on('connection', function (socket) {
    //WebSocket Server
    var $server = this;

    /**
     * Client events
     *
     * EVENTS:
     * - newMessageSent : sent message to current user
     * - newMessageReceived : sent message to all user except current user
     * - private : open private chat
     * - connectedUser : user enter to the chat
     * - userPrint : user typing
     *
     * @type object
     */
    var sendEvent = {};

    /**
     * Send data to all users
     * @param msg
     */
    sendEvent.toAll = function (msg) {
        for (var i in $server.clients)
            if ($server.clients[i] != socket)
                $server.clients[i].send(msg);
    }

    //Connected event
    sendEvent.connectedUser = function () {
        var time = (new Date).toLocaleTimeString(),
            usrMsg = 'You are successfully connected',
            msgAll = 'New user connected',
            userJson = {'event': 'connectedUserSent', 'time': time, 'text': usrMsg},
            allJson = {'event': 'connectedUserReceived', 'time': time, 'text': msgAll},
            clientStr = JSON.stringify(userJson),
            allStr = JSON.stringify(allJson);

        socket.send(clientStr);
        sendEvent.toAll(allStr);
    };

    /**
     * JSON MESSAGE FORMAT
     *
     * var msg = {
     *      'event' : event
     *      'name' : name,
     *      'time' : time,
     *      'image' : image, //base64 format
     *      'text' : msg
     *  };
     * @param msg
     */
    sendEvent.newMessage = {
        init: function (jsonArr) {
            var time = (new Date).toLocaleTimeString(),
                usrJson = {'event': 'newMessageSent', 'time': time, 'text': jsonArr.text},
                clientStr = JSON.stringify(usrJson),
                allJson = {'event':'newMessageReceived','time':time,'text':jsonArr.text},
                allStr = JSON.stringify(allJson);

            //send to user
            socket.send(clientStr);
            sendEvent.toAll(allStr);
        }
    };

    sendEvent.userPrint = {
        init: function (jsonArr) {
            var clientStr = JSON.stringify(jsonArr);

            sendEvent.toAll(clientStr);
        }
    }

    //Send notification about new user
    sendEvent.connectedUser();

    /**
     * Receiving message event
     */
    socket.on('message', function (msg) {
        var jsonArr = JSON.parse(msg);

        sendEvent[jsonArr.event].init(jsonArr);
    });

    /**
     * Disconnect event
     */
    socket.on('close', function () {
        console.log('user disconnected');

        console.log('online: '+$server.clients.length)
    });
});