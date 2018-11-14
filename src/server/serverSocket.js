import Server from 'socket.io';
import Storage from './storage';
import * as events from '../events';
import * as utils from '../utils';

export default class ServerSocket {
    /**
     * @param {Server} io
     * @param {Storage} storage
     */
    constructor(io, storage) {
        this.io = io;
        this.nsp = this.io.of('/server');
        this.storage = storage;

        this.broadcastServerLog.bind(this);
    }

    /**
     * @param {Object} log
     * @param {String} log.type
     * @param {String} log.user
     * @param {String} log.message
     * @param {String} log.room
     */
    broadcastServerLog(log) {
        log.time = utils.getTerminalTime();
        this.storage.appendLog(log);
        this.nsp.emit(events.SERVER_LOG, log);
    }
}