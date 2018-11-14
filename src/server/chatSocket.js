import Server from 'socket.io';
import Storage from './storage';
import * as events from '../events';
import * as utils from '../utils';

export default class ChatSocket {
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
        this.io = io;
        this.namespace = namespace;
        this.nsp = this.io.of(`/${namespace}`);
        this.storage = storage;
        this.broadcastServerLog = serverCallback;

        this.initialize.bind(this);
    }

    /**
     * @returns {ChatSocket}
     */
    initialize() {
        this.nsp.on('connection', (socket) => {
            let sessionID = socket.request.sessionID;
            let user = this.storage.getUser(sessionID);
            if (user) {
                this.broadcastConnectMessage(socket, user, sessionID);

                socket.on(events.CHAT_MESSAGE, (message) => {
                    this.broadcastChatMessage(socket, user, message);
                });

                socket.on(events.CLIENT_SEND_FILE_SLICE, (data) => {
                    this.storeFileSlice(socket, user, data);
                })

                socket.on('disconnect', () => {
                    this.broadcastDisconnectMessage(socket, user, sessionID);
                });
            }
        });
        return this;
    }

    broadcastChatMessage(socket, user, message) {
        socket.broadcast.emit(events.CHAT_MESSAGE, {
            user: user.name,
            message: message,
            time: utils.getSimpleTime(),
            color: user.color
        });
        this.broadcastServerLog({
            type: events.SERVER_CHAT,
            user: user.name,
            message: message,
            room: 'WORLD',
        });
    }

    broadcastDisconnectMessage(socket, user, sessionID) {
        this.storage.removeUserFromRoom(sessionID, 'world');
        socket.broadcast.emit(events.CHAT_DISCONNECT, user);
        this.broadcastServerLog({
            type: events.SERVER_DISCONNECT,
            user: user.name,
            message: '',
            room: 'WORLD',
        });
    }

    broadcastConnectMessage(socket, user, sessionID) {
        this.storage.addUserToRoom(sessionID, this.namespace);
        socket.broadcast.emit(events.CHAT_CONNECT, user);

        this.broadcastServerLog({
            type: events.SERVER_CONNECT,
            user: user.name,
            message: '',
            room: 'WORLD',
        });
    }

    storeFileSlice(socket, user, data) {
        this.storage.storeFileSlice(data);
        let complete = this.storage.fileIsComplete(data.name);
        if(complete) {
            console.log("FILE COMPLETE!");
            let res = this.storage.finalizeFile(data.name);
            if(!res.err) {
                socket.emit(events.SERVER_FINISH_RECEIVE_FILE);
                socket.broadcast.emit(events.CHAT_FILE, {
                    user: user.name,
                    file: {
                        name: res.alias,
                        size: res.size,
                        path: '/files/' + res.name,
                        ext: res.name.split('.').pop().toUpperCase(),
                    },
                    time: utils.getSimpleTime(),
                    color: user.color,
                });
                this.broadcastServerLog({
                    type: events.SERVER_FILE,
                    user: user.name,
                    message: res.alias,
                    room: 'WORLD',
                })
            } else {
                socket.emit(events.SERVER_ERROR_RECEIVE_FILE, res.err);
            }
        } else {
            var curr = this.storage.getCurrentFileSlice(data.name);
            // console.log("REQUEST FILE SLICE: " + curr);
            socket.emit(events.SERVER_REQUEST_FILE_SLICE, { 
                currentSlice: curr
            });
        }
    }
}