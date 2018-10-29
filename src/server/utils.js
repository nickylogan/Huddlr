/**
 * @param {String} text
 */
export function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function getSimpleTime() {
    let d = new Date();
    return `${('0' + d.getHours()).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}`;
}

export function getTerminalTime() {
    let d = new Date();
    let y = d.getFullYear();
    let mm = ('0' + d.getMonth()).slice(-2);
    let dd = ('0' + d.getDate()).slice(-2);
    let h = ('0' + d.getHours()).slice(-2);
    let m = ('0' + d.getMinutes()).slice(-2);
    let s = ('0' + d.getSeconds()).slice(-2);
    return `[${y}-${mm}-${dd} ${h}:${m}:${s}]`;
}

/**
 * @param {Number} length
 */
export function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

/**
 * @param {Number} min
 * @param {Number} max
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomColor() {
    let maxSum = 200 + 128 + 128;
    let _1 = Math.min(255, randomInt(0, maxSum));
    let _2 = Math.min(255, randomInt(0, maxSum - _1));
    let _3 = Math.min(255, randomInt(0, maxSum - _2 - _1));
    let arr = [('0' + _1.toString(16)).slice(-2), ('0' + _2.toString(16)).slice(-2), ('0' + _3.toString(16)).slice(-2)];
    arr = shuffle(arr);
    return `#${arr[0] + arr[1] + arr[2]}`;
}

/**
 * @param {Array} array
 */
export function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}