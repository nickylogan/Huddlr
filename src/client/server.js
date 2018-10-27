import ServerUI from './serverUI';

let serverUI = new ServerUI();

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 100; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

for (let i = 1; i <= 100; ++i) {
    serverUI.appendLog(makeid());
}