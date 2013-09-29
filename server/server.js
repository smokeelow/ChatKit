var ws = require('ws').Server,
    WebSocketServer = new ws({port: 8080});

console.log('server-started');
var usersList = {'event':'usersList'};

WebSocketServer.on('connection', function (socket) {
    console.log('user connected');
    console.log('online: ' + this.clients.length);

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
     * Send some data to all users
     * @param msg
     * @param key
     */
    sendEvent.toAll = function (msg,key) {
        if(key) {
            for (var i in $server.clients)
                    $server.clients[i].send(msg);
        }
        else {
            for (var i in $server.clients)
                if ($server.clients[i] != socket)
                    $server.clients[i].send(msg);
        }

    };

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
                usrJson = {'event': 'newMessageSent', 'time': time, 'text': jsonArr.text,'nickname':jsonArr['nickname']},
                clientStr = JSON.stringify(usrJson),
                allJson = {'event': 'newMessageReceived', 'time': time, 'text': jsonArr.text,'nickname':jsonArr['nickname']},
                allStr = JSON.stringify(allJson);

            socket.send(clientStr);
            sendEvent.toAll(allStr);
        }
    };

    /**
     * Send notification that user typing something
     * @type {{init: Function}}
     */
    sendEvent.userPrint = {
        init: function (jsonArr) {
            var clientStr = JSON.stringify(jsonArr);

            sendEvent.toAll(clientStr);
        }
    };

    /**
     * Send to all users current user name and avatar
     * @type {{init: Function}}
     */
    sendEvent.userData = {
        init: function (json) {
            usersList[socket['upgradeReq']['headers']['sec-websocket-key']] = {'nickname':json['nickname'],'user-image':json['user-image']};

            var clientStr = JSON.stringify(usersList);

            socket.send(clientStr);
            sendEvent.toAll(clientStr);
        }
    };


    /**
     * Update users list after user disconnect
     */
    sendEvent.userDataUpdate = function() {
        delete usersList[socket['upgradeReq']['headers']['sec-websocket-key']];

        var clientStr = JSON.stringify(usersList);

        sendEvent.toAll(clientStr,'all');
    };

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
        //notification
        console.log('user disconnected');

        //update users list
        sendEvent.userDataUpdate();

        //show online
        console.log('online: ' + $server.clients.length)

        //show users list
        console.log(usersList);
    });
});