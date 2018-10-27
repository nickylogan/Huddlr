import ChatUI from './chatUI';

function log(message) {
    console.log("World: " + message);
}

let chatUI = new ChatUI(log).initialize();
