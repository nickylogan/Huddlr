import ServerUI from './serverUI';
import * as utils from '../utils';
import * as events from '../events';
import io from 'socket.io-client';

let serverUI = new ServerUI();

var socket = io('/server');

socket.on(events.SERVER_LOG, function(data) {
    // console.log(data);
    serverUI.appendLog(data);
});