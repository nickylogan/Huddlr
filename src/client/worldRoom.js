import ChatUI from './chatUI';

function log(message) {
    console.log(message);
}

let chatUI = new ChatUI(log).initialize();
