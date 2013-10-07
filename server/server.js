var ws = require('ws').Server,
    WebSocketServer = new ws({port: 8080});

console.log('server-started');
var UsersList = {'event': 'usersList', 'list': {}};

WebSocketServer.on('connection', function (Socket) {
    console.log('user connected');
    console.log('online: ' + this.clients.length);

    //WebSocket Server
    var $Server = this;

    //User WebSocket ID
    var USER_ID = Socket['upgradeReq']['headers']['sec-websocket-key'];

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
    var SendEvent = {};

    /**
     * Send some data to all users
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

    //Connected event
    SendEvent.connectedUser = function () {
        var time = (new Date).toLocaleTimeString(),
            usrMsg = 'You are successfully connected',
            msgAll = 'New user connected',
            userJson = {'event': 'connectedUserSent', 'time': time, 'text': usrMsg},
            allJson = {'event': 'connectedUserReceived', 'time': time, 'text': msgAll},
            clientStr = JSON.stringify(userJson),
            allStr = JSON.stringify(allJson);

        Socket.send(clientStr);
        SendEvent.toAll(allStr);
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
    SendEvent.newMessage = {
        init: function (jsonArr) {
            var time = (new Date).toLocaleTimeString(),
                userJson = {'event': 'newMessageSent', 'time': time, 'text': jsonArr.text, 'nickname': jsonArr['nickname']},
                clientStr = JSON.stringify(userJson),
                allJson = {'event': 'newMessageReceived', 'time': time, 'text': jsonArr.text, 'nickname': jsonArr['nickname']},
                allStr = JSON.stringify(allJson);

            Socket.send(clientStr);
            SendEvent.toAll(allStr);
        }
    };

    /**
     * Send notification that user typing something
     * @type {{init: Function}}
     */
    SendEvent.userPrint = {
        init: function (jsonArr) {
            var clientStr = JSON.stringify(jsonArr);

            SendEvent.toAll(clientStr);
        }
    };

    /**
     * Send to all users current user name and avatar
     * @type {{init: Function}}
     */
    SendEvent.userData = {
        init: function (json) {
            UsersList['list'][Socket['upgradeReq']['headers']['sec-websocket-key']] = {'nickname': json['nickname'], 'user-image': json['user-image'], 'socket': Socket};
        }
    };


    /**
     * Update users list after user disconnect
     */
    SendEvent.userDataUpdate = function () {
        delete UsersList['list'][USER_ID];

        console.log(UsersList['list']);

//        var clientStr = JSON.stringify(UsersList);

//        SendEvent.toAll(clientStr, 'all');
    };

    /**
     * Search users
     * @type {{init: Function}}
     */
    SendEvent.usersSearch = {
        init: function (json) {
            var users = {};

            for (var x in UsersList['list']) {
                var obj = UsersList['list'][x];

                if (obj['nickname'].toLowerCase().indexOf(json['name'].toLowerCase()) > -1 && x != Socket['upgradeReq']['headers']['sec-websocket-key'])
                    users[x] = {'nickname': obj['nickname'], 'user-image': obj['user-image']};
            }

            var json = {'event': 'usersFound', 'data': users},
                clientStr = JSON.stringify(json);

            Socket.send(clientStr);
        }
    };

    /**
     * Invite user and start chat with him
     * @type {{init: Function}}
     */
    SendEvent.inviteUser = {
        init: function (json) {
            var user = UsersList['list'][json['id']]['socket'],
                userJson = {'event': 'startChat', 'user': {'id': USER_ID, 'nickname': UsersList['list'][USER_ID]['nickname'], 'user-image': UsersList['list'][USER_ID]['user-image']}},
                userStr = JSON.stringify(userJson),
                clientJson = {'event': 'startChat', 'user': {'id': json['id'], 'nickname': UsersList['list'][json['id']]['nickname'], 'user-image': UsersList['list'][json['id']]['user-image']}},
                clientStr = JSON.stringify(clientJson);

            user.send(userStr);
            Socket.send(clientStr);
        }
    };

    //Send notification about new user
    SendEvent.connectedUser();

    /**
     * Receiving message event
     */
    Socket.on('message', function (msg) {
        var jsonArr = JSON.parse(msg);

        SendEvent[jsonArr.event].init(jsonArr);
    });

    /**
     * Disconnect user
     */
    Socket.on('close', function () {
        //notification
        console.log('user disconnected');

        //update users list
        SendEvent.userDataUpdate();

        //show online
        console.log('online: ' + $Server.clients.length)

        //show users list
        console.log(UsersList);
    });
});