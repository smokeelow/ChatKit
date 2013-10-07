/**
 * Ajax object
 * @type {{get: Function}}
 */
var ajax = {

    /**
     * Load page
     * @param url
     * @param callback
     */
    get:function(url,callback) {
        var a = new XMLHttpRequest();

        a.open('GET', url, true);
        a.send();

        a.onreadystatechange = function() {
            if(a.readyState == 4)
                if(a.status == 200 || a.status == 304)
                        callback(a.responseText);
        }
    }
};