/**
 * ChatKit Server
 *
 * @author Sergey Bevzuk | https://github.com/smokeelow
 */


/**
 * Web Socket Server
 *
 * @type {Server|*}
 */
var ws = require('ws').Server,
    WebSocketServer = new ws({port: 8080});

console.log('server started');
var UsersList = {'event': 'usersList', 'list': {}};

WebSocketServer.on('connection', function (Socket) {
    console.log('user connected');
    console.log('online: ' + this.clients.length);

    //WebSocket Server
    var $Server = this;

    //User WebSocket ID
    var USER_ID = Socket['upgradeReq']['headers']['sec-websocket-key'];

    //Event sender object
    var SendEvent = {};

    /**
     * Send data to all users
     * @param msg
     * @param key
     */
    SendEvent.toAll = function (msg, key) {
        if (key)
            for (var i in $Server.clients)
                $Server.clients[i].send(msg);
        else
            for (var i in $Server.clients)
                if ($Server.clients[i] != Socket)
                    $Server.clients[i].send(msg);
    };

    /**
     * Receiving message event
     */
    Socket.on('message', function (msg) {
        var jsonArr = JSON.parse(msg);
    });

    /**
     * Disconnect user
     */
    Socket.on('close', function () {
        //notification
        console.log('user disconnected');

        //show online
        console.log('online: ' + $Server.clients.length)
    });
});