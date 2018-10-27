import ServerUI from './serverUI';

let serverUI = new ServerUI();


// THESE ARE UI TESTS, REMOVE THESE LATER
function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
for (let i = 1; i <= 100; ++i) {
    let types = ['connect', 'disconnect', 'chat'];
    let users = ['Alex', 'Benjamin', 'Chloe', 'Daisy'];
    let data = {
        type: types[Math.round(Math.random() * 2)],
        user: users[Math.round(Math.random() * 3)],
        message: makeid(Math.ceil(Math.random() * 40) + 5),
        room: 'R' + makeid(5),
    }
    serverUI.appendLog(data);
}