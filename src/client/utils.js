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

export function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomColor() {
    let r = randomInt(0, 128);
    let g = randomInt(0, 128);
    let b = randomInt(0, 128);
    r = ('0' + r.toString(16)).slice(-2);
    g = ('0' + g.toString(16)).slice(-2);
    b = ('0' + b.toString(16)).slice(-2);
    return `#${r + g + b}`;
}