var config = require('../config'),
    fs = require('fs');

/**
 * App Settings
 * @type object
 */
var Settings = {};

Settings.getUserCamera = function () {
    function success(stream) {
        document.getElementById('camFeed').src = webkitURL.createObjectURL(stream);
    }

    function fail() {
        alert('Camera not found');
    }

    if (navigator.webkitGetUserMedia)
        navigator.webkitGetUserMedia({video: true}, success, fail);
    else
        alert('Camera not found');
};


Settings.takeUserPhoto = function () {
    var c = document.getElementById('photo');
    var v = document.getElementById('camFeed');
    c.getContext('2d').drawImage(v, 0, 0, 320, 240);

    var image = c.toDataURL('image/png').replace('image/png', 'image/octet-stream');

    //
    ////Save image
    //var base64Data = req.rawBody.replace(/^data:image\/png;base64,/, ""),
    //
    //    require
    //("fs").writeFile("out.png", base64Data, 'base64', function (err) {
    //    console.log(err);
    //});
};


Settings.saveImagePath = function (type, data) {
    if (type == 'camera')
        saveFromCamera();
    else
        saveLocalPath();


    function saveFromCamera() {

    }

    function saveLocalPath() {
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

                    fs.readFile(data.value, function (err, image) {
                        if (err)
                            console.log(err)
                        else {
                            var base64Image = image.toString('base64'),
                                imgName = base64Image.substr(20, 20);

                            fs.writeFile('images/user/' + imgName + '.' + type['1'], base64Image, 'base64', function (err) {
                                if (err)
                                    console.log(err);
                                else {
                                    config['user-image'] = '../images/user/avatar.' + type['1'];

                                    var tmpConfig = JSON.stringify(config);

                                    fs.writeFile('../config.json', tmpConfig, function (err) {
                                        if (err)
                                            console.log(err);
                                        else
                                            Settings.init();
                                    });
                                }
                            });
                        }
                    });
                }
            };

            tempImg.src = data.value;
        }
    }
};


Settings.showPopUp = function (txt) {
    var overlay = document.getElementById('overlay'),
        popup = document.getElementById('popup'),
        popupTxt = popup.getElementsByTagName('div')[0],
        close = document.getElementById('close-popup'),
        wrapper = document.getElementById('wrapper');

    popupTxt.innerHTML = txt;
    var w = popup.clientWidth;
    var margin = (w / 2).toString();
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

Settings.init = function () {
    var userAvatar = document.getElementById('user-avatar'),
        userAvatarImg = userAvatar.getElementsByTagName('img')[0];

    if (config['user-image'] != '')
        userAvatarImg.src = config['user-image'];
};

window.addEventListener('DOMContentLoaded', function () {
    Settings.init();
    console.log(config);

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
});