/*********** CONFIG ***********/
//Server IP Address and Port
var host = 'localhost:8080';

//List of added users
var currentList = {};


//CHAT INIT
window.addEventListener('DOMContentLoaded', function () {

    /*********** GLOBAL ELEMENTS ***********/
    var UsersList = document.getElementById('users-list'),
        MsgBox = document.getElementById('message-box'),
        MsgArea = document.getElementById('message-area'),
        MsgWrapper = document.getElementById('msg-wrapper'),
        MsgLog = document.getElementById('message-log'),
        Log = document.getElementById('log'),
        MsgSplitter = document.getElementById('msg-splitter'),
        MsgTxt = document.getElementById('message'),
        TestLayer = document.getElementById('test-layer'),
        UserImage = document.getElementById('user-image'),
        UnreadMessages = document.getElementById('unread-messages'),
        UserName = document.getElementById('user-name'),
        UsersSearch = document.getElementById('users-search'),
        UsersFound = document.getElementById('users-found'),
        Users = document.getElementById('users');


    /*********** USER PANEL ***********/
    UserName.innerHTML = localStorage['nickname'];
    UserImage.src = localStorage['user-image'];


    /*********** SOCKET EVENTS ***********/
    var Socket;

    function ConnectToServer() {
        Socket = new WebSocket('ws://' + host);

        //Connected to server
        Socket.addEventListener('open', function () {
            document.getElementById('overlay').style.display = 'none';
            Message.sendUserInfo();
        });

        /**
         * Wait message from server
         * @param msg
         */
        Socket.addEventListener('message', function (event) {
            Message.display(event.data);
        });

        /**
         * Disconnect from server
         */
        Socket.addEventListener('close', function () {
            ConnectToServer();
        });
    }

    //Connect to server on load
    ConnectToServer();

    /*********** SOCKET EVENTS END***********/


    /*********** INTERFACE EVENTS ***********/
    var UsrListWidth = 178;
    UsersList.style.width = UsrListWidth + 'px';

    //Set width for #message-box
    function setMsgBoxWidth() {
        var w = (window.innerWidth - UsrListWidth - 1).toString();

        MsgBox.style.width = w + 'px';
    }

    //Set height for #message-log
    function setMsgLogHeight() {
        var msgBoxHeight = MsgBox.clientHeight,
            msgAreaHeight = 215;

        var areaHeight = (msgBoxHeight - msgAreaHeight - 17).toString();

        MsgLog.style.height = areaHeight + 'px';
    }

    //Splitter in message box
    function msgBoxSplitter() {
        MsgSplitter.addEventListener('mousedown', function (e) {
            var start = e.pageY,
                body = document.body;

            function resize(e) {
                var end = e.pageY;

                MsgLog.style.height = (MsgLog.clientHeight + (end - start)) + 'px';
                MsgArea.style.height = (MsgArea.clientHeight - (end - start)) + 'px';

                if (MsgLog.clientHeight <= 400)
                    removeEvents();

                start = end;
            }

            function removeEvents() {
                body.removeEventListener('mousemove', resize);
                body.removeEventListener('mouseup', resize);
            }

            body.addEventListener('mouseup', function () {
                removeEvents();
            });

            body.addEventListener('mousemove', resize);
        });
    }

    //Check height of #log
    function checkMsgHeight() {
        if (Log.clientHeight >= MsgLog.clientHeight)
            MsgWrapper.style.height = '100%';
        else
            MsgWrapper.style.height = 'auto';
    }

    msgBoxSplitter();
    setMsgBoxWidth();
    setMsgLogHeight();

    window.addEventListener('resize', function () {
        setMsgBoxWidth();
        setMsgLogHeight();
        checkMsgHeight();
    });

    /**
     * Shows right panel
     * @param name
     */
    function showRightPanel(name) {
        //ID of blocks
        var arr = ['chat', 'users-found'];

        if (name) {
            for (var i = 0, size = arr.length; i < size; i++) {
                if (arr[i] != name)
                    document.getElementById(arr[i]).style.display = 'none';
                else
                    document.getElementById(name).style.display = 'block';
            }
        } else {
            for (var i = 0, size = arr.length; i < size; i++) {
                document.getElementById(arr[i]).style.display = 'none';
            }
        }
    }

    /**
     * Search users
     */
    UsersSearch.addEventListener('keyup', function () {
        if (this.value != '') {
            showRightPanel('users-found');

            this.className += ' users-search-active';

            UsersFound.getElementsByClassName('title')[0].innerHTML = 'Users <span>results for "' + this.value + '"</span>';

            var json = {'event': 'usersSearch', 'name': this.value},
                serverStr = JSON.stringify(json);

            Socket.send(serverStr);
        } else
            showRightPanel();
    });

    /*********** MESSAGE AREA EVENTS **************/

    /**
     * Message operations
     * @type object
     */
    var Message = {};

    /**
     * Send to server user info
     */
    Message.sendUserInfo = function () {
        var json = {'event': 'userData', 'user-image': localStorage['user-image'], 'nickname': localStorage['nickname']},
            serverStr = JSON.stringify(json);

        Socket.send(serverStr);
    };

    Message.userStartPrint = function () {
        var json = {'event': 'userPrint', 'type': 1},
            serverStr = JSON.stringify(json);

        Socket.send(serverStr);
    };

    Message.userStopPrint = function () {
        var json = {'event': 'userPrint', 'type': 0},
            serverStr = JSON.stringify(json);

        Socket.send(serverStr);
    };

    /**
     * Construct message for server
     * @param e
     */
    Message.prepareAndSend = function (e) {
        var txt = e.innerHTML;

        if (txt != '') {
            var json = {'event': 'newMessage', 'text': encodeURI(txt), 'user-image': localStorage['user-image'], 'nickname': localStorage['nickname']},
                serverStr = JSON.stringify(json);
            e.innerHTML = '';

            Socket.send(serverStr);
        }
    };

    /**
     * Start chat with user
     * @param id
     */
    Message.inviteUser = function (id) {
        var json = {'event': 'inviteUser', 'id': id},
            serverStr = JSON.stringify(json);

        document.body.className = 'progress';

        Socket.send(serverStr);
    };

    /**
     * Catch event and display
     * @param jsonObj
     */
    Message.display = function (jsonObj) {
        var jsonArr = JSON.parse(jsonObj);

        /**
         * Message events
         * @type object
         */
        var MsgEvents = {};

        /**
         * User's message appearing
         * @type {{init: Function}}
         */
        MsgEvents.newMessageSent = {
            /**
             * if TRUE message is received, else message is sent
             * @param type
             */
            init: function (type) {
                var h = document.createElement('div');

                if (type)
                    h.className = 'message-line';
                else
                    h.className = 'message-line current-user';

                //decode user message
                var msg = decodeURI(jsonArr.text);

                //user message construct
                h.innerHTML = '<div class="user-msg-box"><div class="msg-right-side"><div class="user-name">' + jsonArr['nickname'] + '</div><div class="user-msg-date">' + jsonArr.time + '</div><div class="user-msg">' + msg + '</div></div><div class="clear"></div></div>';

                TestLayer.appendChild(h);

                var elementHeight = h.clientHeight.toString();
                TestLayer.removeChild(h);

                h.style.marginBottom = '-' + elementHeight + 'px';

                Log.appendChild(h);

                setTimeout(function () {
                    h.style.marginBottom = 0;
                }, 1);

                checkMsgHeight();

                var counter = 0,
                    timer = setInterval(function () {
                        counter++;

                        MsgWrapper.scrollTop = MsgWrapper.scrollHeight;

                        if (counter == 150)
                            clearInterval(timer);
                    }, 1);
            }
        };

        /**
         * Received message from other users
         * @type {{init: Function}}
         */
        MsgEvents.newMessageReceived = {
            init: function () {
                MsgEvents.newMessageSent.init(true);
            }
        };

        MsgEvents.userPrint = {
            init: function () {
                if (jsonArr.type)
                    console.log('typing');
                else
                    console.log('stop typing');
            }
        };

        /**
         * Current user successfully connected
         * @type {{init: Function}}
         */
        MsgEvents.connectedUserSent = {
            init: function () {

            }
        };

        /**
         * Other user successfully connected
         * @type {{init: Function}}
         */
        MsgEvents.connectedUserReceived = {
            init: function () {

            }
        };

        /**
         * Generate users list
         * @type {{init: Function}}
         */
        MsgEvents.usersList = {
            init: function () {
                //remove first element for users list
                delete jsonArr['event'];

                UsersList.innerHTML = '';

                for (var id in jsonArr) {
                    var userHtml = '<div class="user" data-id="' + id + '"><img class="user-image" src="' + jsonArr[id]['user-image'] + '"/><div class="user-nickname">' + jsonArr[id]['nickname'] + '</div><div class="clear"></div>';

                    UsersList.innerHTML += userHtml;
                }
            }
        };


        /**
         * Show found users
         * @type {{init: Function}}
         */
        MsgEvents.usersFound = {
            init: function () {
                var results = document.getElementById('users-search-result');

                results.innerHTML = '';

                for (var id in jsonArr['data']) {
                    var obj = jsonArr['data'][id],
                        userLine = document.createElement('div'),
                        img = '<img src="' + obj['user-image'] + '"/>',
                        name = '<div class="user-name">' + obj['nickname'] + '</div>',
                        clear = '<div class="clear"></div>';

                    userLine.className = 'user';
                    userLine.setAttribute('data-id', id);
                    userLine.innerHTML = img + name + clear;

                    results.appendChild(userLine);

                    userLine.addEventListener('click', function () {
                        Message.inviteUser(this.getAttribute('data-id'));
                    });
                }

                UsersSearch.className = '';
            }
        };

        /**
         * Start chat with user
         * @type {{init: Function}}
         */
        MsgEvents.startChat = {
            init: function () {
                //Add user to contact list
                currentList[jsonArr['user']['id']] = true;

                var img = '<img src="' + jsonArr['user']['user-image'] + '"/>',
                    name = '<div class="user-name">' + jsonArr['user']['nickname'] + '</div>',
                    clear   = '<div class="clear"></div>',
                    userLine = document.createElement('div');

                userLine.className = 'user';
                userLine.setAttribute('data-id', jsonArr['user']['id']);
                userLine.innerHTML = img + name + clear;

                Users.appendChild(userLine);

                showRightPanel('chat');
            }
        };

        //Call event
        MsgEvents[jsonArr.event].init();
    };

    //Main Elements
    var Msg = document.getElementById('message');
    var SendBtn = document.getElementById('send');

    //Track 'Enter' press
    Msg.addEventListener('keypress', function (e) {
        if (e.which == '13')
            Message.prepareAndSend(this);
    });

    //Track Button press
    SendBtn.addEventListener('click', function () {
        Message.prepareAndSend(Msg);
    });
});