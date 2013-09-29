//Global vars
var fs = require('fs');

/**
 * App Settings
 * @type object
 */
var Settings = {};

/**
 * Open camera interface
 */
Settings.openCameraLayer = function () {
    var cameraLayer = document.getElementById('camera-layer'),
        camera = document.getElementById('camera'),
        photo = document.getElementById('camera-preview');

    cameraLayer.className = 'show-from-scale';

    Settings.getUserCamera();

    document.getElementById('close-clayer').addEventListener('click', function () {
        cameraLayer.className = '';
    });

    document.getElementById('make-shot').addEventListener('click', function () {
        photo.getContext('2d').drawImage(camera, 0, 0, 180, 180);
    });

    document.getElementById('save-shot').addEventListener('click', function() {
        Settings.saveImagePath('camera', photo)
    });
};

/**
 * Connect to user camera
 */
Settings.getUserCamera = function () {
    function success(stream) {
        document.getElementById('camera').src = webkitURL.createObjectURL(stream);
    }

    function fail() {
        alert('Camera not found');
    }

    if (navigator.webkitGetUserMedia)
        navigator.webkitGetUserMedia({video: true}, success, fail);
    else
        alert('Camera not found');
};


/**
 * Saving picture that user choose (from camera or from local storage)
 * @param type
 * @param data
 */
Settings.saveImagePath = function (type, data) {
    if (type == 'camera')
        saveFromCamera();
    else
        saveLocalPath();

    //If image from captured from camera
    function saveFromCamera() {
        localStorage['user-image'] = data.toDataURL();

        document.getElementById('camera-layer').className = '';

        Settings.init();
    }


    //If image selected by user
    function saveLocalPath() {
        console.log(data.value);
        var type = data.value.split('.'),
            extArr = ['gif', 'png', 'jpg', 'jpeg'];

        if (type.length > 2)
            Settings.showPopUp('File have incorrect extension');
        else if (extArr.indexOf(type['1']) < 0)
            Settings.showPopUp('Unsupported file extension');
        else {
            var tempImg = new Image();

            tempImg.onload = function () {
                if (this.width < 180 || this.height < 180)
                    Settings.showPopUp('Minimum size of image must be 180x180');
                else {
                    var canvas = document.createElement('canvas');
                    canvas.width = 180;
                    canvas.height = 180;

                    var image = canvas.getContext('2d').drawImage(tempImg, 0, 0, 180, 180);

                    localStorage['user-image'] = canvas.toDataURL();

                    Settings.init();
                }
            }

            tempImg.src = data.value;
        }
    }
};

/**
 * Shows popup with error message
 * @param txt
 */
Settings.showPopUp = function (txt) {
    var overlay = document.getElementById('overlay'),
        popup = document.getElementById('popup'),
        popupTxt = popup.getElementsByTagName('div')[0],
        close = document.getElementById('close-popup'),
        wrapper = document.getElementById('wrapper');

    popupTxt.innerHTML = txt;
    var w = popup.clientWidth;
    var margin = (w / 2);
    popup.style.marginLeft = '-' + margin + 'px';
    wrapper.className = 'blur-scale';
    popup.className += ' show-from-scale';

    close.addEventListener('click', function () {
        popup.classList.remove('show-from-scale');
        wrapper.className = '';
        popup.classList.add('blur-100');

        setTimeout(function () {
            popup.classList.remove('blur-100');
            popupTxt.innerHTML = '';
        }, 301);
    });
};


/**
 * Initialize main settings
 */
Settings.init = function () {
    var file = document.getElementById('file-picture'),
        userAvatar = document.getElementById('user-avatar'),
        userAvatarImg = userAvatar.getElementsByTagName('img')[0];

    file.value = '';

    if (localStorage['user-image'] != null) {
        userAvatarImg.src = localStorage['user-image'];
        userAvatar.classList.remove('no-avatar');
    }
};

Settings.steps = {
    first: function () {
        var content = document.getElementById('profile');

        document.title = 'ChatKit / Choose your picture';

        content.style.top = 0;
        content.style.opacity = 1;
    },

    second: function() {
        document.title = 'ChatKit / Choose your name';

        var nickName = document.getElementById('nickname'),
            tmpElement = document.createElement('div'),
            preSave = document.getElementById('pre-saved-name'),
            saveSettings = document.getElementById('save-settings');

        nickName.addEventListener('keyup', function() {
            tmpElement.innerHTML = this.value;
            preSave.innerHTML = tmpElement.textContent || tmpElement.innerText;

            localStorage['nickname'] = tmpElement.textContent || tmpElement.innerText;
            console.log(localStorage['nickname']);
        });


        saveSettings.addEventListener('click', function() {
            if(localStorage['nickname'] != '')
                window.location.href = 'chat.html';
        });
    }
};

window.addEventListener('DOMContentLoaded', function () {
    Settings.init();

    Settings.steps.first();

    document.getElementById('open-camera-layer').addEventListener('click', function () {
        Settings.openCameraLayer();
    });

    var file = document.getElementById('file-picture');

    file.addEventListener('mouseover', function () {
        document.getElementById('file-from-fs').style.background = '#1fbba6';
    });

    file.addEventListener('mouseout', function () {
        document.getElementById('file-from-fs').style.background = '';
    });

    file.addEventListener('change', function () {
        Settings.saveImagePath('file', this);
    });

    document.getElementById('next-step').addEventListener('click', function() {
        var firstStep = document.getElementById('first-step'),
            secondStep = document.getElementById('second-step');

        firstStep.style.display = 'none';

        secondStep.style.opacity = 1;
        secondStep.style.left = 0;

        Settings.steps.second();
    });
});