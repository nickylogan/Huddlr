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