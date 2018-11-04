import Server from 'socket.io';
import Storage from './storage';
import * as events from '../events';
import * as utils from '../utils';
import ChatSocket from './chatSocket';

export default class PrivateChatSocket extends ChatSocket{
    /**
     * @callback BroadcastCallback
     * @param {Object} log
     * @param {String} log.type
     * @param {String} log.user
     * @param {String} log.message
     * @param {String} log.room
     */

    /**
     * @param {Server} io
     * @param {Storage} storage
     * @param {String} namespace
     * @param {BroadcastCallback} serverCallback
     */
    constructor(io, storage, namespace, serverCallback) {
        super(io, storage, namespace, serverCallback);
    }

    /**
     * @returns {PrivateChatSocket}
     */
    initialize() {
        console.log("private initialize called");
        return this;
    }
}