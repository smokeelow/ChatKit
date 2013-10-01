//init object
/**
 * Init object
 * @type object
 */
var Caret = {}; // <--- THIS IS INITIALIZATION OF OBJECT, IT'S CLEAR?


/**
 * Create custom caret
 * @param elementID
 */
Caret.setFor = function (elementID) {

    /*** INIT ELEMENTS ***/
    var e = document.getElementById(elementID),
        eWrapper = document.createElement('div'),
        eOverlay = document.createElement('div'),
        eText = document.createElement('span'),
        eCaret = document.createElement('span');

    eWrapper
        .setAttribute('id', elementID + '-x-caret-wrapper');
    eOverlay
        .setAttribute('id', elementID + '-x-caret-overlay');
    eText
        .setAttribute('id', elementID + '-x-caret-text');
    eCaret
        .setAttribute('id', elementID + '-x-caret');

    /*** PLACEMENT OF ELEMENTS ***/
    e.parentNode.insertBefore(eWrapper);
    eWrapper.appendChild(e);
    eOverlay.appendChild(eText);
    eOverlay.appendChild(eCaret);
    eWrapper.appendChild(eOverlay);

    /*** EVENTS ***/
    eWrapper.addEventListener('click', function () {
        e.focus();
    });

    e.addEventListener('keydown', function (e) {
        getAndWrite(this, e);
    });

    e.addEventListener('keyup', function(e) {
        getAndWrite(this, e);
    });

    e.addEventListener('keypress', function(e) {
        getAndWrite(this, e);
    });

    function getAndWrite(el, e) {
        eWrapper.innerHTML = el.value.replace(/\n/g, '<br/>');

        var length = el.value.length,
            eCaretLeft = parseInt(eCaret.style.left);

        if (e.keyCode == 37 && eCaretLeft >= (0 - ((length - 1) * 10)))
            eCaret.style.left = eCaretLeft - 10 + 'px';
        else if (e.keyCode == 39 && (eCaretLeft + 10) <= 0)
            eCaret.style.left = eCaretLeft + 10 + 'px';
    }
};