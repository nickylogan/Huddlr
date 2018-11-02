import ChatUI from './chatUI';
import $ from 'jquery';
import * as utils from '../utils';
import * as events from '../events';
import io from 'socket.io-client';

let chatUI = new ChatUI(broadcast).initialize();

var socket = io('/world');

socket.on(events.CHAT_CONNECT, function(user) {
    chatUI.appendUser(user);
})

socket.on(events.CHAT_DISCONNECT, function(user) {
    chatUI.removeUser(user);
})

socket.on(events.CHAT_MESSAGE, function(msg) {
    chatUI.appendMessage(msg);
})

function broadcast(message) {
    socket.emit(events.CHAT_MESSAGE, message);
}
