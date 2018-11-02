import ChatUI from './chatUI';
import $ from 'jquery';
import * as utils from '../utils';
import * as events from '../events';
import io from 'socket.io-client';
import ClientSocket from './clientSocket';

let socket = new ClientSocket('/world');
let chatUI = new ChatUI(socket).initialize();

socket.setConnectCallback(function (user) {
    chatUI.appendUser(user)
});
socket.setDisconnectCallback(function (user) {
    chatUI.removeUser(user)
});
socket.setMessageCallback(function (msg) {
    chatUI.appendMessage(msg)
});