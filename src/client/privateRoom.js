import ChatUI from './chatUI';

function log(message) {
    console.log("Private: " + message);
}

let chatUI = new ChatUI(log).initialize();
