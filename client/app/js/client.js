window.addEventListener('DOMContentLoaded', function () {

    /*********** SOCKET EVENTS ***********/
    var socket = new WebSocket('ws://localhost:8080');

    /**
     * Open socket
     */
    socket.addEventListener('open', function () {
        document.getElementById('overlay').style.display = 'none';
    });

    /**
     * Wait message from server
     * @param msg
     */
    socket.addEventListener('message', function (event) {
        Message.display(event.data);
    });
    /*********** SOCKET EVENTS END***********/


    /*********** INTERFACE EVENTS ***********/

    //Main Global Elements
    var UsersList = document.getElementById('users-list'),
        MsgBox = document.getElementById('message-box'),
        MsgArea = document.getElementById('message-area'),
        MsgWrapper = document.getElementById('msg-wrapper'),
        MsgLog = document.getElementById('message-log'),
        Log = document.getElementById('log'),
        MsgSplitter = document.getElementById('msg-splitter'),
        MsgTxt = document.getElementById('message'),
        TestLayer = document.getElementById('test-layer');

    var msgAreaStartHeight = MsgArea.clientHeight.toString(),
        msgLogStartHeight = MsgLog.clientHeight.toString();

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
            msgAreaHeight = MsgArea.clientHeight;

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

                var sum = MsgLog.clientHeight + MsgArea.clientHeight + 13;

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


    /*********** MESSAGE AREA EVENTS **************/

    /**
     * Message operations
     * @type object
     */
    var Message = {};

    Message.userStartPrint = function () {
        var json = {'event': 'userPrint', 'type': 1},
            serverStr = JSON.stringify(json);

        socket.send(serverStr);
    };

    Message.userStopPrint = function () {
        var json = {'event': 'userPrint', 'type': 0},
            serverStr = JSON.stringify(json);

        socket.send(serverStr);
    };

    /**
     * Construct message for server
     * @param e
     */
    Message.prepareAndSend = function (e) {
        var txt = e.innerHTML.toString();

        if (txt != '') {
            var json = {'event': 'newMessage', 'text': encodeURI(txt)},
                serverStr = JSON.stringify(json);
            e.innerHTML = '';
            socket.send(serverStr);
        }
    };

    /**
     * Display message on screen
     * @param jsonObj
     */
    Message.display = function (jsonObj) {
        console.log(jsonObj);
        var jsonArr = JSON.parse(jsonObj);

        /**
         * Message events
         * @type object
         */
        var MsgEvents = {};

        /**
         * Message of current user
         * @type {{init: Function}}
         */
        MsgEvents.newMessageSent = {
            init: function () {
                var msg = decodeURI(jsonArr.text);

                //Message construct
                var h = document.createElement('div');
                h.className = 'message-line current-user';

                if (!msg.icon)
                    var icon = '<div class="user-icon"><img src="images/no-avatar.png" alt="no-avatar"/></div>';
                else
                    var icon = '<div class="user-icon"><img src="' + msg.icon + '" alt="no-avatar"/></div>';

                var msgHtml = '<div class="user-msg-box"><div class="msg-left-side">' + icon + '</div><div class="msg-right-side"><div class="user-name"></div><div class="user-msg-date">' + jsonArr.time + '</div><div class="user-msg">' + msg + '</div></div><div class="clear"></div></div>';
                h.innerHTML = msgHtml;

                TestLayer.appendChild(h);

                var elementHeight = h.clientHeight.toString();
                TestLayer.removeChild(h);

                h.style.marginBottom = '-'+elementHeight + 'px';

                Log.appendChild(h);

                setTimeout(function () {
                    h.style.marginBottom = 0;
                }, 1);

                checkMsgHeight();

                var counter = 0;
                var timer = setInterval(function () {
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
                var msg = decodeURI(jsonArr.text);

                //Message construct
                var h = document.createElement('div');
                h.className = 'message-line';

                if (!msg.icon)
                    var icon = '<div class="user-icon"><img src="images/no-avatar.png" alt="no-avatar"/></div>';
                else
                    var icon = '<div class="user-icon"><img src="' + msg.icon + '" alt="no-avatar"/></div>';

                var msgHtml = '<div class="user-msg-box"><div class="msg-left-side">' + icon + '</div><div class="msg-right-side"><div class="user-name"></div><div class="user-msg-date">' + jsonArr.time + '</div><div class="user-msg">' + msg + '</div></div><div class="clear"></div></div>';
                h.innerHTML = msgHtml;

                TestLayer.appendChild(h);

                var elementHeight = h.clientHeight.toString();
                TestLayer.removeChild(h);

                h.style.top = elementHeight + 'px';
                Log.appendChild(h);

                setTimeout(function () {
                    h.style.top = 0;
                    h.style.padding = '5px';
                    h.style.height = elementHeight + 'px';
                }, 1);

                checkMsgHeight();

                var counter = 0;
                var timer = setInterval(function () {
                    counter++;

                    MsgWrapper.scrollTop = MsgWrapper.scrollHeight;

                    if (counter == 150)
                        clearInterval(timer);
                }, 1);
            }
        };

        MsgEvents.userPrint = {
            init: function () {
                //                var print = document.createElement('div');

                if (jsonArr.type) {
                    //                    print.setAttribute('id', 'typing');
                    //                    print.innerHTML = 'Typing';

                    console.log('typing');
                }
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

    //    //Track typing
    //    MsgBox.addEventListener('keydown', function () {
    //        Message.userStartPrint();
    //    });
    //
    //    //Track typing
    //    MsgBox.addEventListener('keyup', function () {
    //        Message.userStopPrint();
    //    })

    //Track Button press
    SendBtn.addEventListener('click', function () {
        Message.prepareAndSend(Msg);
    });
});