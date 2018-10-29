import ChatUI from './chatUI';
import $ from 'jquery';
import * as utils from './utils';

function log(message) {
    console.log("World: " + message);
}

let chatUI = new ChatUI(log).initialize();

// THESE ARE UI TESTS. REMOVE LATER!

let ids = [];

setInterval(function() {
    let k = utils.randomInt(0,3);
    if(k >= 1) {
        let id = utils.makeid(6);
        ids.push(id);
        chatUI.appendUser({
            id: id,
            name: id,
            color: utils.randomColor(),
        });
    } else {
        let idx = utils.randomInt(0, ids.length-1);
        let id = ids[idx];
        ids.splice(idx,1);
        chatUI.removeUser(id);
    }
}, 2000);